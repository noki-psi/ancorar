import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowRight } from 'lucide-react';

interface StepCompassionProps {
  preTension: number;
  onNext: () => void;
  onBack: () => void;
}

export const StepCompassion: React.FC<StepCompassionProps> = ({ preTension, onNext, onBack }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col flex-1 justify-center space-y-6 py-6"
    >
      {/* Icon */}
      <div className="flex justify-center">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-emerald-500/20 border border-cyan-500/20 flex items-center justify-center">
          <ShieldCheck className="w-7 h-7 text-cyan-400" />
        </div>
      </div>

      {/* Compassionate quote */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 relative">
        <p className="text-base text-slate-100 font-medium leading-relaxed text-center italic">
          "O que você sente agora não é seu inimigo. É apenas o seu corpo tentando cuidar de você."
        </p>
        <p className="text-sm text-slate-300 text-center mt-3 not-italic">
          Vamos respirar juntos e sinalizar segurança para o seu sistema.
        </p>

        <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
          <span>Tensão registrada</span>
          <span className="font-semibold text-cyan-300">Nível {preTension} de 5</span>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <button
          onClick={onNext}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        >
          <span>Iniciar exercício de respiração</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          onClick={onBack}
          className="w-full py-2.5 text-xs text-slate-400 hover:text-slate-200 transition-colors font-medium"
        >
          ← Alterar autoavaliação
        </button>
      </div>
    </motion.div>
  );
};
