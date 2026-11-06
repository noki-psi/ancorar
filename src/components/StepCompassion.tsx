import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowRight, SlidersHorizontal } from 'lucide-react';
import { BreathingSettings } from '../lib/settings';
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

  const durationMin = Math.round(settings.totalDurationSeconds / 60);
  const ratioLabel = `${settings.inhaleDuration}:${settings.holdDuration}:${settings.exhaleDuration}`;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
      className="flex flex-col flex-1 justify-center space-y-5 py-6"
    >
      <div className="flex justify-center">
        <div className="w-12 h-12 rounded-2xl bg-petrol-800/80 border border-petrol-700/60 flex items-center justify-center">
          <ShieldCheck className="w-6 h-6 text-sage-300" />
        </div>
      </div>

      <div className="p-5 rounded-2xl bg-petrol-900/60 border border-petrol-800/80 relative space-y-3">
        <p className="text-base sm:text-lg text-sand-200 font-medium leading-relaxed text-center italic">
          "O que você sente agora não é seu inimigo. É apenas o seu corpo tentando cuidar de você."
        </p>
        <p className="text-xs sm:text-sm text-slate-300 text-center not-italic leading-relaxed">
          Vamos respirar juntos, sinalizando segurança e estabilidade para o seu sistema.
        </p>

        <div className="pt-3 border-t border-petrol-800/80 flex items-center justify-between text-xs text-slate-400">
          <span>Tensão autoavaliada</span>
          <span className="font-medium text-sand-300">Nível {preTension} de 5</span>
        </div>
      </div>

      <div className="space-y-2">
        <button
          onClick={onNext}
          className="w-full py-3.5 px-6 rounded-2xl bg-sage-400 hover:bg-sage-300 text-petrol-950 font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-sm"
        >
          <span>Iniciar exercício respiratório</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Discreet Settings Trigger Button */}
        <button
          type="button"
          onClick={() => setIsSettingsOpen(true)}
          className="w-full py-2.5 px-3 rounded-xl bg-petrol-900/40 hover:bg-petrol-900/80 text-slate-400 hover:text-sand-200 text-xs font-normal flex items-center justify-center gap-1.5 border border-petrol-800/50 transition-colors"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-sage-400" />
          <span>Personalizar tempo ({durationMin} min • ritmo {ratioLabel})</span>
        </button>

        <button
          onClick={onBack}
          className="w-full py-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors font-medium"
        >
          ← Ajustar autoavaliação
        </button>
      </div>

      {/* Settings Modal */}
      <BreathingSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={onUpdateSettings}
      />
    </motion.div>
  );
};
