import React from 'react';
import { motion } from 'framer-motion';
import { Brain, ArrowRight, Activity, ShieldCheck } from 'lucide-react';

interface StepOnboardingProps {
  onNext: () => void;
}

export const StepOnboarding: React.FC<StepOnboardingProps> = ({ onNext }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col flex-1 justify-center space-y-5 py-4"
    >
      {/* Badge Conceitual */}
      <div className="inline-flex items-center gap-2 self-start px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">
        <Brain className="w-3.5 h-3.5" />
        <span>Psicoeducação • Modelo TCC (Beck)</span>
      </div>

      <div className="space-y-3">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
          A Tensão da Prova e os <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">Pensamentos Automáticos</span>
        </h2>
        <p className="text-slate-300 text-sm leading-relaxed">
          Ao se deparar com uma prova ou avaliação acadêmica, é perfeitamente natural que surjam 
          <strong className="text-cyan-300 font-semibold"> Pensamentos Automáticos</strong> como 
          <em className="text-slate-200"> "Não vou lembrar de nada"</em> ou 
          <em className="text-slate-200"> "Vou falhar e decepcionar a todos"</em>.
        </p>
      </div>

      {/* Caixa de Impacto Psicofisiológico */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-900/40 border border-slate-800 backdrop-blur-sm space-y-3">
        <div className="flex items-center gap-2.5 text-xs font-bold text-amber-400 tracking-wide uppercase">
          <Activity className="w-4 h-4 text-amber-400" />
          <span>A Resposta no Seu Corpo</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Esses pensamentos ativam respostas viscerais imediatas: taquicardia, aperto no peito, respiração curta e sensação de bloqueio mental ("deu um branco").
        </p>
        <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2 text-xs text-emerald-400 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>O <strong className="text-white">Ancorar</strong> desacelera seu sistema nervoso autônomo e restaura o foco do córtex pré-frontal.</span>
        </div>
      </div>

      <div className="pt-2">
        <button
          onClick={onNext}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98]"
        >
          <span>Entender meu estado atual</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};
