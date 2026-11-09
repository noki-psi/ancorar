import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowRight, ArrowLeft, SlidersHorizontal } from 'lucide-react';
import { BreathingSettings, formatPatternDisplay, formatDurationLabel } from '../lib/settings';
import { BreathingSettingsModal } from './BreathingSettingsModal';

interface StepCompassionProps {
  preTension: number;
  onNext: () => void;
  onBack: () => void;
  settings: BreathingSettings;
  onUpdateSettings: (settings: BreathingSettings) => void;
}

export const StepCompassion: React.FC<StepCompassionProps> = ({
  preTension,
  onNext,
  onBack,
  settings,
  onUpdateSettings,
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const durationLabel = formatDurationLabel(settings.totalDurationSeconds);
  const ratioLabel = formatPatternDisplay(settings);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
      className="flex flex-col flex-1 justify-center space-y-5 py-4 max-w-md mx-auto w-full select-none"
    >
      <div className="flex justify-center">
        <div 
          className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-center shadow-sm"
          title="Espaço seguro e acolhedor para descompressão"
        >
          <ShieldCheck className="w-6 h-6 text-emerald-700 dark:text-emerald-400" />
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-white dark:bg-[#151c22] border border-stone-200 dark:border-stone-800 space-y-3.5 shadow-sm text-center">
        <p className="text-base sm:text-lg text-stone-900 dark:text-stone-100 font-semibold leading-relaxed italic">
          "O que você sente agora não é seu inimigo. É apenas o seu corpo tentando cuidar de você."
        </p>
        <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 not-italic leading-relaxed">
          Vamos respirar juntos, enviando sinais biológicos de segurança e estabilidade para o seu sistema.
        </p>

        <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
          <span>Tensão autoavaliada</span>
          <span 
            className="font-semibold text-stone-800 dark:text-stone-200 bg-stone-100 dark:bg-stone-800 px-2.5 py-0.5 rounded-full"
            title="Autoavaliação informada na etapa anterior"
          >
            Nível {preTension} de 5
          </span>
        </div>
      </div>

      <div className="space-y-2 pt-1">
        <button
          onClick={onNext}
          title="Avançar diretamente para a tela de respiração guiada"
          className="w-full py-4 px-6 rounded-2xl bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-base flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-sm"
        >
          <span>Iniciar exercício respiratório</span>
          <ArrowRight className="w-5 h-5" />
        </button>

        {/* Discreet Settings Trigger Button */}
        <button
          type="button"
          onClick={() => setIsSettingsOpen(true)}
          title="Ajustar tempo total e segundos de cada fase respiratória"
          className="w-full py-2.5 px-3 rounded-xl bg-stone-100 dark:bg-stone-800/80 hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 text-xs font-semibold flex items-center justify-center gap-2 border border-stone-200 dark:border-stone-700/60 transition-colors"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
          <span>Personalizar sessão ({durationLabel} • {ratioLabel})</span>
        </button>

        <button
          onClick={onBack}
          className="w-full py-2 text-xs font-semibold text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 transition-colors flex items-center justify-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar para a autoavaliação</span>
        </button>
      </div>

      <BreathingSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={onUpdateSettings}
      />
    </motion.div>
  );
};
