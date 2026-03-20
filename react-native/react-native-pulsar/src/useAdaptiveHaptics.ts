import { Platform } from 'react-native';
import { useCallback } from 'react';
import usePatternComposer from './usePatternComposer';
import type { Pattern, AdaptivePreset, AdaptiveHaptics } from './types';

export default function useAdaptiveHaptics(preset: AdaptivePreset): AdaptiveHaptics {
  const platformConfig = Platform.OS === 'ios' ? preset.ios : preset.android;
  const customPattern = typeof platformConfig !== 'function' ? platformConfig as Pattern : undefined;
  const composer = usePatternComposer(customPattern);

  const play = useCallback(() => {
    'worklet';
    if (typeof platformConfig === 'function') {
      platformConfig();
    } else {
      composer.play();
    }
  }, [platformConfig, composer]);

  return { play };
}
