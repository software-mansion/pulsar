import { Image } from 'react-native';
import { defineBundle } from '../createBundle';
import Pulsar from '../NativeRNPulsar';

jest.mock('../NativeRNPulsar', () => ({
  __esModule: true,
  default: {
    PatternComposer_parsePattern: jest.fn(),
    PatternComposer_play: jest.fn(),
    PatternComposer_stop: jest.fn(),
    PatternComposer_release: jest.fn(),
    Pulsar_loadBundleFromUriSync: jest.fn(),
    Pulsar_loadBundleFromUri: jest.fn(),
    Pulsar_playBundlePreset: jest.fn(),
    Pulsar_stopBundlePreset: jest.fn(),
    Pulsar_disposeBundle: jest.fn(),
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

const definition = {
  schema: 'pulsar.sidecar/1',
  id: 'com.acme.haptics',
  contentHash: 'sha256-abc',
  asset: 42,
  presets: {
    heartbeatV2: {
      name: 'Heartbeat V2',
      duration: 1200,
      pattern: pattern(0.9),
      audio: false,
      animation: true,
      lottie: {
        source: { v: '5.7.4', fr: 30, ip: 0, op: 60 },
        frameRate: 30,
        totalFrames: 60,
      },
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
  native.Pulsar_loadBundleFromUriSync.mockReturnValue('com.acme.haptics#1');
  native.Pulsar_loadBundleFromUri.mockResolvedValue('com.acme.haptics#1');
  jest.spyOn(Image, 'resolveAssetSource').mockReturnValue({
    uri: 'file:///bundle.pulsar',
  } as never);
});

describe('defineBundle', () => {
  it('binds a definition without loading or parsing it', () => {
    const loaders = defineBundle(definition);

    expect(loaders.loadBundleSync).toEqual(expect.any(Function));
    expect(loaders.loadBundleAsync).toEqual(expect.any(Function));
    expect(native.Pulsar_loadBundleFromUriSync).not.toHaveBeenCalled();
    expect(native.Pulsar_loadBundleFromUri).not.toHaveBeenCalled();
    expect(native.PatternComposer_parsePattern).not.toHaveBeenCalled();
  });

  it('rejects a stale generated definition immediately', () => {
    expect(() =>
      defineBundle({ ...definition, schema: 'pulsar.sidecar/0' })
    ).toThrow(/pulsar-gen-rn/);
  });
});

describe('loadBundleSync', () => {
  it('defaults to the inline path and never reads the .pulsar asset', () => {
    const bundle = defineBundle(definition).loadBundleSync();

    expect(bundle).not.toHaveProperty('then');
    expect(Object.keys(bundle)).toEqual(['heartbeatV2', 'explosion']);
    expect(bundle.id).toBe('com.acme.haptics');
    expect(bundle.contentHash).toBe('sha256-abc');
    expect(Image.resolveAssetSource).not.toHaveBeenCalled();
    expect(native.Pulsar_loadBundleFromUriSync).not.toHaveBeenCalled();
  });

  it('parses each inline pattern once and plays it synchronously', () => {
    const bundle = defineBundle(definition).loadBundleSync(false);

    const firstResult: void = bundle.heartbeatV2.play();
    bundle.heartbeatV2.play();

    expect(firstResult).toBeUndefined();
    expect(native.PatternComposer_parsePattern).toHaveBeenCalledTimes(1);
    expect(native.PatternComposer_play).toHaveBeenCalledTimes(2);
    expect(native.PatternComposer_play).toHaveBeenLastCalledWith(100);
  });

  it('hands the seek to the native composer and re-parses only when it moves', () => {
    const bundle = defineBundle(definition).loadBundleSync(false);

    bundle.heartbeatV2.play();
    bundle.heartbeatV2.play(600);
    bundle.heartbeatV2.play(600);

    expect(native.PatternComposer_parsePattern).toHaveBeenCalledTimes(2);
    expect(native.PatternComposer_parsePattern).toHaveBeenNthCalledWith(
      1,
      definition.presets.heartbeatV2.pattern,
      0
    );
    expect(native.PatternComposer_parsePattern).toHaveBeenNthCalledWith(
      2,
      definition.presets.heartbeatV2.pattern,
      600
    );
    expect(native.PatternComposer_release).toHaveBeenCalledWith(100);
    expect(native.PatternComposer_play).toHaveBeenLastCalledWith(101);
  });

  it('exposes preset metadata and dynamic lookup', () => {
    const bundle = defineBundle(definition).loadBundleSync();

    expect(bundle.heartbeatV2.name).toBe('Heartbeat V2');
    expect(bundle.heartbeatV2.duration).toBe(1200);
    expect(bundle.heartbeatV2.animation?.frameRate).toBe(30);
    expect(bundle.explosion.hasAudio).toBe(true);
    expect(bundle.get('explosion')).toBe(bundle.explosion);
    expect(bundle.get('missing')).toBeUndefined();
  });

  it('reads the asset on the calling thread when includeAssets is true', () => {
    const bundle = defineBundle(definition).loadBundleSync(true);

    expect(bundle).not.toHaveProperty('then');
    expect(native.Pulsar_loadBundleFromUriSync).toHaveBeenCalledWith(
      'file:///bundle.pulsar'
    );

    bundle.explosion.play();
    expect(native.Pulsar_playBundlePreset).toHaveBeenCalledWith(
      'com.acme.haptics#1',
      'explosion',
      0
    );
    expect(native.PatternComposer_parsePattern).not.toHaveBeenCalled();
  });

  it('forwards a seek position to the native bundle', () => {
    const bundle = defineBundle(definition).loadBundleSync(true);

    bundle.explosion.play(750);
    expect(native.Pulsar_playBundlePreset).toHaveBeenLastCalledWith(
      'com.acme.haptics#1',
      'explosion',
      750
    );

    bundle.explosion.play(-1);
    expect(native.Pulsar_playBundlePreset).toHaveBeenLastCalledWith(
      'com.acme.haptics#1',
      'explosion',
      0
    );
  });

  it('throws when the native sync load fails', () => {
    native.Pulsar_loadBundleFromUriSync.mockReturnValue('');

    expect(() => defineBundle(definition).loadBundleSync(true)).toThrow(
      /failed to load bundle "com.acme.haptics"/
    );
  });
});

describe('loadBundleAsync', () => {
  it('loads the Metro URI before returning an asset-backed bundle', async () => {
    const pending = defineBundle(definition).loadBundleAsync();
    expect(pending).toHaveProperty('then');
    const bundle = await pending;

    expect(Image.resolveAssetSource).toHaveBeenCalledWith(42);
    expect(native.Pulsar_loadBundleFromUri).toHaveBeenCalledWith(
      'file:///bundle.pulsar'
    );

    const result: void = bundle.explosion.play();
    expect(result).toBeUndefined();
    expect(native.Pulsar_playBundlePreset).toHaveBeenCalledWith(
      'com.acme.haptics#1',
      'explosion',
      0
    );
  });

  it('still carries the inline pattern and animation for the Lottie view', async () => {
    const bundle = await defineBundle(definition).loadBundleAsync();

    expect(bundle.heartbeatV2.pattern).toEqual(
      definition.presets.heartbeatV2.pattern
    );
    expect(bundle.heartbeatV2.animation?.totalFrames).toBe(60);
  });

  it('rejects before returning when the asset cannot be resolved', async () => {
    jest.spyOn(Image, 'resolveAssetSource').mockReturnValue(undefined as never);

    await expect(
      defineBundle(definition).loadBundleAsync()
    ).rejects.toThrow(/withPulsar/);
  });

  it('forwards native URI loading failures', async () => {
    native.Pulsar_loadBundleFromUri.mockRejectedValueOnce(
      new Error('could not read asset')
    );

    await expect(
      defineBundle(definition).loadBundleAsync()
    ).rejects.toThrow('could not read asset');
  });
});

describe('dispose', () => {
  it('releases parsed inline patterns', () => {
    const bundle = defineBundle(definition).loadBundleSync();
    bundle.heartbeatV2.play();

    bundle.dispose();

    expect(native.PatternComposer_release).toHaveBeenCalledWith(100);
  });

  it('releases the native bundle exactly once', async () => {
    const bundle = await defineBundle(definition).loadBundleAsync();

    bundle.dispose();
    bundle.dispose();

    expect(native.Pulsar_disposeBundle).toHaveBeenCalledTimes(1);
    expect(native.Pulsar_disposeBundle).toHaveBeenCalledWith(
      'com.acme.haptics#1'
    );
  });

  it('leaves both paths inert afterwards', async () => {
    const inline = defineBundle(definition).loadBundleSync();
    const withAssets =
      await defineBundle(definition).loadBundleAsync();

    inline.dispose();
    withAssets.dispose();
    jest.clearAllMocks();
    jest.spyOn(console, 'warn').mockImplementation(() => {});

    inline.heartbeatV2.play();
    inline.heartbeatV2.stop();
    withAssets.explosion.play();
    withAssets.explosion.stop();

    expect(native.PatternComposer_parsePattern).not.toHaveBeenCalled();
    expect(native.PatternComposer_play).not.toHaveBeenCalled();
    expect(native.Pulsar_playBundlePreset).not.toHaveBeenCalled();
    expect(native.Pulsar_stopBundlePreset).not.toHaveBeenCalled();
  });
});
