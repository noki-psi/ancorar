import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCcw, Clock, Wind, Check } from 'lucide-react';
import { BreathingSettings, DEFAULT_BREATHING_SETTINGS } from '../lib/settings';

interface BreathingSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: BreathingSettings;
  onSave: (settings: BreathingSettings) => void;
}

const DURATION_PRESETS = [
  { label: '1 min', seconds: 60 },
  { label: '2 min (Padrão)', seconds: 120 },
  { label: '3 min', seconds: 180 },
  { label: '5 min', seconds: 300 },
];

export const BreathingSettingsModal: React.FC<BreathingSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
}) => {
  const [current, setCurrent] = useState<BreathingSettings>(settings);

  // Sync state if modal is reopened
  React.useEffect(() => {
    if (isOpen) {
      setCurrent(settings);
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const cycleLength = current.inhaleDuration + current.holdDuration + current.exhaleDuration;
  const cycleCount = Math.floor(current.totalDurationSeconds / cycleLength);

  const handleReset = () => {
    setCurrent(DEFAULT_BREATHING_SETTINGS);
  };

  const handleConfirm = () => {
    onSave(current);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-petrol-950/80 backdrop-blur-sm"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ y: '100%', opacity: 0.5 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="relative w-full max-w-md bg-petrol-900 border-t sm:border border-petrol-700/80 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl z-10 max-h-[90vh] overflow-y-auto space-y-5"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-petrol-800">
            <div>
              <h3 className="text-base font-semibold text-sand-200">
                Personalizar Sessão
              </h3>
              <p className="text-[11px] text-slate-400">
                Adapte o tempo disponível e o ritmo respiratório
              </p>
            </div>
            <button
              onClick={onClose}
              aria-label="Fechar configurações"
              className="p-1.5 rounded-xl bg-petrol-800/80 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 1. Tempo Disponível */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
              <Clock className="w-3.5 h-3.5 text-sage-400" />
              <span>Tempo que você tem disponível:</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {DURATION_PRESETS.map((p) => {
                const isSelected = current.totalDurationSeconds === p.seconds;
                return (
                  <button
                    key={p.seconds}
                    type="button"
                    onClick={() => setCurrent({ ...current, totalDurationSeconds: p.seconds })}
                    className={`py-2 px-2 rounded-xl text-xs font-medium border text-center transition-all ${
                      isSelected
                        ? 'border-sage-400 bg-sage-400/20 text-sand-200 shadow-sm'
                        : 'border-petrol-800 bg-petrol-950/40 text-slate-400 hover:text-slate-200 hover:bg-petrol-800/40'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Tempo de cada etapa da respiração */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between text-xs font-medium text-slate-300">
              <div className="flex items-center gap-1.5">
                <Wind className="w-3.5 h-3.5 text-sage-400" />
                <span>Ritmo de cada etapa (em segundos):</span>
              </div>
              <span className="text-[11px] text-sand-300 font-mono">
                {current.inhaleDuration}s : {current.holdDuration}s : {current.exhaleDuration}s
              </span>
            </div>

            {/* Stepper controls */}
            <div className="space-y-2.5">
              {/* Inhale */}
              <div className="p-3 rounded-2xl bg-petrol-950/60 border border-petrol-800/70 flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-slate-200 block">Inspiração</span>
                  <span className="text-[10px] text-slate-400">Puxar o ar suavemente</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrent({ ...current, inhaleDuration: Math.max(2, current.inhaleDuration - 1) })}
                    className="w-7 h-7 rounded-lg bg-petrol-800 hover:bg-petrol-700 text-slate-200 font-bold text-sm flex items-center justify-center transition-colors"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-sm font-semibold text-sand-200 tabular-nums">
                    {current.inhaleDuration}s
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrent({ ...current, inhaleDuration: Math.min(8, current.inhaleDuration + 1) })}
                    className="w-7 h-7 rounded-lg bg-petrol-800 hover:bg-petrol-700 text-slate-200 font-bold text-sm flex items-center justify-center transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Hold */}
              <div className="p-3 rounded-2xl bg-petrol-950/60 border border-petrol-800/70 flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-slate-200 block">Pausa / Retenção</span>
                  <span className="text-[10px] text-slate-400">Manter os pulmões cheios</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrent({ ...current, holdDuration: Math.max(0, current.holdDuration - 1) })}
                    className="w-7 h-7 rounded-lg bg-petrol-800 hover:bg-petrol-700 text-slate-200 font-bold text-sm flex items-center justify-center transition-colors"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-sm font-semibold text-sand-200 tabular-nums">
                    {current.holdDuration}s
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrent({ ...current, holdDuration: Math.min(6, current.holdDuration + 1) })}
                    className="w-7 h-7 rounded-lg bg-petrol-800 hover:bg-petrol-700 text-slate-200 font-bold text-sm flex items-center justify-center transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Exhale */}
              <div className="p-3 rounded-2xl bg-petrol-950/60 border border-petrol-800/70 flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-slate-200 block">Expiração</span>
                  <span className="text-[10px] text-slate-400">Soltar longo pela boca</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrent({ ...current, exhaleDuration: Math.max(3, current.exhaleDuration - 1) })}
                    className="w-7 h-7 rounded-lg bg-petrol-800 hover:bg-petrol-700 text-slate-200 font-bold text-sm flex items-center justify-center transition-colors"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-sm font-semibold text-sand-200 tabular-nums">
                    {current.exhaleDuration}s
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrent({ ...current, exhaleDuration: Math.min(12, current.exhaleDuration + 1) })}
                    className="w-7 h-7 rounded-lg bg-petrol-800 hover:bg-petrol-700 text-slate-200 font-bold text-sm flex items-center justify-center transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Cycle summary info */}
            <div className="p-3 rounded-xl bg-petrol-950/40 border border-petrol-800/50 text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center justify-between text-slate-300">
                <span>Duração de 1 ciclo completo:</span>
                <span className="font-semibold text-sand-200">{cycleLength} segundos</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Ciclos aproximados na sessão:</span>
                <span>{cycleCount} ciclos</span>
              </div>
              <p className="text-[10px] text-slate-400 pt-1 border-t border-petrol-800/40 leading-relaxed">
                Nota: a proporção 3:2:6 é a recomendação acadêmica para estímulo parassimpático, mas você pode adaptar com liberdade.
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={handleConfirm}
              className="w-full py-3 px-4 rounded-2xl bg-sage-400 hover:bg-sage-300 text-petrol-950 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-[0.98]"
            >
              <Check className="w-4 h-4" />
              <span>Salvar configurações</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="w-full py-2 px-4 rounded-xl text-xs text-slate-400 hover:text-sand-200 transition-colors flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restaurar padrão científico (3:2:6 • 2 min)</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
