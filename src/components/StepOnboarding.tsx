import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck } from 'lucide-react';

interface StepOnboardingProps {
  onNext: () => void;
}

export const StepOnboarding: React.FC<StepOnboardingProps> = ({ onNext }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
      className="flex flex-col flex-1 justify-center space-y-7 py-6"
    >
      <div className="space-y-3.5">
        <span 
          className="text-xs font-semibold tracking-wider text-sage-400 uppercase"
          title="Espaço de pausa antes da sua avaliação"
        >
          Momento de Pausa
        </span>
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-sand-200 leading-snug">
          A tensão da avaliação e os pensamentos automáticos
        </h2>

        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
          Diante de uma prova, é comum surgirem ideias como <em className="text-sand-300">"não vou lembrar"</em> ou <em className="text-sand-300">"vou falhar"</em>. 
          Esses pensamentos frequentemente desencadeiam sinais no corpo, como taquicardia, respiração superficial e inquietação.
        </p>
      </div>

      <div className="p-5 rounded-2xl bg-petrol-900/70 border border-petrol-700/50 space-y-3.5 shadow-sm">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-sage-400 shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            O <strong className="text-sand-200 font-medium">Ancorar</strong> propõe uma pausa com respiração compassada (proporção 3:2:6). Essa prática pode favorecer a desaceleração do ritmo autonômico e ajudar a resgatar a sensação de clareza mental.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-300 font-medium pt-2.5 border-t border-petrol-800/80">
          <span title="Duração estimada da prática">Prática breve (1 a 3 min)</span>
          <span className="text-slate-600">•</span>
          <span title="Nenhum dado pessoal identificável é coletado">Participação anônima</span>
        </div>
      </div>

      <button
        onClick={onNext}
        title="Começar autoavaliação do nível de tensão"
        className="w-full py-4 px-6 rounded-2xl bg-sage-400 hover:bg-sage-300 text-petrol-950 font-bold text-base flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-md"
      >
        <span>Iniciar autoavaliação</span>
        <ArrowRight className="w-5 h-5" />
      </button>
    </motion.div>
  );
};
