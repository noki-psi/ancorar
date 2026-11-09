import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { TENSION_LIST } from '../lib/constants';

interface StepPostCheckoutProps {
  value: number;
  onChange: (val: number) => void;
  onNext: () => void;
}

export const StepPostCheckout: React.FC<StepPostCheckoutProps> = ({ value, onChange, onNext }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
      className="flex flex-col flex-1 justify-center space-y-5 py-4 max-w-md mx-auto w-full select-none"
    >
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
          Como você percebe seu corpo agora?
        </h2>
        <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
          Note seu peito, respiração e ritmo cardíaco após a prática.
        </p>
      </div>

      <div className="space-y-2.5">
        {TENSION_LIST.map((item) => {
          const isSelected = value === item.level;
          return (
            <button
              key={item.level}
              type="button"
              onClick={() => onChange(item.level)}
              title={`Selecionar nível ${item.level}: ${item.label}`}
              className={`w-full p-3.5 sm:p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                isSelected 
                  ? 'border-emerald-700 bg-emerald-50/70 dark:bg-emerald-950/40 dark:border-emerald-500 shadow-sm' 
                  : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-[#151c22] text-stone-700 dark:text-stone-300 hover:border-stone-300 dark:hover:border-stone-700'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <span className="text-xl select-none" role="img" aria-label={item.label}>{item.emoji}</span>
                <span className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100">
                  {item.level} — {item.label}
                </span>
              </div>
              <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                isSelected ? 'border-emerald-700 bg-emerald-700 dark:border-emerald-400 dark:bg-emerald-400' : 'border-stone-300 dark:border-stone-600'
              }`}>
                {isSelected && <div className="w-2 h-2 rounded-full bg-white dark:bg-stone-900" />}
              </div>
            </button>
          );
        })}
      </div>

      <button
        onClick={onNext}
        title="Visualizar a comparação de antes e depois"
        className="w-full py-4 px-6 rounded-2xl bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-base flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-sm"
      >
        <span>Ver resultado</span>
        <ArrowRight className="w-5 h-5" />
      </button>
    </motion.div>
  );
};
