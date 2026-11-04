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
    sessions.unshift({
      ...session,
      id: session.id || 'local_' + Math.random().toString(36).substring(2, 9),
      tension_delta: session.pre_tension - session.post_tension,
      created_at: session.created_at || new Date().toISOString()
    });
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

export async function saveSession(data: Omit<SessionRecord, 'id' | 'created_at' | 'tension_delta'>): Promise<{ success: boolean; isOffline: boolean; error?: string }> {
  const payload = {
    ...data,
    tension_delta: data.pre_tension - data.post_tension,
    created_at: new Date().toISOString()
  };

  // Always keep offline copy as cache/backup
  saveLocalSession(payload);

  if (!supabase) {
    return { success: true, isOffline: true };
  }

  try {
    const { error } = await supabase.from('sessions').insert([
      {
        anonymous_user_id: data.anonymous_user_id,
        pre_tension: data.pre_tension,
        post_tension: data.post_tension,
        duration_seconds: data.duration_seconds
      }
    ]);

    if (error) {
      console.warn('Supabase sync error, stored locally:', error.message);
      return { success: true, isOffline: true, error: error.message };
    }

    return { success: true, isOffline: false };
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

    // Merge remote sessions with any unsynced local sessions that have local_ prefix
    const localOnly = localSessions.filter(s => s.id?.startsWith('local_'));
    const combined = [...data, ...localOnly];
    
    return { 
      sessions: combined.map(item => ({
        ...item,
        tension_delta: item.tension_delta !== undefined ? item.tension_delta : (item.pre_tension - item.post_tension)
      })), 
      isOffline: false 
    };
  } catch (err) {
    console.warn('Network failure fetching sessions:', err);
    return { sessions: localSessions, isOffline: true };
  }
}
