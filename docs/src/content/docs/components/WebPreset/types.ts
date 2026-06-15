/**
 * Structural shape of a single web haptic segment as it appears in the generated
 * preset JSON. Kept permissive (`type: string`) so importing the JSON modules type-
 * checks without fighting the library's discriminated union — the pattern is cast to
 * `HapticPattern` from pulsar-haptics at the playback boundary.
 */
export type WebHapticSegment = {
  type: string;
  timestamp: number;
  duration: number;
  intensity?: number;
  frequency?: number;
};

/**
 * Shape of a generated web preset JSON (see web/Pulsar/scripts/generate-presets.ts).
 * Unlike the mobile presets, web presets carry a raw `pattern` of segments rather
 * than continuous/discrete envelopes.
 */
export type WebPatternData = {
  name: string;
  description: string;
  tags: string[];
  duration: number;
  pattern: WebHapticSegment[];
};

export type WebPresetConfig = {
  image: ImageMetadata;
  data: WebPatternData;
};
