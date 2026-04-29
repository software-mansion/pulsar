import { useIsFocused } from 'expo-router';
import { useEffect } from 'react';
import { Settings } from 'react-native-pulsar';
import { useSharedValue } from 'react-native-reanimated';
import { runOnUIAsync } from 'react-native-worklets';

import type { Composer } from './gestureTypes';

export function useHapticsScreenActivity(composer: Composer) {
  const isFocused = useIsFocused();
  const isScreenActive = useSharedValue(isFocused);

  useEffect(() => {
    isScreenActive.value = isFocused;

    if (!isFocused) {
      runOnUIAsync(() => {
        composer.stop();
      });
      Settings.stopHaptics();
    }
  }, [composer, isFocused, isScreenActive]);

  return isScreenActive;
}
