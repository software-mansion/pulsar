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
  native.Pulsar_loadBundleFromUri.mockResolvedValue('com.acme.haptics');
  jest.spyOn(Image, 'resolveAssetSource').mockReturnValue({
    uri: 'file:///bundle.pulsar',
  } as never);
});

describe('defineBundle', () => {
  it('binds a definition without loading or parsing it', () => {
    const loadBundle = defineBundle(definition);

    expect(loadBundle).toEqual(expect.any(Function));
    expect(native.Pulsar_loadBundleFromUri).not.toHaveBeenCalled();
    expect(native.PatternComposer_parsePattern).not.toHaveBeenCalled();
  });

  it('loads the inline path without reading the .pulsar asset', () => {
    const loadBundle = defineBundle(definition);
    const bundle = loadBundle({ withAssets: false });

    expect(bundle).not.toHaveProperty('then');
    expect(Object.keys(bundle)).toEqual(['heartbeatV2', 'explosion']);
    expect(bundle.id).toBe('com.acme.haptics');
    expect(bundle.contentHash).toBe('sha256-abc');
    expect(Image.resolveAssetSource).not.toHaveBeenCalled();
    expect(native.Pulsar_loadBundleFromUri).not.toHaveBeenCalled();
  });

  it('keeps inline play synchronous and parses each pattern once', () => {
    const bundle = defineBundle(definition)({ withAssets: false });

    const firstResult: void = bundle.heartbeatV2.play();
    const secondResult: void = bundle.heartbeatV2.play();

    expect(firstResult).toBeUndefined();
    expect(secondResult).toBeUndefined();
    expect(native.PatternComposer_parsePattern).toHaveBeenCalledTimes(1);
    expect(native.PatternComposer_play).toHaveBeenCalledTimes(2);
    expect(native.PatternComposer_play).toHaveBeenLastCalledWith(100);
  });

  it('exposes preset metadata and dynamic lookup', () => {
    const bundle = defineBundle(definition)({ withAssets: false });

    expect(bundle.heartbeatV2.name).toBe('Heartbeat V2');
    expect(bundle.heartbeatV2.duration).toBe(1200);
    expect(bundle.heartbeatV2.animation?.frameRate).toBe(30);
    expect(bundle.explosion.hasAudio).toBe(true);
    expect(bundle.get('explosion')).toBe(bundle.explosion);
    expect(bundle.get('missing')).toBeUndefined();
  });

  it('releases parsed inline patterns on dispose', () => {
    const bundle = defineBundle(definition)({ withAssets: false });
    bundle.heartbeatV2.play();

    bundle.dispose();

    expect(native.PatternComposer_release).toHaveBeenCalledWith(100);
  });

  it('loads the Metro URI before returning an asset-backed bundle', async () => {
    const pending = defineBundle(definition)({ withAssets: true });
    expect(pending).toHaveProperty('then');
    const bundle = await pending;

    expect(Image.resolveAssetSource).toHaveBeenCalledWith(42);
    expect(native.Pulsar_loadBundleFromUri).toHaveBeenCalledWith(
      'file:///bundle.pulsar'
    );

    const result: void = bundle.explosion.play();
    expect(result).toBeUndefined();
    expect(native.Pulsar_playBundlePreset).toHaveBeenCalledWith(
      'com.acme.haptics',
      'explosion'
    );
    expect(native.PatternComposer_parsePattern).not.toHaveBeenCalled();

    bundle.dispose();
    expect(native.Pulsar_disposeBundle).toHaveBeenCalledWith(
      'com.acme.haptics'
    );
  });

  it('rejects before returning when the asset cannot be resolved', async () => {
    jest.spyOn(Image, 'resolveAssetSource').mockReturnValue(undefined);

    await expect(
      defineBundle(definition)({ withAssets: true })
    ).rejects.toThrow(/withPulsar/);
  });

  it('forwards native URI loading failures', async () => {
    native.Pulsar_loadBundleFromUri.mockRejectedValueOnce(
      new Error('could not read asset')
    );

    await expect(
      defineBundle(definition)({ withAssets: true })
    ).rejects.toThrow('could not read asset');
  });

  it('rejects a stale generated definition immediately', () => {
    const stale = {
      ...definition,
      schema: 'pulsar.sidecar/0',
    };

    expect(() => defineBundle(stale)).toThrow(/pulsar-gen-rn/);
  });
});
