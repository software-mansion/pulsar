import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { readZip, writeZip } from '../src/zip.ts';
import { readBundleBytes, computeContentHash } from '../src/read.ts';
import { validateManifest } from '../src/validate.ts';
import { generate } from '../src/generate.ts';
import { buildSidecar } from '../src/emit/rn.ts';
import { buildFixtureBundle } from '../fixtures/fixture.ts';

const here = dirname(fileURLToPath(import.meta.url));
const goldenDir = join(here, '..', 'fixtures', 'golden');
const golden = (name: string) => readFileSync(join(goldenDir, name), 'utf8');

test('zip round-trips STORE and DEFLATE entries', () => {
  const entries = {
    'a.txt': new TextEncoder().encode('hi'),
    'nested/big.json': new TextEncoder().encode('x'.repeat(5000)), // compressible → DEFLATE
  };
  const round = readZip(writeZip(entries));
  assert.equal(new TextDecoder().decode(round['a.txt']), 'hi');
  assert.equal(new TextDecoder().decode(round['nested/big.json']), 'x'.repeat(5000));
});

test('readBundleBytes parses + validates the fixture manifest', () => {
  const { manifest, entries } = readBundleBytes(buildFixtureBundle());
  assert.equal(manifest.id, 'com.acme.haptics');
  assert.equal(manifest.name, 'Acme Pack');
  assert.deepEqual(
    manifest.presets.map((p) => p.id),
    ['heartbeatV2', 'explosion'],
  );
  assert.ok(manifest.hash?.startsWith('sha256-'));
  assert.ok(entries['haptics/heartbeatV2.json']);
  assert.ok(entries['audio/boom.ogg']);
});

test('content hash is deterministic and excludes the manifest hash field', () => {
  const a = readBundleBytes(buildFixtureBundle());
  const b = readBundleBytes(buildFixtureBundle());
  assert.equal(a.manifest.hash, b.manifest.hash);

  // Recomputing over the same entries (hash field stripped internally) reproduces it.
  assert.equal(computeContentHash(a.entries), a.manifest.hash);
});

test('validateManifest rejects malformed manifests', () => {
  assert.throws(() => validateManifest({ schema: 'wrong', id: 'x', name: 'y', presets: [] }), /schema/);
  assert.throws(
    () =>
      validateManifest({
        schema: 'pulsar.bundle/1',
        id: 'x',
        name: 'y',
        presets: [{ id: 'ok', name: 'A', haptics: 'a.json' }, { id: 'ok', name: 'B', haptics: 'b.json' }],
      }),
    /duplicate/,
  );
  assert.throws(
    () =>
      validateManifest({
        schema: 'pulsar.bundle/1',
        id: 'x',
        name: 'y',
        presets: [{ id: '1bad', name: 'A', haptics: 'a.json' }],
      }),
    /Invalid preset id/,
  );
  assert.throws(
    () =>
      validateManifest({
        schema: 'pulsar.bundle/1',
        id: 'x',
        name: 'y',
        presets: [{ id: 'class', name: 'A', haptics: 'a.json' }],
      }),
    /reserved/,
  );
});

test('emitters match committed goldens', () => {
  const { manifest } = readBundleBytes(buildFixtureBundle());
  assert.equal(generate(manifest, 'swift', { assetName: 'acme-pack' }).content, golden('AcmePack.swift'));
  assert.equal(generate(manifest, 'kotlin', { assetName: 'acme-pack' }).content, golden('AcmePack.kt'));
  assert.equal(generate(manifest, 'dart', { assetName: 'acme-pack' }).content, golden('acme_pack.bundle.dart'));
  assert.equal(generate(manifest, 'rn', { assetName: 'acme-pack' }).content, golden('acme-pack.presets.json'));
});

test('swift/kotlin/dart typed views expose both preset ids', () => {
  const { manifest } = readBundleBytes(buildFixtureBundle());
  for (const target of ['swift', 'kotlin', 'dart'] as const) {
    const out = generate(manifest, target, { assetName: 'acme-pack' }).content;
    assert.match(out, /heartbeatV2/);
    assert.match(out, /explosion/);
    assert.match(out, /com\.acme\.haptics/);
  }
});

test('rn sidecar keys are the preset ids (source of keyof inference)', () => {
  const { manifest } = readBundleBytes(buildFixtureBundle());
  const sidecar = buildSidecar(manifest);
  assert.deepEqual(Object.keys(sidecar.presets), ['heartbeatV2', 'explosion']);
  assert.equal(sidecar.presets.heartbeatV2.animation, true);
  assert.equal(sidecar.presets.explosion.animation, false);
});
