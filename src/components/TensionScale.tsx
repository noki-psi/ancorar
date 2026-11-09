import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import { TENSION_SCALE_0_TO_10, getScaleLabel } from '../lib/constants';

interface TensionScaleProps {
  title?: string;
  subtitle?: string;
  value: number | null;
  onChange: (val: number) => void;
  onConfirm: () => void;
  onSkip: () => void;
  confirmLabel?: string;
  skipLabel?: string;
}

export const TensionScale: React.FC<TensionScaleProps> = ({
  title = 'Como você se percebe agora?',
  subtitle = 'Selecione seu nível de tensão neste momento (escala de 0 a 10).',
  value,
  onChange,
  onConfirm,
  onSkip,
  confirmLabel = 'Continuar',
  skipLabel = 'Pular avaliação',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
      className="flex flex-col flex-1 justify-center space-y-6 py-6 max-w-sm mx-auto w-full select-none"
    >
      {/* Title & Subtitle */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          {title}
        </h2>
        <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 max-w-xs mx-auto leading-relaxed">
          {subtitle}
        </p>
      </div>

      {/* Scale Card */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#151c22] border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
        {/* Current Selection Feedback */}
        <div className="text-center py-1 border-b border-stone-100 dark:border-stone-800/80">
          <span className="text-xs uppercase font-bold tracking-wider text-stone-400 block mb-1">
            Nível Selecionado
          </span>
          <div className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 h-7 flex items-center justify-center">
            {value !== null ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300">
                <span className="text-xl font-extrabold">{value}</span>
                <span>—</span>
                <span className="font-semibold text-sm">{getScaleLabel(value)}</span>
              </span>
            ) : (
              <span className="text-stone-400 font-normal text-xs">
                Toque em um número de 0 a 10
              </span>
            )}
          </div>
        </div>

        {/* 0 to 10 Scale Grid with Monochromatic Gradient */}
        <div className="grid grid-cols-11 gap-1 pt-1">
          {TENSION_SCALE_0_TO_10.map((item) => {
            const isSelected = value === item.level;
            return (
              <button
                key={item.level}
                type="button"
                onClick={() => onChange(item.level)}
                title={`${item.level}: ${item.label}`}
                className={`h-11 rounded-lg border flex flex-col items-center justify-center transition-all ${item.bgLight} ${item.textLight} ${
                  isSelected
                    ? 'ring-2 ring-emerald-700 dark:ring-emerald-400 ring-offset-2 ring-offset-white dark:ring-offset-[#151c22] scale-105 z-10 font-black shadow-md border-emerald-700'
                    : 'border-stone-200 dark:border-stone-800 hover:scale-102 hover:border-emerald-500 font-bold opacity-90 hover:opacity-100'
                }`}
              >
                <span className="text-xs sm:text-sm tabular-nums">{item.level}</span>
                {isSelected && <span className="w-1 h-1 rounded-full bg-current mt-0.5" />}
              </button>
            );
          })}
        </div>

        {/* Scale Legend (Anchors) */}
        <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400 pt-1 font-medium">
          <span className="text-left font-semibold text-emerald-800 dark:text-emerald-300">
            0 • Sem tensão
          </span>
          <span className="text-center text-stone-400">
            5 • Moderada
          </span>
          <span className="text-right font-semibold text-emerald-950 dark:text-emerald-200">
            10 • Tensão máxima
          </span>
        </div>
      </div>

      {/* Actions: Confirm (if selected) or Skip */}
      <div className="space-y-2 pt-2">
        <button
          type="button"
          onClick={onConfirm}
          disabled={value === null}
          title={value !== null ? confirmLabel : 'Selecione um nível para continuar'}
          className="w-full py-4 px-6 rounded-2xl bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 disabled:opacity-35 disabled:hover:bg-emerald-700 text-white font-bold text-base flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-sm"
        >
          <span>{confirmLabel}</span>
          {value !== null ? <Check className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
        </button>

        <button
          type="button"
          onClick={onSkip}
          title="Avançar sem registrar avaliação de tensão"
          className="w-full py-2.5 text-xs font-semibold text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 transition-colors text-center"
        >
          {skipLabel}
        </button>
      </div>
    </motion.div>
  );
};
