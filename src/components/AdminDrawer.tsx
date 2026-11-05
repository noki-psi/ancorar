import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RefreshCw, Database, FileSpreadsheet, ShieldAlert } from 'lucide-react';
import { SessionRecord } from '../types';
import { fetchAllSessions, isSupabaseConfigured } from '../lib/supabase';
import { getTensionEmoji } from '../lib/constants';

interface AdminDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminDrawer: React.FC<AdminDrawerProps> = ({ isOpen, onClose }) => {
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);

  const loadData = async () => {
    setIsLoading(true);
    const result = await fetchAllSessions();
    setSessions(result.sessions);
    setIsOfflineMode(result.isOffline);
    setIsLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  // Derived Metrics
  const totalSessions = sessions.length;
  const uniqueUsers = new Set(sessions.map(s => s.anonymous_user_id)).size;
  
  const avgPreTension = totalSessions > 0 
    ? (sessions.reduce((acc, s) => acc + s.pre_tension, 0) / totalSessions).toFixed(1)
    : '0.0';

  const avgPostTension = totalSessions > 0 
    ? (sessions.reduce((acc, s) => acc + s.post_tension, 0) / totalSessions).toFixed(1)
    : '0.0';

  const reducedSessionsCount = sessions.filter(s => (s.pre_tension - s.post_tension) > 0).length;
  const reductionPercentage = totalSessions > 0
    ? Math.round((reducedSessionsCount / totalSessions) * 100)
    : 0;

  const exportCSV = () => {
    if (sessions.length === 0) {
      alert('Nenhum dado registrado para exportar.');
      return;
    }

    const headers = ['ID_Sessao', 'ID_Usuario_Anonimo', 'Pre_Tensao_1a5', 'Post_Tensao_1a5', 'Delta_Reducao', 'Duracao_Segundos', 'Data_Hora_UTC'];
    const rows = sessions.map(s => [
      s.id || 'N/A',
      s.anonymous_user_id,
      s.pre_tension,
      s.post_tension,
      s.pre_tension - s.post_tension,
      s.duration_seconds,
      s.created_at || new Date().toISOString()
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ancorar_relatorio_unirn_${new Date().toISOString().slice(0, 10)}.csv`);
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
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50"
          />

          {/* Drawer Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 max-h-[90vh] bg-slate-950 border-t border-slate-800 rounded-t-3xl z-50 flex flex-col shadow-2xl max-w-xl mx-auto overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-cyan-400" />
                  <span>Painel do Projeto de Extensão (UNI-RN)</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Orientação: Profa. Ms. Marianna Lucena • Curso de Psicologia
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Connection Status Notice */}
            <div className="px-4 py-2 border-b border-slate-900 bg-slate-900/40 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isOfflineMode ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'}`} />
                <span className="text-slate-300 font-medium">
                  {isOfflineMode 
                    ? 'Modo Offline (dados salvos localmente)' 
                    : 'Base de dados de pesquisa conectada (dados 100% anônimos)'}
                </span>
              </div>
              <button
                onClick={loadData}
                disabled={isLoading}
                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
              >
                <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Atualizar</span>
              </button>
            </div>

            {/* Content Body */}
            <div className="p-4 overflow-y-auto space-y-4 flex-1">
              {/* Aggregated Metrics Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Total Sessões</div>
                  <div className="text-2xl font-black text-cyan-300 mt-1">{totalSessions}</div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Usuários Únicos</div>
                  <div className="text-2xl font-black text-emerald-300 mt-1">{uniqueUsers}</div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Pré vs Pós Médio</div>
                  <div className="text-sm font-bold text-slate-200 mt-1.5 flex items-center justify-center gap-1.5">
                    <span>{getTensionEmoji(Number(avgPreTension))}</span>
                    <span className="text-rose-400">{avgPreTension}</span>
                    <span className="text-slate-500">→</span>
                    <span>{getTensionEmoji(Number(avgPostTension))}</span>
                    <span className="text-emerald-400">{avgPostTension}</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
                  <div className="text-[10px] uppercase font-bold text-slate-400">% com Redução</div>
                  <div className="text-2xl font-black text-teal-300 mt-1">{reductionPercentage}%</div>
                </div>
              </div>

              {/* Action: Export CSV */}
              <button
                onClick={exportCSV}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-[0.98] transition-transform"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Exportar CSV para Relatório UNI-RN</span>
              </button>

              {/* Setup Helper if Supabase not configured */}
              {!isSupabaseConfigured && (
                <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-200 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                    <span>Sincronização em nuvem da pesquisa:</span>
                  </div>
                  <p className="text-[11px] text-amber-300/90">
                    Defina <code className="bg-slate-900 px-1 py-0.5 rounded text-amber-100">VITE_SUPABASE_URL</code> e <code className="bg-slate-900 px-1 py-0.5 rounded text-amber-100">VITE_SUPABASE_ANON_KEY</code> no seu arquivo <code>.env</code> para sincronizar os dados com a base da pesquisa.
                  </p>
                </div>
              )}

              {/* Recent Sessions List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Últimos Registros Anônimos ({sessions.length})
                </h4>

                {sessions.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800">
                    Nenhuma sessão realizada ainda neste dispositivo ou banco.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {sessions.slice(0, 15).map((s, idx) => {
                      const delta = s.pre_tension - s.post_tension;
                      return (
                        <div
                          key={s.id || idx}
                          className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between text-xs"
                        >
                          <div className="space-y-0.5">
                            <div className="font-mono text-[10px] text-slate-400">
                              {s.anonymous_user_id.slice(0, 12)}...
                            </div>
                            <div className="text-[11px] text-slate-300 flex items-center gap-2">
                              <span>
                                {getTensionEmoji(s.pre_tension)} <strong>{s.pre_tension}</strong>
                                <span className="mx-1 text-slate-500">→</span>
                                {getTensionEmoji(s.post_tension)} <strong>{s.post_tension}</strong>
                              </span>
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                delta > 0 ? 'bg-emerald-500/20 text-emerald-300' : delta === 0 ? 'bg-slate-800 text-slate-400' : 'bg-rose-500/20 text-rose-300'
                              }`}>
                                {delta > 0 ? `-${delta}` : delta === 0 ? '0' : `+${Math.abs(delta)}`}
                              </span>
                            </div>
                          </div>

                          <div className="text-right text-[10px] text-slate-400">
                            <div>{s.duration_seconds}s de prática</div>
                            <div className="text-[9px] text-slate-400 mt-0.5">
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
