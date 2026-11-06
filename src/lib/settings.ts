export interface BreathingSettings {
  totalDurationSeconds: number;
  inhaleDuration: number;
  holdDuration: number;
  exhaleDuration: number;
  holdPostExhaleDuration: number;
}

export const DEFAULT_BREATHING_SETTINGS: BreathingSettings = {
  totalDurationSeconds: 120, // 2 minutes
  inhaleDuration: 3,         // 3 seconds
  holdDuration: 2,           // 2 seconds
  exhaleDuration: 6,         // 6 seconds
  holdPostExhaleDuration: 0, // 0 seconds (default 3:2:6, optionally + hold pós-exalação)
};

const SETTINGS_KEY = 'ancorar_breathing_settings';

export function getPatternRaw(settings: BreathingSettings): string {
  if (settings.holdPostExhaleDuration > 0) {
    return `${settings.inhaleDuration}${settings.holdDuration}${settings.exhaleDuration}${settings.holdPostExhaleDuration}`;
  }
  return `${settings.inhaleDuration}${settings.holdDuration}${settings.exhaleDuration}`;
}

export function formatPatternDisplay(patternOrSettings: string | BreathingSettings): string {
  if (typeof patternOrSettings === 'object') {
    if (patternOrSettings.holdPostExhaleDuration > 0) {
      return `${patternOrSettings.inhaleDuration}:${patternOrSettings.holdDuration}:${patternOrSettings.exhaleDuration}:${patternOrSettings.holdPostExhaleDuration}`;
    }
    return `${patternOrSettings.inhaleDuration}:${patternOrSettings.holdDuration}:${patternOrSettings.exhaleDuration}`;
  }

  const clean = patternOrSettings.replace(/[^0-9]/g, '');
  if (!clean) return '3:2:6';
  return clean.split('').join(':');
}

export function formatDurationLabel(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  if (mins === 0) return `${secs}s`;
  if (secs === 0) return `${mins} min`;
  return `${mins}m ${secs}s`;
}

export function formatDurationLong(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  if (mins === 0) return `${secs} segundos`;
  if (secs === 0) return `${mins} ${mins === 1 ? 'minuto' : 'minutos'}`;
  return `${mins} min e ${secs} seg`;
}

export function getBreathingSettings(): BreathingSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_BREATHING_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      totalDurationSeconds: Math.max(10, Math.min(3600, Number(parsed.totalDurationSeconds) || 120)),
      inhaleDuration: Math.max(2, Math.min(8, Number(parsed.inhaleDuration) || 3)),
      holdDuration: Math.max(0, Math.min(6, typeof parsed.holdDuration === 'number' ? parsed.holdDuration : 2)),
      exhaleDuration: Math.max(3, Math.min(12, Number(parsed.exhaleDuration) || 6)),
      holdPostExhaleDuration: Math.max(0, Math.min(6, typeof parsed.holdPostExhaleDuration === 'number' ? parsed.holdPostExhaleDuration : 0)),
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
