// Canonical Pulsar bundle manifest types (portable — no Node APIs).
// Mirrors tools/schema/pulsar.bundle-1.schema.json and docs/bundle-format.md.

export const SCHEMA_ID = 'pulsar.bundle/1';

export interface AudioRef {
  src: string;
  volume?: number;
  offset?: number;
}

export interface AnimationRef {
  src: string;
  frameRate?: number;
  totalFrames?: number;
}

export interface PresetEntry {
  /** Code-safe identifier; becomes `bundle.presets.<id>`. */
  id: string;
  /** Human label. */
  name: string;
  /** Optional duration hint, ms. */
  duration?: number;
  /** Path within the zip to the DevicePattern JSON. */
  haptics: string;
  audio?: AudioRef;
  animation?: AnimationRef;
}

export interface BundleManifest {
  schema: string;
  generator?: string;
  /** Reverse-DNS bundle identity. */
  id: string;
  /** Human label; drives the generated type name. */
  name: string;
  revision?: number;
  /** Content hash (e.g. "sha256-…"); embedded in generated descriptors for drift protection. */
  hash?: string;
  presets: PresetEntry[];
}

/** A single haptics payload (device wire shape). */
export interface DevicePattern {
  continuousPattern: {
    amplitude: Array<{ time: number; value: number }>;
    frequency: Array<{ time: number; value: number }>;
  };
  discretePattern: Array<{ time: number; amplitude: number; frequency: number }>;
}

/** A Lottie animation carried inside a generated view (the `rn` target renders it in JS). */
export interface InlineLottie {
  /** The parsed Lottie JSON — handed straight to `lottie-react-native`'s `source`. */
  source: unknown;
  frameRate?: number;
  totalFrames?: number;
}

export type Target = 'swift' | 'kotlin' | 'dart' | 'rn';

export interface GenerateOptions {
  /** Bundle file name without extension, e.g. "acme-pack". Defaults from manifest.id. */
  assetName?: string;
  /** Kotlin package / Dart notice; ignored by other targets. */
  packageName?: string;
  /**
   * Kotlin only: the package the Pulsar bundle runtime lives in. The Android SDK uses the default;
   * the KMP SDK is `com.swmansion.pulsar.kmp.bundle`, so a KMP consumer must set this.
   */
  runtimePackage?: string;
  /**
   * Preset id → device pattern, from `extractPatterns`. **Required by the `rn` target**, which
   * inlines the patterns into its sidecar so the app needs no binary asset; ignored by the others.
   */
  patterns?: Record<string, DevicePattern>;
  /**
   * Preset id → Lottie animation, from `extractAnimations`. Optional; the `rn` target inlines
   * these so the app can render them without shipping the `.pulsar`. Ignored by other targets.
   */
  animations?: Record<string, InlineLottie>;
}

export interface GeneratedFile {
  filename: string;
  content: string;
  /** Non-fatal notes for the caller to surface (e.g. media a target cannot carry). */
  warnings?: string[];
}
