// Node-only: read a .pulsar file from disk and pull out its validated manifest.

import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { readZip, type ZipEntries } from './zip.ts';
import { validateManifest } from './validate.ts';
import type { BundleManifest } from './types.ts';

const MANIFEST = 'manifest.json';

export interface ReadBundleResult {
  manifest: BundleManifest;
  entries: ZipEntries;
}

export function readBundleBytes(data: Uint8Array): ReadBundleResult {
  const entries = readZip(data);
  const manifestBytes = entries[MANIFEST];
  if (!manifestBytes) throw new Error(`Bundle is missing ${MANIFEST}`);
  const manifest = validateManifest(JSON.parse(Buffer.from(manifestBytes).toString('utf8')));
  return { manifest, entries };
}

export function readBundleFile(path: string): ReadBundleResult {
  return readBundleBytes(readFileSync(path));
}

function sha256Hex(bytes: Uint8Array): string {
  return createHash('sha256').update(bytes).digest('hex');
}

/** Recursively key-sorted JSON — deterministic across generators. */
export function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  if (value && typeof value === 'object') {
    const keys = Object.keys(value as Record<string, unknown>).sort();
    return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify((value as Record<string, unknown>)[k])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

/**
 * Deterministic content hash over a bundle's entries. The `hash` field of manifest.json is
 * excluded (it is what we are computing). Documented in docs/bundle-format.md so Studio and the
 * SDKs can reproduce it. Returns e.g. "sha256-ab12…".
 */
export function computeContentHash(entries: ZipEntries): string {
  const lines: string[] = [];
  for (const name of Object.keys(entries).sort()) {
    let bytes = entries[name];
    if (name === MANIFEST) {
      const obj = JSON.parse(Buffer.from(bytes).toString('utf8')) as Record<string, unknown>;
      delete obj.hash;
      bytes = new TextEncoder().encode(stableStringify(obj));
    }
    lines.push(`${name}\n${sha256Hex(bytes)}`);
  }
  return 'sha256-' + sha256Hex(new TextEncoder().encode(lines.join('\n')));
}
