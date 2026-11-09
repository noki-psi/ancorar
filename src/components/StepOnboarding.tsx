import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { BreathingSettings, formatDurationLabel, formatPatternDisplay } from '../lib/settings';
import { BreathingSettingsModal } from './BreathingSettingsModal';
import { TENSION_LIST } from '../lib/constants';

interface StepOnboardingProps {
  onStartBreathing: () => void;
  settings: BreathingSettings;
  onUpdateSettings: (settings: BreathingSettings) => void;
  preTension: number | null;
  onSelectPreTension: (val: number | null) => void;
}

export const StepOnboarding: React.FC<StepOnboardingProps> = ({
  onStartBreathing,
  settings,
  onUpdateSettings,
  preTension,
  onSelectPreTension,
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showOptionalTension, setShowOptionalTension] = useState(false);

  const durationLabel = formatDurationLabel(settings.totalDurationSeconds);
  const ratioLabel = formatPatternDisplay(settings);

  return (
    <div className="flex flex-col flex-1 justify-center items-center text-center px-4 py-8 max-w-sm mx-auto w-full select-none">
      {/* Organic Breathing Aura in the Center as Protagonist Preview */}
      <div className="relative w-44 h-44 sm:w-52 sm:h-52 flex items-center justify-center my-6">
        <motion.div
          animate={{
            scale: [0.92, 1.15, 0.92],
            opacity: [0.15, 0.35, 0.15],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute inset-0 rounded-full bg-emerald-600/20 dark:bg-emerald-400/20 blur-2xl pointer-events-none"
        />

        <motion.div
          animate={{
            scale: [0.95, 1.08, 0.95],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="w-36 h-36 sm:w-44 sm:h-44 rounded-full border border-stone-200 dark:border-stone-800 bg-white/80 dark:bg-[#121920]/80 backdrop-blur-sm flex flex-col items-center justify-center shadow-lg p-4"
        >
          <Wind className="w-8 h-8 text-emerald-700 dark:text-emerald-400 mb-2 stroke-[1.6]" />
          <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400 tracking-wider uppercase">
            Pausa Guiada
          </span>
        </motion.div>
      </div>

      {/* Short, Serene Phrase (Generous Negative Space) */}
      <div className="space-y-2 mb-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 dark:text-stone-100">
          Faça uma pausa consciente
        </h2>
        <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 max-w-xs mx-auto leading-relaxed font-normal">
          Respire com calma, desacelere o ritmo e reencontre seu centro.
        </p>
      </div>

      {/* Single Primary CTA: "Começar a respirar" */}
      <div className="w-full space-y-3">
        <button
          onClick={onStartBreathing}
          title="Começar o exercício respiratório agora"
          className="w-full py-4 px-6 rounded-2xl bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-base flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] shadow-sm hover:shadow-md"
        >
          <Wind className="w-5 h-5" />
          <span>Começar a respirar</span>
        </button>

        {/* Discreet Duration & Pattern Trigger */}
        <div className="flex items-center justify-center gap-2">
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

        {/* Optional Tension Assessment Trigger (Non-blocking) */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setShowOptionalTension(prev => !prev)}
            className="text-[11px] text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 transition-colors inline-flex items-center gap-1"
          >
            <span>{preTension ? `Tensão inicial: Nível ${preTension}` : 'Registrar como você está agora? (Opcional)'}</span>
            <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${showOptionalTension ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showOptionalTension && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden pt-2"
              >
                <div className="flex items-center justify-center gap-1.5 p-2 rounded-2xl bg-stone-100/70 dark:bg-stone-800/40 border border-stone-200/60 dark:border-stone-800/60">
                  {TENSION_LIST.slice().reverse().map(item => {
                    const isSelected = preTension === item.level;
                    return (
                      <button
                        key={item.level}
                        type="button"
                        onClick={() => onSelectPreTension(isSelected ? null : item.level)}
                        title={`${item.level} — ${item.label}`}
                        className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                          isSelected
                            ? 'bg-emerald-700 text-white shadow-xs'
                            : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700'
                        }`}
                      >
                        <span className="text-sm select-none">{item.emoji}</span>
                        <span>{item.level}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
