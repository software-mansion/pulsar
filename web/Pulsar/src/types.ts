/**
 * Type definitions for the Pulsar haptics library
 */

// ---------------------------------------------------------------------------
// Types — mirrors react-native-pulsar API
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

export type RealtimeComposer = {
  /** Not supported on web — continuous amplitude/frequency control requires native APIs. */
  set: (amplitude: number, frequency: number) => void;
  playDiscrete: (amplitude: number, frequency: number) => void;
  stop: () => void;
  isActive: () => boolean;
};


export enum RealtimeComposerStrategy {
  ENVELOPE = 0,
  PRIMITIVE_TICK = 1,
  PRIMITIVE_COMPLEX = 2,
  ENVELOPE_WITH_DISCRETE_PRIMITIVES = 3,
}
