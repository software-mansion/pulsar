import Presets from './Presets';
import Settings from './Settings';
import useRealtimeComposer from './useRealtimeComposer';
import usePatternComposer from './usePatternComposer';
import useAdaptiveHaptics from './useAdaptiveHaptics';
import { defineBundle } from './createBundle';

export {
  Presets,
  Settings,
  useRealtimeComposer,
  usePatternComposer,
  useAdaptiveHaptics,
  defineBundle,
};

export type {
  Pattern,
  PatternComposer,
  AdaptivePreset,
  AdaptivePresetConfig,
  AdaptiveHaptics,
} from './types';
export type {
  Bundle,
  BundleDefinition,
  BundleLoader,
  BundleMeta,
  LoadBundleOptions,
  PresetHandle,
  PresetAnimation,
} from './createBundle';
export { HapticSupport, RealtimeComposerStrategy } from './NativeRNPulsar';
export type { RealtimeComposer } from './useRealtimeComposer';
