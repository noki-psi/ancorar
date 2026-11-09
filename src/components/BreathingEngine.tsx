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
      gain.gain.setValueAtTime(0.02, audioCtxRef.current.currentTime);
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

  // Phase metadata with soothing, calm colors
  const phaseMetadata = {
    inhale: {
      label: 'Inspire',
      subtext: 'Pelo nariz',
      color: '#2d604f', // Calm natural sage
      targetScale: 1.25,
      duration: currentSettings.inhaleDuration,
    },
    hold: {
      label: 'Suspenda',
      subtext: 'Mantenha o ar',
      color: '#a07838', // Sober warm gold
      targetScale: 1.25,
      duration: currentSettings.holdDuration,
    },
    exhale: {
      label: 'Expire',
      subtext: 'Pela boca',
      color: '#1f4e40', // Deep peaceful forest
      targetScale: 0.80,
      duration: currentSettings.exhaleDuration,
    },
    hold_post_exhale: {
      label: 'Suspenda',
      subtext: 'Sem tensões',
      color: '#a07838', // Same gold as pre-exhale suspension
      targetScale: 0.80,
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
      className="flex flex-col flex-1 justify-between py-2 select-none max-w-md mx-auto w-full"
    >
      {/* Top bar: minimal duration selector & controls */}
      <div className="flex items-center justify-between px-1">
        <div 
          className="inline-flex gap-1 p-1 rounded-full bg-stone-100 dark:bg-stone-800/80 border border-stone-200/80 dark:border-stone-700/60"
          title="Selecione o tempo total desta sessão"
        >
          {timerOptions.map(opt => (
            <button
              key={opt.seconds}
              onClick={() => handleSelectDuration(opt.seconds)}
              title={`Definir sessão de ${opt.label}`}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 ${
                selectedDuration === opt.seconds
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          {/* Discreet button to view/adjust settings during practice without blocking the orb */}
          <button
            onClick={() => setShowInSessionSettings(prev => !prev)}
            aria-label="Ajustar ritmo"
            title={showInSessionSettings ? 'Ocultar ajustes de ritmo' : 'Ajustar ritmo durante o exercício (+1s / -1s)'}
            className={`p-2 rounded-full border transition-all ${
              showInSessionSettings 
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700' 
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 bg-stone-100 dark:bg-stone-800/80 border-stone-200/80 dark:border-stone-700/60'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsAudioMuted(!isAudioMuted)}
            aria-label={isAudioMuted ? 'Ativar som' : 'Desativar som'}
            title={isAudioMuted ? 'Ativar sinal sonoro suave' : 'Desativar sinal sonoro'}
            className="p-2 rounded-full text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 bg-stone-100 dark:bg-stone-800/80 border-stone-200/80 dark:border-stone-700/60 transition-colors"
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* 
        ─── Central Organic Breathing Orb (Unblocked, Peaceful & Sober) ───
      */}
      <div className="flex-1 flex flex-col items-center justify-center my-auto py-2">
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
          {/* Subtle Ambient Aura Expanding and Contracting with Breath */}
          <motion.div
            initial={{ scale: 0.80 }}
            animate={{
              scale: phase === 'exhale' || phase === 'hold_post_exhale' ? 0.84 : 1.26,
              opacity: phase === 'hold' || phase === 'hold_post_exhale' ? 0.18 : phase === 'inhale' ? 0.16 : 0.08,
            }}
            transition={{
              duration: phaseMetadata.duration,
              ease: [0.42, 0, 0.58, 1],
            }}
            className="absolute inset-0 rounded-full blur-2xl pointer-events-none transition-colors duration-700"
            style={{ backgroundColor: phaseMetadata.color }}
          />

          {/* Faint Concentric Ring Following the Orb Scale */}
          <motion.div
            initial={{ scale: 0.80 }}
            animate={{
              scale: phase === 'exhale' || phase === 'hold_post_exhale' ? 0.86 : 1.22,
              opacity: phase === 'hold' || phase === 'hold_post_exhale' ? 0.3 : 0.15,
            }}
            transition={{
              duration: phaseMetadata.duration,
              ease: [0.42, 0, 0.58, 1],
            }}
            className="absolute inset-4 rounded-full border pointer-events-none transition-all duration-700"
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
            className="relative w-52 h-52 sm:w-56 sm:h-56 rounded-full border border-stone-200 dark:border-stone-800 bg-white/95 dark:bg-[#151c22]/95 backdrop-blur-md flex flex-col items-center justify-center transition-colors duration-700 shadow-xl p-4"
          >
            {/* Inner rim highlight */}
            <div
              className="absolute inset-1.5 rounded-full border opacity-20 pointer-events-none transition-colors duration-700"
              style={{ borderColor: phaseMetadata.color }}
            />

            <AnimatePresence mode="wait">
              <motion.div
                key={phase}
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -3 }}
                transition={{ duration: 0.22 }}
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
                  className="text-5xl sm:text-6xl font-bold text-stone-900 dark:text-stone-100 tabular-nums leading-none tracking-tight my-1"
                  title="Segundos restantes nesta fase"
                >
                  {phaseSecondsLeft}
                </p>

                <p className="text-xs text-stone-500 dark:text-stone-400 font-medium leading-tight">
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
        <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 font-medium px-0.5">
          <button
            type="button"
            onClick={() => setShowInSessionSettings(prev => !prev)}
            className="text-xs font-mono bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 px-2 py-0.5 rounded-md border border-stone-200 dark:border-stone-700 transition-colors flex items-center gap-1.5"
            title="Ajustar ritmo durante a prática (+1s / -1s)"
          >
            <SlidersHorizontal className="w-3 h-3 text-emerald-700 dark:text-emerald-400" />
            <span>{formatPatternDisplay(currentSettings)}</span>
          </button>

          <span 
            className="tabular-nums text-stone-800 dark:text-stone-200 font-semibold"
            title="Tempo restante da prática"
          >
            {formatTime(timeRemaining)} restantes
          </span>
        </div>

        {/* Progress Bar */}
        <div 
          className="w-full h-1.5 bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden"
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
              className="overflow-hidden bg-white dark:bg-[#151c22] border border-stone-200 dark:border-stone-800 rounded-2xl p-2.5 shadow-lg space-y-2"
            >
              {/* Header with +1s / -1s global shift */}
              <div className="flex items-center justify-between gap-1.5">
                <span className="text-[11px] font-semibold text-stone-700 dark:text-stone-300">
                  Ajustar ritmo ao vivo:
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleShiftAll(-1)}
                    title="Diminuir 1 segundo em todas as fases da respiração"
                    className="px-2 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 active:scale-95 text-stone-800 dark:text-stone-200 text-xs font-bold border border-stone-200 dark:border-stone-700 transition-all"
                  >
                    -1s em tudo
                  </button>

                  <button
                    type="button"
                    onClick={() => handleShiftAll(+1)}
                    title="Aumentar 1 segundo em todas as fases da respiração"
                    className="px-2 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 active:scale-95 text-stone-800 dark:text-stone-200 text-xs font-bold border border-stone-200 dark:border-stone-700 transition-all"
                  >
                    +1s em tudo
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowInSessionSettings(false)}
                    aria-label="Ocultar ajustes"
                    title="Ocultar ajustes"
                    className="p-1 rounded-md text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Compact micro-steppers for individual phases */}
              <div className="grid grid-cols-4 gap-1 text-center text-xs">
                {/* Inhale */}
                <div 
                  className="p-1.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800"
                  title="Inspiração (pelo nariz)"
                >
                  <span className="text-[10px] text-stone-400 block truncate">Inspire</span>
                  <div className="flex items-center justify-center gap-0.5 mt-0.5">
                    <button
                      type="button"
                      title="Diminuir 1s da inspiração"
                      onClick={() => handleUpdateSingleStage('inhaleDuration', Math.max(2, currentSettings.inhaleDuration - 1))}
                      className="w-5 h-5 rounded bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-bold flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="font-semibold text-stone-800 dark:text-stone-200 tabular-nums w-4 text-center">
                      {currentSettings.inhaleDuration}
                    </span>
                    <button
                      type="button"
                      title="Aumentar 1s da inspiração"
                      onClick={() => handleUpdateSingleStage('inhaleDuration', Math.min(10, currentSettings.inhaleDuration + 1))}
                      className="w-5 h-5 rounded bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-bold flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Hold */}
                <div 
                  className="p-1.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800"
                  title="Suspensão com pulmões cheios"
                >
                  <span className="text-[10px] text-stone-400 block truncate">Suspenda</span>
                  <div className="flex items-center justify-center gap-0.5 mt-0.5">
                    <button
                      type="button"
                      title="Diminuir 1s da suspensão"
                      onClick={() => handleUpdateSingleStage('holdDuration', Math.max(0, currentSettings.holdDuration - 1))}
                      className="w-5 h-5 rounded bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-bold flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="font-semibold text-stone-800 dark:text-stone-200 tabular-nums w-4 text-center">
                      {currentSettings.holdDuration}
                    </span>
                    <button
                      type="button"
                      title="Aumentar 1s da suspensão"
                      onClick={() => handleUpdateSingleStage('holdDuration', Math.min(8, currentSettings.holdDuration + 1))}
                      className="w-5 h-5 rounded bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-bold flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Exhale */}
                <div 
                  className="p-1.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800"
                  title="Expiração lenta pela boca"
                >
                  <span className="text-[10px] text-stone-400 block truncate">Expire</span>
                  <div className="flex items-center justify-center gap-0.5 mt-0.5">
                    <button
                      type="button"
                      title="Diminuir 1s da expiração"
                      onClick={() => handleUpdateSingleStage('exhaleDuration', Math.max(3, currentSettings.exhaleDuration - 1))}
                      className="w-5 h-5 rounded bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-bold flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="font-semibold text-stone-800 dark:text-stone-200 tabular-nums w-4 text-center">
                      {currentSettings.exhaleDuration}
                    </span>
                    <button
                      type="button"
                      title="Aumentar 1s da expiração"
                      onClick={() => handleUpdateSingleStage('exhaleDuration', Math.min(15, currentSettings.exhaleDuration + 1))}
                      className="w-5 h-5 rounded bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-bold flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Post-Exhale Hold */}
                <div 
                  className="p-1.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800"
                  title="Suspensão com pulmões vazios"
                >
                  <span className="text-[10px] text-stone-400 block truncate">Suspenda</span>
                  <div className="flex items-center justify-center gap-0.5 mt-0.5">
                    <button
                      type="button"
                      title="Diminuir 1s da suspensão final"
                      onClick={() => handleUpdateSingleStage('holdPostExhaleDuration', Math.max(0, (currentSettings.holdPostExhaleDuration || 0) - 1))}
                      className="w-5 h-5 rounded bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-bold flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="font-semibold text-stone-800 dark:text-stone-200 tabular-nums w-4 text-center">
                      {currentSettings.holdPostExhaleDuration || 0}
                    </span>
                    <button
                      type="button"
                      title="Aumentar 1s da suspensão final"
                      onClick={() => handleUpdateSingleStage('holdPostExhaleDuration', Math.min(8, (currentSettings.holdPostExhaleDuration || 0) + 1))}
                      className="w-5 h-5 rounded bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-bold flex items-center justify-center"
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
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            onClick={() => setIsActive(!isActive)}
            title={isActive ? 'Pausar o exercício temporariamente' : 'Retomar o exercício'}
            className="py-3 px-4 rounded-2xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-100 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 border border-stone-200 dark:border-stone-700 transition-all active:scale-[0.98]"
          >
            {isActive ? (
              <>
                <Pause className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                <span>Pausar</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                <span>Retomar</span>
              </>
            )}
          </button>

          <button
            onClick={() => onComplete(Math.max(totalElapsedTime, 10))}
            title="Finalizar o exercício agora e ir para a reavaliação"
            className="py-3 px-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Concluir</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};
