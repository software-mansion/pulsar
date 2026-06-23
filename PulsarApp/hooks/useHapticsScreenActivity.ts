import { useIsFocused } from 'expo-router';
import { useEffect } from 'react';
import { useSharedValue } from 'react-native-reanimated';
import { runOnUIAsync } from 'react-native-worklets';

import type { Composer } from './gestureTypes';

export function useHapticsScreenActivity(composer: Composer) {
  const isFocused = useIsFocused();
  const isScreenActive = useSharedValue(isFocused);

  useEffect(() => {
    if (!isFocused) {
      runOnUIAsync((isFocused) => {
        isScreenActive.value = isFocused;
        composer.stop();
      }, isFocused);
    } else {
      isScreenActive.value = isFocused;
    }
    
    return () => {
      runOnUIAsync(() => {
        isScreenActive.value = false;
        composer.stop();
      });
    };
  }, [composer, isFocused, isScreenActive]);

  return isScreenActive;
}
