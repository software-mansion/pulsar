import { test, mock } from 'node:test';
import assert from 'node:assert/strict';
import { resolvePreset } from '../internal/resolvePreset.ts';
import type { HapticLottieProps } from '../types.ts';

const pattern = {
  continuousPattern: { amplitude: [{ time: 0, value: 1 }], frequency: [{ time: 0, value: 0.5 }] },
  discretePattern: [{ time: 0, amplitude: 1, frequency: 0.5 }],
};

const lottie = { v: '5.7.4', fr: 30, ip: 0, op: 60 };

/** A generated bundle preset. `id` must be unique per test — warnings fire once per id. */
function preset(id: string, over: Record<string, unknown> = {}) {
  return {
    id,
    name: id,
    duration: 1500,
    pattern,
    animation: { source: lottie, frameRate: 30, totalFrames: 60 },
    hasAudio: false,
    hasAnimation: true,
    play: () => {},
    stop: () => {},
    ...over,
  } as unknown as NonNullable<HapticLottieProps['preset']>;
}

test('a preset supplies source, haptics and duration', () => {
  const out = resolvePreset({ preset: preset('a') } as HapticLottieProps);

  assert.equal(out?.source, lottie);
  assert.equal(out?.haptics, pattern);
  assert.equal(out?.durationMs, 1500);
});

test('explicit props win over the preset', () => {
  const ownSource = { v: 'own' };
  const out = resolvePreset({
    preset: preset('b'),
    source: ownSource,
    durationMs: 99,
  } as unknown as HapticLottieProps);

  assert.equal(out?.source, ownSource);
  assert.equal(out?.durationMs, 99);
  // haptics still come from the preset — each half is overridable on its own.
  assert.equal(out?.haptics, pattern);
});

test('props pass through untouched when there is no preset', () => {
  const props = { source: lottie, haptics: pattern } as unknown as HapticLottieProps;
  assert.equal(resolvePreset(props), props);
});

test('a binary-path preset falls back to its own play trigger', () => {
  const p = preset('c', { pattern: undefined });
  const out = resolvePreset({ preset: p, source: lottie } as unknown as HapticLottieProps);

  assert.equal(out?.haptics, p.play);
});

test('renders nothing and warns when the animation is not carried in JS', () => {
  const warn = mock.method(console, 'warn', () => {});

  const out = resolvePreset({ preset: preset('d', { animation: undefined }) } as HapticLottieProps);

  assert.equal(out, null);
  assert.equal(warn.mock.calls.length, 1);
  assert.match(String(warn.mock.calls[0]?.arguments[0]), /not carried in JS/);
  warn.mock.restore();
});

test('warns differently for a preset that simply has no animation, and only once', () => {
  const warn = mock.method(console, 'warn', () => {});
  const p = preset('e', { animation: undefined, hasAnimation: false });

  assert.equal(resolvePreset({ preset: p } as HapticLottieProps), null);
  assert.equal(resolvePreset({ preset: p } as HapticLottieProps), null);

  assert.equal(warn.mock.calls.length, 1, 'a re-render must not spam the console');
  assert.match(String(warn.mock.calls[0]?.arguments[0]), /has no animation/);
  warn.mock.restore();
});
