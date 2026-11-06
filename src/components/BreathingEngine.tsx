import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pause, Play, Volume2, VolumeX, CheckCircle2 } from 'lucide-react';
import { BreathPhase } from '../types';
import { BreathingSettings, formatPatternDisplay } from '../lib/settings';

interface BreathingEngineProps {
  onComplete: (actualDurationSeconds: number) => void;
  settings: BreathingSettings;
}

export const BreathingEngine: React.FC<BreathingEngineProps> = ({ onComplete, settings }) => {
  const [selectedDuration, setSelectedDuration] = useState<number>(settings.totalDurationSeconds);
  const [timeRemaining, setTimeRemaining] = useState<number>(settings.totalDurationSeconds);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [phase, setPhase] = useState<BreathPhase>('inhale');
  const [phaseSecondsLeft, setPhaseSecondsLeft] = useState<number>(settings.inhaleDuration);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [totalElapsedTime, setTotalElapsedTime] = useState<number>(0);

  // Sync state if settings prop changes
  useEffect(() => {
    setSelectedDuration(settings.totalDurationSeconds);
    setTimeRemaining(settings.totalDurationSeconds);
    setPhase('inhale');
    setPhaseSecondsLeft(settings.inhaleDuration);
    cycleTimeRef.current = 0;
  }, [settings]);

  // Audio Context for subtle calming acoustic tone
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Cycle time tracking ref (from 0 to cycleLength - 1)
  const cycleTimeRef = useRef<number>(0);

  const { inhaleDuration, holdDuration, exhaleDuration, holdPostExhaleDuration } = settings;
  const cycleLength = inhaleDuration + holdDuration + exhaleDuration + holdPostExhaleDuration;

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
      hold_post_exhale: 396 
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

      // Advance cycle time
      cycleTimeRef.current = (cycleTimeRef.current + 1) % cycleLength;
      const c = cycleTimeRef.current;

      const tInhaleEnd = inhaleDuration;
      const tHoldEnd = tInhaleEnd + holdDuration;
      const tExhaleEnd = tHoldEnd + exhaleDuration;

      if (c < tInhaleEnd) {
        setPhase('inhale');
        setPhaseSecondsLeft(tInhaleEnd - c);
      } else if (holdDuration > 0 && c < tHoldEnd) {
        setPhase('hold');
        setPhaseSecondsLeft(tHoldEnd - c);
      } else if (c < tExhaleEnd) {
        setPhase('exhale');
        setPhaseSecondsLeft(tExhaleEnd - c);
      } else {
        setPhase('hold_post_exhale');
        setPhaseSecondsLeft(cycleLength - c);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, timeRemaining, cycleLength, inhaleDuration, holdDuration, exhaleDuration, holdPostExhaleDuration]);

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
    setPhaseSecondsLeft(inhaleDuration);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  const progress = ((selectedDuration - timeRemaining) / selectedDuration) * 100;

  // Phase metadata for colors and labels
  const phaseMetadata = {
    inhale: {
      label: 'Inspire',
      subtext: 'Pelo nariz, com calma',
      color: '#7fae9b', // Sage green
      targetScale: 1.28,
      duration: inhaleDuration,
    },
    hold: {
      label: 'Segure',
      subtext: 'Pausa no ápice (pulmões cheios)',
      color: '#e5d7b5', // Sand gold
      targetScale: 1.28, // Stays at maximum size during hold
      duration: holdDuration,
    },
    exhale: {
      label: 'Expire',
      subtext: 'Solte devagar pela boca',
      color: '#5c937f', // Deep sage
      targetScale: 0.72, // Shrinks back to small size
      duration: exhaleDuration,
    },
    hold_post_exhale: {
      label: 'Pausa',
      subtext: 'Silêncio interno (pulmões vazios)',
      color: '#8fa89b', // Neutral soft sage
      targetScale: 0.72, // Stays at small size during post-exhale pause
      duration: holdPostExhaleDuration,
    },
  }[phase];

  // Quick preset options based on current settings
  const timerOptions = Array.from(new Set([60, settings.totalDurationSeconds, 180, 300]))
    .sort((a, b) => a - b)
    .slice(0, 3)
    .map(s => ({ label: `${Math.round(s / 60)} min`, seconds: s }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col flex-1 justify-between py-2 select-none"
    >
      {/* Top bar: minimal duration selector & sound toggle */}
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

        <button
          onClick={() => setIsAudioMuted(!isAudioMuted)}
          aria-label={isAudioMuted ? 'Ativar som' : 'Desativar som'}
          title={isAudioMuted ? 'Ativar sinal sonoro suave nas trocas de fase' : 'Desativar sinal sonoro'}
          className="p-2.5 rounded-full text-slate-400 hover:text-sand-200 bg-petrol-900/60 border border-petrol-800/60 transition-colors"
        >
          {isAudioMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-sage-300" />}
        </button>
      </div>

      {/* 
        ─── Central Organic Breathing Orb ───
        Behavior:
        - Inhale: Ball starts small and expands to maximum size (0.72 -> 1.28) over inhaleDuration.
        - Hold: At this maximum size (1.28), it stays still/paused for holdDuration.
        - Exhale: Contracts from maximum size back to small size (1.28 -> 0.72) over exhaleDuration.
      */}
      <div className="flex-1 flex flex-col items-center justify-center my-auto py-2">
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
          {/* Subtle Ambient Aura Expanding and Contracting with Breath */}
          <motion.div
            initial={{ scale: 0.72 }}
            animate={{
              scale: phase === 'exhale' ? 0.76 : 1.35,
              opacity: phase === 'hold' ? 0.35 : phase === 'inhale' ? 0.28 : 0.12,
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
            initial={{ scale: 0.72 }}
            animate={{
              scale: phase === 'exhale' ? 0.78 : 1.30,
              opacity: phase === 'hold' ? 0.4 : 0.2,
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
            initial={{ scale: 0.72 }}
            animate={{
              scale: phaseMetadata.targetScale,
            }}
            transition={{
              duration: phaseMetadata.duration,
              ease: [0.42, 0, 0.58, 1],
            }}
            className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full border border-petrol-700/60 bg-petrol-950/90 backdrop-blur-md flex flex-col items-center justify-center transition-colors duration-700 shadow-2xl"
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
                className="text-center px-4"
              >
                <p
                  className="text-sm sm:text-base font-bold tracking-widest uppercase transition-colors duration-500 mb-1"
                  style={{ color: phaseMetadata.color }}
                  title="Fase atual da respiração"
                >
                  {phaseMetadata.label}
                </p>

                <p 
                  className="text-6xl sm:text-7xl font-bold text-sand-200 tabular-nums leading-none tracking-tight my-1"
                  title="Segundos restantes nesta fase"
                >
                  {phaseSecondsLeft}
                </p>

                <p className="text-xs text-slate-300 mt-2 font-medium">
                  {phaseMetadata.subtext}
                </p>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* 
        ─── Bottom Controls: Progress & Time Remaining Placed Together ───
      */}
      <div className="space-y-3 px-1">
        {/* Time Remaining right next to the progress bar */}
        <div className="flex items-center justify-between text-xs sm:text-sm text-slate-300 font-medium px-0.5">
          <span 
            className="text-xs text-slate-300 font-mono bg-petrol-900/80 px-2 py-0.5 rounded-md border border-petrol-800"
            title="Ritmo da sessão (Inspiração : Retenção : Expiração : Pausa final)"
          >
            {formatPatternDisplay(settings)}
          </span>
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
