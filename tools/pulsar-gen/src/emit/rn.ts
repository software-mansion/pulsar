// React Native emitter — a self-contained JSON sidecar. It carries the device patterns inline, so
// the app imports one JSON and needs no `.pulsar` binary asset (and therefore no Metro assetExts
// entry and no async load). Types arise from `keyof` inference over the imported file (the
// nano-icons approach), so there is NO .d.ts / code generation here. Portable (no Node APIs).

import type {
  BundleManifest,
  DevicePattern,
  GenerateOptions,
  GeneratedFile,
  InlineLottie,
} from '../types.ts';
import { resolveAssetName } from './shared.ts';

/** Sidecar format tag, so a stale file fails loudly in `createBundle` instead of silently. */
export const SIDECAR_SCHEMA = 'pulsar.sidecar/1';

export interface PresetSidecarEntry {
  name: string;
  duration?: number;
  /** The device wire pattern, inlined — what the app hands to the native pattern composer. */
  pattern: DevicePattern;
  /**
   * True when the source preset was authored with audio / animation. Audio is consumed natively
   * and always stays in the `.pulsar`; animation is rendered in JS and is inlined below whenever
   * it is a JSON Lottie.
   */
  audio: boolean;
  animation: boolean;
  /** The inlined Lottie, present when `animation` is true and the source was JSON. */
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
      throw new Error(
        `rn target: no pattern for preset "${p.id}". Pass \`patterns\` from extractPatterns().`,
      );
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
  const withAudio = manifest.presets.filter((p) => p.audio).map((p) => p.id);
  if (withAudio.length > 0) {
    warnings.push(
      `presets ${withAudio.join(', ')} carry audio, which is played natively and cannot be inlined — ` +
        'they will play haptics only. Load the .pulsar binary (loadBundle) if you need the sound.',
    );
  }
  const droppedAnimation = manifest.presets
    .filter((p) => p.animation && !animations[p.id])
    .map((p) => p.id);
  if (droppedAnimation.length > 0) {
    warnings.push(
      `presets ${droppedAnimation.join(', ')} have an animation that could not be inlined ` +
        '(dotLottie `.lottie` is binary — re-export the animation as .json, or use the .pulsar binary).',
    );
  }

  // Minified on purpose: this file ships inside the app's JS bundle (same call as nano-icons'
  // glyphmaps). It is generated, so nobody reads the diff.
  return {
    filename: `${asset}.bundle.json`,
    content: JSON.stringify(sidecar) + '\n',
    ...(warnings.length > 0 ? { warnings } : {}),
  };
}
