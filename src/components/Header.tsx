import React from 'react';
import { Sparkles, Shield, HeartHandshake } from 'lucide-react';

interface HeaderProps {
  onOpenAdmin: () => void;
  isOnline: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAdmin, isOnline }) => {
  return (
    <header className="w-full pt-4 pb-3 px-4 backdrop-blur-md bg-slate-950/60 border-b border-slate-800/80 sticky top-0 z-40 transition-all">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 p-[1.5px] shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-[#090d16] rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight bg-gradient-to-r from-cyan-300 via-teal-200 to-emerald-300 bg-clip-text text-transparent">
              Ancorar
            </h1>
            <p className="text-[10px] text-slate-400 font-medium leading-none">
              Espaço de Pausa e Respiração
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Badge de status do Supabase */}
          <div 
            title={isOnline ? "Conectado ao Supabase Cloud" : "Modo Seguro / Offline (Armazenamento Local Ativo)"}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all ${
              isOnline 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
            <span>{isOnline ? 'Cloud' : 'Offline'}</span>
          </div>

          <button
            onClick={onOpenAdmin}
            aria-label="Abrir Painel Acadêmico"
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-400 hover:text-cyan-300 border border-slate-700/60 transition-colors"
          >
            <Shield className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Credencial Acadêmica */}
      <div className="max-w-md mx-auto mt-2">
        <div className="flex items-center justify-center gap-1.5 py-1 px-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-[10.5px] text-slate-300 text-center font-medium shadow-inner">
          <HeartHandshake className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="truncate">
            Projeto de Extensão I • Teorias Comportamentalistas • UNI-RN
          </span>
        </div>
      </div>
    </header>
  );
};
