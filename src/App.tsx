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

const AdminDrawer = lazy(() => import('./components/AdminDrawer'));

export function App() {
  const [currentStep, setCurrentStep] = useState<Step>('onboarding');
  const [preTension, setPreTension] = useState<number>(4);
  const [postTension, setPostTension] = useState<number>(2);
  const [sessionDuration, setSessionDuration] = useState<number>(120);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [isOffline, setIsOffline] = useState<boolean>(!isSupabaseConfigured);

  useEffect(() => {
    getAnonymousUserId();
    checkSupabaseConnection().then(online => {
      setIsOffline(!online);
    });
  }, []);

  const handleFinishBreathing = (actualDuration: number) => {
    setSessionDuration(actualDuration);
    setCurrentStep('post-checkout');
  };

  const handleCompleteSession = async () => {
    const userId = getAnonymousUserId();
    const result = await saveSession({
      anonymous_user_id: userId,
      pre_tension: preTension,
      post_tension: postTension,
      duration_seconds: sessionDuration,
    });

    setIsOffline(result.isOffline);
    setCurrentStep('summary');
  };

  // Restart goes directly to the breathing exercise
  const handleRestart = () => {
    setSessionDuration(120);
    setCurrentStep('breathing');
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#090d16] text-slate-100 relative selection:bg-cyan-500/30 selection:text-cyan-200">
      <Header onOpenAdmin={() => setIsAdminOpen(true)} isOnline={!isOffline} />

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
              onNext={() => setCurrentStep('breathing')}
              onBack={() => setCurrentStep('pre-checkin')}
            />
          )}

          {currentStep === 'breathing' && (
            <BreathingEngine
              key="breathing"
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
              isOffline={isOffline}
              onRestart={handleRestart}
            />
          )}
        </AnimatePresence>
      </main>

      <Footer onOpenAdmin={() => setIsAdminOpen(true)} />

      <Suspense fallback={null}>
        <AdminDrawer isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} />
      </Suspense>
    </div>
  );
}

export default App;
