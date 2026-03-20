import Presets from './Presets';
import Settings from './Settings';
import useRealtimeComposer from './useRealtimeComposer';
import usePatternComposer from './usePatternComposer';
import useAdaptiveHaptics from './useAdaptiveHaptics';

const useHapticsComposer = usePatternComposer;

export {
  Presets,
  Settings,
  useRealtimeComposer,
  usePatternComposer,
  useHapticsComposer,
  useAdaptiveHaptics,
};

export type { Pattern, PatternComposer, AdaptivePreset, AdaptivePresetConfig, AdaptiveHaptics } from './types';
export { HapticSupport } from './NativeRNPulsar';
export type { RealtimeComposer } from './useRealtimeComposer';
