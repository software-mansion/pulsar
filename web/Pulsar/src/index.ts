/**
 * @pulsar/haptics
 * Web haptics library — API mirrors react-native-pulsar
 */

// ---------------------------------------------------------------------------
// Primary API (mirrors react-native-pulsar)
// ---------------------------------------------------------------------------

export { default as Presets } from './Presets';
export { default as Settings } from './Settings';
export { createPatternComposer } from './pattern-composer';

export type {
  Pattern,
  PatternComposer,
  AdaptivePreset,
  AdaptivePresetConfig,
  AdaptiveHaptics,
  RealtimeComposer,
} from './types';

export { HapticSupport, RealtimeComposerStrategy } from './types';

// ---------------------------------------------------------------------------
// Legacy / low-level API
// ---------------------------------------------------------------------------

export { haptics, HapticsManager, playHaptic, playPattern, stopHaptic } from './haptics';

export type {
  HapticIntensity,
  HapticConfig,
  HapticPattern,
  HapticPatternInput,
  HapticStatus,
  HapticCapabilities,
} from './types';

export { isVibrationSupported, intensityToValue, mergeHapticConfig } from './utils';
