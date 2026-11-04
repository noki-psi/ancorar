import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

interface StepPostCheckoutProps {
  value: number;
  onChange: (val: number) => void;
  onNext: () => void;
}

const SCALE_OPTIONS = [
  { level: 5, emoji: '🔴', label: 'Muito Ansioso / Taquicárdico' },
  { level: 4, emoji: '🟠', label: 'Tenso / Preocupado' },
  { level: 3, emoji: '🟡', label: 'Agitado / Disperso' },
  { level: 2, emoji: '🟢', label: 'Neutro / Leve' },
  { level: 1, emoji: '🔵', label: 'Calmo / Focado' },
];

export const StepPostCheckout: React.FC<StepPostCheckoutProps> = ({ value, onChange, onNext }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col flex-1 justify-center space-y-5 py-4"
    >
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-semibold text-emerald-300">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Passo 3 de 4 • Reavaliação de Impacto</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Como você se sente após essa pausa?
        </h2>
        <p className="text-xs text-slate-400">
          Observe a sensação no seu peito, batimentos cardíacos e respiração agora:
        </p>
      </div>

      <div className="space-y-2.5">
        {SCALE_OPTIONS.map((item) => {
          const isSelected = value === item.level;
          return (
            <button
              key={item.level}
              type="button"
              onClick={() => onChange(item.level)}
              className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 ${
                isSelected 
                  ? 'border-emerald-400 bg-emerald-950/40 shadow-md shadow-emerald-500/20 scale-[1.01]' 
                  : 'border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl filter drop-shadow">{item.emoji}</span>
                <div>
                  <span className="text-sm font-bold text-slate-100">
                    Nível {item.level} - {item.label}
                  </span>
                </div>
              </div>
              <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                isSelected ? 'border-emerald-400 bg-emerald-400' : 'border-slate-600 bg-transparent'
              }`}>
                {isSelected && <div className="w-2 h-2 rounded-full bg-slate-950" />}
              </div>
            </button>
          );
        })}
      </div>

      <div className="pt-2">
        <button
          onClick={onNext}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98]"
        >
          <span>Ver Meu Resultado de Ancoragem</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};
