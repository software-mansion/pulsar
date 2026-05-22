/**
 * A time-based haptic program that can be compiled into a Web Vibration API pattern.
 *
 * Each entry starts at `timestamp` milliseconds from the beginning of playback.
 * Overlapping entries are merged into a single vibration timeline during parsing.
 */
export type HapticValuePoint = {
  /**
   * Relative position inside the segment, in milliseconds from `0` to `duration`.
   */
  time: number;

  /**
   * Normalized parameter value from `0` to `1`.
   */
  value: number;
};

export type HapticContinuousSegment = {
  /**
   * Produces one uninterrupted vibration block for the given duration.
   */
  type: "continuous";

  /**
   * Start time of the haptic block, in milliseconds from the beginning of the pattern.
   */
  timestamp: number; // in milliseconds

  /**
   * Total length of the uninterrupted vibration block, in milliseconds.
   */
  duration: number; // in milliseconds
};

export type HapticPulseSegment = {
  /**
   * Produces a square-wave style haptic block made of repeated shots and pauses.
   */
  type: "pulse";

  /**
   * Start time of the haptic block, in milliseconds from the beginning of the pattern.
   */
  timestamp: number; // in milliseconds

  /**
   * Total length of the pulse block, in milliseconds.
   */
  duration: number; // in milliseconds

  /**
   * Pulse shot length from `0` to `1`.
   * Higher intensity means each vibration shot stays on for longer.
   */
  intensity?: number; // from 0 to 1

  /**
   * Pulse pause scaling from `0` to `1`.
   * Higher frequency means shorter pauses between shots.
   */
  frequency?: number; // from 0 to 1
};

export type HapticLineSegment = {
  /**
   * Produces a pulse-like haptic block whose intensity and frequency
   * evolve over time using linearly interpolated control points.
   */
  type: "line";

  /**
   * Start time of the haptic block, in milliseconds from the beginning of the pattern.
   */
  timestamp: number; // in milliseconds

  /**
   * Total length of the line block, in milliseconds.
   */
  duration: number; // in milliseconds

  /**
   * Time-varying intensity control points from `0` to `1`.
   */
  intensity: HapticValuePoint[];

  /**
   * Time-varying frequency control points from `0` to `1`.
   */
  frequency: HapticValuePoint[];
};

export type HapticPattern = Array<HapticContinuousSegment | HapticPulseSegment | HapticLineSegment>;

/**
 * A Web Vibration API compatible pattern expressed as alternating vibration and pause durations.
 */
export type ParsedPattern = Array<number>;
