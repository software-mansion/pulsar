// Manifest validation (portable — no Node APIs).

import { SCHEMA_ID, type BundleManifest, type PresetEntry } from './types.ts';
import { assertValidPresetId } from './naming.ts';

function fail(msg: string): never {
  throw new Error(`Invalid Pulsar manifest: ${msg}`);
}

function asString(v: unknown, path: string): string {
  if (typeof v !== 'string' || v.length === 0) fail(`${path} must be a non-empty string`);
  return v as string;
}

export function validateManifest(input: unknown): BundleManifest {
  if (typeof input !== 'object' || input === null) fail('manifest must be an object');
  const m = input as Record<string, unknown>;

  if (m.schema !== SCHEMA_ID) fail(`schema must be "${SCHEMA_ID}" (got ${JSON.stringify(m.schema)})`);
  const id = asString(m.id, 'id');
  const name = asString(m.name, 'name');

  if (!Array.isArray(m.presets) || m.presets.length === 0) fail('presets must be a non-empty array');

  const seen = new Set<string>();
  const presets: PresetEntry[] = m.presets.map((raw, i) => {
    if (typeof raw !== 'object' || raw === null) fail(`presets[${i}] must be an object`);
    const p = raw as Record<string, unknown>;
    const pid = asString(p.id, `presets[${i}].id`);
    try {
      assertValidPresetId(pid);
    } catch (e) {
      fail(`presets[${i}].id — ${(e as Error).message}`);
    }
    if (seen.has(pid)) fail(`duplicate preset id "${pid}"`);
    seen.add(pid);

    const entry: PresetEntry = {
      id: pid,
      name: asString(p.name, `presets[${i}].name`),
      haptics: asString(p.haptics, `presets[${i}].haptics`),
    };
    if (p.duration !== undefined) entry.duration = Number(p.duration);
    if (p.audio !== undefined) {
      const a = p.audio as Record<string, unknown>;
      entry.audio = { src: asString(a.src, `presets[${i}].audio.src`) };
      if (a.volume !== undefined) entry.audio.volume = Number(a.volume);
      if (a.offset !== undefined) entry.audio.offset = Number(a.offset);
    }
    if (p.animation !== undefined) {
      const a = p.animation as Record<string, unknown>;
      entry.animation = { src: asString(a.src, `presets[${i}].animation.src`) };
      if (a.frameRate !== undefined) entry.animation.frameRate = Number(a.frameRate);
      if (a.totalFrames !== undefined) entry.animation.totalFrames = Number(a.totalFrames);
    }
    return entry;
  });

  const manifest: BundleManifest = { schema: SCHEMA_ID, id, name, presets };
  if (typeof m.generator === 'string') manifest.generator = m.generator;
  if (m.revision !== undefined) manifest.revision = Number(m.revision);
  if (typeof m.hash === 'string') manifest.hash = m.hash;
  return manifest;
}
