import { useState, useEffect, lazy, Suspense } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { StepOnboarding } from './components/StepOnboarding';
import { StepPreCheckin } from './components/StepPreCheckin';
import { StepCompassion } from './components/StepCompassion';
import { BreathingEngine } from './components/BreathingEngine';
import { StepPostCheckout } from './components/StepPostCheckout';
import { StepSummary } from './components/StepSummary';
import { Step } from './types';
import { getAnonymousUserId, saveSession, isSupabaseConfigured, checkSupabaseConnection } from './lib/supabase';
import { getBreathingSettings, saveBreathingSettings, BreathingSettings, getPatternRaw, formatPatternDisplay } from './lib/settings';

const AdminDrawer = lazy(() => import('./components/AdminDrawer'));

export function App() {
  const [currentStep, setCurrentStep] = useState<Step>('onboarding');
  const [preTension, setPreTension] = useState<number>(4);
  const [postTension, setPostTension] = useState<number>(2);
  const [breathingSettings, setBreathingSettings] = useState<BreathingSettings>(getBreathingSettings);
  const [sessionDuration, setSessionDuration] = useState<number>(() => getBreathingSettings().totalDurationSeconds);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [isOffline, setIsOffline] = useState<boolean>(!isSupabaseConfigured);

  useEffect(() => {
    getAnonymousUserId();
    checkSupabaseConnection().then(online => {
      setIsOffline(!online);
    });
  }, []);

  const handleUpdateSettings = (newSettings: BreathingSettings) => {
    setBreathingSettings(newSettings);
    setSessionDuration(newSettings.totalDurationSeconds);
    saveBreathingSettings(newSettings);
  };

  const handleFinishBreathing = (actualDuration: number) => {
    setSessionDuration(actualDuration);
    setCurrentStep('post-checkout');
  };

  const handleCompleteSession = async () => {
    const userId = getAnonymousUserId();
    const patternRaw = getPatternRaw(breathingSettings);
    const result = await saveSession({
      anonymous_user_id: userId,
      pre_tension: preTension,
      post_tension: postTension,
      duration_seconds: sessionDuration,
      target_duration_seconds: breathingSettings.totalDurationSeconds,
      breathing_pattern: patternRaw,
    });

    setIsOffline(result.isOffline);
    setCurrentStep('summary');
  };

  // Restart goes directly to the breathing exercise per specification
  const handleRestart = () => {
    setSessionDuration(breathingSettings.totalDurationSeconds);
    setCurrentStep('breathing');
  };

  // Step indicator helper
  const getStepProgress = () => {
    switch (currentStep) {
      case 'onboarding':
        return { current: 1, total: 4, label: 'Introdução' };
      case 'pre-checkin':
        return { current: 2, total: 4, label: 'Como você está' };
      case 'compassion':
        return { current: 2, total: 4, label: 'Acolhimento' };
      case 'breathing':
        return { current: 3, total: 4, label: `Respiração ${formatPatternDisplay(breathingSettings)}` };
      case 'post-checkout':
        return { current: 4, total: 4, label: 'Reavaliação' };
      case 'summary':
        return { current: 4, total: 4, label: 'Conclusão' };
      default:
        return undefined;
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#090f15] text-slate-100 relative selection:bg-sage-400/20 selection:text-sand-200">
      {/* Discreet organic ambient gradient */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md h-64 bg-petrol-800/20 blur-3xl pointer-events-none -z-10" />

      {/* Header */}
      <Header 
        onOpenAdmin={() => setIsAdminOpen(true)} 
        isOnline={!isOffline} 
        stepProgress={getStepProgress()} 
      />

      {/* Main Container */}
      <main className="flex-1 flex flex-col max-w-md w-full mx-auto px-4 py-2 relative">
        <AnimatePresence mode="wait">
          {currentStep === 'onboarding' && (
            <StepOnboarding key="onboarding" onNext={() => setCurrentStep('pre-checkin')} />
          )}

          {currentStep === 'pre-checkin' && (
            <StepPreCheckin
              key="pre-checkin"
              value={preTension}
              onChange={setPreTension}
              onNext={() => setCurrentStep('compassion')}
            />
          )}

          {currentStep === 'compassion' && (
            <StepCompassion
              key="compassion"
              preTension={preTension}
              settings={breathingSettings}
              onUpdateSettings={handleUpdateSettings}
              onNext={() => setCurrentStep('breathing')}
              onBack={() => setCurrentStep('pre-checkin')}
            />
          )}

          {currentStep === 'breathing' && (
            <BreathingEngine
              key="breathing"
              settings={breathingSettings}
              onComplete={handleFinishBreathing}
            />
          )}

          {currentStep === 'post-checkout' && (
            <StepPostCheckout
              key="post-checkout"
              value={postTension}
              onChange={setPostTension}
              onNext={handleCompleteSession}
            />
          )}

          {currentStep === 'summary' && (
            <StepSummary
              key="summary"
              preTension={preTension}
              postTension={postTension}
              durationSeconds={sessionDuration}
              targetDurationSeconds={breathingSettings.totalDurationSeconds}
              breathingPattern={getPatternRaw(breathingSettings)}
              isOffline={isOffline}
              onRestart={handleRestart}
            />
          )}
        </AnimatePresence>
      </main>

      {/* Footer - hidden during breathing practice for zero distractions */}
      <Footer 
        onOpenAdmin={() => setIsAdminOpen(true)} 
        hideDuringPractice={currentStep === 'breathing'} 
      />

      {/* Admin / Extension Research Metrics Drawer */}
      <Suspense fallback={null}>
        <AdminDrawer isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} />
      </Suspense>
    </div>
  );
}

export default App;
