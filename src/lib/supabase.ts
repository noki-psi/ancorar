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
      let synced = false;
      const res = await supabase.from('sessions').insert([
        {
          anonymous_user_id: session.anonymous_user_id,
          pre_tension: session.pre_tension,
          post_tension: session.post_tension,
          duration_seconds: session.duration_seconds,
          breathing_pattern: session.breathing_pattern || '326',
          target_duration_seconds: session.target_duration_seconds || 120
        }
      ]);

      if (!res.error) {
        synced = true;
      } else {
        if (res.error.message?.includes('breathing_pattern') || res.error.message?.includes('target_duration_seconds') || res.error.code === 'PGRST204') {
          const metadataTag = `#p=${session.breathing_pattern || '326'}&t=${session.target_duration_seconds || 120}`;
          const fallbackRes = await supabase.from('sessions').insert([
            {
              anonymous_user_id: `${session.anonymous_user_id}${metadataTag}`,
              pre_tension: session.pre_tension,
              post_tension: session.post_tension,
              duration_seconds: session.duration_seconds
            }
          ]);
          if (!fallbackRes.error) {
            synced = true;
          }
        }
      }

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

  // Always keep offline copy as cache/backup
  saveLocalSession(payload);

  if (!supabase) {
    return { success: true, isOffline: true, sessionId: localId };
  }

  try {
    let synced = false;
    const { error } = await supabase.from('sessions').insert([
      {
        anonymous_user_id: data.anonymous_user_id,
        pre_tension: data.pre_tension,
        post_tension: data.post_tension,
        duration_seconds: data.duration_seconds,
        breathing_pattern: data.breathing_pattern || '326',
        target_duration_seconds: data.target_duration_seconds || 120
      }
    ]);

    if (!error) {
      synced = true;
    } else {
      // If error is due to missing columns in remote database (e.g. PGRST204), encode metadata into anonymous_user_id
      if (error.message?.includes('breathing_pattern') || error.message?.includes('target_duration_seconds') || error.code === 'PGRST204') {
        const metadataTag = `#p=${data.breathing_pattern || '326'}&t=${data.target_duration_seconds || 120}`;
        const encodedUserId = `${data.anonymous_user_id}${metadataTag}`;
        const fallbackRes = await supabase.from('sessions').insert([
          {
            anonymous_user_id: encodedUserId,
            pre_tension: data.pre_tension,
            post_tension: data.post_tension,
            duration_seconds: data.duration_seconds
          }
        ]);
        if (!fallbackRes.error) {
          synced = true;
        }
      }
    }

    if (synced) {
      payload.synced_to_cloud = true;
      saveLocalSession(payload);
      return { success: true, isOffline: false, sessionId: localId };
    }

    console.warn('Supabase sync error, stored locally:', error?.message);
    return { success: true, isOffline: true, sessionId: localId, error: error?.message };
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
      let userId = item.anonymous_user_id || '';
      let pattern = item.breathing_pattern;
      let targetDur = item.target_duration_seconds;

      if (userId.includes('#p=')) {
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
        (ls.anonymous_user_id === userId || ls.id === item.id) &&
        ls.pre_tension === item.pre_tension &&
        ls.post_tension === item.post_tension
      );

      if (localMatch) {
        if (!pattern) pattern = localMatch.breathing_pattern;
        if (!targetDur) targetDur = localMatch.target_duration_seconds;
      }

      const hasBoth = item.pre_tension !== null && item.pre_tension !== undefined &&
                      item.post_tension !== null && item.post_tension !== undefined;
      const computedDelta = hasBoth ? (item.tension_delta ?? (item.pre_tension - item.post_tension)) : null;

      return {
        ...item,
        anonymous_user_id: userId,
        pre_tension: item.pre_tension ?? null,
        post_tension: item.post_tension ?? null,
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
