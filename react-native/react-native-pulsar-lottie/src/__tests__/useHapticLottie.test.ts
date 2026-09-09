import { test, describe, beforeEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';

/**
 * Records what the hook asks of `react-native-pulsar`, standing in for the native
 * pattern composer. Registered as a module mock before the hook is imported.
 */
const composer = {
  parsed: [] as unknown[],
  plays: 0,
  stops: 0,
  ready: true,
  isParsed() {
    return this.ready;
  },
  play() {
    this.plays += 1;
  },
  stop() {
    this.stops += 1;
  },
  reset(ready = true) {
    this.parsed = [];
    this.plays = 0;
    this.stops = 0;
    this.ready = ready;
  },
};

// React needs to know it is inside an act() scope before anything renders.
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

mock.module('react-native-pulsar', {
  exports: {
    usePatternComposer(pattern: unknown) {
      composer.parsed.push(pattern);
      return composer;
    },
  },
});

const { useHapticLottie } = await import('../useHapticLottie.ts');
const TestRenderer = (await import('react-test-renderer')).default;

type Options = Parameters<typeof useHapticLottie>[0];
type Handle = ReturnType<typeof useHapticLottie>;
type Preset = NonNullable<Options['preset']>;

/** Renders the hook once and hands back its result. */
function renderHook(options: Options): Handle {
  let handle: Handle | undefined;
  function Probe() {
    handle = useHapticLottie(options);
    return null;
  }
  TestRenderer.act(() => {
    TestRenderer.create(createElement(Probe));
  });
  return handle!;
}

const pattern = {
  continuousPattern: {
    amplitude: [{ time: 0, value: 1 }],
    frequency: [{ time: 0, value: 0.5 }],
  },
  discretePattern: [{ time: 0, amplitude: 1, frequency: 0.5 }],
};

/** The hook's `Pattern` type lives in the native package; the shape above is enough. */
const asHaptics = (p: object) => p as NonNullable<Options['haptics']>;

/** A generated bundle preset, as the hook sees it. */
function preset(over: Record<string, unknown> = {}) {
  const played: string[] = [];
  return Object.assign(
    {
      id: 'celebration',
      name: 'Celebration',
      duration: 1500,
      pattern,
      hasAudio: false,
      hasAnimation: true,
      play: () => played.push('play'),
      stop: () => played.push('stop'),
      calls: played,
      ...over,
    },
    {}
  ) as unknown as Preset & { calls: string[] };
}

describe('useHapticLottie', () => {
  beforeEach(() => composer.reset());

  test("plays the preset's pattern through the composer", () => {
    const handle = renderHook({ preset: preset() });

    assert.equal(composer.parsed[0], pattern, 'the pattern is pre-parsed, warming the engine');
    assert.equal(handle.isReady, true);

    handle.play();
    handle.stop();

    assert.equal(composer.plays, 1);
    assert.equal(composer.stops, 1);
  });

  test('explicit haptics win over the preset', () => {
    const own = asHaptics({ ...pattern });
    renderHook({ preset: preset(), haptics: own });

    assert.equal(composer.parsed[0], own);
  });

  test('a preset with audio plays itself, so its audio plays too', () => {
    const p = preset({ hasAudio: true });
    const handle = renderHook({ preset: p });

    handle.play();
    handle.stop();

    assert.deepEqual(p.calls, ['play', 'stop']);
    assert.equal(composer.plays, 0, 'the preset owns the pattern natively');
    assert.equal(composer.parsed[0], undefined, 'nothing is re-parsed in JS');
    assert.equal(handle.isReady, true, 'a preset source is always ready');
  });

  test('explicit haptics keep an audio preset from playing itself', () => {
    const p = preset({ hasAudio: true });
    const handle = renderHook({ preset: p, haptics: asHaptics(pattern) });

    handle.play();
    handle.stop();

    assert.deepEqual(p.calls, []);
    assert.equal(composer.plays, 1);
    assert.equal(composer.stops, 1);
  });

  test('a preset trigger function is simply called', () => {
    let fired = 0;
    const handle = renderHook({ haptics: () => (fired += 1) });

    assert.equal(handle.isReady, true);

    handle.play();
    handle.stop();

    assert.equal(fired, 1);
    assert.equal(composer.plays, 0, 'a trigger has no buffered pattern to stop');
  });

  test('a pattern that is not parsed yet does not fire', () => {
    composer.reset(false);
    const handle = renderHook({ haptics: asHaptics(pattern) });

    assert.equal(handle.isReady, false);

    handle.play();

    assert.equal(composer.plays, 0);
  });

  test('hapticsEnabled: false silences play but still allows stop', () => {
    const handle = renderHook({ haptics: asHaptics(pattern), hapticsEnabled: false });

    handle.play();
    assert.equal(composer.plays, 0);

    handle.stop();
    assert.equal(composer.stops, 1, 'stopping is always safe');
  });

  test('with nothing to play at all the handle is inert', () => {
    const handle = renderHook({});

    handle.play();
    handle.stop();

    assert.equal(composer.plays, 0);
    assert.equal(composer.stops, 0);
    assert.equal(handle.isReady, true);
  });
});
