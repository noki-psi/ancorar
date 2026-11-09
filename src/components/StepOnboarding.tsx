import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Brain, Shield, Wind } from 'lucide-react';

interface StepOnboardingProps {
  onNext: () => void;
}

interface SlideItem {
  id: number;
  badge: string;
  icon: React.ReactNode;
  title: string;
  highlight: string;
  detail: string;
}

export const StepOnboarding: React.FC<StepOnboardingProps> = ({ onNext }) => {
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [direction, setDirection] = useState<number>(1);

  const slides: SlideItem[] = [
    {
      id: 0,
      badge: '1 de 3 • Compreensão (TCC)',
      icon: <Brain className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />,
      title: 'Ideias automáticas aceleram o corpo',
      highlight: 'Diante de uma prova, pensamentos como "não vou lembrar" ou "vou falhar" surgem de forma involuntária.',
      detail: 'Essa interpretação de ameaça dispara respostas físicas imediatas: taquicardia, respiração curta e inquietação.',
    },
    {
      id: 1,
      badge: '2 de 3 • Acolhimento Compassivo',
      icon: <Shield className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />,
      title: 'Seu corpo não é seu inimigo',
      highlight: 'Essa hiperativação é apenas um mecanismo de proteção biológico momentaneamente descalibrado pela pressão.',
      detail: 'Não lutamos contra o que você sente. Vamos acolher o corpo e sinalizar segurança para o seu sistema nervoso.',
    },
    {
      id: 2,
      badge: '3 de 3 • Regulação Vagal (3:2:6)',
      icon: <Wind className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />,
      title: 'A respiração que ativa a sua calma',
      highlight: 'Inspirar em 3s, suspender em 2s e expirar longamente em 6s estimula o nervo vago e ativa o sistema parassimpático.',
      detail: 'Em apenas 2 minutos de prática, o ritmo cardíaco desacelera e a mente recupera a clareza necessária para a prova.',
    },
  ];

  const handleNextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setDirection(1);
      setCurrentSlide(prev => prev + 1);
    } else {
      onNext();
    }
  };

  const handlePrevSlide = () => {
    if (currentSlide > 0) {
      setDirection(-1);
      setCurrentSlide(prev => prev - 1);
    }
  };

  const handleSelectSlide = (idx: number) => {
    setDirection(idx > currentSlide ? 1 : -1);
    setCurrentSlide(idx);
  };

  const active = slides[currentSlide];
  const isLast = currentSlide === slides.length - 1;

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 30 : -30,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -30 : 30,
      opacity: 0,
    }),
  };

  return (
    <div className="flex flex-col flex-1 justify-between py-4 sm:py-6 select-none max-w-md mx-auto w-full">
      {/* Top Direct Title: Catchy & Reassuring */}
      <div className="text-center space-y-2 pt-1">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
          Pausa Pré-Prova • 2 minutos
        </span>
        
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 dark:text-stone-100 leading-tight">
          Retome o controle antes da prova
        </h2>
        
        <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 max-w-xs mx-auto leading-relaxed">
          Acalme sua mente e seu corpo para realizar uma boa avaliação com clareza.
        </p>
      </div>

      {/* Interactive Slideshow Card with Smooth Fades */}
      <div className="my-auto py-3">
        <div className="relative min-h-[220px] sm:min-h-[210px] flex items-center justify-center">
          <AnimatePresence custom={direction} mode="wait">
            <motion.div
              key={active.id}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28, ease: [0.25, 1, 0.5, 1] }}
              className="w-full p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#151c22] border border-stone-200 dark:border-stone-800 shadow-sm space-y-3.5"
            >
              {/* Badge & Icon */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
                    {active.icon}
                  </div>
                  <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
                    {active.badge}
                  </span>
                </div>

                <span className="text-xs text-stone-400 tabular-nums font-mono">
                  {currentSlide + 1} / {slides.length}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 leading-snug">
                {active.title}
              </h3>

              {/* Highlight */}
              <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-200 font-medium leading-relaxed">
                {active.highlight}
              </p>

              {/* Detail */}
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed pt-2 border-t border-stone-100 dark:border-stone-800/80">
                {active.detail}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Carousel Navigation Controls (Arrows + Dots) */}
        <div className="flex items-center justify-between mt-3 px-2">
          {/* Prev Arrow */}
          <button
            onClick={handlePrevSlide}
            disabled={currentSlide === 0}
            aria-label="Slide anterior"
            title="Slide anterior"
            className="p-2.5 rounded-full text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white disabled:opacity-20 disabled:hover:text-stone-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          {/* Dots Indicator */}
          <div className="flex items-center gap-1.5">
            {slides.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => handleSelectSlide(idx)}
                aria-label={`Ir para slide ${idx + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentSlide === idx 
                    ? 'w-6 bg-emerald-700 dark:bg-emerald-400' 
                    : 'w-2 bg-stone-300 dark:bg-stone-700 hover:bg-stone-400'
                }`}
              />
            ))}
          </div>

          {/* Next Arrow */}
          <button
            onClick={handleNextSlide}
            aria-label="Próximo slide"
            title={isLast ? 'Começar autoavaliação' : 'Próximo slide'}
            className="p-2.5 rounded-full text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 pt-1">
        <button
          onClick={isLast ? onNext : handleNextSlide}
          title={isLast ? 'Iniciar autoavaliação de tensão' : 'Avançar para a próxima etapa da introdução'}
          className="w-full py-4 px-6 rounded-2xl bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-base flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-sm"
        >
          <span>{isLast ? 'Iniciar autoavaliação' : 'Avançar introdução'}</span>
          <ArrowRight className="w-5 h-5" />
        </button>

        {!isLast && (
          <button
            onClick={onNext}
            title="Ir direto para a autoavaliação sem ver todos os slides"
            className="w-full py-2 text-xs font-semibold text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 transition-colors text-center"
          >
            Pular introdução e começar agora
          </button>
        )}
      </div>
    </div>
  );
};
