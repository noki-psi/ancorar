import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pause, Play, Volume2, VolumeX, CheckCircle2 } from 'lucide-react';
import { BreathPhase } from '../types';

interface BreathingEngineProps {
  onComplete: (actualDurationSeconds: number) => void;
}

// Immutable 3:2:6 ratio per AGENTS.md
const PHASES_CONFIG: Record<BreathPhase, {
  label: string;
  duration: number;
  subtext: string;
  color: string;
  scale: number;
}> = {
  inhale: {
    label: 'Inspire',
    duration: 3,
    subtext: 'Pelo nariz, suavemente',
    color: '#7fae9b', // Sage green
    scale: 1.22,
  },
  hold: {
    label: 'Segure',
    duration: 2,
    subtext: 'Mantenha o ar com leveza',
    color: '#e5d7b5', // Sand gold
    scale: 1.22,
  },
  exhale: {
    label: 'Expire',
    duration: 6,
    subtext: 'Longo pela boca',
    color: '#5c937f', // Deep sage
    scale: 0.85,
  },
};

const TIMER_OPTIONS = [
  { label: '1 min', seconds: 60 },
  { label: '2 min', seconds: 120 },
  { label: '3 min', seconds: 180 },
];

export const BreathingEngine: React.FC<BreathingEngineProps> = ({ onComplete }) => {
  const [selectedDuration, setSelectedDuration] = useState<number>(120);
  const [timeRemaining, setTimeRemaining] = useState<number>(120);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [phase, setPhase] = useState<BreathPhase>('inhale');
  const [phaseSecondsLeft, setPhaseSecondsLeft] = useState<number>(3);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [totalElapsedTime, setTotalElapsedTime] = useState<number>(0);

  // References to keep cycle in exact mathematical synchronization
  const audioCtxRef = useRef<AudioContext | null>(null);
  const cycleTimeRef = useRef<number>(0); // 0 to 11 (3+2+6 = 11s)

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

  // Tone shift per phase trigger
  useEffect(() => {
    if (!isActive) return;
    const tones: Record<BreathPhase, number> = { inhale: 432, hold: 528, exhale: 360 };
    playSoftTone(tones[phase]);
  }, [phase, isActive, isAudioMuted]);

  // Synchronized single interval clock
  useEffect(() => {
    if (!isActive || timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTotalElapsedTime(prev => prev + 1);

      setTimeRemaining(prev => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });

      // Synchronize 11-second master breathing cycle:
      // [0, 1, 2] = Inhale (3s) -> phaseSecondsLeft: 3, 2, 1
      // [3, 4] = Hold (2s) -> phaseSecondsLeft: 2, 1
      // [5, 6, 7, 8, 9, 10] = Exhale (6s) -> phaseSecondsLeft: 6, 5, 4, 3, 2, 1
      cycleTimeRef.current = (cycleTimeRef.current + 1) % 11;
      const c = cycleTimeRef.current;

      if (c < 3) {
        setPhase('inhale');
        setPhaseSecondsLeft(3 - c);
      } else if (c < 5) {
        setPhase('hold');
        setPhaseSecondsLeft(2 - (c - 3));
      } else {
        setPhase('exhale');
        setPhaseSecondsLeft(6 - (c - 5));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, timeRemaining]);

  // Handle completion when timer reaches 0
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
    setPhaseSecondsLeft(3);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  const progress = ((selectedDuration - timeRemaining) / selectedDuration) * 100;
  const currentCfg = PHASES_CONFIG[phase];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col flex-1 justify-between py-2 select-none"
    >
      {/* Top bar controls */}
      <div className="flex items-center justify-between px-1">
        <div className="inline-flex gap-1 p-1 rounded-full bg-petrol-900/70 border border-petrol-800/80">
          {TIMER_OPTIONS.map(opt => (
            <button
              key={opt.seconds}
              onClick={() => handleSelectDuration(opt.seconds)}
              className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all duration-300 ${
                selectedDuration === opt.seconds
                  ? 'bg-petrol-800 text-sand-200'
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
          className="p-2 rounded-full text-slate-400 hover:text-sand-200 bg-petrol-900/60 border border-petrol-800/60 transition-colors"
        >
          {isAudioMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-sage-300" />}
        </button>
      </div>

      {/* Central Organic Breathing Orb */}
      <div className="flex-1 flex flex-col items-center justify-center my-auto py-4">
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
          {/* Subtle natural aura */}
          <motion.div
            animate={{
              scale: [1, currentCfg.scale * 1.12, 1],
              opacity: [0.1, 0.28, 0.1],
            }}
            transition={{
              duration: currentCfg.duration,
              ease: 'easeInOut',
              repeat: Infinity,
            }}
            className="absolute inset-0 rounded-full blur-3xl pointer-events-none transition-colors duration-700"
            style={{ backgroundColor: currentCfg.color }}
          />

          {/* Calming Ripple Ring */}
          <motion.div
            animate={{
              scale: currentCfg.scale * 1.05,
              opacity: phase === 'hold' ? 0.35 : 0.18,
            }}
            transition={{
              duration: currentCfg.duration,
              ease: 'easeInOut',
            }}
            className="absolute inset-4 rounded-full border pointer-events-none transition-all duration-700"
            style={{ borderColor: currentCfg.color }}
          />

          {/* Main Breathing Circle */}
          <motion.div
            animate={{ scale: currentCfg.scale }}
            transition={{ duration: currentCfg.duration, ease: 'easeInOut' }}
            className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full border border-petrol-700/60 bg-petrol-950/90 backdrop-blur-md flex flex-col items-center justify-center transition-all duration-700 shadow-xl"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={phase}
                initial={{ opacity: 0, y: 2 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -2 }}
                transition={{ duration: 0.25 }}
                className="text-center px-4"
              >
                <p
                  className="text-sm font-semibold tracking-widest uppercase transition-colors duration-500 mb-1"
                  style={{ color: currentCfg.color }}
                >
                  {currentCfg.label}
                </p>

                <p className="text-5xl sm:text-6xl font-semibold text-sand-200 tabular-nums leading-none tracking-tight">
                  {phaseSecondsLeft}
                </p>

                <p className="text-[11px] text-slate-400 mt-2 font-normal">
                  {currentCfg.subtext}
                </p>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>

        <p className="mt-4 text-xs text-slate-400 tabular-nums font-medium">
          {formatTime(timeRemaining)} restantes
        </p>
      </div>

      {/* Bottom controls */}
      <div className="space-y-3 px-1">
        <div className="w-full h-1 bg-petrol-900 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-linear"
            style={{ width: `${progress}%`, backgroundColor: currentCfg.color }}
          />
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => setIsActive(!isActive)}
            className="py-3 px-4 rounded-xl bg-petrol-900/80 hover:bg-petrol-800 text-slate-200 text-xs font-medium flex items-center justify-center gap-2 border border-petrol-800 transition-all active:scale-[0.98]"
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
            className="py-3 px-4 rounded-xl bg-petrol-900/80 hover:bg-petrol-800 text-slate-200 text-xs font-medium flex items-center justify-center gap-2 border border-petrol-800 transition-all active:scale-[0.98]"
          >
            <CheckCircle2 className="w-4 h-4 text-sage-300" />
            <span>Concluir</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};
