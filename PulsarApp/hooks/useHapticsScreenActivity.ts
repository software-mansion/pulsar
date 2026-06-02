import { useIsFocused } from 'expo-router';
import { useEffect } from 'react';
import { Settings } from 'react-native-pulsar';
import { useSharedValue } from 'react-native-reanimated';

import type { Composer } from './gestureTypes';

export function useHapticsScreenActivity(composer: Composer) {
  const isFocused = useIsFocused();
  const isScreenActive = useSharedValue(isFocused);

  useEffect(() => {
    if (isFocused) {
      // The native composer is a process-wide singleton; if a previously-focused
      // screen latched it off via stop(), clear the latch before we start
      // driving haptics. useRealtimeComposer also resets on mount, but a
      // re-focused screen that never re-mounted (tab switch) needs this too.
      composer.reset();
      isScreenActive.value = true;
      return;
    }

    // On unfocus the load-bearing change is now the native sticky-stopped
    // latch installed by composer.stop / Settings.stopHaptics. Once latched,
    // any stray composer.set arriving from an in-flight worklet tick is a
    // no-op — so we no longer need to win the JS-vs-UI ordering race here.
    isScreenActive.value = false;
    composer.stop();
    Settings.stopHaptics();
  }, [composer, isFocused, isScreenActive]);

  return isScreenActive;
}
