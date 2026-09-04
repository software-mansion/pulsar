// React Native emitter — a typed module carrying patterns inline and statically requiring the
// `.pulsar` asset. Consumers import only this module; preset keys arise from its object literal.

import type { BundleManifest, DevicePattern, GenerateOptions, GeneratedFile, InlineLottie } from '../types.ts';
import { DO_NOT_EDIT, resolveAssetName } from './shared.ts';

/** Lets `createBundle` reject a stale file instead of silently playing nothing. */
export const SIDECAR_SCHEMA = 'pulsar.sidecar/1';

export interface PresetSidecarEntry {
  name: string;
  duration?: number;
  pattern: DevicePattern;
  /** How the preset was authored. `lottie` below holds the payload, when it can be carried. */
  audio: boolean;
  animation: boolean;
  lottie?: InlineLottie;
}

export interface BundleSidecar {
  schema: string;
  id: string;
  contentHash: string;
  revision?: number;
  presets: Record<string, PresetSidecarEntry>;
}

export function buildSidecar(
  manifest: BundleManifest,
  patterns: Record<string, DevicePattern>,
  animations: Record<string, InlineLottie> = {},
): BundleSidecar {
  const presets: Record<string, PresetSidecarEntry> = {};
  for (const p of manifest.presets) {
    const pattern = patterns[p.id];
    if (!pattern) {
      throw new Error(`rn target: no pattern for preset "${p.id}". Pass \`patterns\` from extractPatterns().`);
    }
    const entry: PresetSidecarEntry = {
      name: p.name,
      pattern,
      audio: !!p.audio,
      animation: !!p.animation,
    };
    if (p.duration !== undefined) entry.duration = p.duration;
    const lottie = animations[p.id];
    if (lottie) entry.lottie = lottie;
    presets[p.id] = entry;
  }
  const sidecar: BundleSidecar = {
    schema: SIDECAR_SCHEMA,
    id: manifest.id,
    contentHash: manifest.hash ?? '',
    presets,
  };
  if (manifest.revision !== undefined) sidecar.revision = manifest.revision;
  return sidecar;
}

export function emitRn(manifest: BundleManifest, opts: GenerateOptions = {}): GeneratedFile {
  const asset = resolveAssetName(manifest, opts);
  if (!opts.patterns) {
    throw new Error(
      'rn target requires `patterns` (the inlined haptics). Build them with ' +
        '`extractPatterns(manifest, entries)` from @swmansion/pulsar-gen.',
    );
  }
  const animations = opts.animations ?? {};
  const sidecar = buildSidecar(manifest, opts.patterns, animations);

  const warnings: string[] = [];
  const droppedAnimation = manifest.presets.filter((p) => p.animation && !animations[p.id]).map((p) => p.id);
  if (droppedAnimation.length > 0) {
    warnings.push(
      `presets ${droppedAnimation.join(', ')} have an animation that could not be inlined ` +
        '(dotLottie `.lottie` is binary — re-export the animation as .json, or use the .pulsar binary).',
    );
  }

  // Keep the payload minified: it ships inside the app's JS bundle.
  const serialized = JSON.stringify(sidecar);
  const definition = serialized.slice(0, -1) + `,"asset":require(${JSON.stringify(`./${asset}.pulsar`)})}`;
  return {
    filename: `${asset}.bundle.ts`,
    content:
      `// ${DO_NOT_EDIT}\n` +
      `// prettier-ignore\n` +
      `import { defineBundle } from 'react-native-pulsar';\n\n` +
      `// prettier-ignore\n` +
      `export const loadBundle = defineBundle(${definition});\n` +
      `// prettier-ignore\n` +
      `export type { PresetHandle } from 'react-native-pulsar';\n`,
    ...(warnings.length > 0 ? { warnings } : {}),
  };
}
