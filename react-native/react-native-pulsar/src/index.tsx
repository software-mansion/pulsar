import Presets from './Presets';
import Settings from './Settings';
import useRealtimeComposer from './useRealtimeComposer';
import usePatternComposer from './usePatternComposer';
import useAdaptiveHaptics from './useAdaptiveHaptics';
import {
  createBundle,
  createBundleFromAsset,
  loadBundle,
} from './createBundle';

export {
  Presets,
  Settings,
  useRealtimeComposer,
  usePatternComposer,
  useAdaptiveHaptics,
  createBundle,
  createBundleFromAsset,
  loadBundle,
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
  BundleMeta,
  BundleDescriptor,
  BundleSidecar,
  PresetHandle,
  PresetAnimation,
  PresetMedia,
} from './createBundle';
export { HapticSupport, RealtimeComposerStrategy } from './NativeRNPulsar';
export type { RealtimeComposer } from './useRealtimeComposer';
