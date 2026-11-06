import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCcw, Clock, Wind, Check } from 'lucide-react';
import { BreathingSettings, DEFAULT_BREATHING_SETTINGS, formatPatternDisplay, formatDurationLong } from '../lib/settings';

interface BreathingSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: BreathingSettings;
  onSave: (settings: BreathingSettings) => void;
}

const QUICK_PRESETS = [
  { label: '30 seg', seconds: 30 },
  { label: '1 min', seconds: 60 },
  { label: '1m 30s', seconds: 90 },
  { label: '2 min (Padrão)', seconds: 120 },
  { label: '3 min', seconds: 180 },
  { label: '5 min', seconds: 300 },
  { label: '10 min', seconds: 600 },
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

  const cycleLength = current.inhaleDuration + current.holdDuration + current.exhaleDuration + (current.holdPostExhaleDuration || 0);
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
          className="relative w-full max-w-md bg-petrol-900 border-t sm:border border-petrol-700/80 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl z-10 max-h-[92vh] overflow-y-auto space-y-5"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-petrol-800">
            <div>
              <h3 className="text-lg font-semibold text-sand-200">
                Personalizar Sessão
              </h3>
              <p className="text-xs text-slate-300">
                Adapte o tempo disponível e o ritmo respiratório
              </p>
            </div>
            <button
              onClick={onClose}
              aria-label="Fechar configurações"
              title="Fechar painel de configurações"
              className="p-2 rounded-xl bg-petrol-800/80 text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 1. Tempo Disponível (Segundos até 60 minutos com combinação min + seg) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm font-semibold text-slate-200">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-sage-400" />
                <span>Duração total da sessão:</span>
              </div>
              <span 
                className="text-xs text-sand-300 font-medium bg-petrol-950 px-2.5 py-0.5 rounded-full border border-petrol-800"
                title="Tempo total configurado para a prática"
              >
                {formatDurationLong(current.totalDurationSeconds)}
              </span>
            </div>

            {/* Granular Minutes & Seconds Steppers */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* Minutes Stepper */}
              <div 
                className="p-3 rounded-2xl bg-petrol-950/70 border border-petrol-800/80 flex items-center justify-between"
                title="Ajuste os minutos da sessão (0 a 60 min)"
              >
                <div>
                  <span className="text-xs text-slate-400 block font-medium">Minutos</span>
                  <span className="text-base sm:text-lg font-bold text-sand-200 tabular-nums">
                    {Math.floor(current.totalDurationSeconds / 60)} min
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    title="Diminuir 1 minuto"
                    disabled={Math.floor(current.totalDurationSeconds / 60) <= 0 && (current.totalDurationSeconds % 60) <= 15}
                    onClick={() => {
                      const curMin = Math.floor(current.totalDurationSeconds / 60);
                      const curSec = current.totalDurationSeconds % 60;
                      const nextMin = Math.max(0, curMin - 1);
                      const nextTotal = Math.max(15, nextMin * 60 + curSec);
                      setCurrent({ ...current, totalDurationSeconds: nextTotal });
                    }}
                    className="w-8 h-8 rounded-lg bg-petrol-800 hover:bg-petrol-700 disabled:opacity-40 disabled:hover:bg-petrol-800 text-slate-200 font-bold text-base flex items-center justify-center transition-colors"
                  >
                    -
                  </button>
                  <button
                    type="button"
                    title="Aumentar 1 minuto"
                    disabled={Math.floor(current.totalDurationSeconds / 60) >= 60}
                    onClick={() => {
                      const curMin = Math.floor(current.totalDurationSeconds / 60);
                      const curSec = current.totalDurationSeconds % 60;
                      const nextMin = Math.min(60, curMin + 1);
                      const nextTotal = Math.min(3600, nextMin * 60 + (nextMin === 60 ? 0 : curSec));
                      setCurrent({ ...current, totalDurationSeconds: nextTotal });
                    }}
                    className="w-8 h-8 rounded-lg bg-petrol-800 hover:bg-petrol-700 disabled:opacity-40 disabled:hover:bg-petrol-800 text-slate-200 font-bold text-base flex items-center justify-center transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Seconds Stepper */}
              <div 
                className="p-3 rounded-2xl bg-petrol-950/70 border border-petrol-800/80 flex items-center justify-between"
                title="Ajuste os segundos da sessão (combinação flexível, ex: 1min30seg)"
              >
                <div>
                  <span className="text-xs text-slate-400 block font-medium">Segundos</span>
                  <span className="text-base sm:text-lg font-bold text-sand-200 tabular-nums">
                    {current.totalDurationSeconds % 60} seg
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    title="Diminuir 15 segundos"
                    disabled={current.totalDurationSeconds <= 15}
                    onClick={() => {
                      const curMin = Math.floor(current.totalDurationSeconds / 60);
                      let curSec = current.totalDurationSeconds % 60;
                      curSec = curSec - 15;
                      let nextTotal = curMin * 60 + curSec;
                      if (curSec < 0) {
                        if (curMin > 0) {
                          nextTotal = (curMin - 1) * 60 + 45;
                        } else {
                          nextTotal = 15;
                        }
                      }
                      setCurrent({ ...current, totalDurationSeconds: Math.max(15, nextTotal) });
                    }}
                    className="w-8 h-8 rounded-lg bg-petrol-800 hover:bg-petrol-700 disabled:opacity-40 disabled:hover:bg-petrol-800 text-slate-200 font-bold text-base flex items-center justify-center transition-colors"
                  >
                    -
                  </button>
                  <button
                    type="button"
                    title="Aumentar 15 segundos"
                    disabled={current.totalDurationSeconds >= 3600}
                    onClick={() => {
                      const curMin = Math.floor(current.totalDurationSeconds / 60);
                      let curSec = current.totalDurationSeconds % 60;
                      curSec = curSec + 15;
                      let nextTotal = curMin * 60 + curSec;
                      if (curSec >= 60) {
                        nextTotal = (curMin + 1) * 60 + (curSec - 60);
                      }
                      setCurrent({ ...current, totalDurationSeconds: Math.min(3600, nextTotal) });
                    }}
                    className="w-8 h-8 rounded-lg bg-petrol-800 hover:bg-petrol-700 disabled:opacity-40 disabled:hover:bg-petrol-800 text-slate-200 font-bold text-base flex items-center justify-center transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Quick preset pills */}
            <div className="space-y-1.5">
              <span className="text-xs text-slate-400 font-medium block">Atalhos rápidos:</span>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_PRESETS.map((p) => {
                  const isSelected = current.totalDurationSeconds === p.seconds;
                  return (
                    <button
                      key={p.seconds}
                      type="button"
                      onClick={() => setCurrent({ ...current, totalDurationSeconds: p.seconds })}
                      title={`Definir duração para ${p.label}`}
                      className={`py-1.5 px-2.5 rounded-xl text-xs font-semibold border text-center transition-all ${
                        isSelected
                          ? 'border-sage-400 bg-sage-400/20 text-sand-200 shadow-sm'
                          : 'border-petrol-800 bg-petrol-950/40 text-slate-300 hover:text-white hover:bg-petrol-800/40'
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 2. Tempo de cada etapa da respiração */}
          <div className="space-y-3.5 pt-1">
            <div className="flex items-center justify-between text-sm font-semibold text-slate-200">
              <div className="flex items-center gap-1.5">
                <Wind className="w-4 h-4 text-sage-400" />
                <span>Ritmo de cada etapa (segundos):</span>
              </div>
              <span 
                className="text-xs text-sand-300 font-mono bg-petrol-950 px-2 py-0.5 rounded border border-petrol-800"
                title="Padrão respiratório configurado"
              >
                {formatPatternDisplay(current)}
              </span>
            </div>

            {/* Stepper controls */}
            <div className="space-y-2.5">
              {/* Inhale */}
              <div 
                className="p-3.5 rounded-2xl bg-petrol-950/60 border border-petrol-800/70 flex items-center justify-between"
                title="Tempo de puxar o ar calmamente pelo nariz"
              >
                <div>
                  <span className="text-sm font-medium text-slate-100 block">Inspiração</span>
                  <span className="text-xs text-slate-400">Puxar o ar suavemente</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    title="Diminuir 1 segundo"
                    onClick={() => setCurrent({ ...current, inhaleDuration: Math.max(2, current.inhaleDuration - 1) })}
                    className="w-8 h-8 rounded-lg bg-petrol-800 hover:bg-petrol-700 text-slate-200 font-bold text-base flex items-center justify-center transition-colors"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-sm sm:text-base font-semibold text-sand-200 tabular-nums">
                    {current.inhaleDuration}s
                  </span>
                  <button
                    type="button"
                    title="Aumentar 1 segundo"
                    onClick={() => setCurrent({ ...current, inhaleDuration: Math.min(8, current.inhaleDuration + 1) })}
                    className="w-8 h-8 rounded-lg bg-petrol-800 hover:bg-petrol-700 text-slate-200 font-bold text-base flex items-center justify-center transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Hold (Pre-Exhale) */}
              <div 
                className="p-3.5 rounded-2xl bg-petrol-950/60 border border-petrol-800/70 flex items-center justify-between"
                title="Pausa com os pulmões confortavelmente cheios"
              >
                <div>
                  <span className="text-sm font-medium text-slate-100 block">Retenção (Pulmões cheios)</span>
                  <span className="text-xs text-slate-400">Pausa suave no ápice</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    title="Diminuir 1 segundo"
                    onClick={() => setCurrent({ ...current, holdDuration: Math.max(0, current.holdDuration - 1) })}
                    className="w-8 h-8 rounded-lg bg-petrol-800 hover:bg-petrol-700 text-slate-200 font-bold text-base flex items-center justify-center transition-colors"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-sm sm:text-base font-semibold text-sand-200 tabular-nums">
                    {current.holdDuration}s
                  </span>
                  <button
                    type="button"
                    title="Aumentar 1 segundo"
                    onClick={() => setCurrent({ ...current, holdDuration: Math.min(6, current.holdDuration + 1) })}
                    className="w-8 h-8 rounded-lg bg-petrol-800 hover:bg-petrol-700 text-slate-200 font-bold text-base flex items-center justify-center transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Exhale */}
              <div 
                className="p-3.5 rounded-2xl bg-petrol-950/60 border border-petrol-800/70 flex items-center justify-between"
                title="Tempo de soltar o ar prolongado pela boca"
              >
                <div>
                  <span className="text-sm font-medium text-slate-100 block">Expiração</span>
                  <span className="text-xs text-slate-400">Soltar longo pela boca</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    title="Diminuir 1 segundo"
                    onClick={() => setCurrent({ ...current, exhaleDuration: Math.max(3, current.exhaleDuration - 1) })}
                    className="w-8 h-8 rounded-lg bg-petrol-800 hover:bg-petrol-700 text-slate-200 font-bold text-base flex items-center justify-center transition-colors"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-sm sm:text-base font-semibold text-sand-200 tabular-nums">
                    {current.exhaleDuration}s
                  </span>
                  <button
                    type="button"
                    title="Aumentar 1 segundo"
                    onClick={() => setCurrent({ ...current, exhaleDuration: Math.min(12, current.exhaleDuration + 1) })}
                    className="w-8 h-8 rounded-lg bg-petrol-800 hover:bg-petrol-700 text-slate-200 font-bold text-base flex items-center justify-center transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Hold Post-Exhale (NEW) */}
              <div 
                className="p-3.5 rounded-2xl bg-petrol-950/60 border border-petrol-800/70 flex items-center justify-between"
                title="Pausa opcional com pulmões vazios antes de iniciar nova inspiração (ex: ritmo quadrado ou 3:2:6:2)"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-slate-100 block">Pausa pós-exalação</span>
                    {current.holdPostExhaleDuration === 0 && (
                      <span className="text-[10px] uppercase font-bold text-slate-400 bg-petrol-900 px-1.5 py-0.5 rounded border border-petrol-800">
                        Opcional
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400">
                    {current.holdPostExhaleDuration === 0 ? 'Desativada (padrão 3:2:6)' : 'Manter pulmões vazios'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    title="Diminuir 1 segundo"
                    onClick={() => setCurrent({ ...current, holdPostExhaleDuration: Math.max(0, (current.holdPostExhaleDuration || 0) - 1) })}
                    className="w-8 h-8 rounded-lg bg-petrol-800 hover:bg-petrol-700 text-slate-200 font-bold text-base flex items-center justify-center transition-colors"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-sm sm:text-base font-semibold text-sand-200 tabular-nums">
                    {current.holdPostExhaleDuration || 0}s
                  </span>
                  <button
                    type="button"
                    title="Aumentar 1 segundo"
                    onClick={() => setCurrent({ ...current, holdPostExhaleDuration: Math.min(6, (current.holdPostExhaleDuration || 0) + 1) })}
                    className="w-8 h-8 rounded-lg bg-petrol-800 hover:bg-petrol-700 text-slate-200 font-bold text-base flex items-center justify-center transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Cycle summary info */}
            <div className="p-3.5 rounded-xl bg-petrol-950/40 border border-petrol-800/50 text-xs sm:text-sm text-slate-300 space-y-1.5">
              <div className="flex items-center justify-between">
                <span>Duração de 1 ciclo completo:</span>
                <span className="font-semibold text-sand-200">{cycleLength} segundos</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Ciclos previstos nesta sessão:</span>
                <span className="font-medium text-slate-200">{cycleCount} ciclos</span>
              </div>
              <p className="text-xs text-slate-400 pt-1.5 border-t border-petrol-800/40 leading-relaxed">
                Padrão científico recomendado: 3:2:6 (2 min). A pausa pós-exalação (ex: 3:2:6:2) permite explorar respirações mais contemplativas.
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={handleConfirm}
              title="Salvar preferências neste aparelho"
              className="w-full py-3.5 px-4 rounded-2xl bg-sage-400 hover:bg-sage-300 text-petrol-950 font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.98]"
            >
              <Check className="w-4 h-4" />
              <span>Salvar configurações</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              title="Restaurar a proporção clássica 3:2:6 com duração de 2 minutos"
              className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm text-slate-400 hover:text-sand-200 transition-colors flex items-center justify-center gap-1.5 font-medium"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Restaurar padrão científico (3:2:6 • 2 min)</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
