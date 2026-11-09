import React from 'react';
import { Menu } from 'lucide-react';
import { Logo } from './Logo';

interface HeaderProps {
  onOpenMenu: () => void;
  onGoHome: () => void;
  stepProgress?: {
    current: number;
    total: number;
    label: string;
  };
}

export const Header: React.FC<HeaderProps> = ({ onOpenMenu, onGoHome, stepProgress }) => {
  return (
    <header className="w-full pt-3 pb-2.5 px-4 backdrop-blur-md bg-white/85 dark:bg-[#121920]/85 border-b border-stone-200/80 dark:border-stone-800/80 sticky top-0 z-40 transition-colors">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Brand - Clickable to return to Home at any time */}
        <button
          onClick={onGoHome}
          className="flex items-center gap-2.5 text-left group focus:outline-none"
          title="Voltar para o início"
        >
          <Logo size={30} />
          <div>
            <h1 className="text-base font-bold tracking-tight text-stone-900 dark:text-stone-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
              Ancorar
            </h1>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 font-medium leading-none">
              Pausa e Respiração
            </p>
          </div>
        </button>

        {/* Minimal Right: Hamburger Menu for general navigation */}
        <div className="flex items-center gap-2">
          {stepProgress && (
            <span className="hidden xs:inline-block text-[11px] font-semibold text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-800/80 px-2 py-0.5 rounded-full">
              {stepProgress.current}/{stepProgress.total}
            </span>
          )}

          <button
            onClick={onOpenMenu}
            aria-label="Abrir menu de navegação"
            title="Menu de navegação e opções"
            className="p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Discreet step indicator bar when active */}
      {stepProgress && (
        <div className="max-w-md mx-auto mt-2 pt-1.5 border-t border-stone-100 dark:border-stone-800/60 flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400 font-medium">
          <span className="font-semibold text-stone-700 dark:text-stone-200">{stepProgress.label}</span>
          <span>Etapa {stepProgress.current} de {stepProgress.total}</span>
        </div>
      )}
    </header>
  );
};
