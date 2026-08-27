// Pulls preset payloads out of a bundle's zip entries. Portable — no Node APIs.

import type { BundleManifest, DevicePattern, InlineLottie } from './types.ts';

export type EntryMap = Record<string, Uint8Array>;

function assertDevicePattern(value: unknown, where: string): DevicePattern {
  const p = value as Partial<DevicePattern> | null;
  if (!p || typeof p !== 'object') throw new Error(`${where}: not a JSON object`);
  if (!Array.isArray(p.discretePattern)) {
    throw new Error(`${where}: missing "discretePattern" array`);
  }
  const c = p.continuousPattern;
  if (!c || !Array.isArray(c.amplitude) || !Array.isArray(c.frequency)) {
    throw new Error(`${where}: "continuousPattern" needs "amplitude" and "frequency" arrays`);
  }
  return p as DevicePattern;
}

export function extractPatterns(
  manifest: BundleManifest,
  entries: EntryMap,
): Record<string, DevicePattern> {
  const decoder = new TextDecoder();
  const out: Record<string, DevicePattern> = {};
  for (const preset of manifest.presets) {
    const bytes = entries[preset.haptics];
    if (!bytes) {
      throw new Error(
        `Bundle is missing "${preset.haptics}" (haptics payload for preset "${preset.id}")`,
      );
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(decoder.decode(bytes));
    } catch (e) {
      throw new Error(`${preset.haptics}: invalid JSON — ${(e as Error).message}`);
    }
    out[preset.id] = assertDevicePattern(parsed, preset.haptics);
  }
  return out;
}

/** A dotLottie is a zip of binary parts, so it cannot be inlined — those ids land in `skipped`. */
export function extractAnimations(
  manifest: BundleManifest,
  entries: EntryMap,
): { animations: Record<string, InlineLottie>; skipped: string[] } {
  const decoder = new TextDecoder();
  const animations: Record<string, InlineLottie> = {};
  const skipped: string[] = [];

  for (const preset of manifest.presets) {
    const ref = preset.animation;
    if (!ref) continue;

    if (!/\.json$/i.test(ref.src)) {
      skipped.push(preset.id);
      continue;
    }
    const bytes = entries[ref.src];
    if (!bytes) {
      throw new Error(
        `Bundle is missing "${ref.src}" (animation for preset "${preset.id}")`,
      );
    }
    let source: unknown;
    try {
      source = JSON.parse(decoder.decode(bytes));
    } catch (e) {
      throw new Error(`${ref.src}: invalid Lottie JSON — ${(e as Error).message}`);
    }
    const inline: InlineLottie = { source };
    if (ref.frameRate !== undefined) inline.frameRate = ref.frameRate;
    if (ref.totalFrames !== undefined) inline.totalFrames = ref.totalFrames;
    animations[preset.id] = inline;
  }

  return { animations, skipped };
}
