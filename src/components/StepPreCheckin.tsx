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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col flex-1 justify-center space-y-5 py-4"
    >
      <div className="space-y-1.5">
        <p className="text-[11px] text-cyan-400 font-semibold tracking-wide uppercase">Passo 1 de 4</p>
        <h2 className="text-xl font-bold text-white tracking-tight">
          Como está seu corpo e mente agora?
        </h2>
        <p className="text-xs text-slate-400">Identifique sua sensação neste momento, sem julgamento:</p>
      </div>

      <div className="space-y-2">
        {TENSION_LIST.map((item) => {
          const isSelected = value === item.level;
          return (
            <button
              key={item.level}
              type="button"
              onClick={() => onChange(item.level)}
              className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                isSelected 
                  ? 'border-cyan-400/60 bg-cyan-500/10 shadow-sm shadow-cyan-500/10' 
                  : `${item.badgeBorder} ${item.accentBg} hover:bg-slate-800/40`
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg" role="img" aria-label={item.label}>{item.emoji}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-100">{item.level} - {item.label}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
                </div>
              </div>
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                isSelected ? 'border-cyan-400 bg-cyan-400' : 'border-slate-600'
              }`}>
                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
              </div>
            </button>
          );
        })}
      </div>

      <button
        onClick={onNext}
        className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
      >
        <span>Continuar</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </motion.div>
  );
};
