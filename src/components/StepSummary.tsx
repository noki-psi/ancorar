import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingDown, ExternalLink, RotateCcw, Award, Send, Database, Home, User } from 'lucide-react';
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
  onGoHome: () => void;
  onOpenPersonal: () => void;
}

export const StepSummary: React.FC<StepSummaryProps> = ({
  preTension,
  postTension,
  durationSeconds,
  targetDurationSeconds = 120,
  breathingPattern = '326',
  isOffline,
  onRestart,
  onGoHome,
  onOpenPersonal,
}) => {
  const delta = preTension - postTension;
  const surveyUrl = import.meta.env.VITE_SURVEY_URL || 'https://forms.gle/exemplo-questionario-unirn';

  useEffect(() => {
    if (delta > 0) {
      try {
        confetti({
          particleCount: 40,
          spread: 45,
          origin: { y: 0.65 },
          colors: ['#2d604f', '#5ca187', '#dcd3c4']
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
        badgeColor: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
      };
    } else if (delta === 1) {
      return {
        title: 'Sensação de alívio',
        desc: `Você reduziu 1 nível de tensão (de ${preTension} para ${postTension}). Momentos de desaceleração favorecem o equilíbrio antes da avaliação.`,
        badgeColor: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
      };
    } else if (delta === 0) {
      return {
        title: 'Estabilidade acolhida',
        desc: `Seu nível se manteve em ${preTension}. A pausa com respiração lenta pode atuar como um amortecedor contra a elevação da ansiedade.`,
        badgeColor: 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700'
      };
    } else {
      return {
        title: 'Acolhimento da sensação',
        desc: `Voltar a atenção ao corpo às vezes torna tensões pré-existentes mais perceptíveis. Respeite seu tempo e ritmo interno.`,
        badgeColor: 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700'
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
      transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
      className="flex flex-col flex-1 justify-center space-y-4 py-3 max-w-md mx-auto w-full select-none"
    >
      {/* Research Sync Badge */}
      <div 
        className="flex items-center justify-between text-xs px-4 py-2.5 rounded-2xl bg-white dark:bg-[#151c22] border border-stone-200 dark:border-stone-800 shadow-sm"
        title={isOffline ? "Dados armazenados localmente no seu aparelho para privacidade" : "Dados enviados anonimamente para a base da pesquisa"}
      >
        <span className="text-stone-500 dark:text-stone-400 font-medium">Status da sessão:</span>
        <span className={`inline-flex items-center gap-1.5 font-semibold ${isOffline ? 'text-amber-700 dark:text-amber-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
          {isOffline ? (
            <>
              <Database className="w-3.5 h-3.5" />
              <span>Salvo no aparelho (offline)</span>
            </>
          ) : (
            <>
              <Send className="w-3.5 h-3.5 -rotate-12" />
              <span>Dados Enviados</span>
            </>
          )}
        </span>
      </div>

      {/* Main Impact Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#151c22] border border-stone-200 dark:border-stone-800 space-y-4 text-center relative overflow-hidden shadow-sm">
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${feedback.badgeColor}`}>
          <Award className="w-3.5 h-3.5" />
          <span>{feedback.title}</span>
        </div>

        {/* Delta Visualizer with Standardized Emojis */}
        <div className="flex items-center justify-center gap-6 py-2">
          <div className="text-center" title="Nível avaliado antes de começar a respirar">
            <span className="text-[11px] text-stone-400 dark:text-stone-500 block uppercase font-bold tracking-wider">Antes</span>
            <div className="text-3xl font-extrabold text-stone-800 dark:text-stone-100 mt-1 flex items-center justify-center gap-1.5">
              <span>{getTensionEmoji(preTension)}</span>
              <span>{preTension}</span>
            </div>
            <span className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 block">{preInfo?.label}</span>
          </div>

          <div className="flex flex-col items-center justify-center px-1">
            <TrendingDown className={`w-6 h-6 ${delta > 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-stone-400'}`} />
            {delta > 0 && (
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mt-0.5" title="Redução da tensão percebida">
                -{delta} {delta === 1 ? 'nível' : 'níveis'}
              </span>
            )}
          </div>

          <div className="text-center" title="Nível reavaliado após a respiração">
            <span className="text-[11px] text-stone-400 dark:text-stone-500 block uppercase font-bold tracking-wider">Depois</span>
            <div className="text-3xl font-extrabold text-stone-900 dark:text-stone-100 mt-1 flex items-center justify-center gap-1.5">
              <span>{getTensionEmoji(postTension)}</span>
              <span>{postTension}</span>
            </div>
            <span className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 block">{postInfo?.label}</span>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
          {feedback.desc}
        </p>

        {/* Practice Details */}
        <div 
          className="pt-2.5 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400"
          title="Tempo executado versus tempo previsto, e ritmo respiratório praticado"
        >
          <span>
            Duração: <strong className="text-stone-800 dark:text-stone-200 font-semibold">{Math.round(durationSeconds)}s</strong> / {targetDurationSeconds}s
          </span>
          <span className="font-mono text-[11px] text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded border border-stone-200 dark:border-stone-700">
            Ritmo: {formatPatternDisplay(breathingPattern)}
          </span>
        </div>
      </div>

      {/* Survey CTA */}
      <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 space-y-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-white dark:bg-stone-800 text-emerald-700 dark:text-emerald-400 shrink-0 shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">
              Colabore com a pesquisa da extensão
            </h4>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 leading-relaxed">
              Sua avaliação anônima apoia o aprimoramento contínuo das ferramentas de cuidado do UNI-RN.
            </p>
          </div>
        </div>

        <a
          href={surveyUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Abrir questionário acadêmico breve"
          className="w-full py-2.5 px-4 rounded-xl bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-100 border border-stone-300 dark:border-stone-700 font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-xs"
        >
          <span>Responder questionário breve</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 pt-1">
        {/* Restart directly to breathing */}
        <button
          onClick={onRestart}
          title="Iniciar nova sessão de respiração imediatamente"
          className="w-full py-4 px-6 rounded-2xl bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-base flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-sm"
        >
          <RotateCcw className="w-5 h-5 text-white" />
          <span>Fazer outra sessão de respiração</span>
        </button>

        <div className="grid grid-cols-2 gap-2">
          {/* Go Home / Back to start */}
          <button
            onClick={onGoHome}
            title="Voltar para a tela inicial"
            className="py-3 px-3 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 font-semibold text-xs flex items-center justify-center gap-1.5 border border-stone-200 dark:border-stone-700 transition-all active:scale-[0.98]"
          >
            <Home className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <span>Voltar ao início</span>
          </button>

          {/* Open Personal Dashboard */}
          <button
            onClick={onOpenPersonal}
            title="Abrir meu histórico pessoal privado salvo neste aparelho"
            className="py-3 px-3 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 font-semibold text-xs flex items-center justify-center gap-1.5 border border-stone-200 dark:border-stone-700 transition-all active:scale-[0.98]"
          >
            <User className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <span>Meu Histórico</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};
