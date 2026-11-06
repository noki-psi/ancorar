export interface BreathingSettings {
  totalDurationSeconds: number;
  inhaleDuration: number;
  holdDuration: number;
  exhaleDuration: number;
}

export const DEFAULT_BREATHING_SETTINGS: BreathingSettings = {
  totalDurationSeconds: 120, // 2 minutes
  inhaleDuration: 3,         // 3 seconds
  holdDuration: 2,           // 2 seconds
  exhaleDuration: 6,         // 6 seconds
};

const SETTINGS_KEY = 'ancorar_breathing_settings';

export function getBreathingSettings(): BreathingSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_BREATHING_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      totalDurationSeconds: Number(parsed.totalDurationSeconds) || 120,
      inhaleDuration: Math.max(2, Math.min(8, Number(parsed.inhaleDuration) || 3)),
      holdDuration: Math.max(0, Math.min(6, typeof parsed.holdDuration === 'number' ? parsed.holdDuration : 2)),
      exhaleDuration: Math.max(3, Math.min(12, Number(parsed.exhaleDuration) || 6)),
    };
  } catch {
    return DEFAULT_BREATHING_SETTINGS;
  }
}

export function saveBreathingSettings(settings: BreathingSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save breathing settings', e);
  }
}
