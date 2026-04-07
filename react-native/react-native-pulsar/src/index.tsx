import Presets from './Presets';
import Settings from './Settings';
import useRealtimeComposer from './useRealtimeComposer';
import usePatternComposer from './usePatternComposer';
import useAdaptiveHaptics from './useAdaptiveHaptics';

export {
  Presets,
  Settings,
  useRealtimeComposer,
  usePatternComposer,
  useAdaptiveHaptics,
};

export type { Pattern, PatternComposer, AdaptivePreset, AdaptivePresetConfig, AdaptiveHaptics } from './types';
export { HapticSupport, RealtimeComposerStrategy } from './NativeRNPulsar';
export type { RealtimeComposer } from './useRealtimeComposer';
