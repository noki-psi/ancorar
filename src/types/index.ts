export interface SessionRecord {
  id?: string;
  anonymous_user_id: string;
  pre_tension: number;
  post_tension: number;
  tension_delta?: number;
  duration_seconds: number;
  breathing_pattern?: string; // e.g. "326" or "3262"
  target_duration_seconds?: number; // e.g. 120
  created_at?: string;
  synced_to_cloud?: boolean;
  evaluation_skipped?: boolean;
}

export type Step = 
  | 'onboarding'
  | 'breathing'
  | 'summary';

export type BreathPhase = 'inhale' | 'hold' | 'exhale' | 'hold_post_exhale';
