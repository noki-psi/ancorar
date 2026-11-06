import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { TENSION_LIST } from '../lib/constants';

interface StepPreCheckinProps {
  value: number;
  onChange: (val: number) => void;
  onNext: () => void;
}

export const StepPreCheckin: React.FC<StepPreCheckinProps> = ({ value, onChange, onNext }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
      className="flex flex-col flex-1 justify-center space-y-5 py-4"
    >
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-sand-200 tracking-tight">
          Como está seu corpo e mente agora?
        </h2>
        <p className="text-xs text-slate-400">Observe seu estado neste instante, sem julgamento.</p>
      </div>

      <div className="space-y-2">
        {TENSION_LIST.map((item) => {
          const isSelected = value === item.level;
          return (
            <button
              key={item.level}
              type="button"
              onClick={() => onChange(item.level)}
              className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                isSelected 
                  ? 'border-sage-400/80 bg-petrol-800/90 text-white shadow-sm' 
                  : 'border-petrol-800/60 bg-petrol-900/40 text-slate-300 hover:bg-petrol-800/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-base select-none" role="img" aria-label={item.label}>{item.emoji}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-100">{item.level} — {item.label}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
                </div>
              </div>
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                isSelected ? 'border-sage-400 bg-sage-400' : 'border-slate-600'
              }`}>
                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-petrol-950" />}
              </div>
            </button>
          );
        })}
      </div>

      <button
        onClick={onNext}
        className="w-full py-3.5 px-6 rounded-2xl bg-sage-400 hover:bg-sage-300 text-petrol-950 font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-sm"
      >
        <span>Continuar</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </motion.div>
  );
};
