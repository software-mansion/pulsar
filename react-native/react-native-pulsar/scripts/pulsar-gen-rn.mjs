#!/usr/bin/env node
// Generates a `<name>.presets.json` sidecar next to every `.pulsar` in a directory.
// The sidecar is what gives `bundle.presets.<id>` its autocomplete (keyof inference).
//
//   node scripts/pulsar-gen-rn.mjs <dir> [<dir> ...]     (default: ./assets)
//
// Self-contained (node:zlib only) so it needs no extra dependency in the app.

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, basename } from 'node:path';
import { inflateRawSync } from 'node:zlib';

function readManifest(bundlePath) {
  const buf = readFileSync(bundlePath);
  // Locate End Of Central Directory.
  let eocd = -1;
  for (let i = buf.length - 22; i >= 0; i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error(`${bundlePath}: not a zip`);
  let ptr = buf.readUInt32LE(eocd + 16);
  const count = buf.readUInt16LE(eocd + 10);
  for (let n = 0; n < count; n++) {
    const method = buf.readUInt16LE(ptr + 10);
    const compSize = buf.readUInt32LE(ptr + 20);
    const nameLen = buf.readUInt16LE(ptr + 28);
    const extraLen = buf.readUInt16LE(ptr + 30);
    const commentLen = buf.readUInt16LE(ptr + 32);
    const localOff = buf.readUInt32LE(ptr + 42);
    const name = buf.toString('utf8', ptr + 46, ptr + 46 + nameLen);
    if (name === 'manifest.json') {
      const lNameLen = buf.readUInt16LE(localOff + 26);
      const lExtraLen = buf.readUInt16LE(localOff + 28);
      const start = localOff + 30 + lNameLen + lExtraLen;
      const raw = buf.subarray(start, start + compSize);
      const bytes = method === 0 ? raw : inflateRawSync(raw);
      return JSON.parse(bytes.toString('utf8'));
    }
    ptr += 46 + nameLen + extraLen + commentLen;
  }
  throw new Error(`${bundlePath}: missing manifest.json`);
}

function buildSidecar(manifest) {
  const presets = {};
  for (const p of manifest.presets) {
    presets[p.id] = { name: p.name, audio: !!p.audio, animation: !!p.animation };
    if (p.duration !== undefined) presets[p.id].duration = p.duration;
  }
  const sidecar = { id: manifest.id, contentHash: manifest.hash ?? '', presets };
  if (manifest.revision !== undefined) sidecar.revision = manifest.revision;
  return sidecar;
}

const dirs = process.argv.slice(2);
if (dirs.length === 0) dirs.push('assets');

for (const dir of dirs) {
  for (const file of readdirSync(dir)) {
    if (!file.endsWith('.pulsar')) continue;
    const manifest = readManifest(join(dir, file));
    const out = join(dir, `${basename(file, '.pulsar')}.presets.json`);
    writeFileSync(out, JSON.stringify(buildSidecar(manifest), null, 2) + '\n');
    process.stderr.write(`pulsar-gen-rn: wrote ${out}\n`);
  }
}
