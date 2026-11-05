import React from 'react';
import { Shield, HeartHandshake, PhoneCall } from 'lucide-react';
import { Logo } from './Logo';

interface HeaderProps {
  onOpenAdmin: () => void;
  isOnline: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAdmin, isOnline }) => {
  const tooltipText = isOnline
    ? "Base de dados de pesquisa ativa • Online: seus dados são 100% anonimizados e enviados com segurança aos pesquisadores da UNI-RN."
    : "Modo Offline • Armazenamento local seguro ativo no seu dispositivo.";

  return (
    <header className="w-full pt-3.5 pb-2.5 px-4 backdrop-blur-xl bg-slate-950/70 border-b border-slate-800/60 sticky top-0 z-40 transition-all">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Logo and Brand Title */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center p-1 rounded-2xl bg-gradient-to-tr from-cyan-500/15 via-teal-500/10 to-emerald-500/15 border border-cyan-500/20 shadow-md shadow-cyan-500/10">
            <Logo size={32} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-bold tracking-tight bg-gradient-to-r from-cyan-300 via-teal-200 to-emerald-300 bg-clip-text text-transparent">
                Ancorar
              </h1>
            </div>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide">
              Espaço de Pausa e Respiração
            </p>
          </div>
        </div>

        {/* Right Actions: Status Badge & Admin */}
        <div className="flex items-center gap-2">
          {/* Status Badge */}
          <div 
            title={tooltipText}
            aria-label={tooltipText}
            className={`group relative cursor-help flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all duration-300 ${
              isOnline 
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25 hover:bg-emerald-500/15 hover:border-emerald-500/40 shadow-sm shadow-emerald-500/10'
                : 'bg-amber-500/10 text-amber-300 border-amber-500/25 hover:bg-amber-500/15 hover:border-amber-500/40'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span className="tracking-wide">{isOnline ? 'Online' : 'Offline'}</span>
          </div>

          {/* Admin Panel Button */}
          <button
            onClick={onOpenAdmin}
            aria-label="Painel de Pesquisa Acadêmica"
            title="Abrir Painel do Projeto de Extensão (UNI-RN)"
            className="p-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 border border-slate-800/80 transition-all hover:border-slate-700 active:scale-95 shadow-sm"
          >
            <Shield className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Institutional Academic Badge & CVV Emergency Line */}
      <div className="max-w-md mx-auto mt-2">
        <div className="flex items-center justify-between gap-2 py-1 px-2.5 rounded-xl bg-slate-900/60 border border-slate-800/70 text-[10px] text-slate-300 font-medium shadow-inner">
          <div className="flex items-center gap-1.5 truncate">
            <HeartHandshake className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="truncate text-slate-300">
              Projeto de Extensão I • UNI-RN
            </span>
          </div>

          <a 
            href="tel:188"
            title="Ligue gratuitamente para o CVV - Centro de Valorização da Vida"
            className="inline-flex items-center gap-1 shrink-0 px-2 py-0.5 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-800/40 text-cyan-300 hover:text-cyan-200 text-[10px] font-semibold transition-all"
          >
            <PhoneCall className="w-3 h-3 text-cyan-400" />
            <span>CVV 188</span>
          </a>
        </div>
      </div>
    </header>
  );
};
