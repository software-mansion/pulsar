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

/** A Lottie carried inside a generated view, for targets that render it in JS. */
export interface InlineLottie {
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
  /** Kotlin only. KMP must set `com.swmansion.pulsar.kmp.bundle`; Android uses the default. */
  runtimePackage?: string;
  /** From `extractPatterns`. Required by `rn`, ignored by the others. */
  patterns?: Record<string, DevicePattern>;
  /** From `extractAnimations`. Inlined by `rn`, ignored by the others. */
  animations?: Record<string, InlineLottie>;
}

export interface GeneratedFile {
  filename: string;
  content: string;
  /** Non-fatal notes for the caller to surface. */
  warnings?: string[];
}
