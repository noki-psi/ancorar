import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingDown, ExternalLink, RotateCcw, Award, Cloud, CloudOff } from 'lucide-react';
import confetti from 'canvas-confetti';

interface StepSummaryProps {
  preTension: number;
  postTension: number;
  durationSeconds: number;
  isOffline: boolean;
  onRestart: () => void;
}

export const StepSummary: React.FC<StepSummaryProps> = ({
  preTension,
  postTension,
  durationSeconds,
  isOffline,
  onRestart,
}) => {
  const delta = preTension - postTension;
  const surveyUrl = import.meta.env.VITE_SURVEY_URL || 'https://forms.gle/exemplo-questionario-unirn';

  useEffect(() => {
    if (delta > 0) {
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.65 },
          colors: ['#22d3ee', '#34d399', '#38bdf8']
        });
      } catch (e) {
        // Fallback
      }
    }
  }, [delta]);

  const getFeedbackMessage = () => {
    if (delta > 1) {
      return {
        title: 'Excelente ancoragem!',
        desc: `Sua ansiedade percebida reduziu em ${delta} pontos (de ${preTension} para ${postTension}). Seu sistema parassimpático respondeu positivamente ao estímulo vagal.`,
        badgeColor: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
      };
    } else if (delta === 1) {
      return {
        title: 'Pausa reconfortante!',
        desc: `Você reduziu 1 nível de tensão (de ${preTension} para ${postTension}). Pequenas pausas geram grande amortecimento cognitivo diante das avaliações.`,
        badgeColor: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
      };
    } else if (delta === 0) {
      return {
        title: 'Estabilidade mantida',
        desc: `Seu nível permaneceu em ${preTension}. A respiração prolongada atuou prevenindo o aumento da reatividade ao estresse da prova.`,
        badgeColor: 'bg-teal-500/10 text-teal-300 border-teal-500/30'
      };
    } else {
      return {
        title: 'Acolhimento da sensação',
        desc: `Trazer consciência para o corpo às vezes destaca a tensão que já estava presente. Tudo bem, respire no seu próprio ritmo.`,
        badgeColor: 'bg-amber-500/10 text-amber-300 border-amber-500/30'
      };
    }
  };

  const feedback = getFeedbackMessage();

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col flex-1 justify-center space-y-5 py-3"
    >
      {/* Status da gravação de dados */}
      <div className="flex items-center justify-between text-[11px] px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800">
        <span className="text-slate-400">Base de dados da pesquisa:</span>
        <span className={`inline-flex items-center gap-1.5 font-semibold ${isOffline ? 'text-amber-300' : 'text-emerald-300'}`}>
          {isOffline ? <CloudOff className="w-3.5 h-3.5" /> : <Cloud className="w-3.5 h-3.5" />}
          {isOffline ? 'Salvo no seu aparelho (offline)' : 'Enviado à pesquisa UNI-RN (anônimo)'}
        </span>
      </div>

      {/* Card Principal de Impacto */}
      <div className="p-6 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 shadow-xl space-y-4 text-center relative overflow-hidden">
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${feedback.badgeColor}`}>
          <Award className="w-4 h-4 text-cyan-400" />
          <span>{feedback.title}</span>
        </div>

        {/* Delta Visualizer */}
        <div className="flex items-center justify-center gap-4 py-2">
          <div className="text-center">
            <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Antes</span>
            <div className="text-3xl font-extrabold text-slate-200 mt-1">
              {preTension} <span className="text-xs text-slate-500 font-normal">/ 5</span>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center">
            <TrendingDown className={`w-8 h-8 ${delta > 0 ? 'text-emerald-400 animate-bounce' : 'text-cyan-400'}`} />
            {delta > 0 && (
              <span className="text-[10px] font-bold text-emerald-400 mt-0.5">
                -{delta} {delta === 1 ? 'nível' : 'níveis'}
              </span>
            )}
          </div>

          <div className="text-center">
            <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Depois</span>
            <div className="text-3xl font-extrabold text-cyan-300 mt-1">
              {postTension} <span className="text-xs text-slate-500 font-normal">/ 5</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed font-normal">
          {feedback.desc}
        </p>

        <div className="pt-2 text-[11px] text-slate-400">
          Duração da microintervenção: <strong className="text-slate-200">{Math.round(durationSeconds)} segundos</strong>
        </div>
      </div>

      {/* Banner de Chamada para a Pesquisa Acadêmica UNI-RN */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/60 via-slate-900 to-teal-950/60 border border-cyan-500/30 space-y-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">
              Sua experiência ajuda nossa pesquisa!
            </h4>
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
              Responda ao Questionário de Avaliação Acadêmica do UNI-RN e colabore com os dados do Projeto de Extensão.
            </p>
          </div>
        </div>

        <a
          href={surveyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-2.5 px-4 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all group"
        >
          <span>Responder Questionário no Google Forms</span>
          <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </a>
      </div>

      {/* Reiniciar */}
      <button
        onClick={onRestart}
        className="w-full py-3.5 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs tracking-wide border border-slate-700 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
      >
        <RotateCcw className="w-4 h-4 text-cyan-400" />
        <span>Fazer Outra Sessão de Respiração</span>
      </button>
    </motion.div>
  );
};
