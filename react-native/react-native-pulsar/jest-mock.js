/**
 * Ready-to-use Jest mock for `react-native-pulsar`. Replaces the whole public
 * API with no-op `jest.fn()`s so tests can run on Node without a native module.
 *
 *   jest.mock('react-native-pulsar', () =>
 *     require('react-native-pulsar/jest-mock')
 *   );
 */

const HapticSupport = {
  NO_SUPPORT: 0,
  LIMITED_SUPPORT: 1,
  STANDARD_SUPPORT: 2,
  ADVANCED_SUPPORT: 3,
};

const RealtimeComposerStrategy = {
  ENVELOPE: 0,
  PRIMITIVE_TICK: 1,
  PRIMITIVE_COMPLEX: 2,
  ENVELOPE_WITH_DISCRETE_PRIMITIVES: 3,
};

// Deeply nested mock: every leaf (at any depth, e.g. Presets.System.impactLight)
// is a stable jest.fn(), so any preset path is callable and assertable.
function createDeepMock() {
  const cache = new Map();
  const target = jest.fn();
  return new Proxy(target, {
    get(fn, prop) {
      // Jest sniffs `received.calls.all` to detect a Jasmine spy; without this
      // the catch-all would return a truthy callable and break matchers like
      // toHaveBeenCalledTimes.
      if (prop === 'calls') {
        return undefined;
      }
      if (typeof prop === 'symbol' || prop in fn) {
        return fn[prop];
      }
      if (!cache.has(prop)) {
        cache.set(prop, createDeepMock());
      }
      return cache.get(prop);
    },
  });
}

const Presets = createDeepMock();

const Settings = {
  enableHaptics: jest.fn(),
  enableSound: jest.fn(),
  enableCache: jest.fn(),
  clearCache: jest.fn(),
  preloadPresets: jest.fn(),
  stopHaptics: jest.fn(),
  shutDownEngine: jest.fn(),
  getHapticsSupportLevel: jest.fn(() => HapticSupport.ADVANCED_SUPPORT),
  forceHapticsSupportLevel: jest.fn(),
  enableImpulseCompositionMode: jest.fn(),
  setRealtimeComposerStrategy: jest.fn(),
};

const useRealtimeComposer = jest.fn(() => ({
  set: jest.fn(),
  playDiscrete: jest.fn(),
  stop: jest.fn(),
  isActive: jest.fn(() => false),
}));

const usePatternComposer = jest.fn(() => ({
  play: jest.fn(),
  stop: jest.fn(),
  parse: jest.fn(),
  isParsed: jest.fn(() => false),
}));

const useAdaptiveHaptics = jest.fn(() => ({
  play: jest.fn(),
}));

// Mirrors the real bundle: presets are direct members (non-enumerable metadata alongside), so a
// test asserting on `bundle.someId.play` fails the same way it would in the app if that preset is
// gone.
function mockBundle(sidecar) {
  const presets = {};
  for (const [id, preset] of Object.entries(sidecar?.presets ?? {})) {
    presets[id] = {
      id,
      hasAudio: !!preset?.audio,
      hasAnimation: !!preset?.animation,
      play: jest.fn(),
      stop: jest.fn(),
    };
  }
  return Object.defineProperties(presets, {
    id: { value: sidecar?.id ?? '', enumerable: false },
    contentHash: { value: sidecar?.contentHash ?? '', enumerable: false },
    get: { value: jest.fn((id) => presets[id]), enumerable: false },
    dispose: { value: jest.fn(), enumerable: false },
  });
}

const createBundle = jest.fn(mockBundle);
const createBundleFromAsset = jest.fn((sidecar, asset) => ({
  asset,
  bundleId: sidecar?.id ?? '',
  contentHash: sidecar?.contentHash ?? '',
  presetIds: Object.keys(sidecar?.presets ?? {}),
  media: Object.fromEntries(
    Object.entries(sidecar?.presets ?? {}).map(([id, p]) => [
      id,
      { audio: !!p?.audio, animation: !!p?.animation },
    ])
  ),
  __sidecar: sidecar,
}));
const loadBundle = jest.fn(async (descriptor) =>
  mockBundle(descriptor?.__sidecar)
);

module.exports = {
  __esModule: true,
  Presets,
  Settings,
  useRealtimeComposer,
  usePatternComposer,
  useAdaptiveHaptics,
  createBundle,
  createBundleFromAsset,
  loadBundle,
  HapticSupport,
  RealtimeComposerStrategy,
};
