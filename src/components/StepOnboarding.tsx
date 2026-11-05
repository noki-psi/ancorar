import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface StepOnboardingProps {
  onNext: () => void;
}

export const StepOnboarding: React.FC<StepOnboardingProps> = ({ onNext }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col flex-1 justify-center space-y-6 py-6"
    >
      {/* Hero */}
      <div className="space-y-4">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
          A tensão da prova e os{' '}
          <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
            pensamentos automáticos
          </span>
        </h2>

        <p className="text-slate-300 text-sm leading-relaxed">
          Antes de uma avaliação, é natural surgirem pensamentos como{' '}
          <em className="text-slate-200">"Não vou lembrar"</em> ou{' '}
          <em className="text-slate-200">"Vou falhar"</em>.
          Eles ativam respostas no corpo: coração acelerado, aperto no peito e respiração curta.
        </p>
      </div>

      {/* Info card */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
        <p className="text-xs text-slate-300 leading-relaxed">
          O <strong className="text-white">Ancorar</strong> usa a respiração prolongada (proporção 3:2:6) para
          ativar seu nervo vago e devolver a clareza antes da prova.
        </p>
        <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
          <span>⏱ Exercício de 1 a 3 min</span>
          <span className="text-slate-700">•</span>
          <span>🔒 100% anônimo</span>
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={onNext}
        className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
      >
        <span>Começar</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </motion.div>
  );
};
