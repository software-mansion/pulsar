/**
 * A short authored sound played in sync with a haptic pattern.
 *
 * Platform notes:
 * - iOS: `uri` must resolve to a **local** file (absolute path, `file://`, or a
 *   resource bundled in the app). It is registered as a Core Haptics audio event,
 *   so audio and haptics share the engine clock (sample-accurate). Remote URLs
 *   are not supported.
 * - Android: `uri` is a path, `file://` uri, or the name of a resource in
 *   `res/raw`. An **explicit** `.ogg` with baked haptic channels gives perfect,
 *   audio-coupled sync on supported devices. Anything else — `.wav`/`.mp3`, a
 *   bare name (defaults to `.wav`), or a device without coupled-haptics support —
 *   plays the audio while the pattern's own haptics fire in parallel.
 */
export type Sound = {
  /**
   * The audio source: either a Metro asset from `require('./boom.wav')`, or a uri
   * string (a bundled resource name, an absolute path, or a `file://` uri).
   *
   * A `require()` is resolved automatically via `Image.resolveAssetSource`. Note
   * it resolves to a **remote** Metro URL in dev but a local file in release —
   * and synced playback needs a local file, so test `require()` sounds on a
   * release build / device.
   */
  uri: number | string,
  /** Playback volume, 0.0–1.0. Defaults to 1.0. */
  volume?: number,
  /** Shift of the audio relative to the haptics, in ms. Defaults to 0. */
  offset?: number,
  /**
   * Where in the source file playback begins, in ms — a seek into the file, so the whole
   * file can be shipped once and a trimmed window played from it. Defaults to 0 (the top).
   * The native side slices the audio to this window before playing, so audio and haptics
   * stay sample-accurate (there is no runtime seek on the audio itself).
   */
  start?: number,
  /**
   * How much of the file to play from `start`, in ms. Defaults to 0, which plays to the
   * end of the file. Together with `start` this is the trim window.
   */
  duration?: number,
}

export type Pattern = {
  discretePattern: { time: number, amplitude: number, frequency: number }[],
  continuousPattern: {
    amplitude: { time: number, value: number }[],
    frequency: { time: number, value: number }[],
  },
  sound?: Sound,
}

export type PatternComposer = {
  play: () => void;
  stop: () => void;
  parse: (pattern: Pattern) => void;
  isParsed: () => boolean;
};

export type AdaptivePresetConfig = (() => void) | Pattern;

export type AdaptivePreset = {
  ios: AdaptivePresetConfig;
  android: AdaptivePresetConfig;
};

export type AdaptiveHaptics = {
  play: () => void;
};

/**
 * What the device's vibrator can actually render, as reported by the platform.
 *
 * `Settings.getHapticsSupportLevel()` collapses hardware into one ordered level, which is
 * the right check for "how rich a pattern can this device play". These flags are the
 * finer-grained inputs behind it, for the cases where the level is not enough:
 *
 * - The level is decided by amplitude control (and, on Android 16+, the frequency
 *   profile). Primitive support is **not** part of it, so a `STANDARD_SUPPORT` device
 *   can still lack `VibrationEffect.Composition` primitives. Callers that render their
 *   own single-hit patterns can read `hasPrimitiveSupport` to pick a waveform fallback
 *   instead of composing primitives the vibrator will silently drop.
 * - `minControlPointDurationMillis` is the shortest control point the vendor's envelope
 *   implementation will honor, useful when authoring envelopes at runtime.
 *
 * Platform notes:
 * - **Android:** each field maps to the corresponding `Vibrator` query.
 * - **iOS:** Core Haptics exposes a single `supportsHaptics` capability and the Taptic
 *   Engine renders the full event set uniformly, so `hasAmplitudeControl`,
 *   `hasPrimitiveSupport` and `isEnvelopeSupported` all mirror it.
 *   `isFrequencyProfileSupported` is `false` (Core Haptics models sharpness rather than
 *   exposing a frequency profile) and `minControlPointDurationMillis` is `0`.
 */
export type HapticCapabilities = {
  /** Amplitude (intensity) control, rather than on/off buzzing only. */
  hasAmplitudeControl: boolean;
  /** `VibrationEffect.Composition` primitives. Android: requires API 30+. */
  hasPrimitiveSupport: boolean;
  /** Envelope effects. Android: requires API 36+. */
  isEnvelopeSupported: boolean;
  /** A vendor frequency profile is available. Android: requires API 36+. iOS: always false. */
  isFrequencyProfileSupported: boolean;
  /** Shortest envelope control point the device will honor, in ms. */
  minControlPointDurationMillis: number;
};
