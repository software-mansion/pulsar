/**
 * Type definitions for the Pulsar haptics library
 */

// ---------------------------------------------------------------------------
// Legacy types (kept for backward compatibility)
// ---------------------------------------------------------------------------

export type HapticIntensity = 'light' | 'medium' | 'heavy'

export interface HapticConfig {
  duration?: number
  intensity?: HapticIntensity
  delay?: number
  loop?: boolean
  loopCount?: number
}

export interface HapticPattern {
  name: string
  description: string
  effects: HapticConfig[]
}

export interface HapticPatternInput {
  name: string
  effects: HapticConfig[]
}

export type HapticStatus = 'idle' | 'playing' | 'paused' | 'stopped'

export interface HapticCapabilities {
  supported: boolean
  maxDuration: number
  supportedIntensities: HapticIntensity[]
  supportsPatterns: boolean
}

// ---------------------------------------------------------------------------
// New types — mirrors react-native-pulsar API
// ---------------------------------------------------------------------------

/**
 * A haptic pattern with discrete and continuous components.
 * Only discretePattern is usable on web (Vibration API limitation).
 */
export type Pattern = {
  discretePattern: { time: number; amplitude: number; frequency: number }[];
  continuousPattern: {
    amplitude: { time: number; value: number }[];
    frequency: { time: number; value: number }[];
  };
};

export type PatternComposer = {
  play: () => void;
  stop: () => void;
  parse: (pattern: Pattern) => void;
  isParsed: () => boolean;
};

export type AdaptivePresetConfig = (() => void) | Pattern;

export type AdaptivePreset = {
  web: AdaptivePresetConfig;
};

export type AdaptiveHaptics = {
  play: () => void;
};

export type RealtimeComposer = {
  /** Not supported on web — continuous amplitude/frequency control requires native APIs. */
  set: (amplitude: number, frequency: number) => void;
  playDiscrete: (amplitude: number, frequency: number) => void;
  stop: () => void;
  isActive: () => boolean;
};

export enum HapticSupport {
  NO_SUPPORT = 0,
  MINIMAL_SUPPORT = 1,
  LIMITED_SUPPORT = 2,
  STANDARD_SUPPORT = 3,
  ADVANCED_SUPPORT = 4,
}

export enum RealtimeComposerStrategy {
  ENVELOPE = 0,
  PRIMITIVE_TICK = 1,
  PRIMITIVE_COMPLEX = 2,
  ENVELOPE_WITH_DISCRETE_PRIMITIVES = 3,
}
