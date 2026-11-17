/* eslint-env jest */
require('react-native-gesture-handler/jestSetup');

jest.mock('react-native-pulsar', () => require('react-native-pulsar/jest-mock'));

jest.mock('react-native-worklets', () => ({ runOnUI: fn => fn }));

jest.mock('react-native-reanimated', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: { View, createAnimatedComponent: component => component },
    useSharedValue: value => ({ value }),
    useAnimatedStyle: factory => factory(),
    runOnJS: fn => fn,
  };
});

jest.mock('react-native/Libraries/TurboModule/TurboModuleRegistry', () => {
  const actual = jest.requireActual(
    'react-native/Libraries/TurboModule/TurboModuleRegistry',
  );
  const pulsarModule = new Proxy({}, { get: () => jest.fn() });
  return {
    ...actual,
    getEnforcing: name =>
      name === 'RNPulsar' ? pulsarModule : actual.getEnforcing(name),
  };
});

jest.mock('react-native-pulsar-lottie', () => {
  const { View } = require('react-native');
  return {
    HapticLottieView: View,
    useHapticLottie: () => ({}),
  };
});
