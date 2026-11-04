import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, ShieldCheck, HeartHandshake, ArrowRight } from 'lucide-react';

interface StepCompassionProps {
  preTension: number;
  onNext: () => void;
  onBack: () => void;
}

export const StepCompassion: React.FC<StepCompassionProps> = ({ preTension, onNext, onBack }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col flex-1 justify-center space-y-6 py-4"
    >
      <div className="flex flex-col items-center text-center space-y-3">
        {/* Glowing Shield Icon */}
        <div className="relative">
          <div className="absolute inset-0 bg-cyan-500/25 blur-xl rounded-full animate-pulse-slow"></div>
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-600 to-emerald-400 p-[1.5px] shadow-xl">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-cyan-400" />
            </div>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-[11px] font-semibold text-teal-300">
          <HeartHandshake className="w-3.5 h-3.5" />
          <span>Abordagem Compassiva (Inspirada em IFS)</span>
        </div>
      </div>

      {/* Card da Citação Reflexiva */}
      <div className="p-6 rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950/80 border border-slate-800 shadow-2xl relative overflow-hidden backdrop-blur-md">
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
        
        <p className="text-base sm:text-lg text-slate-100 font-medium leading-relaxed italic text-center">
          "Lembre-se: o que você sente agora não é seu inimigo. É apenas o seu corpo tentando cuidar de você. Vamos respirar juntos e sinalizar segurança para o seu sistema."
        </p>

        <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span>Tensão inicial registrada:</span>
          <span className="font-semibold text-cyan-300">Nível {preTension} de 5</span>
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="space-y-2.5 pt-2">
        <button
          onClick={onNext}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98]"
        >
          <span>Iniciar Exercício de Ancoragem</span>
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
