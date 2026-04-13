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
  RealtimeComposer,
} from './types';

export { RealtimeComposerStrategy } from './types';

export { isVibrationSupported } from './engine';
