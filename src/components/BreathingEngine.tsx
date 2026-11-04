import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, CheckCircle, RotateCcw, Info } from 'lucide-react';
import { BreathPhase } from '../types';

interface BreathingEngineProps {
  onComplete: (actualDurationSeconds: number) => void;
}

// 3s Inhale -> 2s Hold -> 6s Exhale
const PHASE_CONFIG: Record<BreathPhase, { name: string; duration: number; tip: string; color: string; glow: string; scale: number }> = {
  inhale: {
    name: 'Inspire profundamente',
    duration: 3,
    tip: 'Puxe o ar suavemente pelas narinas enchendo o abdômen',
    color: 'text-cyan-400',
    glow: 'from-cyan-500/25 to-sky-500/10 border-cyan-400/50 shadow-cyan-500/30',
    scale: 1.28
  },
  hold: {
    name: 'Segure o ar',
    duration: 2,
    tip: 'Mantenha a calmaria interna sem pressionar a garganta',
    color: 'text-amber-400',
    glow: 'from-amber-500/25 to-yellow-500/10 border-amber-400/50 shadow-amber-500/30',
    scale: 1.28
  },
  exhale: {
    name: 'Expire longamente',
    duration: 6,
    tip: 'Solte o ar devagar pela boca, estimulando o nervo vago',
    color: 'text-emerald-400',
    glow: 'from-emerald-500/25 to-teal-500/10 border-emerald-400/50 shadow-emerald-500/30',
    scale: 0.88
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

  // Audio Context for subtle calming bell/binaural-like cue
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playSoftTone = (freq: number) => {
    if (isAudioMuted) return;
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
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
      gain.gain.setValueAtTime(0.06, audioCtxRef.current.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtxRef.current.currentTime + 0.8);

      osc.connect(gain);
      gain.connect(audioCtxRef.current.destination);

      osc.start();
      osc.stop(audioCtxRef.current.currentTime + 0.8);
    } catch (e) {
      // Audio autoplay policy fallback
    }
  };

  // Tone shift per phase
  useEffect(() => {
    if (!isActive) return;
    if (phase === 'inhale') playSoftTone(432); // Soothing 432 Hz
    if (phase === 'hold') playSoftTone(528);   // Soft 528 Hz
    if (phase === 'exhale') playSoftTone(360); // Grounding 360 Hz
  }, [phase, isActive, isAudioMuted]);

  // Main Timer Tick (Every 1 second)
  useEffect(() => {
    let interval: any = null;

    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTotalElapsedTime(prev => prev + 1);

        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });

        setPhaseSecondsLeft(prev => {
          if (prev <= 1) {
            // Transition phase
            setPhase(currPhase => {
              if (currPhase === 'inhale') {
                return 'hold';
              } else if (currPhase === 'hold') {
                return 'exhale';
              } else {
                return 'inhale';
              }
            });
            // Return next phase initial duration
            return 0; // Handled by next phase effect
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, timeRemaining]);

  // Sync phase countdown duration when phase changes
  useEffect(() => {
    setPhaseSecondsLeft(PHASE_CONFIG[phase].duration);
  }, [phase]);

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
      className="flex flex-col flex-1 justify-between py-2 space-y-4"
    >
      {/* Top Controls: Duration Picker & Audio */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800">
          {TIMER_OPTIONS.map((opt) => (
            <button
              key={opt.seconds}
              type="button"
              onClick={() => handleSelectDuration(opt.seconds)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                selectedDuration === opt.seconds
                  ? 'bg-cyan-500 text-slate-950 shadow-sm shadow-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setIsAudioMuted(!isAudioMuted)}
          aria-label={isAudioMuted ? "Desmutar som" : "Mutar som"}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 transition-colors"
        >
          {isAudioMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
        </button>
      </div>

      {/* Central Visualizer: Dynamic Fluid Glow Circle */}
      <div className="relative flex flex-col items-center justify-center my-auto min-h-[290px]">
        {/* Outer ambient glow ripple */}
        <motion.div
          animate={{
            scale: [1, currentConfig.scale, 1],
            opacity: [0.15, 0.4, 0.15]
          }}
          transition={{
            duration: currentConfig.duration,
            ease: "easeInOut",
            repeat: Infinity
          }}
          className={`absolute w-64 h-64 sm:w-72 sm:h-72 rounded-full bg-gradient-to-tr ${currentConfig.glow} blur-3xl pointer-events-none`}
        />

        {/* Breathing Orb */}
        <motion.div
          animate={{
            scale: phase === 'inhale' ? 1.25 : phase === 'hold' ? 1.25 : 0.82
          }}
          transition={{
            duration: currentConfig.duration,
            ease: "easeInOut"
          }}
          className={`relative w-52 h-52 sm:w-60 sm:h-60 rounded-full border-2 bg-gradient-to-b ${currentConfig.glow} shadow-2xl flex flex-col items-center justify-center p-4 backdrop-blur-md transition-colors duration-700`}
        >
          {/* Inner pulsating waves */}
          <div className="absolute inset-2 rounded-full border border-white/10 opacity-60"></div>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={phase}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.3 }}
              className="text-center space-y-1 z-10"
            >
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                {phase === 'inhale' ? 'Inspiração (3s)' : phase === 'hold' ? 'Retenção (2s)' : 'Expiração Longa (6s)'}
              </span>
              <h3 className={`text-xl sm:text-2xl font-black tracking-tight ${currentConfig.color}`}>
                {currentConfig.name}
              </h3>
              <div className="text-3xl font-extrabold text-white tracking-widest mt-1">
                {phaseSecondsLeft}s
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Micro-tip below the orb */}
        <div className="mt-5 text-center max-w-xs">
          <p className="text-xs text-slate-300 font-medium h-8 transition-opacity duration-300">
            {currentConfig.tip}
          </p>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between px-2 text-xs text-slate-400 font-medium">
          <div className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            <span>Respiração Vagal (3:2:6)</span>
          </div>
          <span>Tempo Restante: <strong className="text-slate-100">{formatTime(timeRemaining)}</strong></span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
          <div 
            className="h-full bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 transition-all duration-1000 ease-linear"
            style={{ width: `${((selectedDuration - timeRemaining) / selectedDuration) * 100}%` }}
          />
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            onClick={() => setIsActive(!isActive)}
            className="py-3 px-4 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-white font-semibold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-all active:scale-95"
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
            className="py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600/40 to-emerald-600/40 hover:from-cyan-600/60 hover:to-emerald-600/60 text-cyan-200 font-semibold text-xs flex items-center justify-center gap-2 border border-cyan-500/40 transition-all active:scale-95"
          >
            <CheckCircle className="w-4 h-4 text-emerald-300" />
            <span>Concluir Agora</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};
