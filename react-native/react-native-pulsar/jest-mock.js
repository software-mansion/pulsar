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
