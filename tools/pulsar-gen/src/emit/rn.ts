// React Native emitter — a JSON sidecar. Types arise from `keyof` inference over this file
// (the nano-icons approach), so there is NO .d.ts / code generation here. Portable (no Node APIs).

import type { BundleManifest, GenerateOptions, GeneratedFile } from '../types.ts';
import { resolveAssetName } from './shared.ts';

export interface PresetSidecarEntry {
  name: string;
  duration?: number;
  audio: boolean;
  animation: boolean;
}

export interface BundleSidecar {
  id: string;
  contentHash: string;
  revision?: number;
  presets: Record<string, PresetSidecarEntry>;
}

export function buildSidecar(manifest: BundleManifest): BundleSidecar {
  const presets: Record<string, PresetSidecarEntry> = {};
  for (const p of manifest.presets) {
    const entry: PresetSidecarEntry = { name: p.name, audio: !!p.audio, animation: !!p.animation };
    if (p.duration !== undefined) entry.duration = p.duration;
    presets[p.id] = entry;
  }
  const sidecar: BundleSidecar = { id: manifest.id, contentHash: manifest.hash ?? '', presets };
  if (manifest.revision !== undefined) sidecar.revision = manifest.revision;
  return sidecar;
}

export function emitRn(manifest: BundleManifest, opts: GenerateOptions = {}): GeneratedFile {
  const asset = resolveAssetName(manifest, opts);
  return {
    filename: `${asset}.presets.json`,
    content: JSON.stringify(buildSidecar(manifest), null, 2) + '\n',
  };
}
