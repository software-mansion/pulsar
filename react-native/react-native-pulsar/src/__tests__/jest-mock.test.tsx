// Exercises the shipped Jest mock (../../jest-mock.js). Consumers wire it up via
// `jest.mock('react-native-pulsar', () => require('react-native-pulsar/jest-mock'))`;
// here we require it directly since we are inside the package.
jest.mock('react-native-pulsar', () => require('../../jest-mock'), {
  virtual: true,
});

const {
  Presets,
  Settings,
  useRealtimeComposer,
  usePatternComposer,
  useAdaptiveHaptics,
  HapticSupport,
  RealtimeComposerStrategy,
} = require('react-native-pulsar');

describe('react-native-pulsar/jest-mock', () => {
  it('exposes Presets as deeply nested, callable, assertable mocks', () => {
    Presets.System.impactLight();
    Presets.System.Android.effectClick();

    expect(Presets.System.impactLight).toHaveBeenCalledTimes(1);
    expect(Presets.System.Android.effectClick).toHaveBeenCalledTimes(1);
    // Same reference on repeated access (children are cached).
    expect(Presets.System.impactLight).toBe(Presets.System.impactLight);
  });

  it('mocks every Settings method and returns a real support level', () => {
    Settings.enableHaptics(true);
    expect(Settings.enableHaptics).toHaveBeenCalledWith(true);
    expect(Settings.getHapticsSupportLevel()).toBe(HapticSupport.ADVANCED_SUPPORT);
  });

  it('mocks the hooks and the composers they return', () => {
    const realtime = useRealtimeComposer();
    realtime.start();
    realtime.set(1, 200);
    expect(realtime.start).toHaveBeenCalled();
    expect(realtime.set).toHaveBeenCalledWith(1, 200);
    expect(realtime.isActive()).toBe(false);

    const pattern = usePatternComposer();
    pattern.play();
    expect(pattern.play).toHaveBeenCalled();
    expect(pattern.isParsed()).toBe(false);

    const adaptive = useAdaptiveHaptics({ ios: () => {}, android: () => {} });
    adaptive.play();
    expect(adaptive.play).toHaveBeenCalled();
  });

  it('exposes the enums with the correct values', () => {
    expect(HapticSupport.NO_SUPPORT).toBe(0);
    expect(HapticSupport.ADVANCED_SUPPORT).toBe(3);
    expect(RealtimeComposerStrategy.ENVELOPE).toBe(0);
    expect(RealtimeComposerStrategy.ENVELOPE_WITH_DISCRETE_PRIMITIVES).toBe(3);
  });
});
