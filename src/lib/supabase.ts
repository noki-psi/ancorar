import { createClient } from '@supabase/supabase-js';
import { SessionRecord } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

const USER_ID_KEY = 'ancorar_anon_user_id';
const LOCAL_SESSIONS_KEY = 'ancorar_local_sessions';

export function getAnonymousUserId(): string {
  try {
    let id = localStorage.getItem(USER_ID_KEY);
    if (!id) {
      id = 'anon_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
      localStorage.setItem(USER_ID_KEY, id);
    }
    return id;
  } catch (e) {
    return 'anon_guest_' + Math.random().toString(36).substring(2, 9);
  }
}

export function getLocalSessions(): SessionRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_SESSIONS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load local sessions', e);
    return [];
  }
}

export function clearLocalSessions(): void {
  try {
    localStorage.removeItem(LOCAL_SESSIONS_KEY);
  } catch (e) {
    console.error('Failed to clear local sessions', e);
  }
}

export function saveLocalSession(session: SessionRecord): void {
  try {
    const sessions = getLocalSessions();
    const id = session.id || 'local_' + Math.random().toString(36).substring(2, 9);
    
    // Strict data integrity: delta only computed if both pre and post exist
    const hasBoth = session.pre_tension !== null && session.pre_tension !== undefined &&
                    session.post_tension !== null && session.post_tension !== undefined;
    const delta = hasBoth ? (session.pre_tension! - session.post_tension!) : null;

    const sessionData: SessionRecord = {
      ...session,
      id,
      pre_tension: session.pre_tension ?? null,
      post_tension: session.post_tension ?? null,
      tension_delta: delta,
      created_at: session.created_at || new Date().toISOString()
    };

    const existingIndex = sessions.findIndex(s => s.id === id);
    if (existingIndex >= 0) {
      sessions[existingIndex] = sessionData;
    } else {
      sessions.unshift(sessionData);
    }
    localStorage.setItem(LOCAL_SESSIONS_KEY, JSON.stringify(sessions));
  } catch (e) {
    console.error('Failed to save session locally', e);
  }
}

export async function checkSupabaseConnection(): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('sessions').select('id').limit(1);
    return !error;
  } catch {
    return false;
  }
}

/**
 * Builds metadata string encoded in the anonymous_user_id.
 * Allows storing true null / 0..10 ratings and patterns even when the remote
 * database hasn't yet executed the latest alter table schema commands.
 */
function buildMetadataTag(session: {
  pre_tension: number | null | undefined;
  post_tension: number | null | undefined;
  breathing_pattern?: string;
  target_duration_seconds?: number;
}): string {
  const preVal = session.pre_tension === null || session.pre_tension === undefined ? 'null' : session.pre_tension;
  const postVal = session.post_tension === null || session.post_tension === undefined ? 'null' : session.post_tension;
  const p = session.breathing_pattern || '326';
  const t = session.target_duration_seconds || 120;
  return `#v2=1&pre=${preVal}&post=${postVal}&p=${p}&t=${t}`;
}

/**
 * Strips existing metadata tags to get clean base user id
 */
function cleanBaseUserId(userId: string): string {
  if (userId.includes('#')) {
    return userId.split('#')[0];
  }
  return userId;
}

/**
 * Highly resilient insert helper that guarantees insertion regardless of whether
 * the remote Supabase database has legacy constraints (1..5 not null) or new schema (0..10 nullable).
 */
async function resilientCloudInsert(session: {
  anonymous_user_id: string;
  pre_tension: number | null | undefined;
  post_tension: number | null | undefined;
  duration_seconds: number;
  breathing_pattern?: string;
  target_duration_seconds?: number;
}): Promise<boolean> {
  if (!supabase) return false;

  const baseUserId = cleanBaseUserId(session.anonymous_user_id);

  // Attempt 1: Modern schema insert (all columns, native pre/post nullable 0..10)
  try {
    const { error: err1 } = await supabase.from('sessions').insert([
      {
        anonymous_user_id: baseUserId,
        pre_tension: session.pre_tension ?? null,
        post_tension: session.post_tension ?? null,
        duration_seconds: session.duration_seconds,
        breathing_pattern: session.breathing_pattern || '326',
        target_duration_seconds: session.target_duration_seconds || 120
      }
    ]);
    if (!err1) return true;

    // If err1 is not null, analyze error
    // Attempt 2: If missing new columns (PGRST204 or column names), but columns pre/post accept native values
    const isMissingColumns = err1.code === 'PGRST204' || 
      err1.message?.includes('breathing_pattern') || 
      err1.message?.includes('target_duration_seconds');

    const metaTag = buildMetadataTag(session);
    const taggedUserId = `${baseUserId}${metaTag}`;

    if (isMissingColumns) {
      const { error: err2 } = await supabase.from('sessions').insert([
        {
          anonymous_user_id: taggedUserId,
          pre_tension: session.pre_tension ?? null,
          post_tension: session.post_tension ?? null,
          duration_seconds: session.duration_seconds
        }
      ]);
      if (!err2) return true;
    }

    // Attempt 3: If database has legacy check constraint (1..5 not null) or error 23502 / 23514
    // Map safe fallback integers between 1 and 5 for the legacy columns,
    // while the TRUE data (null, 0..10, pattern, target) is safely preserved in the metadata tag.
    const safePre = session.pre_tension === null || session.pre_tension === undefined
      ? 3
      : Math.min(5, Math.max(1, Math.round(session.pre_tension / 2) || 1));
    const safePost = session.post_tension === null || session.post_tension === undefined
      ? safePre
      : Math.min(5, Math.max(1, Math.round(session.post_tension / 2) || 1));

    const { error: err3 } = await supabase.from('sessions').insert([
      {
        anonymous_user_id: taggedUserId,
        pre_tension: safePre,
        post_tension: safePost,
        duration_seconds: session.duration_seconds
      }
    ]);

    if (!err3) return true;
    console.warn('All insert attempts failed in Supabase:', err3.message);
    return false;
  } catch (e) {
    console.warn('Network exception during resilientCloudInsert:', e);
    return false;
  }
}

export async function syncOfflineSessions(): Promise<{ syncedCount: number }> {
  if (!supabase) return { syncedCount: 0 };

  const isOnline = await checkSupabaseConnection();
  if (!isOnline) return { syncedCount: 0 };

  const localSessions = getLocalSessions();
  const unsynced = localSessions.filter(s => s.synced_to_cloud === false);

  if (unsynced.length === 0) return { syncedCount: 0 };

  let syncedCount = 0;
  for (const session of unsynced) {
    try {
      const synced = await resilientCloudInsert({
        anonymous_user_id: session.anonymous_user_id,
        pre_tension: session.pre_tension,
        post_tension: session.post_tension,
        duration_seconds: session.duration_seconds,
        breathing_pattern: session.breathing_pattern,
        target_duration_seconds: session.target_duration_seconds,
      });

      if (synced) {
        session.synced_to_cloud = true;
        syncedCount++;
      }
    } catch (e) {
      console.warn('Failed to sync offline session', e);
    }
  }

  if (syncedCount > 0) {
    try {
      localStorage.setItem(LOCAL_SESSIONS_KEY, JSON.stringify(localSessions));
    } catch (e) {
      console.error('Failed to update localStorage after offline sync', e);
    }
  }

  return { syncedCount };
}

export async function saveSession(data: Omit<SessionRecord, 'id' | 'created_at' | 'tension_delta'> & { id?: string }): Promise<{ success: boolean; isOffline: boolean; sessionId: string; error?: string }> {
  const localId = data.id || ('local_' + Math.random().toString(36).substring(2, 9));
  
  // Strict data integrity: delta only computed if both pre and post are non-null
  const hasBoth = data.pre_tension !== null && data.pre_tension !== undefined &&
                  data.post_tension !== null && data.post_tension !== undefined;
  const delta = hasBoth ? (data.pre_tension! - data.post_tension!) : null;

  const payload: SessionRecord = {
    ...data,
    id: localId,
    pre_tension: data.pre_tension ?? null,
    post_tension: data.post_tension ?? null,
    tension_delta: delta,
    created_at: new Date().toISOString(),
    synced_to_cloud: false
  };

  // Always keep offline copy as cache/backup immediately
  saveLocalSession(payload);

  if (!supabase) {
    return { success: true, isOffline: true, sessionId: localId };
  }

  try {
    const synced = await resilientCloudInsert({
      anonymous_user_id: data.anonymous_user_id,
      pre_tension: data.pre_tension,
      post_tension: data.post_tension,
      duration_seconds: data.duration_seconds,
      breathing_pattern: data.breathing_pattern,
      target_duration_seconds: data.target_duration_seconds
    });

    if (synced) {
      payload.synced_to_cloud = true;
      saveLocalSession(payload);
      return { success: true, isOffline: false, sessionId: localId };
    }

    return { success: true, isOffline: true, sessionId: localId, error: 'Could not sync with Supabase cloud' };
  } catch (err: any) {
    console.warn('Network or Supabase failure, stored locally:', err?.message);
    return { success: true, isOffline: true, sessionId: localId, error: err?.message };
  }
}

export async function fetchAllSessions(): Promise<{ sessions: SessionRecord[]; isOffline: boolean }> {
  const localSessions = getLocalSessions();

  if (!supabase) {
    return { sessions: localSessions, isOffline: true };
  }

  try {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) {
      console.warn('Supabase fetch error, fallback to local:', error?.message);
      return { sessions: localSessions, isOffline: true };
    }

    // Map and enrich data with metadata or local records
    const mapped = data.map((item: any) => {
      let userId: string = item.anonymous_user_id || '';
      let pattern = item.breathing_pattern;
      let targetDur = item.target_duration_seconds;
      let preVal: number | null = item.pre_tension ?? null;
      let postVal: number | null = item.post_tension ?? null;

      // Decode v2 metadata tag if present
      if (userId.includes('#v2=1') || userId.includes('#pre=')) {
        const parts = userId.split('#');
        userId = parts[0];
        const queryStr = parts.slice(1).join('#');
        const params = new URLSearchParams(queryStr);

        const rawPre = params.get('pre');
        if (rawPre === 'null') {
          preVal = null;
        } else if (rawPre !== null && !isNaN(Number(rawPre))) {
          preVal = Number(rawPre);
        }

        const rawPost = params.get('post');
        if (rawPost === 'null') {
          postVal = null;
        } else if (rawPost !== null && !isNaN(Number(rawPost))) {
          postVal = Number(rawPost);
        }

        const p = params.get('p');
        if (p) pattern = p;
        const t = params.get('t');
        if (t) targetDur = Number(t);
      } else if (userId.includes('#p=')) {
        const parts = userId.split('#p=');
        userId = parts[0];
        const params = new URLSearchParams('p=' + parts[1]);
        if (!pattern) pattern = params.get('p') || undefined;
        if (!targetDur) {
          const t = params.get('t');
          if (t) targetDur = Number(t);
        }
      }

      // Check if user has corresponding local session to enrich details if missing
      const localMatch = localSessions.find(ls => 
        (cleanBaseUserId(ls.anonymous_user_id) === userId || ls.id === item.id)
      );

      if (localMatch) {
        if (!pattern) pattern = localMatch.breathing_pattern;
        if (!targetDur) targetDur = localMatch.target_duration_seconds;
      }

      const hasBoth = preVal !== null && preVal !== undefined &&
                      postVal !== null && postVal !== undefined;
      const computedDelta = hasBoth ? (preVal! - postVal!) : null;

      return {
        ...item,
        anonymous_user_id: userId,
        pre_tension: preVal,
        post_tension: postVal,
        breathing_pattern: pattern || '326',
        target_duration_seconds: targetDur || 120,
        tension_delta: computedDelta
      };
    });

    // Merge remote sessions with any unsynced local sessions that have local_ prefix
    const localOnly = localSessions.filter(s => s.id?.startsWith('local_') && s.synced_to_cloud === false);
    const combined = [...mapped, ...localOnly];
    
    return { 
      sessions: combined,
      isOffline: false 
    };
  } catch (err) {
    console.warn('Network failure fetching sessions:', err);
    return { sessions: localSessions, isOffline: true };
  }
}
