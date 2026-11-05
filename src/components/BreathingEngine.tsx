import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pause, Play, Volume2, VolumeX, CheckCircle2 } from 'lucide-react';
import { BreathPhase } from '../types';

interface BreathingEngineProps {
  onComplete: (actualDurationSeconds: number) => void;
}

// 3s Inhale -> 2s Hold -> 6s Exhale (Strictly Preserved 3:2:6 Ratio)
const PHASES: Record<BreathPhase, {
  label: string;
  duration: number;
  color: string;
  glow: string;
  scale: number;
  subtext: string;
}> = {
  inhale: {
    label: 'Inspire',
    duration: 3,
    color: '#38bdf8',
    glow: 'rgba(56, 189, 248, 0.28)',
    scale: 1.2,
    subtext: 'Pelo nariz...',
  },
  hold: {
    label: 'Segure',
    duration: 2,
    color: '#fbbf24',
    glow: 'rgba(251, 191, 36, 0.24)',
    scale: 1.2,
    subtext: 'Mantenha a calma...',
  },
  exhale: {
    label: 'Expire',
    duration: 6,
    color: '#34d399',
    glow: 'rgba(52, 211, 153, 0.28)',
    scale: 0.88,
    subtext: 'Longo pela boca...',
  },
};

const TIMER_OPTIONS = [
  { label: '1 min', seconds: 60 },
  { label: '2 min', seconds: 120 },
  { label: '3 min', seconds: 180 },
];

export const BreathingEngine: React.FC<BreathingEngineProps> = ({ onComplete }) => {
  const [selectedDuration, setSelectedDuration] = useState(120);
  const [timeRemaining, setTimeRemaining] = useState(120);
  const [isActive, setIsActive] = useState(true);
  const [phase, setPhase] = useState<BreathPhase>('inhale');
  const [phaseSecondsLeft, setPhaseSecondsLeft] = useState(3);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [totalElapsedTime, setTotalElapsedTime] = useState(0);

  const audioCtxRef = useRef<AudioContext | null>(null);

  const playSoftTone = (freq: number) => {
    if (isAudioMuted) return;
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) audioCtxRef.current = new AudioCtx();
      }
      if (audioCtxRef.current?.state === 'suspended') audioCtxRef.current.resume();
      if (!audioCtxRef.current) return;

      const osc = audioCtxRef.current.createOscillator();
      const gain = audioCtxRef.current.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtxRef.current.currentTime);
      gain.gain.setValueAtTime(0.03, audioCtxRef.current.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtxRef.current.currentTime + 0.8);
      osc.connect(gain);
      gain.connect(audioCtxRef.current.destination);
      osc.start();
      osc.stop(audioCtxRef.current.currentTime + 0.8);
    } catch {
      // Audio autoplay policy fallback
    }
  };

  useEffect(() => {
    if (!isActive) return;
    const tones: Record<BreathPhase, number> = { inhale: 432, hold: 528, exhale: 360 };
    playSoftTone(tones[phase]);
  }, [phase, isActive, isAudioMuted]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTotalElapsedTime(p => p + 1);
        setTimeRemaining(p => {
          if (p <= 1) {
            if (interval) clearInterval(interval);
            return 0;
          }
          return p - 1;
        });
        setPhaseSecondsLeft(p => {
          if (p <= 1) {
            setPhase(c => c === 'inhale' ? 'hold' : c === 'hold' ? 'exhale' : 'inhale');
            return 0;
          }
          return p - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeRemaining]);

  useEffect(() => {
    setPhaseSecondsLeft(PHASES[phase].duration);
  }, [phase]);

  useEffect(() => {
    if (timeRemaining === 0 && totalElapsedTime > 0) {
      onComplete(totalElapsedTime);
    }
  }, [timeRemaining, totalElapsedTime, onComplete]);

  const handleSelectDuration = (s: number) => {
    setSelectedDuration(s);
    setTimeRemaining(s);
    setTotalElapsedTime(0);
    setPhase('inhale');
    setPhaseSecondsLeft(3);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  const progress = ((selectedDuration - timeRemaining) / selectedDuration) * 100;
  const cfg = PHASES[phase];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col flex-1 justify-between py-2 select-none"
    >
      {/* ─── Top Bar: Duration Selector & Sound Toggle ─── */}
      <div className="flex items-center justify-between px-1">
        <div className="inline-flex gap-1 p-1 rounded-full bg-slate-900/90 border border-slate-800/80 backdrop-blur-md">
          {TIMER_OPTIONS.map(o => (
            <button
              key={o.seconds}
              onClick={() => handleSelectDuration(o.seconds)}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all duration-300 ${
                selectedDuration === o.seconds
                  ? 'bg-slate-800 text-cyan-300 shadow-sm shadow-cyan-500/10'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setIsAudioMuted(!isAudioMuted)}
          aria-label={isAudioMuted ? 'Ativar tom suave' : 'Desativar tom suave'}
          className="p-2 rounded-full text-slate-400 hover:text-slate-200 bg-slate-900/60 border border-slate-800/60 transition-colors"
        >
          {isAudioMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
        </button>
      </div>

      {/* ─── Central Breathing Circle: Clean, Meditative, Uncluttered ─── */}
      <div className="flex-1 flex flex-col items-center justify-center my-auto py-4">
        {/* Generous boundary box so the circle NEVER overlaps anything */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
          {/* Subtle Outer Pulsing Wave */}
          <motion.div
            animate={{
              scale: [1, cfg.scale * 1.15, 1],
              opacity: [0.12, 0.35, 0.12],
            }}
            transition={{
              duration: cfg.duration,
              ease: 'easeInOut',
              repeat: Infinity,
            }}
            className="absolute inset-0 rounded-full blur-3xl pointer-events-none transition-colors duration-700"
            style={{ backgroundColor: cfg.color }}
          />

          {/* Faint Concentric Ripple Ring */}
          <motion.div
            animate={{
              scale: cfg.scale * 1.08,
              opacity: phase === 'hold' ? 0.4 : 0.2,
            }}
            transition={{
              duration: cfg.duration,
              ease: 'easeInOut',
            }}
            className="absolute inset-4 rounded-full border pointer-events-none transition-all duration-700"
            style={{ borderColor: cfg.color }}
          />

          {/* Main Breathing Orb */}
          <motion.div
            animate={{ scale: cfg.scale }}
            transition={{ duration: cfg.duration, ease: 'easeInOut' }}
            className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full border border-white/10 bg-slate-950/80 backdrop-blur-2xl flex flex-col items-center justify-center transition-all duration-700"
            style={{
              boxShadow: `0 0 60px -10px ${cfg.glow}`,
            }}
          >
            {/* Inner subtle glow rim */}
            <div
              className="absolute inset-1 rounded-full border opacity-30 pointer-events-none transition-colors duration-700"
              style={{ borderColor: cfg.color }}
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
                {/* Clean Phase Name */}
                <p
                  className="text-sm font-bold tracking-widest uppercase transition-colors duration-500 mb-1"
                  style={{ color: cfg.color }}
                >
                  {cfg.label}
                </p>

                {/* Big, Crisp, Serene Countdown Number */}
                <p className="text-5xl sm:text-6xl font-black text-white tabular-nums leading-none tracking-tight">
                  {phaseSecondsLeft}
                </p>

                {/* Gentle subtext instruction */}
                <p className="text-[11px] text-slate-400 mt-2 font-medium tracking-wide">
                  {cfg.subtext}
                </p>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Minimalist time remaining under the orb */}
        <p className="mt-4 text-xs font-medium text-slate-400 tabular-nums">
          {formatTime(timeRemaining)} restantes
        </p>
      </div>

      {/* ─── Bottom Controls: Minimalist & Tactile ─── */}
      <div className="space-y-3 px-1">
        {/* Clean Progress Line */}
        <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-linear"
            style={{ width: `${progress}%`, backgroundColor: cfg.color }}
          />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => setIsActive(!isActive)}
            className="py-3 px-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 border border-slate-800 transition-all active:scale-[0.98]"
          >
            {isActive ? (
              <>
                <Pause className="w-4 h-4 text-amber-400" />
                <span>Pausar</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 text-emerald-400" />
                <span>Retomar</span>
              </>
            )}
          </button>

          <button
            onClick={() => onComplete(Math.max(totalElapsedTime, 10))}
            className="py-3 px-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 border border-slate-800 hover:border-slate-700 transition-all active:scale-[0.98]"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Concluir</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};
