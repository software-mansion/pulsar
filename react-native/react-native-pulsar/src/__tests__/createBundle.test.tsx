import { createBundle, createBundleFromAsset } from '../createBundle';
import Pulsar from '../NativeRNPulsar';

jest.mock('../NativeRNPulsar', () => ({
  __esModule: true,
  default: {
    PatternComposer_parsePattern: jest.fn(),
    PatternComposer_play: jest.fn(),
    PatternComposer_stop: jest.fn(),
    PatternComposer_release: jest.fn(),
  },
}));

const native = Pulsar as jest.Mocked<typeof Pulsar>;

const pattern = (amplitude: number) => ({
  continuousPattern: {
    amplitude: [{ time: 0, value: amplitude }],
    frequency: [{ time: 0, value: 0.5 }],
  },
  discretePattern: [{ time: 0, amplitude, frequency: 0.5 }],
});

const sidecar = {
  schema: 'pulsar.sidecar/1',
  id: 'com.acme.haptics',
  contentHash: 'sha256-abc',
  presets: {
    heartbeatV2: {
      name: 'Heartbeat V2',
      duration: 1200,
      pattern: pattern(0.9),
      audio: false,
      animation: true,
      lottie: { source: { v: '5.7.4', fr: 30, ip: 0, op: 60 }, frameRate: 30, totalFrames: 60 },
    },
    explosion: {
      name: 'Explosion',
      pattern: pattern(1),
      audio: true,
      animation: false,
    },
  },
};

beforeEach(() => {
  jest.clearAllMocks();
  let next = 100;
  native.PatternComposer_parsePattern.mockImplementation(() => next++);
});

describe('createBundle', () => {
  it('exposes one handle per sidecar preset without touching native', () => {
    const bundle = createBundle(sidecar);

    // Metadata is non-enumerable, so iterating a bundle yields exactly the preset ids.
    expect(Object.keys(bundle)).toEqual(['heartbeatV2', 'explosion']);
    expect(bundle.id).toBe('com.acme.haptics');
    expect(bundle.contentHash).toBe('sha256-abc');
    // Construction is free — nothing is parsed until a preset is actually played.
    expect(native.PatternComposer_parsePattern).not.toHaveBeenCalled();
  });

  it('parses a pattern on first play and reuses it after', () => {
    const bundle = createBundle(sidecar);

    bundle.heartbeatV2.play();
    bundle.heartbeatV2.play();

    expect(native.PatternComposer_parsePattern).toHaveBeenCalledTimes(1);
    expect(native.PatternComposer_parsePattern).toHaveBeenCalledWith(
      sidecar.presets.heartbeatV2.pattern
    );
    expect(native.PatternComposer_play).toHaveBeenCalledTimes(2);
    expect(native.PatternComposer_play).toHaveBeenLastCalledWith(100);
  });

  it('gives each preset its own pattern id', () => {
    const bundle = createBundle(sidecar);

    bundle.heartbeatV2.play();
    bundle.explosion.play();

    expect(native.PatternComposer_play).toHaveBeenNthCalledWith(1, 100);
    expect(native.PatternComposer_play).toHaveBeenNthCalledWith(2, 101);
  });

  it('ignores stop() on a preset that was never played', () => {
    const bundle = createBundle(sidecar);

    bundle.explosion.stop();

    expect(native.PatternComposer_stop).not.toHaveBeenCalled();
    expect(native.PatternComposer_parsePattern).not.toHaveBeenCalled();
  });

  it('releases every parsed pattern on dispose, once', () => {
    const bundle = createBundle(sidecar);
    bundle.heartbeatV2.play();
    bundle.explosion.play();

    bundle.dispose();
    bundle.dispose();

    expect(native.PatternComposer_release).toHaveBeenCalledTimes(2);
    expect(native.PatternComposer_release).toHaveBeenCalledWith(100);
    expect(native.PatternComposer_release).toHaveBeenCalledWith(101);
  });

  it('re-parses after dispose so a reused bundle does not play a released pattern', () => {
    const bundle = createBundle(sidecar);
    bundle.heartbeatV2.play();
    bundle.dispose();

    bundle.heartbeatV2.play();

    expect(native.PatternComposer_parsePattern).toHaveBeenCalledTimes(2);
    expect(native.PatternComposer_play).toHaveBeenLastCalledWith(101);
  });

  it('resolves presets dynamically through get()', () => {
    const bundle = createBundle(sidecar);

    expect(bundle.get('explosion')?.id).toBe('explosion');
    expect(bundle.get('nope')).toBeUndefined();
  });

  it('carries the Lottie for a preset whose animation is inlined', () => {
    const bundle = createBundle(sidecar);

    expect(bundle.heartbeatV2.animation?.source).toEqual({ v: '5.7.4', fr: 30, ip: 0, op: 60 });
    expect(bundle.heartbeatV2.animation?.frameRate).toBe(30);
    expect(bundle.heartbeatV2.animation?.totalFrames).toBe(60);
  });

  it('exposes the raw pattern, name and duration for callers driving playback themselves', () => {
    const bundle = createBundle(sidecar);

    expect(bundle.heartbeatV2.pattern).toBe(sidecar.presets.heartbeatV2.pattern);
    expect(bundle.heartbeatV2.name).toBe('Heartbeat V2');
    expect(bundle.heartbeatV2.duration).toBe(1200);
    expect(bundle.explosion.duration).toBeUndefined();
  });

  it('reports which presets carry media the inline path cannot play', () => {
    const bundle = createBundle(sidecar);

    expect(bundle.heartbeatV2.hasAudio).toBe(false);
    expect(bundle.heartbeatV2.hasAnimation).toBe(true);
    // explosion has no animation at all, so neither the flag nor the payload is set.
    expect(bundle.explosion.hasAnimation).toBe(false);
    expect(bundle.explosion.animation).toBeUndefined();
    // explosion was authored with a sound; on this path only its haptics fire.
    expect(bundle.explosion.hasAudio).toBe(true);
    expect(bundle.explosion.hasAnimation).toBe(false);
  });

  it('keeps bundle members reachable alongside the presets', () => {
    const bundle = createBundle(sidecar);

    expect(typeof bundle.dispose).toBe('function');
    expect(typeof bundle.get).toBe('function');
    expect(bundle.contentHash).toBe('sha256-abc');
    // ...and a preset never collides with them: pulsar-gen reserves these ids.
    expect(bundle.heartbeatV2.id).toBe('heartbeatV2');
  });

  it('rejects a sidecar from the pre-inline format instead of silently playing nothing', () => {
    const stale = {
      id: 'com.acme.haptics',
      contentHash: '',
      presets: {},
    } as never;

    expect(() => createBundle(stale)).toThrow(/pulsar-gen-rn/);
    expect(() => createBundleFromAsset(stale, 1)).toThrow(/pulsar\.sidecar\/1/);
  });
});

describe('createBundleFromAsset', () => {
  it('binds the sidecar ids to the asset for loadBundle', () => {
    const descriptor = createBundleFromAsset(sidecar, 42);

    expect(descriptor.asset).toBe(42);
    expect(descriptor.bundleId).toBe('com.acme.haptics');
    expect(descriptor.presetIds).toEqual(['heartbeatV2', 'explosion']);
    expect(descriptor.media.explosion).toEqual({
      name: 'Explosion',
      duration: undefined,
      audio: true,
      animation: false,
    });
  });
});
