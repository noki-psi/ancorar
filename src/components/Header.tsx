import React from 'react';
import { Database, PhoneCall, User } from 'lucide-react';
import { Logo } from './Logo';

interface HeaderProps {
  onOpenAdmin: () => void;
  onOpenPersonal: () => void;
  isOnline: boolean;
  stepProgress?: {
    current: number;
    total: number;
    label: string;
  };
}

export const Header: React.FC<HeaderProps> = ({ onOpenAdmin, onOpenPersonal, isOnline, stepProgress }) => {
  return (
    <header className="w-full pt-3 pb-2.5 px-4 backdrop-blur-md bg-petrol-950/80 border-b border-petrol-800/60 sticky top-0 z-40 transition-all">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <Logo size={32} />
          <div>
            <h1 className="text-base font-bold tracking-tight text-sand-200">
              Ancorar
            </h1>
            <p className="text-xs text-slate-300 font-medium leading-tight">
              Espaço de Pausa e Respiração
            </p>
          </div>
        </div>

        {/* Status + Actions */}
        <div className="flex items-center gap-2">
          {/* Online badge */}
          <div 
            title={isOnline ? "Conexão ativa: dados anonimizados da pesquisa são enviados com segurança" : "Modo offline: os dados são salvos apenas no seu aparelho"}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border border-petrol-700/80 bg-petrol-900/60 text-slate-200 cursor-help"
          >
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-sage-400 animate-pulse' : 'bg-sand-400'}`} />
            <span>{isOnline ? 'Online' : 'Offline'}</span>
          </div>

          {/* Quick CVV */}
          <a
            href="tel:188"
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 transition-colors"
            title="Ligue 188 gratuitamente para o Centro de Valorização da Vida (apoio emocional 24h)"
          >
            <PhoneCall className="w-3 h-3" />
            <span>188</span>
          </a>

          {/* Personal Drawer button */}
          <button
            onClick={onOpenPersonal}
            aria-label="Meu Histórico Pessoal"
            title="Abrir meu histórico pessoal privado (salvo neste aparelho)"
            className="p-1.5 rounded-lg text-slate-400 hover:text-sand-200 transition-colors"
          >
            <User className="w-4 h-4" />
          </button>

          {/* Admin / Research drawer */}
          <button
            onClick={onOpenAdmin}
            aria-label="Painel da Pesquisa"
            title="Abrir painel analítico da pesquisa"
            className="p-1.5 rounded-lg text-slate-400 hover:text-sand-200 transition-colors"
          >
            <Database className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress indicator when active */}
      {stepProgress && (
        <div 
          className="max-w-md mx-auto mt-2 pt-1.5 border-t border-petrol-800/40 flex items-center justify-between text-xs text-slate-300 font-medium"
          title={`Etapa atual: ${stepProgress.label} (${stepProgress.current} de ${stepProgress.total})`}
        >
          <span className="font-semibold text-slate-200">{stepProgress.label}</span>
          <span>Etapa {stepProgress.current} de {stepProgress.total}</span>
        </div>
      )}
    </header>
  );
};
