import React from 'react';
import { BookOpen, GraduationCap, ArrowUpRight, Heart } from 'lucide-react';

interface FooterProps {
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin }) => {
  return (
    <footer className="w-full mt-auto py-4 px-4 border-t border-slate-900/80 bg-slate-950/80 text-center text-xs text-slate-400 backdrop-blur-md">
      <div className="max-w-md mx-auto space-y-2.5">
        <div className="flex flex-col items-center justify-center gap-0.5">
          <div className="flex items-center gap-1.5 text-slate-300 font-semibold text-[11px]">
            <GraduationCap className="w-4 h-4 text-cyan-400" />
            <span>Curso de Psicologia • Centro Universitário do RN (UNI-RN)</span>
          </div>
          <p className="text-[10px] text-slate-400">
            Orientação: <span className="text-slate-300 font-medium">Profa. Ms. Marianna Lucena</span>
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-1 text-[11px]">
          <button
            onClick={onOpenAdmin}
            className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-medium hover:underline transition-all"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Painel da Pesquisa</span>
            <ArrowUpRight className="w-3 h-3 opacity-70" />
          </button>
          <span className="text-slate-700">•</span>
          <a
            href="tel:188"
            className="inline-flex items-center gap-1 text-slate-300 hover:text-cyan-300 font-medium transition-colors"
          >
            <Heart className="w-3 h-3 text-rose-400" />
            <span>Apoio Emocional: CVV 188</span>
          </a>
        </div>

        <p className="text-[9.5px] text-slate-400 max-w-xs mx-auto leading-tight">
          Microintervenção psicoeducativa preventiva. Não substitui psicoterapia clínica ou atendimento emergencial.
        </p>
      </div>
    </footer>
  );
};
