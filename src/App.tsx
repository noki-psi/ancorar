import { useState, useEffect, lazy, Suspense } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { StepOnboarding } from './components/StepOnboarding';
import { TensionScale } from './components/TensionScale';
import { BreathingEngine } from './components/BreathingEngine';
import { StepSummary } from './components/StepSummary';
import { AboutModal } from './components/AboutModal';
import { NavigationMenu } from './components/NavigationMenu';
import { Step } from './types';
import { getAnonymousUserId, saveSession, isSupabaseConfigured, checkSupabaseConnection, syncOfflineSessions } from './lib/supabase';
import { getBreathingSettings, saveBreathingSettings, BreathingSettings, getPatternRaw } from './lib/settings';

const AdminDrawer = lazy(() => import('./components/AdminDrawer'));
const PersonalDrawer = lazy(() => import('./components/PersonalDrawer'));

export function App() {
  const [currentStep, setCurrentStep] = useState<Step>('home');
  const [preTension, setPreTension] = useState<number | null>(null);
  const [postTension, setPostTension] = useState<number | null>(null);
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

  // Apply theme to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('ancorar_theme', theme);
  }, [theme]);

  // Handle network connectivity & offline queue sync
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

  // Start flow from Home: goes to pre-evaluation (or skip directly)
  const handleStartFromHome = () => {
    setPreTension(null);
    setPostTension(null);
    setCurrentStep('pre-evaluation');
  };

  // Called when user completes the breathing exercise
  const handleFinishBreathing = (actualDuration: number) => {
    setSessionDuration(actualDuration);
    setPostTension(null);
    setCurrentStep('post-evaluation');
  };

  // Finish session: save strictly preserving nulls and show summary
  const handleFinishSession = async (finalPost: number | null) => {
    setPostTension(finalPost);
    const userId = getAnonymousUserId();
    const patternRaw = getPatternRaw(breathingSettings);

    // Strict Data Integrity: pre_tension and post_tension remain null if skipped
    const result = await saveSession({
      anonymous_user_id: userId,
      pre_tension: preTension,
      post_tension: finalPost,
      duration_seconds: sessionDuration,
      target_duration_seconds: breathingSettings.totalDurationSeconds,
      breathing_pattern: patternRaw,
    });

    setIsOffline(result.isOffline);
    setCurrentStep('summary');
  };

  // Restart practice
  const handleRestart = () => {
    setPreTension(null);
    setPostTension(null);
    setSessionDuration(breathingSettings.totalDurationSeconds);
    setCurrentStep('pre-evaluation');
  };

  // Return to minimal Home screen
  const handleGoHome = () => {
    setPreTension(null);
    setPostTension(null);
    setCurrentStep('home');
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#fbfaf8] dark:bg-[#0b1319] text-stone-900 dark:text-stone-100 transition-colors selection:bg-emerald-500/20 selection:text-emerald-900 dark:selection:text-emerald-200">
      {/* Minimal Header */}
      <Header 
        onOpenMenu={() => setIsMenuOpen(true)}
        onGoHome={handleGoHome}
      />

      {/* Main Container */}
      <main className="flex-1 flex flex-col max-w-md w-full mx-auto px-4 py-2 relative">
        <AnimatePresence mode="wait">
          {currentStep === 'home' && (
            <StepOnboarding 
              key="home" 
              onStart={handleStartFromHome}
              settings={breathingSettings}
              onUpdateSettings={handleUpdateSettings}
            />
          )}

          {currentStep === 'pre-evaluation' && (
            <TensionScale
              key="pre-evaluation"
              title="Como você se percebe agora?"
              subtitle="Selecione seu nível de tensão antes de respirar (opcional)."
              value={preTension}
              onChange={setPreTension}
              confirmLabel="Continuar para Respiração"
              skipLabel="Pular avaliação"
              onConfirm={() => setCurrentStep('breathing')}
              onSkip={() => {
                setPreTension(null);
                setCurrentStep('breathing');
              }}
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

          {currentStep === 'post-evaluation' && (
            <TensionScale
              key="post-evaluation"
              title="Como você se percebe agora?"
              subtitle="Selecione seu nível de tensão após o exercício (opcional)."
              value={postTension}
              onChange={setPostTension}
              confirmLabel="Concluir e ver resumo"
              skipLabel="Pular avaliação"
              onConfirm={() => handleFinishSession(postTension)}
              onSkip={() => handleFinishSession(null)}
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
              onOpenGlobal={() => setIsAdminOpen(true)}
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
        onStartPractice={handleStartFromHome}
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
          onStartSession={handleStartFromHome}
        />
      </Suspense>

      {/* Admin / Global Extension Research Metrics Drawer */}
      <Suspense fallback={null}>
        <AdminDrawer isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} />
      </Suspense>
    </div>
  );
}

export default App;
