import React from 'react';
import { Info } from 'lucide-react';

interface FooterProps {
  onOpenAbout: () => void;
  hideDuringPractice?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAbout, hideDuringPractice }) => {
  if (hideDuringPractice) {
    return null;
  }

  return (
    <footer className="w-full mt-auto py-3 px-4 border-t border-stone-200/60 dark:border-stone-800/40 text-center text-xs text-stone-500 dark:text-stone-400">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <span className="text-[11px] text-stone-400 dark:text-stone-500">
          Psicologia • UNI-RN
        </span>

        <button
          onClick={onOpenAbout}
          className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-600 dark:text-stone-300 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
          title="Ver informações sobre o projeto, equipe e fundamentação"
        >
          <Info className="w-3.5 h-3.5" />
          <span>Sobre o projeto</span>
        </button>
      </div>
    </footer>
  );
};
