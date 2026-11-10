import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, GraduationCap, ShieldCheck, Heart, BookOpen, User, Wifi, WifiOff, PhoneCall } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  isOnline: boolean;
  onOpenPersonal: () => void;
  onOpenAdmin: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({
  isOpen,
  onClose,
  isOnline,
  onOpenPersonal,
  onOpenAdmin,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
          className="relative w-full max-w-lg bg-white dark:bg-[#121920] border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-2xl z-10 max-h-[90vh] overflow-y-auto space-y-6 text-stone-900 dark:text-stone-100"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
            <div>
              <h2 className="text-xl font-bold tracking-tight">Sobre o AncorAR</h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Espaço de pausa, autorregulação e respiração consciente
              </p>
            </div>
            <button
              onClick={onClose}
              aria-label="Fechar"
              className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Contexto Institucional Obrigatório */}
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900/70 border border-stone-200/80 dark:border-stone-800 space-y-2">
            <div className="flex items-center gap-2 text-stone-800 dark:text-stone-200 font-semibold text-sm">
              <GraduationCap className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <span>Contexto Acadêmico e Institucional</span>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
              <strong>Projeto de Extensão I — Teorias Comportamentalistas</strong><br />
              Curso de Psicologia • Centro Universitário do RN (<strong>UNI-RN</strong>)<br />
              Docente Responsável: <strong>Profa. Ms. Marianna Lucena</strong>
            </p>
          </div>

          {/* Pilares Psicológicos e Metodológicos */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Pilares Teórico-Metodológicos
            </h3>

            <div className="space-y-2 text-xs leading-relaxed text-stone-600 dark:text-stone-300">
              <div className="p-3 rounded-xl bg-stone-50/70 dark:bg-stone-900/50 border border-stone-200/60 dark:border-stone-800/60">
                <p className="font-semibold text-stone-900 dark:text-stone-100 mb-0.5">
                  1. Modelo Cognitivo-Comportamental (Beck)
                </p>
                <p>
                  Identificação e psicoeducação sobre pensamentos automáticos em momentos de sobrecarga e estresse, e sua repercussão fisiológica imediata no corpo (taquicardia, respiração curta e inquietação).
                </p>
              </div>

              <div className="p-3 rounded-xl bg-stone-50/70 dark:bg-stone-900/50 border border-stone-200/60 dark:border-stone-800/60">
                <p className="font-semibold text-stone-900 dark:text-stone-100 mb-0.5">
                  2. Estimulação Vagal e Respiração Pautada (3:2:6)
                </p>
                <p>
                  Inspiração consciente (3s), suspensão suave (2s) e expiração prolongada (6s) para estimular o nervo vago e ativar o sistema nervoso parassimpático.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-stone-50/70 dark:bg-stone-900/50 border border-stone-200/60 dark:border-stone-800/60">
                <p className="font-semibold text-stone-900 dark:text-stone-100 mb-0.5">
                  3. Acolhimento Compassivo
                </p>
                <p>
                  Despatologização da ansiedade: o corpo não é um inimigo, mas sim um sistema protetor temporariamente hiperativado que necessita de sinais de segurança.
                </p>
              </div>
            </div>
          </div>

          {/* Ética, Privacidade & Conexão */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-stone-800 dark:text-stone-200">
                <ShieldCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                <span>Privacidade & LGPD</span>
              </div>
              <p className="text-stone-500 dark:text-stone-400 leading-snug">
                Dados 100% anônimos. Nenhum nome, e-mail, telefone ou matrícula é coletado.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-stone-800 dark:text-stone-200">
                {isOnline ? (
                  <>
                    <Wifi className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                    <span>Conexão Cloud Ativa</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>Modo Offline Resiliente</span>
                  </>
                )}
              </div>
              <p className="text-stone-500 dark:text-stone-400 leading-snug">
                {isOnline 
                  ? 'Sincronização em nuvem segura com o banco da pesquisa.' 
                  : 'Sessões salvas no aparelho; serão enviadas ao reconectar.'}
              </p>
            </div>
          </div>

          {/* Apoio Emocional CVV */}
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-rose-800 dark:text-rose-300 font-semibold text-xs">
                <Heart className="w-3.5 h-3.5" />
                <span>Precisa de apoio emocional imediato?</span>
              </div>
              <p className="text-[11px] text-rose-700 dark:text-rose-400">
                Ligue gratuitamente para o CVV — Centro de Valorização da Vida.
              </p>
            </div>
            <a
              href="tel:188"
              className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-sm transition-all"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>188</span>
            </a>
          </div>

          {/* Ações e Painéis */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              onClick={() => {
                onClose();
                onOpenPersonal();
              }}
              className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800 text-xs font-semibold flex items-center justify-center gap-2 transition-colors text-stone-700 dark:text-stone-300"
            >
              <User className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <span>Meu Histórico</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenAdmin();
              }}
              className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800 text-xs font-semibold flex items-center justify-center gap-2 transition-colors text-stone-700 dark:text-stone-300"
            >
              <BookOpen className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <span>Painel da Pesquisa</span>
            </button>
          </div>

          {/* Aviso Ético Legal */}
          <p className="text-[11px] text-stone-400 dark:text-stone-500 text-center leading-relaxed border-t border-stone-200 dark:border-stone-800 pt-3">
            Ferramenta estritamente acadêmica, preventiva e psicoeducativa. Não substitui psicoterapia clínica ou atendimento emergencial de saúde mental.
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
