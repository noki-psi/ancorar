export interface SessionRecord {
  id?: string;
  anonymous_user_id: string;
  pre_tension: number;
  post_tension: number;
  tension_delta?: number;
  duration_seconds: number;
  created_at?: string;
}

export type Step = 
  | 'onboarding'
  | 'pre-checkin'
  | 'compassion'
  | 'breathing'
  | 'post-checkout'
  | 'summary';

export type BreathPhase = 'inhale' | 'hold' | 'exhale';
