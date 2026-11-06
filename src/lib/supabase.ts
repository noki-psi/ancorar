import { createClient } from '@supabase/supabase-js';
import { SessionRecord } from '../types';

// Fallback direct credentials for public anon client in frontend
const DEFAULT_SUPABASE_URL = 'https://pgwpydahkdtngghyjedd.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_RE7Z6o13iGD3Ghjn2S6rGA_nnwFcGaq';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('http') &&
  !supabaseUrl.includes('placeholder')
);

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

const USER_ID_KEY = 'ancorar_anon_user_id';
const LOCAL_SESSIONS_KEY = 'ancorar_offline_sessions';

export function getAnonymousUserId(): string {
  let userId = localStorage.getItem(USER_ID_KEY);
  if (!userId) {
    userId = 'anon_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
    localStorage.setItem(USER_ID_KEY, userId);
  }
  return userId;
}

export function clearLocalSessions(): void {
  try {
    localStorage.removeItem(LOCAL_SESSIONS_KEY);
  } catch (e) {
    console.error('Failed to clear local sessions', e);
  }
}

export function getLocalSessions(): SessionRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_SESSIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to parse local sessions', e);
    return [];
  }
}

export function saveLocalSession(session: SessionRecord): void {
  try {
    const sessions = getLocalSessions();
    const id = session.id || 'local_' + Math.random().toString(36).substring(2, 9);
    const sessionData: SessionRecord = {
      ...session,
      id,
      tension_delta: session.pre_tension - session.post_tension,
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

export async function saveSession(data: Omit<SessionRecord, 'id' | 'created_at' | 'tension_delta'>): Promise<{ success: boolean; isOffline: boolean; error?: string }> {
  const localId = 'local_' + Math.random().toString(36).substring(2, 9);
  const payload: SessionRecord = {
    ...data,
    id: localId,
    tension_delta: data.pre_tension - data.post_tension,
    created_at: new Date().toISOString(),
    synced_to_cloud: false
  };

  // Always keep offline copy as cache/backup
  saveLocalSession(payload);

  if (!supabase) {
    return { success: true, isOffline: true };
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
      return { success: true, isOffline: false };
    }

    console.warn('Supabase sync error, stored locally:', error?.message);
    return { success: true, isOffline: true, error: error?.message };
  } catch (err: any) {
    console.warn('Network or Supabase failure, stored locally:', err?.message);
    return { success: true, isOffline: true, error: err?.message };
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

      return {
        ...item,
        anonymous_user_id: userId,
        breathing_pattern: pattern || '326',
        target_duration_seconds: targetDur || 120,
        tension_delta: item.tension_delta !== undefined ? item.tension_delta : (item.pre_tension - item.post_tension)
      };
    });

    // Merge remote sessions with any unsynced local sessions that have local_ prefix
    const localOnly = localSessions.filter(s => s.id?.startsWith('local_'));
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
