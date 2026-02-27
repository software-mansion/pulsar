import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { posthog } from '@/src/config/posthog';

interface OnboardingContextType {
  onboardingState: number;
  setOnboardingState: (state: number) => void;
  resetOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);
const ONBOARDING_COMPLETED_KEY = '@pulsar_onboarding_completed';

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [onboardingState, setOnboardingState] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadOnboardingStatus = async () => {
      try {
        const completed = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
        if (completed === 'true') {
          setOnboardingState(3);
        }
      } catch (error) {
        console.error('Error loading onboarding status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadOnboardingStatus();
  }, []);

  useEffect(() => {
    const saveOnboardingCompletion = async () => {
      if (onboardingState === 3 && !isLoading) {
        try {
          await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
          posthog.capture('onboarding_completed');
        } catch (error) {
          console.error('Error saving onboarding status:', error);
        }
      }
    };

    saveOnboardingCompletion();
  }, [onboardingState, isLoading]);

  const resetOnboarding = () => {
    setOnboardingState(1);
    AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'false');
  };

  return (
    <OnboardingContext.Provider value={{ onboardingState, setOnboardingState, resetOnboarding }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}
