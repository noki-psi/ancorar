import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowRight, SlidersHorizontal } from 'lucide-react';
import { BreathingSettings, formatPatternDisplay } from '../lib/settings';
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
  const ratioLabel = formatPatternDisplay(settings);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
      className="flex flex-col flex-1 justify-center space-y-5 py-6"
    >
      <div className="flex justify-center">
        <div 
          className="w-14 h-14 rounded-2xl bg-petrol-800/80 border border-petrol-700/60 flex items-center justify-center shadow-md"
          title="Espaço seguro e acolhedor para descompressão"
        >
          <ShieldCheck className="w-7 h-7 text-sage-300" />
        </div>
      </div>

      <div className="p-5 sm:p-6 rounded-3xl bg-petrol-900/60 border border-petrol-800/80 relative space-y-3.5 shadow-sm">
        <p className="text-lg sm:text-xl text-sand-200 font-medium leading-relaxed text-center italic">
          "O que você sente agora não é seu inimigo. É apenas o seu corpo tentando cuidar de você."
        </p>
        <p className="text-sm sm:text-base text-slate-300 text-center not-italic leading-relaxed">
          Vamos respirar juntos, sinalizando segurança e estabilidade para o seu sistema.
        </p>

        <div className="pt-3 border-t border-petrol-800/80 flex items-center justify-between text-xs sm:text-sm text-slate-400">
          <span>Tensão autoavaliada</span>
          <span 
            className="font-semibold text-sand-300 bg-petrol-950 px-2.5 py-0.5 rounded-full border border-petrol-800"
            title="Autoavaliação informada na etapa anterior"
          >
            Nível {preTension} de 5
          </span>
        </div>
      </div>

      <div className="space-y-2.5">
        <button
          onClick={onNext}
          title="Avançar diretamente para a tela de respiração guiada"
          className="w-full py-4 px-6 rounded-2xl bg-sage-400 hover:bg-sage-300 text-petrol-950 font-bold text-base flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-md"
        >
          <span>Iniciar exercício respiratório</span>
          <ArrowRight className="w-5 h-5" />
        </button>

        {/* Discreet Settings Trigger Button */}
        <button
          type="button"
          onClick={() => setIsSettingsOpen(true)}
          title="Ajustar tempo total e segundos de cada fase respiratória"
          className="w-full py-3 px-3 rounded-xl bg-petrol-900/60 hover:bg-petrol-900/90 text-slate-300 hover:text-sand-200 text-xs sm:text-sm font-medium flex items-center justify-center gap-2 border border-petrol-800/70 transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4 text-sage-400" />
          <span>Personalizar tempo ({durationMin} min • ritmo {ratioLabel})</span>
        </button>

        <button
          onClick={onBack}
          title="Voltar à tela de autoavaliação"
          className="w-full py-2 text-xs sm:text-sm text-slate-400 hover:text-slate-200 transition-colors font-medium text-center"
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
