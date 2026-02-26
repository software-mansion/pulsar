import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as StoreReview from 'expo-store-review';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface StoreReviewContextType {
  trackTabVisit: (tabName: string) => void;
}

const StoreReviewContext = createContext<StoreReviewContextType | undefined>(undefined);

const STORE_REVIEW_SHOWN_KEY = '@store_review_shown';
const MIN_TIME_IN_APP = 2 * 60 * 1000;
const MIN_TABS_VISITED = 3;

export function StoreReviewProvider({ children }: { children: ReactNode }) {
  const [appStartTime] = useState<number>(Date.now());
  const [visitedTabs, setVisitedTabs] = useState<Set<string>>(new Set());
  const [reviewShown, setReviewShown] = useState<boolean>(false);

  useEffect(() => {
    AsyncStorage.getItem(STORE_REVIEW_SHOWN_KEY).then((value) => {
      if (value === 'true') {
        setReviewShown(true);
      }
    });
  }, []);

  const checkAndShowReview = async () => {
    if (reviewShown) return;

    const timeSpent = Date.now() - appStartTime;
    const tabsVisitedCount = visitedTabs.size;

    if (timeSpent >= MIN_TIME_IN_APP && tabsVisitedCount >= MIN_TABS_VISITED) {
      const isAvailable = await StoreReview.isAvailableAsync();
      
      if (isAvailable) {
        await StoreReview.requestReview();
        setReviewShown(true);
        await AsyncStorage.setItem(STORE_REVIEW_SHOWN_KEY, 'true');
      }
    }
  };

  const trackTabVisit = (tabName: string) => {
    setVisitedTabs((prev) => {
      const newSet = new Set(prev);
      newSet.add(tabName);
      
      if (newSet.size >= MIN_TABS_VISITED && !reviewShown) {
        // checkAndShowReview();
      }
      
      return newSet;
    });
  };

  return (
    <StoreReviewContext.Provider value={{ trackTabVisit }}>
      {children}
    </StoreReviewContext.Provider>
  );
}

export function useStoreReview() {
  const context = useContext(StoreReviewContext);
  if (context === undefined) {
    throw new Error('useStoreReview must be used within a StoreReviewProvider');
  }
  return context;
}
