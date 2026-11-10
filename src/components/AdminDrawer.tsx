import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RefreshCw, FileSpreadsheet, ShieldAlert, Database, Globe } from 'lucide-react';
import { SessionRecord } from '../types';
import { supabase, isSupabaseConfigured, getLocalSessions } from '../lib/supabase';
import { formatPatternDisplay } from '../lib/settings';

interface AdminDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminDrawer: React.FC<AdminDrawerProps> = ({ isOpen, onClose }) => {
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);

  const loadData = async () => {
    setIsLoading(true);

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('sessions')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        if (data) {
          const parsedData = data.map((item: any) => {
            let pattern = item.breathing_pattern;
            let targetDur = item.target_duration_seconds;
            if (item.anonymous_user_id?.includes('#p=')) {
              const matchP = item.anonymous_user_id.match(/#p=([0-9]+)/);
              const matchT = item.anonymous_user_id.match(/&t=([0-9]+)/);
              if (matchP) pattern = matchP[1];
              if (matchT) targetDur = parseInt(matchT[1], 10);
            }

            const hasBoth = item.pre_tension !== null && item.pre_tension !== undefined &&
                            item.post_tension !== null && item.post_tension !== undefined;
            const delta = hasBoth ? (item.tension_delta ?? (item.pre_tension - item.post_tension)) : null;

            return {
              ...item,
              pre_tension: item.pre_tension ?? null,
              post_tension: item.post_tension ?? null,
              breathing_pattern: pattern || '326',
              target_duration_seconds: targetDur || 120,
              tension_delta: delta
            };
          });

          setSessions(parsedData);
          setIsOfflineMode(false);
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Supabase fetch failed, falling back to local storage', err);
      }
    }

    const local = getLocalSessions();
    setSessions(local);
    setIsOfflineMode(true);
    setIsLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  // Aggregate Metrics with strict data integrity (missing values stay null)
  const totalSessions = sessions.length;
  const uniqueUsers = new Set(sessions.map(s => s.anonymous_user_id)).size;

  const sessionsWithPre = sessions.filter(s => s.pre_tension !== null && s.pre_tension !== undefined);
  const avgPreTension = sessionsWithPre.length > 0
    ? (sessionsWithPre.reduce((acc, s) => acc + s.pre_tension!, 0) / sessionsWithPre.length).toFixed(1)
    : '—';

  const sessionsWithPost = sessions.filter(s => s.post_tension !== null && s.post_tension !== undefined);
  const avgPostTension = sessionsWithPost.length > 0
    ? (sessionsWithPost.reduce((acc, s) => acc + s.post_tension!, 0) / sessionsWithPost.length).toFixed(1)
    : '—';

  const sessionsWithBoth = sessions.filter(s => s.pre_tension !== null && s.pre_tension !== undefined &&
                                                s.post_tension !== null && s.post_tension !== undefined);
  const reductionPercentage = sessionsWithBoth.length > 0
    ? Math.round((sessionsWithBoth.filter(s => s.post_tension! < s.pre_tension!).length / sessionsWithBoth.length) * 100)
    : null;

  const exportCSV = () => {
    if (sessions.length === 0) return;

    const headers = ['ID_Anonimo', 'Data_Hora', 'Pre_Tensao_0a10', 'Post_Tensao_0a10', 'Variacao', 'Duracao_Segundos', 'Tempo_Previsto_Segundos', 'Ritmo'];
    const rows = sessions.map(s => {
      const hasBothAnswers = s.pre_tension !== null && s.pre_tension !== undefined &&
                             s.post_tension !== null && s.post_tension !== undefined;
      const variationStr = hasBothAnswers ? String(s.pre_tension! - s.post_tension!) : '';
      return [
        s.anonymous_user_id,
        s.created_at ? new Date(s.created_at).toLocaleString('pt-BR') : '',
        s.pre_tension !== null && s.pre_tension !== undefined ? s.pre_tension : '',
        s.post_tension !== null && s.post_tension !== undefined ? s.post_tension : '',
        variationStr,
        s.duration_seconds,
        s.target_duration_seconds || 120,
        s.breathing_pattern ? formatPatternDisplay(s.breathing_pattern) : '3:2:6'
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ancorar_painel_global_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
            {/* Header: Painel Global */}
            <div className="p-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-bold flex items-center gap-2">
                  <Globe className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                  <span>Painel Global</span>
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  Métricas anônimas agregadas e histórico com data de registro
                </p>
              </div>
              <button
                onClick={onClose}
                title="Fechar painel global"
                className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Connection Status Notice */}
            <div className="px-4 py-2 border-b border-stone-100 dark:border-stone-800/80 bg-stone-50 dark:bg-stone-900/40 flex items-center justify-between text-xs">
              <div 
                className="flex items-center gap-2"
                title={isOfflineMode ? "Operando com dados salvos no navegador" : "Sincronizado em tempo real com o banco Supabase"}
              >
                <Database className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                <span className={`w-2 h-2 rounded-full ${isOfflineMode ? 'bg-amber-500' : 'bg-emerald-600 animate-pulse'}`} />
                <span className="text-stone-600 dark:text-stone-300 font-medium">
                  {isOfflineMode 
                    ? 'Modo Offline (dados salvos localmente)' 
                    : 'Banco de dados conectado'}
                </span>
              </div>
              <button
                onClick={loadData}
                disabled={isLoading}
                title="Recarregar dados do banco de dados"
                className="text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 font-semibold text-xs"
              >
                <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Atualizar</span>
              </button>
            </div>

            {/* Content Body */}
            <div className="p-4 overflow-y-auto space-y-4 flex-1">
              {/* Aggregated Metrics Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div 
                  className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 text-center"
                  title="Quantidade total de sessões registradas"
                >
                  <div className="text-[11px] uppercase font-bold text-stone-400">Total Sessões</div>
                  <div className="text-2xl font-extrabold text-stone-900 dark:text-stone-100 mt-1">{totalSessions}</div>
                </div>

                <div 
                  className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 text-center"
                  title="Número de identificadores anônimos distintos"
                >
                  <div className="text-[11px] uppercase font-bold text-stone-400">Usuários Únicos</div>
                  <div className="text-2xl font-extrabold text-stone-900 dark:text-stone-100 mt-1">{uniqueUsers}</div>
                </div>

                <div 
                  className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 text-center"
                  title="Média das notas de tensão (escala 0 a 10) computada apenas nas sessões respondidas"
                >
                  <div className="text-[11px] uppercase font-bold text-stone-400">Pré vs Pós Médio</div>
                  <div className="text-xs sm:text-sm font-bold text-stone-800 dark:text-stone-200 mt-1.5 flex items-center justify-center gap-1">
                    <span className="text-stone-700 dark:text-stone-300">{avgPreTension}</span>
                    <span className="text-stone-400">→</span>
                    <span className="text-emerald-700 dark:text-emerald-400">{avgPostTension}</span>
                  </div>
                  <span className="text-[9px] text-stone-400 block mt-0.5">escala 0 a 10</span>
                </div>

                <div 
                  className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 text-center"
                  title="Percentual com redução calculado exclusivamente nas sessões que possuem ambas as respostas"
                >
                  <div className="text-[11px] uppercase font-bold text-stone-400">% com Redução</div>
                  <div className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400 mt-1">
                    {reductionPercentage !== null ? `${reductionPercentage}%` : '—'}
                  </div>
                  <span className="text-[9px] text-stone-400 block mt-0.5">
                    {sessionsWithBoth.length} c/ ambos
                  </span>
                </div>
              </div>

              {/* Setup Helper if Supabase not configured */}
              {!isSupabaseConfigured && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 text-amber-900 dark:text-amber-200 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    <span>Sincronização em nuvem:</span>
                  </div>
                  <p className="text-xs text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
                    Defina <code className="bg-amber-100 dark:bg-stone-800 px-1 py-0.5 rounded">VITE_SUPABASE_URL</code> e <code className="bg-amber-100 dark:bg-stone-800 px-1 py-0.5 rounded">VITE_SUPABASE_ANON_KEY</code> no seu arquivo <code>.env</code> para sincronizar os dados em nuvem.
                  </p>
                </div>
              )}

              {/* Recent Sessions List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                    Histórico de Registros ({sessions.length})
                  </h4>
                  {sessions.length > 0 && (
                    <button
                      onClick={exportCSV}
                      title="Baixar planilha CSV com os dados anônimos"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 hover:bg-stone-100 dark:bg-stone-900 dark:hover:bg-stone-800 text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 text-[11px] font-medium transition-colors"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-stone-400" />
                      <span>Exportar CSV</span>
                    </button>
                  )}
                </div>

                {sessions.length === 0 ? (
                  <div className="p-8 text-center text-xs text-stone-400 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-dashed border-stone-200 dark:border-stone-800">
                    Nenhuma sessão realizada ainda neste dispositivo ou banco.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {sessions.slice(0, 30).map((s, idx) => {
                      const hasBothAnswers = s.pre_tension !== null && s.pre_tension !== undefined &&
                                             s.post_tension !== null && s.post_tension !== undefined;
                      const deltaVal = hasBothAnswers ? (s.pre_tension! - s.post_tension!) : null;
                      const pattern = s.breathing_pattern ? formatPatternDisplay(s.breathing_pattern) : '3:2:6';
                      const targetDur = s.target_duration_seconds || 120;
                      
                      const dateFormatted = s.created_at
                        ? new Date(s.created_at).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          }) + ' às ' + new Date(s.created_at).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : 'Data não registrada';

                      return (
                        <div
                          key={s.id || idx}
                          className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 flex items-center justify-between text-xs"
                        >
                          <div className="space-y-1">
                            {/* Date and ID */}
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-stone-800 dark:text-stone-200 text-xs">
                                {dateFormatted}
                              </span>
                              <span className="font-mono text-[10px] text-stone-500 bg-stone-200 dark:bg-stone-800 px-1.5 py-0.5 rounded">
                                {pattern}
                              </span>
                            </div>

                            {/* Evaluation details */}
                            <div className="text-stone-600 dark:text-stone-400 flex items-center gap-2 text-xs">
                              <span>
                                Pré: <strong>{s.pre_tension !== null && s.pre_tension !== undefined ? s.pre_tension : '—'}</strong>
                                <span className="mx-1 text-stone-400">→</span>
                                Pós: <strong>{s.post_tension !== null && s.post_tension !== undefined ? s.post_tension : '—'}</strong>
                              </span>

                              {hasBothAnswers ? (
                                <span className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                                  deltaVal! > 0 ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300' : deltaVal === 0 ? 'bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400' : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                                }`}>
                                  {deltaVal! > 0 ? `-${deltaVal}` : deltaVal === 0 ? '0' : `+${Math.abs(deltaVal!)}`}
                                </span>
                              ) : (
                                <span className="text-[10px] text-stone-400 italic">
                                  (sem variação)
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="text-right text-stone-600 dark:text-stone-400">
                            <div>
                              <strong className="text-stone-900 dark:text-stone-100">{s.duration_seconds}s</strong>/{targetDur}s
                            </div>
                            <div className="text-[10px] text-stone-400 mt-0.5 font-mono truncate max-w-[100px]">
                              {s.anonymous_user_id.slice(0, 10)}...
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

export default AdminDrawer;
