import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { readZip, writeZip } from '../src/zip.ts';
import { readBundleBytes, computeContentHash } from '../src/read.ts';
import { validateManifest } from '../src/validate.ts';
import { generate } from '../src/generate.ts';
import { extractPatterns, extractAnimations } from '../src/patterns.ts';
import { buildSidecar, SIDECAR_SCHEMA } from '../src/emit/rn.ts';
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
        presets: [
          { id: 'ok', name: 'A', haptics: 'a.json' },
          { id: 'ok', name: 'B', haptics: 'b.json' },
        ],
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
  const { manifest, entries } = readBundleBytes(buildFixtureBundle());
  const patterns = extractPatterns(manifest, entries);
  const { animations } = extractAnimations(manifest, entries);
  assert.equal(generate(manifest, 'swift', { assetName: 'acme-pack' }).content, golden('AcmePack.swift'));
  assert.equal(generate(manifest, 'kotlin', { assetName: 'acme-pack' }).content, golden('AcmePack.kt'));
  assert.equal(generate(manifest, 'dart', { assetName: 'acme-pack' }).content, golden('acme_pack.bundle.dart'));
  assert.equal(
    generate(manifest, 'rn', { assetName: 'acme-pack', patterns, animations }).content,
    golden('acme-pack.bundle.ts'),
  );
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

test('rn definition keys are the preset ids (source of keyof inference)', () => {
  const { manifest, entries } = readBundleBytes(buildFixtureBundle());
  const sidecar = buildSidecar(manifest, extractPatterns(manifest, entries));
  assert.equal(sidecar.schema, SIDECAR_SCHEMA);
  assert.deepEqual(Object.keys(sidecar.presets), ['heartbeatV2', 'explosion']);
  assert.equal(sidecar.presets.heartbeatV2.name, 'Heartbeat V2');
  assert.equal(sidecar.presets.heartbeatV2.duration, 1200);
});

test('rn definition inlines the device patterns verbatim', () => {
  const { manifest, entries } = readBundleBytes(buildFixtureBundle());
  const patterns = extractPatterns(manifest, entries);
  const sidecar = buildSidecar(manifest, patterns);

  // The inlined payload is byte-for-byte what the .pulsar carries — the app hands it straight
  // to the native pattern composer, so any drift here is a silently wrong haptic.
  const onDisk = JSON.parse(new TextDecoder().decode(entries['haptics/heartbeatV2.json']!));
  assert.deepEqual(sidecar.presets.heartbeatV2.pattern, onDisk);
  assert.equal(sidecar.presets.explosion.pattern.discretePattern[0]?.amplitude, 1);
});

test('rn definition inlines a JSON Lottie and skips a binary dotLottie', () => {
  const { manifest, entries } = readBundleBytes(buildFixtureBundle());
  const { animations, skipped } = extractAnimations(manifest, entries);

  // heartbeatV2 -> animation/pulse.json (inlinable); explosion -> .lottie (a zip, so not).
  assert.deepEqual(Object.keys(animations), ['heartbeatV2']);
  assert.deepEqual(skipped, ['explosion']);
  assert.equal(animations.heartbeatV2?.frameRate, 60);
  assert.equal(animations.heartbeatV2?.totalFrames, 72);
  assert.equal((animations.heartbeatV2?.source as { fr: number }).fr, 60);

  const sidecar = buildSidecar(manifest, extractPatterns(manifest, entries), animations);
  assert.ok(sidecar.presets.heartbeatV2.lottie, 'JSON animation should be carried in JS');
  assert.equal(sidecar.presets.explosion.lottie, undefined);
  // Both are still flagged as *authored* with an animation — the flag and the payload differ.
  assert.equal(sidecar.presets.explosion.animation, true);
});

test('rn emitter warns about an un-inlinable animation', () => {
  const { manifest, entries } = readBundleBytes(buildFixtureBundle());
  const file = generate(manifest, 'rn', {
    patterns: extractPatterns(manifest, entries),
    animations: extractAnimations(manifest, entries).animations,
  });
  const warnings = file.warnings ?? [];

  assert.equal(warnings.length, 1);
  assert.match(warnings[0]!, /explosion.*could not be inlined/s);
  // heartbeatV2's animation WAS inlined, so it must not be reported as dropped.
  assert.doesNotMatch(warnings[0]!, /heartbeatV2/);
});

test('extractAnimations fails loudly when a manifest points at a missing animation', () => {
  const { manifest, entries } = readBundleBytes(buildFixtureBundle());
  const without = { ...entries };
  delete without['animation/pulse.json'];
  assert.throws(() => extractAnimations(manifest, without), /missing "animation\/pulse\.json"/);
});

test('rn emitter refuses to emit a definition with no patterns', () => {
  const { manifest } = readBundleBytes(buildFixtureBundle());
  assert.throws(() => generate(manifest, 'rn', { assetName: 'acme-pack' }), /requires `patterns`/);
});

// react-native-pulsar ships a standalone copy of this emitter (zero-dependency, so apps can run it
// without installing pulsar-gen). A drift between the two is silent, so pin them together.
test('the standalone react-native-pulsar generator emits the identical module', (t) => {
  const script = join(here, '..', '..', '..', 'react-native', 'react-native-pulsar', 'scripts', 'pulsar-gen-rn.mjs');
  if (!existsSync(script)) return t.skip('react-native-pulsar not checked out alongside');

  const dir = mkdtempSync(join(tmpdir(), 'pulsar-gen-'));
  writeFileSync(join(dir, 'acme-pack.pulsar'), buildFixtureBundle());
  execFileSync(process.execPath, [script, dir], { stdio: 'pipe' });

  assert.equal(readFileSync(join(dir, 'acme-pack.bundle.ts'), 'utf8'), golden('acme-pack.bundle.ts'));
});

test('extractPatterns rejects a bundle whose haptics payload is missing or malformed', () => {
  const { manifest, entries } = readBundleBytes(buildFixtureBundle());
  const without = { ...entries };
  delete without['haptics/explosion.json'];
  assert.throws(() => extractPatterns(manifest, without), /missing "haptics\/explosion\.json"/);

  const malformed = {
    ...entries,
    'haptics/explosion.json': new TextEncoder().encode('{"a":1}'),
  };
  assert.throws(() => extractPatterns(manifest, malformed), /discretePattern/);
});
