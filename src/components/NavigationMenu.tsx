import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Home, Wind, User, Globe, Info, PhoneCall, Sun, Moon } from 'lucide-react';

interface NavigationMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onGoHome: () => void;
  onStartPractice: () => void;
  onOpenAbout: () => void;
  onOpenPersonal: () => void;
  onOpenAdmin: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const NavigationMenu: React.FC<NavigationMenuProps> = ({
  isOpen,
  onClose,
  onGoHome,
  onStartPractice,
  onOpenAbout,
  onOpenPersonal,
  onOpenAdmin,
  theme,
  onToggleTheme,
}) => {
  if (!isOpen) return null;

  const handleAction = (action: () => void) => {
    action();
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm"
        />

        {/* Slide-over Menu Panel */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="relative w-full max-w-xs bg-white dark:bg-[#121920] border-l border-stone-200 dark:border-stone-800 h-full p-6 shadow-2xl z-10 flex flex-col justify-between overflow-y-auto text-stone-900 dark:text-stone-100"
        >
          {/* Header */}
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
              <div>
                <h3 className="font-bold text-base tracking-tight">Menu Geral</h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">Navegação do AncorAR</p>
              </div>
              <button
                onClick={onClose}
                aria-label="Fechar menu"
                className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nav list */}
            <nav className="space-y-1.5">
              <button
                onClick={() => handleAction(onGoHome)}
                className="w-full p-3 rounded-2xl flex items-center gap-3 text-left font-medium text-sm text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800/70 transition-all"
              >
                <div className="w-8 h-8 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center shrink-0">
                  <Home className="w-4 h-4 text-stone-600 dark:text-stone-300" />
                </div>
                <div>
                  <span className="block leading-tight">Início</span>
                  <span className="text-[11px] text-stone-400 dark:text-stone-500">Tela inicial e introdução</span>
                </div>
              </button>

              <button
                onClick={() => handleAction(onStartPractice)}
                className="w-full p-3 rounded-2xl flex items-center gap-3 text-left font-medium text-sm text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800/70 transition-all"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center shrink-0">
                  <Wind className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                </div>
                <div>
                  <span className="block leading-tight">Exercício de Respiração</span>
                  <span className="text-[11px] text-stone-400 dark:text-stone-500">Prática guiada 3:2:6</span>
                </div>
              </button>

              <button
                onClick={() => handleAction(onOpenPersonal)}
                className="w-full p-3 rounded-2xl flex items-center gap-3 text-left font-medium text-sm text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800/70 transition-all"
              >
                <div className="w-8 h-8 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-stone-600 dark:text-stone-300" />
                </div>
                <div>
                  <span className="block leading-tight">Meu Histórico</span>
                  <span className="text-[11px] text-stone-400 dark:text-stone-500">Sessões salvas no aparelho</span>
                </div>
              </button>

              <button
                onClick={() => handleAction(onOpenAdmin)}
                className="w-full p-3 rounded-2xl flex items-center gap-3 text-left font-medium text-sm text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800/70 transition-all"
              >
                <div className="w-8 h-8 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center shrink-0">
                  <Globe className="w-4 h-4 text-stone-600 dark:text-stone-300" />
                </div>
                <div>
                  <span className="block leading-tight">Painel Global</span>
                  <span className="text-[11px] text-stone-400 dark:text-stone-500">Métricas agregadas anônimas</span>
                </div>
              </button>

              <button
                onClick={() => handleAction(onOpenAbout)}
                className="w-full p-3 rounded-2xl flex items-center gap-3 text-left font-medium text-sm text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800/70 transition-all"
              >
                <div className="w-8 h-8 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center shrink-0">
                  <Info className="w-4 h-4 text-stone-600 dark:text-stone-300" />
                </div>
                <div>
                  <span className="block leading-tight">Sobre o Projeto</span>
                  <span className="text-[11px] text-stone-400 dark:text-stone-500">Institucional UNI-RN & Metodologia</span>
                </div>
              </button>
            </nav>
          </div>

          {/* Bottom actions: Theme Toggle & CVV */}
          <div className="pt-6 border-t border-stone-200 dark:border-stone-800 space-y-3">
            {/* Theme Toggle */}
            <button
              onClick={onToggleTheme}
              className="w-full p-3 rounded-2xl border border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs font-semibold hover:bg-stone-50 dark:hover:bg-stone-800/60 transition-colors"
            >
              <div className="flex items-center gap-2 text-stone-700 dark:text-stone-300">
                {theme === 'light' ? (
                  <>
                    <Sun className="w-4 h-4 text-amber-600" />
                    <span>Tema Claro (Sóbrio)</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-indigo-400" />
                    <span>Tema Escuro</span>
                  </>
                )}
              </div>
              <span className="text-[11px] text-stone-400">Alternar</span>
            </button>

            {/* Quick CVV */}
            <a
              href="tel:188"
              className="w-full p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex items-center justify-between text-xs font-semibold text-rose-800 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-950/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4" />
                <span>Apoio Emocional CVV</span>
              </div>
              <span className="font-bold bg-rose-600 text-white px-2 py-0.5 rounded-md text-[11px]">188</span>
            </a>

            <p className="text-[10px] text-stone-400 text-center">
              AncorAR • Versão 1.2
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
