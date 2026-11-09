import React from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Send, Database, Home, User, CheckCircle2 } from 'lucide-react';
import { getScaleLabel } from '../lib/constants';
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
  const hasBoth = preTension !== null && postTension !== null;
  const hasOnlyPre = preTension !== null && postTension === null;
  const hasOnlyPost = preTension === null && postTension !== null;
  const hasNeither = preTension === null && postTension === null;

  // Strict data integrity: delta only exists when both responses are present
  const delta = hasBoth ? (preTension! - postTension!) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
      className="flex flex-col flex-1 justify-center space-y-4 py-4 max-w-sm mx-auto w-full select-none"
    >
      {/* Session Header */}
      <div className="text-center space-y-1">
        <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-center mx-auto text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          Sessão Concluída
        </h2>
        <p className="text-xs text-stone-500 dark:text-stone-400">
          Prática de respiração finalizada
        </p>
      </div>

      {/* Practice Details Card */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#151c22] border border-stone-200 dark:border-stone-800 shadow-sm space-y-3">
        <div className="text-center py-1">
          <span className="text-3xl sm:text-4xl font-extrabold text-stone-900 dark:text-stone-100 tabular-nums">
            {Math.round(durationSeconds)}s
          </span>
          <span className="text-xs text-stone-500 dark:text-stone-400 block mt-0.5">
            de prática realizada ({targetDurationSeconds}s previstos) • Ritmo {formatPatternDisplay(breathingPattern)}
          </span>
        </div>

        {/* Evaluation Comparison Block */}
        <div className="pt-3 border-t border-stone-100 dark:border-stone-800 space-y-2.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block text-center">
            Autoavaliação de Tensão (Escala 0 a 10)
          </span>

          {/* Scenario A: Both exist */}
          {hasBoth && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-2.5 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200/70 dark:border-stone-800">
                  <span className="text-[10px] text-stone-400 uppercase font-semibold block">Antes</span>
                  <div className="text-xl font-bold text-stone-900 dark:text-stone-100 mt-0.5">
                    {preTension}
                  </div>
                  <span className="text-[10px] text-stone-500 dark:text-stone-400 block truncate">
                    {getScaleLabel(preTension)}
                  </span>
                </div>

                <div className="p-2.5 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200/70 dark:border-stone-800">
                  <span className="text-[10px] text-stone-400 uppercase font-semibold block">Depois</span>
                  <div className="text-xl font-bold text-stone-900 dark:text-stone-100 mt-0.5">
                    {postTension}
                  </div>
                  <span className="text-[10px] text-stone-500 dark:text-stone-400 block truncate">
                    {getScaleLabel(postTension)}
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-stone-50/80 dark:bg-stone-900/60 border border-stone-200/60 dark:border-stone-800/60 text-center">
                <span className="text-xs text-stone-600 dark:text-stone-300 font-medium">
                  Variação registrada: <strong className="font-bold text-stone-900 dark:text-stone-100">
                    {delta! > 0 ? `-${delta}` : delta === 0 ? '0' : `+${Math.abs(delta!)}`}
                  </strong>
                </span>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                  Você registrou {preTension} no início e {postTension} ao final.
                </p>
              </div>
            </div>
          )}

          {/* Scenario B: Only Pre exists */}
          {hasOnlyPre && (
            <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200/70 dark:border-stone-800 text-center space-y-1">
              <div className="text-xs text-stone-700 dark:text-stone-300 font-medium">
                Inicial: <strong>{preTension}</strong> ({getScaleLabel(preTension)}) • Final: <em>Não informado</em>
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                Apenas a resposta inicial foi registrada. Variação não calculada.
              </p>
            </div>
          )}

          {/* Scenario C: Only Post exists */}
          {hasOnlyPost && (
            <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200/70 dark:border-stone-800 text-center space-y-1">
              <div className="text-xs text-stone-700 dark:text-stone-300 font-medium">
                Inicial: <em>Não informado</em> • Final: <strong>{postTension}</strong> ({getScaleLabel(postTension)})
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                Apenas a resposta final foi registrada. Variação não calculada.
              </p>
            </div>
          )}

          {/* Scenario D: Neither exists */}
          {hasNeither && (
            <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200/70 dark:border-stone-800 text-center">
              <p className="text-xs text-stone-500 dark:text-stone-400">
                As avaliações foram puladas nesta sessão. Nenhuma variação foi calculada.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Sync Status Badge */}
      <div 
        className="flex items-center justify-between text-xs px-4 py-2.5 rounded-2xl bg-white dark:bg-[#151c22] border border-stone-200 dark:border-stone-800 shadow-xs"
        title={isOffline ? "Dados armazenados localmente no seu aparelho para privacidade" : "Dados enviados anonimamente para a base da pesquisa"}
      >
        <span className="text-stone-500 dark:text-stone-400 font-medium">Registro da sessão:</span>
        <span className={`inline-flex items-center gap-1.5 font-semibold ${isOffline ? 'text-amber-700 dark:text-amber-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
          {isOffline ? (
            <>
              <Database className="w-3.5 h-3.5" />
              <span>Salvo no aparelho</span>
            </>
          ) : (
            <>
              <Send className="w-3.5 h-3.5 -rotate-12" />
              <span>Gravado com sucesso</span>
            </>
          )}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 pt-1">
        <button
          onClick={onRestart}
          title="Iniciar nova sessão de respiração"
          className="w-full py-4 px-6 rounded-2xl bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-base flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-sm"
        >
          <RotateCcw className="w-5 h-5 text-white" />
          <span>Nova sessão</span>
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onGoHome}
            title="Voltar para a tela inicial"
            className="py-3 px-3 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 font-semibold text-xs flex items-center justify-center gap-1.5 border border-stone-200 dark:border-stone-700 transition-all active:scale-[0.98]"
          >
            <Home className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <span>Início</span>
          </button>

          <button
            onClick={onOpenPersonal}
            title="Abrir meu histórico pessoal privado"
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
