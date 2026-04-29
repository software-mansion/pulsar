import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { Platform } from 'react-native';
import { RealtimeComposerStrategy, Settings } from 'react-native-pulsar';

interface PlaygroundContextType {
  selectedStrategy: RealtimeComposerStrategy;
  setSelectedStrategy: (strategy: RealtimeComposerStrategy) => void;
}

const PLAYGROUND_STRATEGY_KEY = '@pulsar_playground_strategy';

const PlaygroundContext = createContext<PlaygroundContextType | undefined>(undefined);

export function PlaygroundProvider({ children }: { children: ReactNode }) {
  const [selectedStrategy, setSelectedStrategyState] = useState(
    RealtimeComposerStrategy.ENVELOPE_WITH_DISCRETE_PRIMITIVES
  );
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(PLAYGROUND_STRATEGY_KEY)
      .then((storedValue) => {
        if (storedValue === null) {
          return;
        }

        const parsed = Number(storedValue);
        if (!Number.isNaN(parsed)) {
          setSelectedStrategyState(parsed as RealtimeComposerStrategy);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoaded(true));
  }, []);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    AsyncStorage.setItem(PLAYGROUND_STRATEGY_KEY, String(selectedStrategy)).catch(console.error);

    if (Platform.OS === 'android') {
      Settings.setRealtimeComposerStrategy(selectedStrategy);
    }
  }, [isLoaded, selectedStrategy]);

  const setSelectedStrategy = (strategy: RealtimeComposerStrategy) => {
    setSelectedStrategyState(strategy);
  };

  return (
    <PlaygroundContext.Provider value={{ selectedStrategy, setSelectedStrategy }}>
      {children}
    </PlaygroundContext.Provider>
  );
}

export function usePlayground() {
  const context = useContext(PlaygroundContext);
  if (context === undefined) {
    throw new Error('usePlayground must be used within a PlaygroundProvider');
  }
  return context;
}
