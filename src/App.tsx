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
import { AboutModal } from './components/AboutModal';
import { NavigationMenu } from './components/NavigationMenu';
import { Step } from './types';
import { getAnonymousUserId, saveSession, isSupabaseConfigured, checkSupabaseConnection, syncOfflineSessions } from './lib/supabase';
import { getBreathingSettings, saveBreathingSettings, BreathingSettings, getPatternRaw, formatPatternDisplay } from './lib/settings';

const AdminDrawer = lazy(() => import('./components/AdminDrawer'));
const PersonalDrawer = lazy(() => import('./components/PersonalDrawer'));

export function App() {
  const [currentStep, setCurrentStep] = useState<Step>('onboarding');
  const [preTension, setPreTension] = useState<number>(4);
  const [postTension, setPostTension] = useState<number>(2);
  const [breathingSettings, setBreathingSettings] = useState<BreathingSettings>(getBreathingSettings);
  const [sessionDuration, setSessionDuration] = useState<number>(() => getBreathingSettings().totalDurationSeconds);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [isPersonalOpen, setIsPersonalOpen] = useState<boolean>(false);
  const [isAboutOpen, setIsAboutOpen] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isOffline, setIsOffline] = useState<boolean>(!isSupabaseConfigured);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('ancorar_theme') as 'light' | 'dark') || 'light';
  });

  // Apply theme to html document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('ancorar_theme', theme);
  }, [theme]);

  useEffect(() => {
    getAnonymousUserId();
    const handleConnectivity = () => {
      checkSupabaseConnection().then(online => {
        setIsOffline(!online);
        if (online) {
          syncOfflineSessions();
        }
      });
    };

    handleConnectivity();

    window.addEventListener('online', handleConnectivity);
    return () => {
      window.removeEventListener('online', handleConnectivity);
    };
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

  // Back to start / onboarding screen
  const handleGoHome = () => {
    setCurrentStep('onboarding');
  };

  // Direct practice start
  const handleStartDirectPractice = () => {
    setSessionDuration(breathingSettings.totalDurationSeconds);
    setCurrentStep('breathing');
  };

  // Step indicator helper
  const getStepProgress = () => {
    switch (currentStep) {
      case 'onboarding':
        return undefined; // Clean home without progress clutter
      case 'pre-checkin':
        return { current: 1, total: 4, label: 'Autoavaliação' };
      case 'compassion':
        return { current: 2, total: 4, label: 'Acolhimento' };
      case 'breathing':
        return { current: 3, total: 4, label: `Respiração ${formatPatternDisplay(breathingSettings)}` };
      case 'post-checkout':
        return { current: 4, total: 4, label: 'Reavaliação' };
      case 'summary':
        return { current: 4, total: 4, label: 'Resultado' };
      default:
        return undefined;
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#fbfaf8] dark:bg-[#0b1319] text-stone-900 dark:text-stone-100 transition-colors selection:bg-emerald-500/20 selection:text-emerald-900 dark:selection:text-emerald-200">
      {/* Minimal Header */}
      <Header 
        onOpenMenu={() => setIsMenuOpen(true)}
        onGoHome={handleGoHome}
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
              onBack={handleGoHome}
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
              onUpdateSettings={handleUpdateSettings}
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
              onGoHome={handleGoHome}
              onOpenPersonal={() => setIsPersonalOpen(true)}
            />
          )}
        </AnimatePresence>
      </main>

      {/* Minimal Footer */}
      <Footer 
        onOpenAbout={() => setIsAboutOpen(true)}
        hideDuringPractice={currentStep === 'breathing'} 
      />

      {/* Hamburger Navigation Menu */}
      <NavigationMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onGoHome={handleGoHome}
        onStartPractice={handleStartDirectPractice}
        onOpenAbout={() => setIsAboutOpen(true)}
        onOpenPersonal={() => setIsPersonalOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        theme={theme}
        onToggleTheme={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
      />

      {/* Dedicated About & Institutional Modal */}
      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
        isOnline={!isOffline}
        onOpenPersonal={() => setIsPersonalOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* Personal Dashboard Drawer */}
      <Suspense fallback={null}>
        <PersonalDrawer 
          isOpen={isPersonalOpen} 
          onClose={() => setIsPersonalOpen(false)} 
          onStartSession={handleStartDirectPractice}
        />
      </Suspense>

      {/* Admin / Extension Research Metrics Drawer */}
      <Suspense fallback={null}>
        <AdminDrawer isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} />
      </Suspense>
    </div>
  );
}

export default App;
