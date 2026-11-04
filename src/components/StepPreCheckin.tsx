import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Activity } from 'lucide-react';

interface StepPreCheckinProps {
  value: number;
  onChange: (val: number) => void;
  onNext: () => void;
}

const SCALE_OPTIONS = [
  { level: 5, emoji: '🔴', label: 'Muito Ansioso / Taquicárdico', desc: 'Coração acelerado, mente a mil, aperto no peito', color: 'border-rose-500/40 bg-rose-950/20 text-rose-300 active:border-rose-400' },
  { level: 4, emoji: '🟠', label: 'Tenso / Preocupado', desc: 'Músculos rígidos, pensamentos intrusivos de prova', color: 'border-orange-500/40 bg-orange-950/20 text-orange-300 active:border-orange-400' },
  { level: 3, emoji: '🟡', label: 'Agitado / Disperso', desc: 'Dificuldade de concentração, inquietude motora', color: 'border-amber-500/40 bg-amber-950/20 text-amber-300 active:border-amber-400' },
  { level: 2, emoji: '🟢', label: 'Neutro / Leve', desc: 'Tranquilo com pequenos toques de expectativa', color: 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300 active:border-emerald-400' },
  { level: 1, emoji: '🔵', label: 'Calmo / Focado', desc: 'Respiração profunda e mente estável', color: 'border-cyan-500/40 bg-cyan-950/20 text-cyan-300 active:border-cyan-400' },
];

export const StepPreCheckin: React.FC<StepPreCheckinProps> = ({ value, onChange, onNext }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col flex-1 justify-center space-y-5 py-4"
    >
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-[11px] font-semibold text-cyan-300">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span>Passo 1 de 4 • Autoavaliação Inicial</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Como está seu corpo e mente neste momento?
        </h2>
        <p className="text-xs text-slate-400">
          Identifique seu nível de tensão prévia com honestidade e sem autojulgamento:
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
                  ? 'border-cyan-400 bg-cyan-950/40 shadow-md shadow-cyan-500/20 scale-[1.01]' 
                  : `${item.color} hover:bg-slate-800/60`
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl filter drop-shadow">{item.emoji}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-100">
                      Nível {item.level} - {item.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-normal mt-0.5">
                    {item.desc}
                  </p>
                </div>
              </div>
              <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                isSelected ? 'border-cyan-400 bg-cyan-400' : 'border-slate-600 bg-transparent'
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
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98]"
        >
          <span>Continuar</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};
