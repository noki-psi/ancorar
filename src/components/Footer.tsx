import React from 'react';
import { BookOpen, GraduationCap, ArrowUpRight, Heart, User } from 'lucide-react';

interface FooterProps {
  onOpenAdmin: () => void;
  onOpenPersonal: () => void;
  hideDuringPractice?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin, onOpenPersonal, hideDuringPractice }) => {
  if (hideDuringPractice) {
    return null;
  }

  return (
    <footer className="w-full mt-auto py-3 px-4 border-t border-petrol-800/40 bg-petrol-950/60 text-center text-xs text-slate-400">
      <div className="max-w-md mx-auto space-y-1.5">
        <div className="flex items-center justify-center gap-1.5 text-slate-300 font-medium text-xs">
          <GraduationCap className="w-4 h-4 text-sage-400" />
          <span>Psicologia • UNI-RN • Profa. Ms. Marianna Lucena</span>
        </div>

        <div className="flex items-center justify-center gap-3 text-xs">
          <button
            onClick={onOpenPersonal}
            title="Abrir histórico privado de sessões deste aparelho"
            className="inline-flex items-center gap-1 text-slate-300 hover:text-sand-200 font-semibold hover:underline transition-all"
          >
            <User className="w-3.5 h-3.5 text-sage-400" />
            <span>Meu Histórico</span>
          </button>
          <span className="text-petrol-700">•</span>
          <button
            onClick={onOpenAdmin}
            title="Abrir painel com estatísticas anônimas da pesquisa"
            className="inline-flex items-center gap-1 text-sage-300 hover:text-sand-200 font-semibold hover:underline transition-all"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Painel da Pesquisa</span>
            <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
          </button>
          <span className="text-petrol-700">•</span>
          <a
            href="tel:188"
            title="Centro de Valorização da Vida - Ligação gratuita 24h"
            className="inline-flex items-center gap-1 text-slate-300 hover:text-sand-200 transition-colors font-medium"
          >
            <Heart className="w-3.5 h-3.5 text-rose-400" />
            <span>Apoio: CVV 188</span>
          </a>
        </div>

        <p className="text-[11px] text-slate-400 max-w-sm mx-auto leading-relaxed">
          Microintervenção psicoeducativa preventiva. Não substitui atendimento clínico especializado.
        </p>
      </div>
    </footer>
  );
};
