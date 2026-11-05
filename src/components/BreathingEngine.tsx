import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, CheckCircle, Wind } from 'lucide-react';
import { BreathPhase } from '../types';

interface BreathingEngineProps {
  onComplete: (actualDurationSeconds: number) => void;
}

// 3s Inhale -> 2s Hold -> 6s Exhale (Strictly Preserved 3:2:6 Ratio)
const PHASE_CONFIG: Record<BreathPhase, {
  name: string;
  duration: number;
  tip: string;
  badge: string;
  textColor: string;
  orbBg: string;
  orbBorder: string;
  orbShadow: string;
  rippleBg: string;
  scale: number;
}> = {
  inhale: {
    name: 'Inspire profundamente',
    duration: 3,
    tip: 'Puxe o ar suavemente pelo nariz enchendo o abdômen',
    badge: 'Inspiração • 3s',
    textColor: 'text-cyan-300',
    orbBg: 'from-cyan-950/30 via-slate-900/90 to-slate-950/95',
    orbBorder: 'border-cyan-400/50',
    orbShadow: 'shadow-[0_0_60px_-12px_rgba(6,182,212,0.35)]',
    rippleBg: 'bg-cyan-500/15 border-cyan-400/25',
    scale: 1.2
  },
  hold: {
    name: 'Segure o ar',
    duration: 2,
    tip: 'Mantenha a calmaria interna sem pressionar a garganta',
    badge: 'Retenção • 2s',
    textColor: 'text-amber-300',
    orbBg: 'from-amber-950/25 via-slate-900/90 to-slate-950/95',
    orbBorder: 'border-amber-400/50',
    orbShadow: 'shadow-[0_0_60px_-12px_rgba(245,158,11,0.30)]',
    rippleBg: 'bg-amber-500/15 border-amber-400/25',
    scale: 1.2
  },
  exhale: {
    name: 'Expire devagar',
    duration: 6,
    tip: 'Solte o ar longo pela boca, ativando o nervo vago',
    badge: 'Expiração Longa • 6s',
    textColor: 'text-emerald-300',
    orbBg: 'from-emerald-950/30 via-slate-900/90 to-slate-950/95',
    orbBorder: 'border-emerald-400/50',
    orbShadow: 'shadow-[0_0_60px_-12px_rgba(16,185,129,0.35)]',
    rippleBg: 'bg-emerald-500/15 border-emerald-400/25',
    scale: 0.86
  }
};

const TIMER_OPTIONS = [
  { label: '1 min', seconds: 60 },
  { label: '2 min (Recomendado)', seconds: 120 },
  { label: '3 min', seconds: 180 }
];

export const BreathingEngine: React.FC<BreathingEngineProps> = ({ onComplete }) => {
  const [selectedDuration, setSelectedDuration] = useState<number>(120);
  const [timeRemaining, setTimeRemaining] = useState<number>(120);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [phase, setPhase] = useState<BreathPhase>('inhale');
  const [phaseSecondsLeft, setPhaseSecondsLeft] = useState<number>(3);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [totalElapsedTime, setTotalElapsedTime] = useState<number>(0);

  // Audio Context for subtle calming tones
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playSoftTone = (freq: number) => {
    if (isAudioMuted) return;
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) audioCtxRef.current = new AudioCtx();
      }
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      if (!audioCtxRef.current) return;

      const osc = audioCtxRef.current.createOscillator();
      const gain = audioCtxRef.current.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtxRef.current.currentTime);
      gain.gain.setValueAtTime(0.04, audioCtxRef.current.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtxRef.current.currentTime + 0.85);

      osc.connect(gain);
      gain.connect(audioCtxRef.current.destination);

      osc.start();
      osc.stop(audioCtxRef.current.currentTime + 0.85);
    } catch {
      // Audio autoplay policy fallback
    }
  };

  // Tone cue per phase transition
  useEffect(() => {
    if (!isActive) return;
    if (phase === 'inhale') playSoftTone(432); // Calming 432 Hz
    if (phase === 'hold') playSoftTone(528);   // Harmonious 528 Hz
    if (phase === 'exhale') playSoftTone(360); // Grounding 360 Hz
  }, [phase, isActive, isAudioMuted]);

  // Main Timer Loop (1s precision)
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTotalElapsedTime(prev => prev + 1);

        setTimeRemaining(prev => {
          if (prev <= 1) {
            if (interval) clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });

        setPhaseSecondsLeft(prev => {
          if (prev <= 1) {
            setPhase(currPhase => {
              if (currPhase === 'inhale') return 'hold';
              if (currPhase === 'hold') return 'exhale';
              return 'inhale';
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeRemaining]);

  // Sync phase countdown when phase changes
  useEffect(() => {
    setPhaseSecondsLeft(PHASE_CONFIG[phase].duration);
  }, [phase]);

  // Completion trigger
  useEffect(() => {
    if (timeRemaining === 0 && totalElapsedTime > 0) {
      onComplete(totalElapsedTime);
    }
  }, [timeRemaining, totalElapsedTime, onComplete]);

  const handleSelectDuration = (seconds: number) => {
    setSelectedDuration(seconds);
    setTimeRemaining(seconds);
    setTotalElapsedTime(0);
    setPhase('inhale');
    setPhaseSecondsLeft(3);
  };

  const handleFinishEarly = () => {
    onComplete(Math.max(totalElapsedTime, 10));
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const currentConfig = PHASE_CONFIG[phase];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col flex-1 justify-between py-2 space-y-3"
    >
      {/* Top Header Controls: Duration Picker & Audio Toggle */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900/90 border border-slate-800/80 backdrop-blur-md">
          {TIMER_OPTIONS.map((opt) => (
            <button
              key={opt.seconds}
              type="button"
              onClick={() => handleSelectDuration(opt.seconds)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all duration-200 ${
                selectedDuration === opt.seconds
                  ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold shadow-sm shadow-cyan-500/25'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setIsAudioMuted(!isAudioMuted)}
          aria-label={isAudioMuted ? "Ativar som dos tons respiratórios" : "Mutar tons respiratórios"}
          title={isAudioMuted ? "Ativar som" : "Desativar som"}
          className="p-2 rounded-xl bg-slate-900/90 border border-slate-800/80 text-slate-400 hover:text-cyan-300 transition-colors active:scale-95"
        >
          {isAudioMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
        </button>
      </div>

      {/* Central Visualizer: Guaranteed Boundary Frame to Prevent Any Overlap */}
      <div className="flex-1 flex flex-col items-center justify-center my-auto py-2">
        {/* Dedicated Viewport Box: Sized generously (w-72 h-72 sm:w-80 sm:h-80) so orb scale NEVER collides with text */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
          {/* Subtle Ambient Background Pulsing Aura */}
          <motion.div
            animate={{
              scale: [1, currentConfig.scale * 1.08, 1],
              opacity: [0.2, 0.45, 0.2]
            }}
            transition={{
              duration: currentConfig.duration,
              ease: "easeInOut",
              repeat: Infinity
            }}
            className={`absolute w-56 h-56 sm:w-64 sm:h-64 rounded-full ${currentConfig.rippleBg} blur-2xl pointer-events-none`}
          />

          {/* Gentle Expanding Ripple Ring */}
          <motion.div
            animate={{
              scale: phase === 'exhale' ? 0.9 : 1.22,
              opacity: phase === 'hold' ? 0.6 : 0.35
            }}
            transition={{
              duration: currentConfig.duration,
              ease: "easeInOut"
            }}
            className={`absolute inset-4 rounded-full border ${currentConfig.rippleBg} pointer-events-none transition-colors duration-700`}
          />

          {/* Main Breathing Orb */}
          <motion.div
            animate={{
              scale: currentConfig.scale
            }}
            transition={{
              duration: currentConfig.duration,
              ease: "easeInOut"
            }}
            className={`relative w-48 h-48 sm:w-56 sm:h-56 rounded-full border-2 bg-gradient-to-b ${currentConfig.orbBg} ${currentConfig.orbBorder} ${currentConfig.orbShadow} backdrop-blur-xl flex flex-col items-center justify-center p-4 transition-all duration-700 select-none`}
          >
            {/* Inner aesthetic sheen ring */}
            <div className="absolute inset-1.5 rounded-full border border-white/10 pointer-events-none" />

            <AnimatePresence mode="wait">
              <motion.div
                key={phase}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.28 }}
                className="text-center space-y-1.5 z-10 px-2"
              >
                {/* Micro Phase Badge */}
                <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-950/60 border border-slate-700/50 text-[10px] font-bold uppercase tracking-wider text-slate-300">
                  {currentConfig.badge}
                </div>

                {/* Phase Instruction Title */}
                <h2 className={`text-base sm:text-lg font-bold tracking-tight ${currentConfig.textColor}`}>
                  {currentConfig.name}
                </h2>

                {/* Big Seconds Countdown */}
                <div className="text-4xl sm:text-5xl font-black text-white tracking-tight tabular-nums drop-shadow-sm">
                  {phaseSecondsLeft}<span className="text-base font-light text-slate-400 ml-0.5">s</span>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Dedicated Psychoeducational Tip Box Below (Guaranteed Clearance) */}
        <div className="mt-4 sm:mt-5 text-center max-w-xs px-4 min-h-[42px] flex items-center justify-center">
          <p className="text-xs sm:text-sm text-slate-300/90 font-medium leading-relaxed transition-all duration-300">
            {currentConfig.tip}
          </p>
        </div>
      </div>

      {/* Bottom Controls & Progress */}
      <div className="space-y-2.5 pt-1">
        {/* Progress & Duration info */}
        <div className="flex items-center justify-between px-1 text-xs text-slate-400 font-medium">
          <div className="flex items-center gap-1.5 text-cyan-300/90">
            <Wind className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px] font-semibold">Proporção 3:2:6</span>
          </div>
          <span className="text-[11px]">
            Tempo: <strong className="text-white font-bold">{formatTime(timeRemaining)}</strong>
          </span>
        </div>

        {/* Sleek Progress Bar */}
        <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800/80">
          <div 
            className="h-full bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 transition-all duration-1000 ease-linear rounded-full shadow-sm shadow-cyan-500/30"
            style={{ width: `${((selectedDuration - timeRemaining) / selectedDuration) * 100}%` }}
          />
        </div>

        {/* Action Buttons: Pause/Resume & Finish */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            onClick={() => setIsActive(!isActive)}
            className="py-3 px-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white font-semibold text-xs flex items-center justify-center gap-2 border border-slate-800 hover:border-slate-700 transition-all active:scale-[0.98] shadow-sm"
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
            onClick={handleFinishEarly}
            className="py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 hover:from-cyan-500/30 hover:to-emerald-500/30 text-cyan-200 font-semibold text-xs flex items-center justify-center gap-2 border border-cyan-500/40 transition-all active:scale-[0.98] shadow-sm shadow-cyan-500/10"
          >
            <CheckCircle className="w-4 h-4 text-emerald-300" />
            <span>Concluir</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};
