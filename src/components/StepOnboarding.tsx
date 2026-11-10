import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, SlidersHorizontal, Wind } from 'lucide-react';
import { BreathingSettings, formatDurationLabel, formatPatternDisplay } from '../lib/settings';
import { BreathingSettingsModal } from './BreathingSettingsModal';

interface StepOnboardingProps {
  onStart: () => void;
  settings: BreathingSettings;
  onUpdateSettings: (settings: BreathingSettings) => void;
}

export const StepOnboarding: React.FC<StepOnboardingProps> = ({
  onStart,
  settings,
  onUpdateSettings,
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const durationLabel = formatDurationLabel(settings.totalDurationSeconds);
  const ratioLabel = formatPatternDisplay(settings);

  return (
    <div className="flex flex-col flex-1 justify-center items-center text-center px-4 py-8 max-w-sm mx-auto w-full select-none">
      {/* Central Living Breathing Circle: Protagonist Preview */}
      <div className="relative w-44 h-44 sm:w-52 sm:h-52 flex items-center justify-center my-6">
        <motion.div
          animate={{
            scale: [0.92, 1.16, 0.92],
            opacity: [0.15, 0.32, 0.15],
          }}
          transition={{
            duration: 5.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute inset-0 rounded-full bg-emerald-600/20 dark:bg-emerald-400/20 blur-2xl pointer-events-none"
        />

        <motion.div
          animate={{
            scale: [0.96, 1.06, 0.96],
          }}
          transition={{
            duration: 5.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="w-36 h-36 sm:w-44 sm:h-44 rounded-full border border-stone-200 dark:border-stone-800 bg-white/80 dark:bg-[#121920]/80 backdrop-blur-sm flex flex-col items-center justify-center shadow-lg p-4"
        >
          <Wind className="w-8 h-8 text-emerald-700 dark:text-emerald-400 mb-1 stroke-[1.6]" />
          <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-widest">
            AncorAR
          </span>
        </motion.div>
      </div>

      {/* Brief, Serene Presentation with Generous Space */}
      <div className="space-y-2 mb-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 dark:text-stone-100">
          Respiração guiada
        </h2>
        <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 max-w-xs mx-auto leading-relaxed font-normal">
          Um espaço simples para desacelerar o ritmo e respirar conscientemente.
        </p>
      </div>

      {/* Main Action: Single "Começar" Button */}
      <div className="w-full space-y-3">
        <button
          onClick={onStart}
          title="Iniciar a sessão"
          className="w-full py-4 px-6 rounded-2xl bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-base flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-sm hover:shadow-md"
        >
          <span>Começar</span>
          <ArrowRight className="w-5 h-5" />
        </button>

        {/* Discreet Duration & Pattern Trigger */}
        <div className="flex items-center justify-center pt-1">
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            title="Ajustar tempo ou proporção da respiração"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 bg-stone-100/80 dark:bg-stone-800/60 hover:bg-stone-200/80 dark:hover:bg-stone-800 transition-colors"
          >
            <SlidersHorizontal className="w-3 h-3 text-emerald-700 dark:text-emerald-400" />
            <span>{durationLabel} • {ratioLabel}</span>
          </button>
        </div>
      </div>

      {/* Settings Modal */}
      <BreathingSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={onUpdateSettings}
      />
    </div>
  );
};
