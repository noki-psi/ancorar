import React from 'react';
import { BookOpen, GraduationCap, ArrowUpRight, Heart } from 'lucide-react';

interface FooterProps {
  onOpenAdmin: () => void;
  hideDuringPractice?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin, hideDuringPractice }) => {
  if (hideDuringPractice) {
    return null;
  }

  return (
    <footer className="w-full mt-auto py-3 px-4 border-t border-petrol-800/40 bg-petrol-950/60 text-center text-xs text-slate-400">
      <div className="max-w-md mx-auto space-y-1.5">
        <div className="flex items-center justify-center gap-1.5 text-slate-300 font-medium text-[11px]">
          <GraduationCap className="w-3.5 h-3.5 text-sage-400" />
          <span>Psicologia • UNI-RN • Profa. Ms. Marianna Lucena</span>
        </div>

        <div className="flex items-center justify-center gap-3 text-[10.5px]">
          <button
            onClick={onOpenAdmin}
            className="inline-flex items-center gap-1 text-sage-300 hover:text-sand-200 font-medium hover:underline transition-all"
          >
            <BookOpen className="w-3 h-3" />
            <span>Painel da Pesquisa</span>
            <ArrowUpRight className="w-3 h-3 opacity-60" />
          </button>
          <span className="text-petrol-700">•</span>
          <a
            href="tel:188"
            className="inline-flex items-center gap-1 text-slate-400 hover:text-sand-200 transition-colors"
          >
            <Heart className="w-3 h-3 text-rose-400" />
            <span>Apoio: CVV 188</span>
          </a>
        </div>

        <p className="text-[9px] text-slate-400 max-w-xs mx-auto leading-tight">
          Microintervenção psicoeducativa preventiva. Não substitui atendimento clínico especializado.
        </p>
      </div>
    </footer>
  );
};
