export {};

// Settings is a thin wrapper over the Turbo Module, so the mock stands in for the
// native side and the assertions cover the mapping.
const mockNative = {
  Pulsar_hapticSupport: jest.fn(() => 2),
  Pulsar_hasAmplitudeControl: jest.fn(() => true),
  Pulsar_hasPrimitiveSupport: jest.fn(() => false),
  Pulsar_isEnvelopeSupported: jest.fn(() => false),
  Pulsar_isFrequencyProfileSupported: jest.fn(() => false),
  Pulsar_minControlPointDurationMillis: jest.fn(() => 35),
  Pulsar_enableHaptics: jest.fn(),
  Pulsar_enableSound: jest.fn(),
  Pulsar_enableCache: jest.fn(),
  Pulsar_clearCache: jest.fn(),
  Pulsar_preloadPresets: jest.fn(),
  Pulsar_stopHaptics: jest.fn(),
  Pulsar_shutDownEngine: jest.fn(),
  Pulsar_forceHapticsSupportLevel: jest.fn(),
  Pulsar_enableImpulseCompositionMode: jest.fn(),
  Pulsar_setRealtimeComposerStrategy: jest.fn(),
};

jest.mock('../NativeRNPulsar', () => ({
  __esModule: true,
  default: mockNative,
  HapticSupport: {
    NO_SUPPORT: 0,
    LIMITED_SUPPORT: 1,
    STANDARD_SUPPORT: 2,
    ADVANCED_SUPPORT: 3,
  },
  RealtimeComposerStrategy: {
    ENVELOPE: 0,
    PRIMITIVE_TICK: 1,
    PRIMITIVE_COMPLEX: 2,
    ENVELOPE_WITH_DISCRETE_PRIMITIVES: 3,
  },
}));

const Settings = require('../Settings').default;

describe('Settings.getHapticCapabilities', () => {
  it('maps every capability from its native getter', () => {
    expect(Settings.getHapticCapabilities()).toEqual({
      hasAmplitudeControl: true,
      hasPrimitiveSupport: false,
      isEnvelopeSupported: false,
      isFrequencyProfileSupported: false,
      minControlPointDurationMillis: 35,
    });
  });

  // The support level is decided by amplitude control, so it cannot answer the
  // primitive question on its own — that is the reason these flags are exposed.
  it('reports missing primitives on a device the level calls STANDARD_SUPPORT', () => {
    expect(Settings.getHapticsSupportLevel()).toBe(2);
    expect(Settings.getHapticCapabilities().hasPrimitiveSupport).toBe(false);
  });
});
