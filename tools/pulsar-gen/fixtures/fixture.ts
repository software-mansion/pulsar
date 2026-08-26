// Builds the canonical test fixture bundle in-memory. Shared by build-fixture.ts and the tests.

import { writeZip, type ZipEntries } from '../src/zip.ts';
import { computeContentHash } from '../src/read.ts';
import type { BundleManifest, DevicePattern } from '../src/types.ts';

const enc = (s: string) => new TextEncoder().encode(s);
const jsonBytes = (v: unknown) => enc(JSON.stringify(v, null, 2) + '\n');

const heartbeat: DevicePattern = {
  continuousPattern: {
    amplitude: [
      { time: 0, value: 0 },
      { time: 10, value: 0.8 },
      { time: 120, value: 0 },
    ],
    frequency: [
      { time: 0, value: 0.2 },
      { time: 1000, value: 0.2 },
    ],
  },
  discretePattern: [
    { time: 0, amplitude: 0.9, frequency: 0.2 },
    { time: 120, amplitude: 0.6, frequency: 0.2 },
  ],
};

const explosion: DevicePattern = {
  continuousPattern: {
    amplitude: [
      { time: 0, value: 1 },
      { time: 200, value: 0 },
    ],
    frequency: [{ time: 0, value: 0.8 }],
  },
  discretePattern: [{ time: 0, amplitude: 1, frequency: 0.9 }],
};

export function buildFixtureBundle(): Uint8Array {
  const manifest: BundleManifest = {
    schema: 'pulsar.bundle/1',
    generator: 'pulsar-gen-fixture',
    id: 'com.acme.haptics',
    name: 'Acme Pack',
    revision: 7,
    presets: [
      {
        id: 'heartbeatV2',
        name: 'Heartbeat V2',
        duration: 1200,
        haptics: 'haptics/heartbeatV2.json',
        audio: { src: 'audio/boom.ogg', volume: 1, offset: 0 },
        animation: { src: 'animation/pulse.json', frameRate: 60, totalFrames: 72 },
      },
      {
        id: 'explosion',
        name: 'Explosion',
        duration: 800,
        haptics: 'haptics/explosion.json',
        audio: { src: 'audio/blast.wav' },
        // A dotLottie: binary, so the rn target cannot inline it — exercises the skip path.
        animation: { src: 'animation/legacy.lottie' },
      },
    ],
  };

  // Placeholder media payloads (real bundles carry actual audio / Lottie bytes).
  const entries: ZipEntries = {
    'haptics/heartbeatV2.json': jsonBytes(heartbeat),
    'haptics/explosion.json': jsonBytes(explosion),
    'audio/boom.ogg': enc('OggS-fixture-audio'),
    'audio/blast.wav': enc('RIFF-fixture-audio'),
    'animation/pulse.json': jsonBytes({ v: '5.7.4', fr: 60, ip: 0, op: 72, w: 100, h: 100, layers: [] }),
    'animation/legacy.lottie': enc('PK\u0003\u0004fixture-dotlottie'),
  };

  // Compute the content hash over everything EXCEPT the manifest's own hash, then embed it.
  const withoutHash: ZipEntries = { ...entries, 'manifest.json': jsonBytes(manifest) };
  manifest.hash = computeContentHash(withoutHash);
  entries['manifest.json'] = jsonBytes(manifest);

  return writeZip(entries);
}
