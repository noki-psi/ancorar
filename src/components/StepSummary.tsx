import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, RotateCcw, Award, Send, Database, Home, User, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { TENSION_LIST, getTensionEmoji } from '../lib/constants';
import { formatPatternDisplay } from '../lib/settings';

interface StepSummaryProps {
  preTension: number | null;
  postTension: number | null;
  durationSeconds: number;
  targetDurationSeconds?: number;
  breathingPattern?: string;
  isOffline: boolean;
  onRestart: () => void;
  onGoHome: () => void;
  onOpenPersonal: () => void;
  onUpdateTension: (pre: number, post: number) => void;
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
  onUpdateTension,
}) => {
  const [currentPost, setCurrentPost] = useState<number | null>(postTension);
  const [currentPre, setCurrentPre] = useState<number | null>(preTension);

  const delta = (currentPre !== null && currentPost !== null) ? currentPre - currentPost : null;

  useEffect(() => {
    if (delta !== null && delta > 0) {
      try {
        confetti({
          particleCount: 35,
          spread: 45,
          origin: { y: 0.65 },
          colors: ['#2d604f', '#5ca187', '#dcd3c4']
        });
      } catch {
        // Fallback
      }
    }
  }, [delta]);

  const handleSelectPostTension = (level: number) => {
    setCurrentPost(level);
    const effectivePre = currentPre ?? level;
    if (currentPre === null) {
      setCurrentPre(effectivePre);
    }
    onUpdateTension(effectivePre, level);
  };

  const getFeedbackMessage = () => {
    if (delta === null) {
      return {
        title: 'Pausa Concluída',
        desc: 'Você dedicou alguns minutos para cuidar do seu ritmo respiratório e desacelerar.',
        badgeColor: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
      };
    }
    if (delta > 1) {
      return {
        title: 'Sensação de alívio',
        desc: `Sua tensão reduziu em ${delta} níveis (de ${currentPre} para ${currentPost}). O ritmo respiratório desacelerado ajuda o corpo a reencontrar estabilidade.`,
        badgeColor: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
      };
    } else if (delta === 1) {
      return {
        title: 'Equilíbrio restabelecido',
        desc: `Você reduziu 1 nível de tensão (de ${currentPre} para ${currentPost}). Momentos de pausa consciente renovam o foco e a calma.`,
        badgeColor: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
      };
    } else if (delta === 0) {
      return {
        title: 'Estabilidade acolhida',
        desc: `Seu nível se manteve estável em ${currentPre}. A respiração consciente atua como um amortecedor contra a sobrecarga física e mental.`,
        badgeColor: 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700'
      };
    } else {
      return {
        title: 'Presença acolhida',
        desc: 'Ao parar para respirar, sensações sutis do corpo tornam-se mais nítidas. Respeite seu tempo e ritmo interno.',
        badgeColor: 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700'
      };
    }
  };

  const feedback = getFeedbackMessage();

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
      className="flex flex-col flex-1 justify-center space-y-4 py-4 max-w-sm mx-auto w-full select-none"
    >
      {/* Session Status & Sync Badge */}
      <div 
        className="flex items-center justify-between text-xs px-4 py-2.5 rounded-2xl bg-white dark:bg-[#151c22] border border-stone-200 dark:border-stone-800 shadow-xs"
        title={isOffline ? "Dados armazenados localmente no seu aparelho para privacidade" : "Dados enviados anonimamente para a base da pesquisa"}
      >
        <span className="text-stone-500 dark:text-stone-400 font-medium">Status da sessão:</span>
        <span className={`inline-flex items-center gap-1.5 font-semibold ${isOffline ? 'text-amber-700 dark:text-amber-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
          {isOffline ? (
            <>
              <Database className="w-3.5 h-3.5" />
              <span>Salvo no aparelho</span>
            </>
          ) : (
            <>
              <Send className="w-3.5 h-3.5 -rotate-12" />
              <span>Dados enviados</span>
            </>
          )}
        </span>
      </div>

      {/* Main Impact Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#151c22] border border-stone-200 dark:border-stone-800 space-y-4 text-center relative overflow-hidden shadow-xs">
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${feedback.badgeColor}`}>
          <Award className="w-3.5 h-3.5" />
          <span>{feedback.title}</span>
        </div>

        {/* Practice Metrics Preview */}
        <div className="py-1">
          <div className="text-4xl sm:text-5xl font-extrabold text-stone-900 dark:text-stone-100 tabular-nums">
            {Math.round(durationSeconds)}s
          </div>
          <span className="text-xs text-stone-500 dark:text-stone-400 font-medium mt-1 block">
            de respiração consciente ({Math.round(durationSeconds)}s de {targetDurationSeconds}s) • Ritmo {formatPatternDisplay(breathingPattern)}
          </span>
        </div>

        {/* Delta Comparison if Evaluated */}
        {delta !== null && (
          <div className="flex items-center justify-center gap-5 py-2 border-y border-stone-100 dark:border-stone-800/80">
            <div className="text-center">
              <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider block">Antes</span>
              <div className="text-2xl font-bold text-stone-800 dark:text-stone-200 mt-0.5">
                <span>{getTensionEmoji(currentPre!)}</span> {currentPre}
              </div>
            </div>

            <div className="flex flex-col items-center justify-center px-1">
              <TrendingDown className={`w-5 h-5 ${delta > 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-stone-400'}`} />
              {delta > 0 && (
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
                  -{delta} {delta === 1 ? 'nível' : 'níveis'}
                </span>
              )}
            </div>

            <div className="text-center">
              <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider block">Depois</span>
              <div className="text-2xl font-bold text-stone-900 dark:text-stone-100 mt-0.5">
                <span>{getTensionEmoji(currentPost!)}</span> {currentPost}
              </div>
            </div>
          </div>
        )}

        <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed font-normal">
          {feedback.desc}
        </p>

        {/* Optional Research Tension Reassessment Bar (Non-blocking) */}
        <div className="pt-3 border-t border-stone-100 dark:border-stone-800 text-left space-y-2">
          <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400 font-medium">
            <span>Como você se percebe agora? (Opcional)</span>
            {currentPost !== null && (
              <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Registrado
              </span>
            )}
          </div>

          <div className="grid grid-cols-5 gap-1 text-center">
            {TENSION_LIST.slice().reverse().map(item => {
              const isSelected = currentPost === item.level;
              return (
                <button
                  key={item.level}
                  type="button"
                  onClick={() => handleSelectPostTension(item.level)}
                  title={`Nível ${item.level}: ${item.label}`}
                  className={`p-1.5 rounded-xl border text-xs flex flex-col items-center justify-center gap-0.5 transition-all ${
                    isSelected
                      ? 'border-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:border-emerald-600 font-bold'
                      : 'border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-900/40 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                  }`}
                >
                  <span className="text-base select-none">{item.emoji}</span>
                  <span className="text-[10px] font-semibold">{item.level}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Action Buttons: Instant Replay or Home */}
      <div className="space-y-2 pt-1">
        {/* Restart directly to breathing */}
        <button
          onClick={onRestart}
          title="Iniciar nova sessão de respiração imediatamente"
          className="w-full py-4 px-6 rounded-2xl bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-base flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-sm"
        >
          <RotateCcw className="w-5 h-5 text-white" />
          <span>Respirar novamente</span>
        </button>

        <div className="grid grid-cols-2 gap-2">
          {/* Go Home / Back to start */}
          <button
            onClick={onGoHome}
            title="Voltar para a tela inicial"
            className="py-3 px-3 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 font-semibold text-xs flex items-center justify-center gap-1.5 border border-stone-200 dark:border-stone-700 transition-all active:scale-[0.98]"
          >
            <Home className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <span>Início</span>
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
