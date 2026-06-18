/**
 * Ready-to-use Jest mock for `react-native-pulsar`.
 *
 * `react-native-pulsar` is backed by a TurboModule, so importing it inside a
 * Jest environment throws (`TurboModuleRegistry.getEnforcing('RNPulsar')`
 * cannot find the native module, and the hooks rely on `react-native-worklets`).
 * This mock replaces the whole public API with no-op `jest.fn()`s so tests that
 * render components using Pulsar can run on Node without a device.
 *
 * Usage (see the React Native SDK docs for details):
 *
 *   jest.mock('react-native-pulsar', () =>
 *     require('react-native-pulsar/jest-mock')
 *   );
 *
 * or globally, from a Jest `setupFiles` entry:
 *
 *   jest.mock('react-native-pulsar', () =>
 *     require('react-native-pulsar/jest-mock')
 *   );
 */

// Enums are real values (mirrors src/NativeRNPulsar.ts) so comparisons keep
// working in tests.
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

/**
 * Builds a deeply nested mock that is both callable and traversable. Every leaf
 * is a stable `jest.fn()`, and intermediate nodes (e.g. `Presets.System`) are
 * proxies, so any path you reach is a `jest.fn()` you can assert on:
 *
 *   Presets.System.impactLight();
 *   expect(Presets.System.impactLight).toHaveBeenCalled();
 *
 * Children are cached per path, so repeated access returns the same mock.
 */
function createDeepMock() {
  const cache = new Map();
  const target = jest.fn();
  return new Proxy(target, {
    get(fn, prop) {
      if (prop === '__isPulsarMock') {
        return true;
      }
      // `received.calls` is how Jest sniffs for a Jasmine spy. A jest.fn() has
      // no `calls` of its own, so without this guard the catch-all below would
      // hand back a truthy callable and Jest would mis-detect every leaf as a
      // spy, breaking matchers like `toHaveBeenCalledTimes`.
      if (prop === 'calls') {
        return undefined;
      }
      // Preserve jest.fn() internals (mock, mockReturnValue, _isMockFunction, …)
      // and symbol access (e.g. Symbol.iterator) so the leaf behaves like a fn.
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

// `Presets` has 150+ nested entries; the deep mock covers all of them without
// having to enumerate every preset name.
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
  start: jest.fn(),
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

module.exports = {
  __esModule: true,
  Presets,
  Settings,
  useRealtimeComposer,
  usePatternComposer,
  useAdaptiveHaptics,
  HapticSupport,
  RealtimeComposerStrategy,
};
