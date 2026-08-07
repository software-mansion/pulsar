/**
 * A short authored sound played in sync with a haptic pattern.
 *
 * Platform notes:
 * - iOS: `uri` must resolve to a **local** file (absolute path, `file://`, or a
 *   resource bundled in the app). It is registered as a Core Haptics audio event,
 *   so audio and haptics share the engine clock (sample-accurate). Remote URLs
 *   are not supported.
 * - Android: `uri` is a path, `file://` uri, or the name of a resource in
 *   `res/raw`. Provide an `.ogg` with baked haptic channels for perfect,
 *   audio-coupled sync on supported devices. Any other format (`.wav`/`.mp3`),
 *   or a device without coupled-haptics support, automatically falls back to
 *   playing the audio while the pattern's own haptics fire in parallel.
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
