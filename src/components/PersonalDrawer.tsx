import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, TrendingDown, Trash2, RotateCcw, FileSpreadsheet, CheckCircle2 } from 'lucide-react';
import { SessionRecord } from '../types';
import { getLocalSessions, clearLocalSessions } from '../lib/supabase';
import { getTensionEmoji } from '../lib/constants';
import { formatPatternDisplay, formatDurationLabel } from '../lib/settings';

interface PersonalDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onStartSession?: () => void;
}

export const PersonalDrawer: React.FC<PersonalDrawerProps> = ({ isOpen, onClose, onStartSession }) => {
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [confirmClear, setConfirmClear] = useState<boolean>(false);

  const loadLocalData = () => {
    const list = getLocalSessions();
    setSessions(list);
  };

  useEffect(() => {
    if (isOpen) {
      loadLocalData();
      setConfirmClear(false);
    }
  }, [isOpen]);

  const handleClear = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    clearLocalSessions();
    setSessions([]);
    setConfirmClear(false);
  };

  const handleExportCSV = () => {
    if (sessions.length === 0) return;

    const headers = ['Data_Hora', 'Pre_Tensao_1a5', 'Post_Tensao_1a5', 'Alivio_Niveis', 'Duracao_Segundos', 'Tempo_Previsto_Segundos', 'Ritmo'];
    const rows = sessions.map(s => [
      s.created_at ? new Date(s.created_at).toLocaleString('pt-BR') : 'N/A',
      s.pre_tension,
      s.post_tension,
      s.pre_tension - s.post_tension,
      s.duration_seconds,
      s.target_duration_seconds || 120,
      s.breathing_pattern ? formatPatternDisplay(s.breathing_pattern) : '3:2:6',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `meu_historico_ancorar_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Personal Metrics
  const totalSessions = sessions.length;
  const totalSeconds = sessions.reduce((acc, s) => acc + (s.duration_seconds || 0), 0);
  const avgDelta = totalSessions > 0
    ? (sessions.reduce((acc, s) => acc + (s.pre_tension - s.post_tension), 0) / totalSessions).toFixed(1)
    : '0.0';

  // Most frequent rhythm
  const patternCounts: Record<string, number> = {};
  sessions.forEach(s => {
    const p = s.breathing_pattern || '326';
    patternCounts[p] = (patternCounts[p] || 0) + 1;
  });
  let favoritePattern = '326';
  let maxCount = 0;
  Object.entries(patternCounts).forEach(([pat, count]) => {
    if (count > maxCount) {
      maxCount = count;
      favoritePattern = pat;
    }
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50"
          />

          {/* Drawer Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 max-h-[90vh] bg-white dark:bg-[#121920] border-t border-stone-200 dark:border-stone-800 rounded-t-3xl z-50 flex flex-col shadow-2xl max-w-xl mx-auto overflow-hidden text-stone-900 dark:text-stone-100"
          >
            {/* Header */}
            <div className="p-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold flex items-center gap-2">
                    <span>Meu Histórico Pessoal</span>
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      Privado
                    </span>
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    Dados individuais salvos exclusivamente na memória deste aparelho
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                title="Fechar meu histórico"
                className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-4 overflow-y-auto space-y-4 flex-1">
              {/* Personal Metrics Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div 
                  className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 text-center"
                  title="Total de práticas de respiração que você concluiu neste aparelho"
                >
                  <div className="text-[11px] uppercase font-bold text-stone-400">Suas Sessões</div>
                  <div className="text-2xl font-extrabold text-stone-900 dark:text-stone-100 mt-1">{totalSessions}</div>
                </div>

                <div 
                  className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 text-center"
                  title="Tempo total acumulado de respiração consciente"
                >
                  <div className="text-[11px] uppercase font-bold text-stone-400">Tempo Total</div>
                  <div className="text-base font-bold text-stone-800 dark:text-stone-200 mt-2 truncate">
                    {formatDurationLabel(totalSeconds)}
                  </div>
                </div>

                <div 
                  className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 text-center"
                  title="Média de redução da tensão entre antes e depois das práticas"
                >
                  <div className="text-[11px] uppercase font-bold text-stone-400">Alívio Médio</div>
                  <div className="text-base font-bold text-emerald-700 dark:text-emerald-400 mt-2 flex items-center justify-center gap-1">
                    <TrendingDown className="w-4 h-4" />
                    <span>{Number(avgDelta) > 0 ? `-${avgDelta}` : avgDelta}</span>
                  </div>
                </div>

                <div 
                  className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 text-center"
                  title="O ritmo respiratório que você mais utilizou"
                >
                  <div className="text-[11px] uppercase font-bold text-stone-400">Ritmo Favorito</div>
                  <div className="text-base font-mono font-bold text-stone-800 dark:text-stone-200 mt-2">
                    {formatPatternDisplay(favoritePattern)}
                  </div>
                </div>
              </div>

              {/* Action Buttons: Start Practice & Export */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {onStartSession && (
                  <button
                    onClick={() => {
                      onClose();
                      onStartSession();
                    }}
                    title="Iniciar nova prática de respiração agora"
                    className="py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-sm"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Iniciar Nova Sessão</span>
                  </button>
                )}

                {sessions.length > 0 && (
                  <button
                    onClick={handleExportCSV}
                    title="Baixar planilha CSV com o histórico das suas sessões"
                    className="py-3 px-4 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 border border-stone-200 dark:border-stone-700 transition-all active:scale-[0.98]"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                    <span>Exportar Histórico (CSV)</span>
                  </button>
                )}
              </div>

              {/* Sessions List */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                    Suas Práticas Realizadas ({sessions.length})
                  </h4>

                  {sessions.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClear}
                      title="Excluir o histórico de sessões apenas deste dispositivo"
                      className={`text-xs flex items-center gap-1 font-medium transition-colors ${
                        confirmClear ? 'text-rose-600 font-bold' : 'text-stone-400 hover:text-rose-600'
                      }`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{confirmClear ? 'Confirmar exclusão?' : 'Limpar histórico'}</span>
                    </button>
                  )}
                </div>

                {sessions.length === 0 ? (
                  <div className="p-8 text-center text-xs text-stone-400 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-dashed border-stone-200 dark:border-stone-800 space-y-3">
                    <p>Nenhuma sessão realizada ainda neste aparelho.</p>
                    {onStartSession && (
                      <button
                        onClick={() => {
                          onClose();
                          onStartSession();
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Fazer primeira sessão</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {sessions.map((s, idx) => {
                      const delta = s.pre_tension - s.post_tension;
                      const pattern = s.breathing_pattern ? formatPatternDisplay(s.breathing_pattern) : '3:2:6';
                      const targetDur = s.target_duration_seconds || 120;
                      const formattedDate = s.created_at
                        ? new Date(s.created_at).toLocaleString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'Recente';

                      return (
                        <div
                          key={s.id || idx}
                          className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 flex items-center justify-between text-xs"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-stone-700 dark:text-stone-300">
                                {formattedDate}
                              </span>
                              <span className="font-mono text-[10px] text-stone-600 dark:text-stone-400 bg-stone-200 dark:bg-stone-800 px-1.5 py-0.5 rounded">
                                {pattern}
                              </span>
                            </div>

                            <div className="text-stone-600 dark:text-stone-400 flex items-center gap-2">
                              <span>
                                {getTensionEmoji(s.pre_tension)} <strong>{s.pre_tension}</strong>
                                <span className="mx-1 text-stone-400">→</span>
                                {getTensionEmoji(s.post_tension)} <strong>{s.post_tension}</strong>
                              </span>
                              <span className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                                delta > 0 ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300' : delta === 0 ? 'bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400' : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                              }`}>
                                {delta > 0 ? `-${delta}` : delta === 0 ? 'Estável' : `+${Math.abs(delta)}`}
                              </span>
                            </div>
                          </div>

                          <div className="text-right text-stone-600 dark:text-stone-400">
                            <div>
                              Duração: <strong className="text-stone-900 dark:text-stone-100">{s.duration_seconds}s</strong> / {targetDur}s
                            </div>
                            <div className="text-[11px] text-stone-400 mt-0.5">
                              {Math.round((s.duration_seconds / targetDur) * 100)}% concluído
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PersonalDrawer;
