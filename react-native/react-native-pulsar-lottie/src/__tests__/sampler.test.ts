import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  clamp,
  lottieDurationMs,
  patternDurationMs,
  sampleEnvelope,
  type EnvelopePoint,
} from '../internal/sampler.ts';
import type { Pattern } from 'react-native-pulsar';

const env: EnvelopePoint[] = [
  { time: 0, value: 0 },
  { time: 400, value: 1 },
  { time: 800, value: 0 },
];

const near = (actual: number, expected: number, eps = 1e-9) =>
  assert.ok(
    Math.abs(actual - expected) <= eps,
    `expected ${actual} to be within ${eps} of ${expected}`
  );

describe('sampleEnvelope', () => {
  test('clamps to the first and last point outside the range', () => {
    assert.equal(sampleEnvelope(env, -50), 0);
    assert.equal(sampleEnvelope(env, 900), 0);
  });

  test('returns the value at an exact knot', () => {
    assert.equal(sampleEnvelope(env, 0), 0);
    assert.equal(sampleEnvelope(env, 400), 1);
    assert.equal(sampleEnvelope(env, 800), 0);
  });

  test('interpolates linearly between knots', () => {
    near(sampleEnvelope(env, 200), 0.5);
    near(sampleEnvelope(env, 600), 0.5);
    near(sampleEnvelope(env, 100), 0.25);
  });

  test('an empty curve is silent', () => {
    assert.equal(sampleEnvelope([], 123), 0);
  });

  test('a single point holds its value everywhere', () => {
    const flat = [{ time: 500, value: 0.7 }];
    assert.equal(sampleEnvelope(flat, 0), 0.7);
    assert.equal(sampleEnvelope(flat, 500), 0.7);
    assert.equal(sampleEnvelope(flat, 10_000), 0.7);
  });

  test('a zero-width span takes the later value instead of dividing by zero', () => {
    const step: EnvelopePoint[] = [
      { time: 0, value: 0 },
      { time: 400, value: 0.2 },
      { time: 400, value: 0.9 },
      { time: 800, value: 1 },
    ];
    assert.equal(sampleEnvelope(step, 400), 0.2);
    near(sampleEnvelope(step, 600), 0.95);
  });
});

describe('clamp', () => {
  test('bounds a value into the range', () => {
    assert.equal(clamp(-1, 0, 1), 0);
    assert.equal(clamp(5, 0, 1), 1);
    assert.equal(clamp(0.4, 0, 1), 0.4);
  });

  test('the bounds themselves pass through', () => {
    assert.equal(clamp(0, 0, 1), 0);
    assert.equal(clamp(1, 0, 1), 1);
  });
});

describe('patternDurationMs', () => {
  const pattern = (over: Partial<Pattern> = {}): Pattern =>
    ({
      continuousPattern: {
        amplitude: [
          { time: 0, value: 0 },
          { time: 800, value: 1 },
        ],
        frequency: [
          { time: 0, value: 0.3 },
          { time: 600, value: 0.8 },
        ],
      },
      discretePattern: [{ time: 250, amplitude: 1, frequency: 0.5 }],
      ...over,
    }) as Pattern;

  test('is the largest timestamp across every channel', () => {
    assert.equal(patternDurationMs(pattern()), 800);
  });

  test('a late transient can be the longest channel', () => {
    assert.equal(
      patternDurationMs(
        pattern({ discretePattern: [{ time: 1200, amplitude: 1, frequency: 0.5 }] })
      ),
      1200
    );
  });

  test('an empty pattern has no length', () => {
    assert.equal(
      patternDurationMs({
        continuousPattern: { amplitude: [], frequency: [] },
        discretePattern: [],
      } as unknown as Pattern),
      0
    );
  });
});

describe('lottieDurationMs', () => {
  test('reads fr/ip/op out of an inline Lottie document', () => {
    assert.equal(lottieDurationMs({ v: '5.7.4', fr: 30, ip: 0, op: 60 }), 2000);
  });

  test('honours a non-zero in-point', () => {
    assert.equal(lottieDurationMs({ fr: 30, ip: 30, op: 60 }), 1000);
  });

  test('a missing in-point counts from zero', () => {
    assert.equal(lottieDurationMs({ fr: 60, op: 60 }), 1000);
  });

  test('gives up on a source it cannot read', () => {
    assert.equal(lottieDurationMs(undefined), undefined);
    assert.equal(lottieDurationMs(42), undefined);
    assert.equal(lottieDurationMs({ uri: 'https://example.com/a.json' }), undefined);
    assert.equal(lottieDurationMs({ fr: 30 }), undefined);
  });

  test('treats a zero frame rate as the 30fps default', () => {
    assert.equal(lottieDurationMs({ fr: 0, op: 60 }), 2000);
  });

  test('rejects a document whose timeline makes no sense', () => {
    assert.equal(lottieDurationMs({ fr: 30, ip: 60, op: 60 }), undefined);
    assert.equal(lottieDurationMs({ fr: 30, ip: 90, op: 60 }), undefined);
  });
});
