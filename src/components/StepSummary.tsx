import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingDown, ExternalLink, RotateCcw, Award, Database } from 'lucide-react';
import confetti from 'canvas-confetti';
import { TENSION_LEVELS, getTensionEmoji } from '../lib/constants';
import { formatPatternDisplay } from '../lib/settings';

interface StepSummaryProps {
  preTension: number;
  postTension: number;
  durationSeconds: number;
  targetDurationSeconds?: number;
  breathingPattern?: string;
  isOffline: boolean;
  onRestart: () => void;
}

export const StepSummary: React.FC<StepSummaryProps> = ({
  preTension,
  postTension,
  durationSeconds,
  targetDurationSeconds = 120,
  breathingPattern = '326',
  isOffline,
  onRestart,
}) => {
  const delta = preTension - postTension;
  const surveyUrl = import.meta.env.VITE_SURVEY_URL || 'https://forms.gle/exemplo-questionario-unirn';

  useEffect(() => {
    if (delta > 0) {
      try {
        confetti({
          particleCount: 45,
          spread: 50,
          origin: { y: 0.65 },
          colors: ['#7fae9b', '#a3c9b8', '#e5d7b5']
        });
      } catch {
        // Fallback
      }
    }
  }, [delta]);

  const getFeedbackMessage = () => {
    if (delta > 1) {
      return {
        title: 'Pausa bem aproveitada',
        desc: `Sua tensão percebida reduziu em ${delta} níveis (de ${preTension} para ${postTension}). O ritmo respiratório mais lento pode ajudar seu corpo a reencontrar estabilidade.`,
        badgeColor: 'bg-sage-500/10 text-sage-300 border-sage-500/30'
      };
    } else if (delta === 1) {
      return {
        title: 'Sensação de alívio',
        desc: `Você reduziu 1 nível de tensão (de ${preTension} para ${postTension}). Momentos de desaceleração favorecem o equilíbrio antes da avaliação.`,
        badgeColor: 'bg-sage-500/10 text-sage-300 border-sage-500/30'
      };
    } else if (delta === 0) {
      return {
        title: 'Estabilidade acolhida',
        desc: `Seu nível se manteve em ${preTension}. A pausa com respiração lenta pode atuar como um amortecedor contra a elevação da ansiedade.`,
        badgeColor: 'bg-sand-400/10 text-sand-300 border-sand-400/30'
      };
    } else {
      return {
        title: 'Acolhimento da sensação',
        desc: `Voltar a atenção ao corpo às vezes torna tensões pré-existentes mais perceptíveis. Respeite seu tempo e ritmo interno.`,
        badgeColor: 'bg-sand-400/10 text-sand-300 border-sand-400/30'
      };
    }
  };

  const feedback = getFeedbackMessage();
  const preInfo = TENSION_LEVELS[preTension];
  const postInfo = TENSION_LEVELS[postTension];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
      className="flex flex-col flex-1 justify-center space-y-4 py-3"
    >
      {/* Research Sync Badge */}
      <div 
        className="flex items-center justify-between text-xs sm:text-sm px-4 py-2.5 rounded-xl bg-petrol-900/60 border border-petrol-800/80"
        title={isOffline ? "Dados armazenados localmente no seu navegador para privacidade" : "Dados salvos de forma 100% anônima na base de pesquisa"}
      >
        <span className="text-slate-300 font-medium">Dados da pesquisa:</span>
        <span className={`inline-flex items-center gap-1.5 font-semibold ${isOffline ? 'text-sand-300' : 'text-sage-300'}`}>
          <Database className="w-4 h-4" />
          {isOffline ? 'Salvo no aparelho (offline)' : 'Enviado'}
        </span>
      </div>

      {/* Main Impact Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-petrol-900/70 border border-petrol-800/90 space-y-4 text-center relative overflow-hidden shadow-lg">
        <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold border ${feedback.badgeColor}`}>
          <Award className="w-4 h-4 text-sage-300" />
          <span>{feedback.title}</span>
        </div>

        {/* Delta Visualizer with Standardized Emojis */}
        <div className="flex items-center justify-center gap-5 py-2">
          <div className="text-center" title="Nível avaliado antes de começar a respirar">
            <span className="text-xs text-slate-400 block uppercase font-semibold tracking-wider">Antes</span>
            <div className="text-3xl sm:text-4xl font-bold text-slate-100 mt-1 flex items-center justify-center gap-1.5">
              <span>{getTensionEmoji(preTension)}</span>
              <span>{preTension}</span>
            </div>
            <span className="text-xs sm:text-sm text-slate-300 mt-0.5 block">{preInfo?.label}</span>
          </div>

          <div className="flex flex-col items-center justify-center px-1">
            <TrendingDown className={`w-7 h-7 ${delta > 0 ? 'text-sage-300' : 'text-slate-500'}`} />
            {delta > 0 && (
              <span className="text-xs font-semibold text-sage-300 mt-0.5" title="Redução da tensão percebida">
                -{delta} {delta === 1 ? 'nível' : 'níveis'}
              </span>
            )}
          </div>

          <div className="text-center" title="Nível reavaliado após a respiração">
            <span className="text-xs text-slate-400 block uppercase font-semibold tracking-wider">Depois</span>
            <div className="text-3xl sm:text-4xl font-bold text-sand-200 mt-1 flex items-center justify-center gap-1.5">
              <span>{getTensionEmoji(postTension)}</span>
              <span>{postTension}</span>
            </div>
            <span className="text-xs sm:text-sm text-slate-300 mt-0.5 block">{postInfo?.label}</span>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
          {feedback.desc}
        </p>

        {/* Practice Details */}
        <div 
          className="pt-2 border-t border-petrol-800/80 flex items-center justify-between text-xs sm:text-sm text-slate-300"
          title="Tempo executado versus tempo previsto, e ritmo respiratório praticado"
        >
          <span>
            Prática: <strong className="text-sand-200 font-semibold">{Math.round(durationSeconds)}s</strong> / {targetDurationSeconds}s
          </span>
          <span className="font-mono text-xs text-sand-300 bg-petrol-950 px-2 py-0.5 rounded border border-petrol-800">
            Ritmo: {formatPatternDisplay(breathingPattern)}
          </span>
        </div>
      </div>

      {/* Survey CTA */}
      <div className="p-4 sm:p-5 rounded-2xl bg-petrol-900/50 border border-petrol-800 space-y-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-petrol-800 text-sage-300 shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-sand-200">
              Colabore com a pesquisa acadêmica
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 mt-0.5 leading-relaxed">
              Sua avaliação anônima ajuda no aprimoramento contínuo das ferramentas de apoio ao estudante.
            </p>
          </div>
        </div>

        <a
          href={surveyUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Abrir formulário breve de pesquisa acadêmica em nova aba"
          className="w-full py-3 px-4 rounded-xl bg-petrol-800 hover:bg-petrol-700 text-sand-200 border border-petrol-700/60 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-sm"
        >
          <span>Responder questionário breve</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {/* Restart directly to breathing */}
      <button
        onClick={onRestart}
        title="Iniciar novo ciclo de respiração imediatamente"
        className="w-full py-4 px-6 rounded-2xl bg-sage-400 hover:bg-sage-300 text-petrol-950 font-bold text-base flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-md"
      >
        <RotateCcw className="w-5 h-5 text-petrol-950" />
        <span>Fazer outra sessão de respiração</span>
      </button>
    </motion.div>
  );
};
