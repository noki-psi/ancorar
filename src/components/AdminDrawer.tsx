import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RefreshCw, FileSpreadsheet, ShieldAlert, Database, BookOpen } from 'lucide-react';
import { SessionRecord } from '../types';
import { supabase, isSupabaseConfigured, getLocalSessions } from '../lib/supabase';
import { getTensionEmoji } from '../lib/constants';
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
            return {
              ...item,
              breathing_pattern: pattern || '326',
              target_duration_seconds: targetDur || 120
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

  const totalSessions = sessions.length;
  const uniqueUsers = new Set(sessions.map(s => s.anonymous_user_id)).size;
  const avgPreTension = totalSessions > 0
    ? (sessions.reduce((acc, s) => acc + s.pre_tension, 0) / totalSessions).toFixed(1)
    : '0.0';
  const avgPostTension = totalSessions > 0
    ? (sessions.reduce((acc, s) => acc + s.post_tension, 0) / totalSessions).toFixed(1)
    : '0.0';

  const reductionPercentage = totalSessions > 0
    ? Math.round((sessions.filter(s => s.post_tension < s.pre_tension).length / totalSessions) * 100)
    : 0;

  const exportCSV = () => {
    if (sessions.length === 0) return;

    const headers = ['ID_Anonimo', 'Pre_Tensao_1a5', 'Post_Tensao_1a5', 'Alivio_Niveis', 'Duracao_Segundos', 'Tempo_Previsto_Segundos', 'Ritmo', 'Data_Hora'];
    const rows = sessions.map(s => [
      s.anonymous_user_id,
      s.pre_tension,
      s.post_tension,
      s.pre_tension - s.post_tension,
      s.duration_seconds,
      s.target_duration_seconds || 120,
      s.breathing_pattern ? formatPatternDisplay(s.breathing_pattern) : '3:2:6',
      s.created_at || new Date().toISOString()
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ancorar_relatorio_pesquisa_${new Date().toISOString().slice(0, 10)}.csv`);
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
            {/* Header */}
            <div className="p-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-bold flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                  <span>Painel do Projeto de Extensão</span>
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  Métricas anônimas agregadas e relatório de impacto (UNI-RN)
                </p>
              </div>
              <button
                onClick={onClose}
                title="Fechar painel da pesquisa"
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
                    ? 'Modo Offline (dados locais)' 
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
                  title="Média das notas de tensão antes e depois do exercício (escala 1 a 5)"
                >
                  <div className="text-[11px] uppercase font-bold text-stone-400">Pré vs Pós Médio</div>
                  <div className="text-sm font-bold text-stone-800 dark:text-stone-200 mt-1.5 flex items-center justify-center gap-1">
                    <span>{getTensionEmoji(Number(avgPreTension))}</span>
                    <span>{avgPreTension}</span>
                    <span className="text-stone-400">→</span>
                    <span>{getTensionEmoji(Number(avgPostTension))}</span>
                    <span className="text-emerald-700 dark:text-emerald-400">{avgPostTension}</span>
                  </div>
                </div>

                <div 
                  className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 text-center"
                  title="Percentual de sessões em que o nível pós foi estritamente menor que o pré"
                >
                  <div className="text-[11px] uppercase font-bold text-stone-400">% com Redução</div>
                  <div className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400 mt-1">{reductionPercentage}%</div>
                </div>
              </div>

              {/* Action: Export CSV */}
              <button
                onClick={exportCSV}
                title="Baixar planilha CSV com todos os dados brutos anônimos"
                className="w-full py-3.5 px-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition-transform"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Exportar CSV de Pesquisa</span>
              </button>

              {/* Setup Helper if Supabase not configured */}
              {!isSupabaseConfigured && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 text-amber-900 dark:text-amber-200 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    <span>Sincronização em nuvem da pesquisa:</span>
                  </div>
                  <p className="text-xs text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
                    Defina <code className="bg-amber-100 dark:bg-stone-800 px-1 py-0.5 rounded">VITE_SUPABASE_URL</code> e <code className="bg-amber-100 dark:bg-stone-800 px-1 py-0.5 rounded">VITE_SUPABASE_ANON_KEY</code> no seu arquivo <code>.env</code> para sincronizar os dados com a base da pesquisa.
                  </p>
                </div>
              )}

              {/* Recent Sessions List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                  Últimos Registros Anônimos ({sessions.length})
                </h4>

                {sessions.length === 0 ? (
                  <div className="p-8 text-center text-xs text-stone-400 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-dashed border-stone-200 dark:border-stone-800">
                    Nenhuma sessão realizada ainda neste dispositivo ou banco.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {sessions.slice(0, 15).map((s, idx) => {
                      const delta = s.pre_tension - s.post_tension;
                      const pattern = s.breathing_pattern ? formatPatternDisplay(s.breathing_pattern) : '3:2:6';
                      const targetDur = s.target_duration_seconds || 120;
                      return (
                        <div
                          key={s.id || idx}
                          title={`Sessão: ${s.duration_seconds}s praticados de ${targetDur}s previstos • Ritmo ${pattern}`}
                          className="p-3 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 flex items-center justify-between text-xs"
                        >
                          <div className="space-y-1">
                            <div className="font-mono text-[11px] text-stone-500 dark:text-stone-400 flex items-center gap-2">
                              <span>{s.anonymous_user_id.slice(0, 12)}...</span>
                              <span className="font-sans text-[10px] bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 px-1.5 py-0.2 rounded font-mono">
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
                                {delta > 0 ? `-${delta}` : delta === 0 ? '0' : `+${Math.abs(delta)}`}
                              </span>
                            </div>
                          </div>

                          <div className="text-right text-stone-600 dark:text-stone-400">
                            <div>
                              <strong className="text-stone-900 dark:text-stone-100">{s.duration_seconds}s</strong>/{targetDur}s
                            </div>
                            <div className="text-[10px] text-stone-400 mt-0.5">
                              {s.created_at ? new Date(s.created_at).toLocaleTimeString() : 'Agora'}
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
