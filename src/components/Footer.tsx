import React from 'react';
import { BookOpen, GraduationCap, ArrowUpRight } from 'lucide-react';

interface FooterProps {
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin }) => {
  return (
    <footer className="w-full mt-auto py-5 px-4 border-t border-slate-900 bg-slate-950/80 text-center text-xs text-slate-400">
      <div className="max-w-md mx-auto space-y-3">
        <div className="flex flex-col items-center justify-center gap-1">
          <div className="flex items-center gap-1.5 text-slate-300 font-semibold text-[11px]">
            <GraduationCap className="w-4 h-4 text-cyan-400" />
            <span>Curso de Psicologia • Centro Universitário do RN (UNI-RN)</span>
          </div>
          <p className="text-[10px] text-slate-400">
            Orientação: <span className="text-slate-300 font-medium">Profa. Ms. Marianna Lucena</span>
          </p>
        </div>

        <div className="pt-2 border-t border-slate-900/60 flex items-center justify-center gap-4 text-[11px]">
          <button
            onClick={onOpenAdmin}
            className="inline-flex items-center gap-1 text-cyan-400/90 hover:text-cyan-300 font-medium hover:underline transition-all"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Painel do Projeto de Extensão (UNI-RN)</span>
            <ArrowUpRight className="w-3 h-3 opacity-70" />
          </button>
        </div>

        <p className="text-[9.5px] text-slate-400">
          Uso educacional e microintervenção preventiva. Não substitui psicoterapia clínica ou atendimento emergencial.
        </p>
      </div>
    </footer>
  );
};
