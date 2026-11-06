import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pause, Play, Volume2, VolumeX, CheckCircle2, SlidersHorizontal, X } from 'lucide-react';
import { BreathPhase } from '../types';
import { BreathingSettings, formatPatternDisplay, formatDurationLabel } from '../lib/settings';

interface BreathingEngineProps {
  onComplete: (actualDurationSeconds: number) => void;
  settings: BreathingSettings;
  onUpdateSettings?: (settings: BreathingSettings) => void;
}

export const BreathingEngine: React.FC<BreathingEngineProps> = ({ onComplete, settings, onUpdateSettings }) => {
  const [currentSettings, setCurrentSettings] = useState<BreathingSettings>(settings);
  const [showInSessionSettings, setShowInSessionSettings] = useState<boolean>(false);
  const [selectedDuration, setSelectedDuration] = useState<number>(settings.totalDurationSeconds);
  const [timeRemaining, setTimeRemaining] = useState<number>(settings.totalDurationSeconds);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [phase, setPhase] = useState<BreathPhase>('inhale');
  const [phaseSecondsLeft, setPhaseSecondsLeft] = useState<number>(settings.inhaleDuration);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [totalElapsedTime, setTotalElapsedTime] = useState<number>(0);

  const settingsRef = useRef<BreathingSettings>(currentSettings);
  settingsRef.current = currentSettings;

  // Sync state if settings prop changes before practice starts
  useEffect(() => {
    if (totalElapsedTime === 0) {
      setCurrentSettings(settings);
      setSelectedDuration(settings.totalDurationSeconds);
      setTimeRemaining(settings.totalDurationSeconds);
      setPhase('inhale');
      setPhaseSecondsLeft(settings.inhaleDuration);
      cycleTimeRef.current = 0;
    }
  }, [settings, totalElapsedTime]);

  // Audio Context for subtle calming acoustic tone
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Cycle time tracking ref (from 0 to cycleLength - 1)
  const cycleTimeRef = useRef<number>(0);

  const playSoftTone = (freq: number) => {
    if (isAudioMuted) return;
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) audioCtxRef.current = new AudioCtx();
      }
      if (audioCtxRef.current?.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      if (!audioCtxRef.current) return;

      const osc = audioCtxRef.current.createOscillator();
      const gain = audioCtxRef.current.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtxRef.current.currentTime);
      gain.gain.setValueAtTime(0.025, audioCtxRef.current.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtxRef.current.currentTime + 0.85);
      osc.connect(gain);
      gain.connect(audioCtxRef.current.destination);
      osc.start();
      osc.stop(audioCtxRef.current.currentTime + 0.85);
    } catch {
      // Audio autoplay policy fallback
    }
  };

  // Trigger phase tone cue
  useEffect(() => {
    if (!isActive) return;
    const tones: Record<BreathPhase, number> = { 
      inhale: 432, 
      hold: 528, 
      exhale: 360,
      hold_post_exhale: 216 // Som mais grave e profundo para a suspensão pós-exalação
    };
    playSoftTone(tones[phase]);
  }, [phase, isActive, isAudioMuted]);

  // Synchronized Master Clock
  useEffect(() => {
    if (!isActive || timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTotalElapsedTime(prev => prev + 1);

      setTimeRemaining(prev => {
        if (prev <= 1) return 0;
        return prev - 1;
      });

      const s = settingsRef.current;
      const cInhale = s.inhaleDuration;
      const cHold = s.holdDuration;
      const cExhale = s.exhaleDuration;
      const cPostHold = s.holdPostExhaleDuration || 0;
      const curCycleLength = cInhale + cHold + cExhale + cPostHold;

      // Advance cycle time
      cycleTimeRef.current = (cycleTimeRef.current + 1) % (curCycleLength || 1);
      const c = cycleTimeRef.current;

      const tInhaleEnd = cInhale;
      const tHoldEnd = tInhaleEnd + cHold;
      const tExhaleEnd = tHoldEnd + cExhale;

      if (c < tInhaleEnd) {
        setPhase('inhale');
        setPhaseSecondsLeft(tInhaleEnd - c);
      } else if (cHold > 0 && c < tHoldEnd) {
        setPhase('hold');
        setPhaseSecondsLeft(tHoldEnd - c);
      } else if (c < tExhaleEnd) {
        setPhase('exhale');
        setPhaseSecondsLeft(tExhaleEnd - c);
      } else if (cPostHold > 0) {
        setPhase('hold_post_exhale');
        setPhaseSecondsLeft(curCycleLength - c);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, timeRemaining]);

  // Completion effect
  useEffect(() => {
    if (timeRemaining === 0 && totalElapsedTime > 0) {
      onComplete(totalElapsedTime);
    }
  }, [timeRemaining, totalElapsedTime, onComplete]);

  const handleSelectDuration = (seconds: number) => {
    setSelectedDuration(seconds);
    setTimeRemaining(seconds);
    setTotalElapsedTime(0);
    cycleTimeRef.current = 0;
    setPhase('inhale');
    setPhaseSecondsLeft(currentSettings.inhaleDuration);
  };

  // Adjust all active breathing stages by +1 or -1 second
  const handleShiftAll = (delta: number) => {
    const nextInhale = Math.max(2, Math.min(10, currentSettings.inhaleDuration + delta));
    const nextHold = Math.max(0, Math.min(8, currentSettings.holdDuration + delta));
    const nextExhale = Math.max(3, Math.min(15, currentSettings.exhaleDuration + delta));
    const nextPostHold = currentSettings.holdPostExhaleDuration 
      ? Math.max(0, Math.min(8, currentSettings.holdPostExhaleDuration + delta))
      : 0;

    const updated: BreathingSettings = {
      ...currentSettings,
      inhaleDuration: nextInhale,
      holdDuration: nextHold,
      exhaleDuration: nextExhale,
      holdPostExhaleDuration: nextPostHold
    };

    setCurrentSettings(updated);
    onUpdateSettings?.(updated);
  };

  // Adjust individual stage during session
  const handleUpdateSingleStage = (field: keyof BreathingSettings, value: number) => {
    const updated: BreathingSettings = {
      ...currentSettings,
      [field]: value
    };
    setCurrentSettings(updated);
    onUpdateSettings?.(updated);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  const progress = ((selectedDuration - timeRemaining) / selectedDuration) * 100;

  // Phase metadata for colors and labels - short & clear to avoid overflow
  const phaseMetadata = {
    inhale: {
      label: 'Inspire',
      subtext: 'Pelo nariz',
      color: '#7fae9b', // Sage green
      targetScale: 1.25,
      duration: currentSettings.inhaleDuration,
    },
    hold: {
      label: 'Suspenda',
      subtext: 'Mantenha o ar',
      color: '#e5d7b5', // Sand gold
      targetScale: 1.25, // Stays at maximum size during hold
      duration: currentSettings.holdDuration,
    },
    exhale: {
      label: 'Expire',
      subtext: 'Pela boca',
      color: '#5c937f', // Deep sage
      targetScale: 0.80, // Shrinks smoothly
      duration: currentSettings.exhaleDuration,
    },
    hold_post_exhale: {
      label: 'Suspenda',
      subtext: 'Sem tensões',
      color: '#e5d7b5', // Same gold as pre-exhale suspension
      targetScale: 0.80, // Stays at small size during post-exhale pause
      duration: currentSettings.holdPostExhaleDuration || 0,
    },
  }[phase];

  // Quick preset options based on current settings
  const timerOptions = Array.from(new Set([60, currentSettings.totalDurationSeconds, 180, 300]))
    .sort((a, b) => a - b)
    .slice(0, 3)
    .map(s => ({ label: formatDurationLabel(s), seconds: s }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col flex-1 justify-between py-2 select-none"
    >
      {/* Top bar: minimal duration selector & controls */}
      <div className="flex items-center justify-between px-1">
        <div 
          className="inline-flex gap-1.5 p-1 rounded-full bg-petrol-900/70 border border-petrol-800/80"
          title="Selecione o tempo total desta sessão"
        >
          {timerOptions.map(opt => (
            <button
              key={opt.seconds}
              onClick={() => handleSelectDuration(opt.seconds)}
              title={`Definir sessão de ${opt.label}`}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
                selectedDuration === opt.seconds
                  ? 'bg-petrol-800 text-sand-200 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Discreet button to view/adjust settings during practice without blocking the orb */}
          <button
            onClick={() => setShowInSessionSettings(prev => !prev)}
            aria-label="Ajustar ritmo"
            title={showInSessionSettings ? 'Ocultar ajustes de ritmo' : 'Ajustar ritmo durante o exercício (+1s / -1s)'}
            className={`p-2.5 rounded-full border transition-all ${
              showInSessionSettings 
                ? 'bg-sage-400/20 text-sand-200 border-sage-400/50' 
                : 'text-slate-400 hover:text-sand-200 bg-petrol-900/60 border-petrol-800/60'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsAudioMuted(!isAudioMuted)}
            aria-label={isAudioMuted ? 'Ativar som' : 'Desativar som'}
            title={isAudioMuted ? 'Ativar sinal sonoro suave nas trocas de fase' : 'Desativar sinal sonoro'}
            className="p-2.5 rounded-full text-slate-400 hover:text-sand-200 bg-petrol-900/60 border border-petrol-800/60 transition-colors"
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-sage-300" />}
          </button>
        </div>
      </div>

      {/* 
        ─── Central Organic Breathing Orb (Unblocked) ───
      */}
      <div className="flex-1 flex flex-col items-center justify-center my-auto py-2">
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
          {/* Subtle Ambient Aura Expanding and Contracting with Breath */}
          <motion.div
            initial={{ scale: 0.80 }}
            animate={{
              scale: phase === 'exhale' || phase === 'hold_post_exhale' ? 0.82 : 1.30,
              opacity: phase === 'hold' || phase === 'hold_post_exhale' ? 0.35 : phase === 'inhale' ? 0.28 : 0.12,
            }}
            transition={{
              duration: phaseMetadata.duration,
              ease: [0.42, 0, 0.58, 1],
            }}
            className="absolute inset-0 rounded-full blur-3xl pointer-events-none transition-colors duration-700"
            style={{ backgroundColor: phaseMetadata.color }}
          />

          {/* Faint Concentric Ring Following the Orb Scale */}
          <motion.div
            initial={{ scale: 0.80 }}
            animate={{
              scale: phase === 'exhale' || phase === 'hold_post_exhale' ? 0.84 : 1.25,
              opacity: phase === 'hold' || phase === 'hold_post_exhale' ? 0.4 : 0.2,
            }}
            transition={{
              duration: phaseMetadata.duration,
              ease: [0.42, 0, 0.58, 1],
            }}
            className="absolute inset-3 rounded-full border pointer-events-none transition-all duration-700"
            style={{ borderColor: phaseMetadata.color }}
          />

          {/* Main Breathing Circle */}
          <motion.div
            initial={{ scale: 0.80 }}
            animate={{
              scale: phaseMetadata.targetScale,
            }}
            transition={{
              duration: phaseMetadata.duration,
              ease: [0.42, 0, 0.58, 1],
            }}
            className="relative w-52 h-52 sm:w-60 sm:h-60 rounded-full border border-petrol-700/60 bg-petrol-950/90 backdrop-blur-md flex flex-col items-center justify-center transition-colors duration-700 shadow-2xl p-4"
          >
            {/* Inner rim highlight */}
            <div
              className="absolute inset-1.5 rounded-full border opacity-25 pointer-events-none transition-colors duration-700"
              style={{ borderColor: phaseMetadata.color }}
            />

            <AnimatePresence mode="wait">
              <motion.div
                key={phase}
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -3 }}
                transition={{ duration: 0.25 }}
                className="text-center px-2 max-w-[150px] mx-auto select-none"
              >
                <p
                  className="text-xs sm:text-sm font-bold tracking-widest uppercase transition-colors duration-500 mb-0.5"
                  style={{ color: phaseMetadata.color }}
                  title="Fase atual da respiração"
                >
                  {phaseMetadata.label}
                </p>

                <p 
                  className="text-5xl sm:text-6xl font-bold text-sand-200 tabular-nums leading-none tracking-tight my-1"
                  title="Segundos restantes nesta fase"
                >
                  {phaseSecondsLeft}
                </p>

                <p className="text-xs text-slate-300 font-medium leading-tight">
                  {phaseMetadata.subtext}
                </p>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* 
        ─── Bottom Controls: Progress, Live Adjustments & Action Buttons ───
      */}
      <div className="space-y-3 px-1">
        {/* Time Remaining & Rhythm display (clickable to open adjustments) */}
        <div className="flex items-center justify-between text-xs sm:text-sm text-slate-300 font-medium px-0.5">
          <button
            type="button"
            onClick={() => setShowInSessionSettings(prev => !prev)}
            className="text-xs text-slate-300 font-mono bg-petrol-900/80 hover:bg-petrol-800 px-2 py-0.5 rounded-md border border-petrol-800 transition-colors flex items-center gap-1.5"
            title="Ajustar ritmo durante a prática (+1s / -1s)"
          >
            <SlidersHorizontal className="w-3 h-3 text-sage-400" />
            <span>{formatPatternDisplay(currentSettings)}</span>
          </button>

          <span 
            className="tabular-nums text-sand-200 font-semibold"
            title="Tempo restante da prática"
          >
            {formatTime(timeRemaining)} restantes
          </span>
        </div>

        {/* Progress Bar */}
        <div 
          className="w-full h-2 bg-petrol-900 rounded-full overflow-hidden"
          title={`Progresso da sessão: ${Math.round(progress)}%`}
        >
          <div
            className="h-full rounded-full transition-all duration-1000 ease-linear"
            style={{ width: `${progress}%`, backgroundColor: phaseMetadata.color }}
          />
        </div>

        {/* Non-blocking in-session rhythm adjustment panel */}
        <AnimatePresence>
          {showInSessionSettings && (
            <motion.div
              initial={{ opacity: 0, y: 8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: 8, height: 0 }}
              className="overflow-hidden bg-petrol-900/95 border border-petrol-800/90 rounded-2xl p-2.5 shadow-xl space-y-2"
            >
              {/* Header with +1s / -1s global shift */}
              <div className="flex items-center justify-between gap-1.5">
                <span className="text-[11px] font-semibold text-slate-300">
                  Ajustar segundos:
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleShiftAll(-1)}
                    title="Diminuir 1 segundo em todas as fases da respiração"
                    className="px-2 py-1 rounded-lg bg-petrol-800 hover:bg-petrol-700 active:scale-95 text-sand-200 text-xs font-bold border border-petrol-700 transition-all"
                  >
                    -1s em tudo
                  </button>

                  <button
                    type="button"
                    onClick={() => handleShiftAll(+1)}
                    title="Aumentar 1 segundo em todas as fases da respiração"
                    className="px-2 py-1 rounded-lg bg-petrol-800 hover:bg-petrol-700 active:scale-95 text-sand-200 text-xs font-bold border border-petrol-700 transition-all"
                  >
                    +1s em tudo
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowInSessionSettings(false)}
                    aria-label="Ocultar ajustes"
                    title="Ocultar ajustes"
                    className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-petrol-800"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Compact micro-steppers for individual phases */}
              <div className="grid grid-cols-4 gap-1 text-center text-xs">
                {/* Inhale */}
                <div 
                  className="p-1.5 rounded-xl bg-petrol-950/70 border border-petrol-800/80"
                  title="Inspiração (pelo nariz)"
                >
                  <span className="text-[10px] text-slate-400 block truncate">Inspire</span>
                  <div className="flex items-center justify-center gap-0.5 mt-0.5">
                    <button
                      type="button"
                      title="Diminuir 1s da inspiração"
                      onClick={() => handleUpdateSingleStage('inhaleDuration', Math.max(2, currentSettings.inhaleDuration - 1))}
                      className="w-5 h-5 rounded bg-petrol-800 hover:bg-petrol-700 text-slate-200 text-xs font-bold flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="font-semibold text-sand-200 tabular-nums w-4 text-center">
                      {currentSettings.inhaleDuration}
                    </span>
                    <button
                      type="button"
                      title="Aumentar 1s da inspiração"
                      onClick={() => handleUpdateSingleStage('inhaleDuration', Math.min(10, currentSettings.inhaleDuration + 1))}
                      className="w-5 h-5 rounded bg-petrol-800 hover:bg-petrol-700 text-slate-200 text-xs font-bold flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Hold */}
                <div 
                  className="p-1.5 rounded-xl bg-petrol-950/70 border border-petrol-800/80"
                  title="Suspensão com pulmões cheios"
                >
                  <span className="text-[10px] text-slate-400 block truncate">Suspenda</span>
                  <div className="flex items-center justify-center gap-0.5 mt-0.5">
                    <button
                      type="button"
                      title="Diminuir 1s da suspensão"
                      onClick={() => handleUpdateSingleStage('holdDuration', Math.max(0, currentSettings.holdDuration - 1))}
                      className="w-5 h-5 rounded bg-petrol-800 hover:bg-petrol-700 text-slate-200 text-xs font-bold flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="font-semibold text-sand-200 tabular-nums w-4 text-center">
                      {currentSettings.holdDuration}
                    </span>
                    <button
                      type="button"
                      title="Aumentar 1s da suspensão"
                      onClick={() => handleUpdateSingleStage('holdDuration', Math.min(8, currentSettings.holdDuration + 1))}
                      className="w-5 h-5 rounded bg-petrol-800 hover:bg-petrol-700 text-slate-200 text-xs font-bold flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Exhale */}
                <div 
                  className="p-1.5 rounded-xl bg-petrol-950/70 border border-petrol-800/80"
                  title="Expiração lenta pela boca"
                >
                  <span className="text-[10px] text-slate-400 block truncate">Expire</span>
                  <div className="flex items-center justify-center gap-0.5 mt-0.5">
                    <button
                      type="button"
                      title="Diminuir 1s da expiração"
                      onClick={() => handleUpdateSingleStage('exhaleDuration', Math.max(3, currentSettings.exhaleDuration - 1))}
                      className="w-5 h-5 rounded bg-petrol-800 hover:bg-petrol-700 text-slate-200 text-xs font-bold flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="font-semibold text-sand-200 tabular-nums w-4 text-center">
                      {currentSettings.exhaleDuration}
                    </span>
                    <button
                      type="button"
                      title="Aumentar 1s da expiração"
                      onClick={() => handleUpdateSingleStage('exhaleDuration', Math.min(15, currentSettings.exhaleDuration + 1))}
                      className="w-5 h-5 rounded bg-petrol-800 hover:bg-petrol-700 text-slate-200 text-xs font-bold flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Post-Exhale Hold */}
                <div 
                  className="p-1.5 rounded-xl bg-petrol-950/70 border border-petrol-800/80"
                  title="Suspensão com pulmões vazios"
                >
                  <span className="text-[10px] text-slate-400 block truncate">Suspenda</span>
                  <div className="flex items-center justify-center gap-0.5 mt-0.5">
                    <button
                      type="button"
                      title="Diminuir 1s da suspensão final"
                      onClick={() => handleUpdateSingleStage('holdPostExhaleDuration', Math.max(0, (currentSettings.holdPostExhaleDuration || 0) - 1))}
                      className="w-5 h-5 rounded bg-petrol-800 hover:bg-petrol-700 text-slate-200 text-xs font-bold flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="font-semibold text-sand-200 tabular-nums w-4 text-center">
                      {currentSettings.holdPostExhaleDuration || 0}
                    </span>
                    <button
                      type="button"
                      title="Aumentar 1s da suspensão final"
                      onClick={() => handleUpdateSingleStage('holdPostExhaleDuration', Math.min(8, (currentSettings.holdPostExhaleDuration || 0) + 1))}
                      className="w-5 h-5 rounded bg-petrol-800 hover:bg-petrol-700 text-slate-200 text-xs font-bold flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            onClick={() => setIsActive(!isActive)}
            title={isActive ? 'Pausar o exercício temporariamente' : 'Retomar o exercício'}
            className="py-3.5 px-4 rounded-xl bg-petrol-900/80 hover:bg-petrol-800 text-slate-200 text-sm font-semibold flex items-center justify-center gap-2 border border-petrol-800 transition-all active:scale-[0.98]"
          >
            {isActive ? (
              <>
                <Pause className="w-4 h-4 text-sand-300" />
                <span>Pausar</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 text-sage-300" />
                <span>Retomar</span>
              </>
            )}
          </button>

          <button
            onClick={() => onComplete(Math.max(totalElapsedTime, 10))}
            title="Finalizar o exercício agora e ir para a reavaliação"
            className="py-3.5 px-4 rounded-xl bg-petrol-900/80 hover:bg-petrol-800 text-slate-200 text-sm font-semibold flex items-center justify-center gap-2 border border-petrol-800 transition-all active:scale-[0.98]"
          >
            <CheckCircle2 className="w-4 h-4 text-sage-300" />
            <span>Concluir</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};
