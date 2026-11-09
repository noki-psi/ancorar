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
    label: 'Muito tenso',
    desc: 'Coração acelerado, mente agitada, aperto no peito',
    color: 'text-rose-500',
    accentBg: 'bg-rose-500/10',
    badgeBorder: 'border-rose-500/30',
  },
  4: {
    level: 4,
    emoji: '🟠',
    label: 'Tenso',
    desc: 'Músculos rígidos, pensamentos acelerados',
    color: 'text-orange-500',
    accentBg: 'bg-orange-500/10',
    badgeBorder: 'border-orange-500/30',
  },
  3: {
    level: 3,
    emoji: '🟡',
    label: 'Agitado',
    desc: 'Dificuldade de foco, leve inquietação',
    color: 'text-amber-500',
    accentBg: 'bg-amber-500/10',
    badgeBorder: 'border-amber-500/30',
  },
  2: {
    level: 2,
    emoji: '🟢',
    label: 'Neutro',
    desc: 'Tranquilo com ritmo confortável',
    color: 'text-emerald-500',
    accentBg: 'bg-emerald-500/10',
    badgeBorder: 'border-emerald-500/30',
  },
  1: {
    level: 1,
    emoji: '🔵',
    label: 'Calmo',
    desc: 'Respiração profunda e mente estável',
    color: 'text-cyan-500',
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

export const getTensionEmoji = (level: number): string => {
  return TENSION_LEVELS[level]?.emoji || '🟡';
};
