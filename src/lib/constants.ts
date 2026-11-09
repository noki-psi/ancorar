export interface ScalePoint {
  level: number;
  label: string;
  bgLight: string;
  textLight: string;
  borderLight: string;
}

export const TENSION_SCALE_0_TO_10: ScalePoint[] = [
  { level: 0, label: 'Sem tensão (Muito calmo)', bgLight: 'bg-emerald-50 dark:bg-emerald-950/20', textLight: 'text-emerald-900 dark:text-emerald-200', borderLight: 'border-emerald-200 dark:border-emerald-900' },
  { level: 1, label: 'Tensão mínima', bgLight: 'bg-emerald-100/70 dark:bg-emerald-950/30', textLight: 'text-emerald-900 dark:text-emerald-200', borderLight: 'border-emerald-200 dark:border-emerald-800' },
  { level: 2, label: 'Muito leve', bgLight: 'bg-emerald-100 dark:bg-emerald-900/30', textLight: 'text-emerald-900 dark:text-emerald-200', borderLight: 'border-emerald-300 dark:border-emerald-800' },
  { level: 3, label: 'Leve', bgLight: 'bg-emerald-200/80 dark:bg-emerald-900/40', textLight: 'text-emerald-900 dark:text-emerald-100', borderLight: 'border-emerald-300 dark:border-emerald-700' },
  { level: 4, label: 'Leve a moderada', bgLight: 'bg-emerald-300/70 dark:bg-emerald-800/40', textLight: 'text-emerald-950 dark:text-emerald-100', borderLight: 'border-emerald-400 dark:border-emerald-700' },
  { level: 5, label: 'Tensão moderada', bgLight: 'bg-emerald-400/70 dark:bg-emerald-800/60', textLight: 'text-emerald-950 dark:text-emerald-100', borderLight: 'border-emerald-500 dark:border-emerald-600' },
  { level: 6, label: 'Moderada a intensa', bgLight: 'bg-emerald-500/70 dark:bg-emerald-700/60', textLight: 'text-white dark:text-emerald-50', borderLight: 'border-emerald-600 dark:border-emerald-500' },
  { level: 7, label: 'Intensa', bgLight: 'bg-emerald-600/80 dark:bg-emerald-700/80', textLight: 'text-white dark:text-emerald-50', borderLight: 'border-emerald-600 dark:border-emerald-500' },
  { level: 8, label: 'Muito intensa', bgLight: 'bg-emerald-700/90 dark:bg-emerald-600', textLight: 'text-white dark:text-emerald-50', borderLight: 'border-emerald-700 dark:border-emerald-400' },
  { level: 9, label: 'Severa', bgLight: 'bg-emerald-800 dark:bg-emerald-500', textLight: 'text-white dark:text-stone-900', borderLight: 'border-emerald-800 dark:border-emerald-400' },
  { level: 10, label: 'Tensão máxima', bgLight: 'bg-emerald-950 dark:bg-emerald-400', textLight: 'text-white dark:text-stone-950', borderLight: 'border-emerald-950 dark:border-emerald-300' },
];

export const getScaleLabel = (level: number | null | undefined): string => {
  if (level === null || level === undefined) return 'Não avaliado';
  return TENSION_SCALE_0_TO_10[level]?.label || `Nível ${level}`;
};
