export interface TensionLevel {
  level: number;
  emoji: string;
  label: string;
  desc: string;
  color: string;
  accentBg: string;
  badgeBorder: string;
}

export const TENSION_LEVELS: Record<number, TensionLevel> = {
  5: {
    level: 5,
    emoji: '🔴',
    label: 'Muito ansioso',
    desc: 'Coração acelerado, mente a mil, aperto no peito',
    color: 'text-rose-400',
    accentBg: 'bg-rose-500/10',
    badgeBorder: 'border-rose-500/30',
  },
  4: {
    level: 4,
    emoji: '🟠',
    label: 'Tenso',
    desc: 'Músculos rígidos, pensamentos de prova',
    color: 'text-orange-400',
    accentBg: 'bg-orange-500/10',
    badgeBorder: 'border-orange-500/30',
  },
  3: {
    level: 3,
    emoji: '🟡',
    label: 'Agitado',
    desc: 'Dificuldade de foco, inquietude',
    color: 'text-amber-400',
    accentBg: 'bg-amber-500/10',
    badgeBorder: 'border-amber-500/30',
  },
  2: {
    level: 2,
    emoji: '🟢',
    label: 'Neutro',
    desc: 'Tranquilo com leve expectativa',
    color: 'text-emerald-400',
    accentBg: 'bg-emerald-500/10',
    badgeBorder: 'border-emerald-500/30',
  },
  1: {
    level: 1,
    emoji: '🔵',
    label: 'Calmo',
    desc: 'Respiração profunda e mente estável',
    color: 'text-cyan-400',
    accentBg: 'bg-cyan-500/10',
    badgeBorder: 'border-cyan-500/30',
  },
};

export const TENSION_LIST: TensionLevel[] = [
  TENSION_LEVELS[5],
  TENSION_LEVELS[4],
  TENSION_LEVELS[3],
  TENSION_LEVELS[2],
  TENSION_LEVELS[1],
];

export function getTensionEmoji(level: number): string {
  const rounded = Math.min(5, Math.max(1, Math.round(level)));
  return TENSION_LEVELS[rounded]?.emoji || '⚪';
}
