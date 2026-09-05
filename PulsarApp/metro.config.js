const { mergeConfig } = require('@react-native/metro-config');
const { getSentryExpoConfig } = require('@sentry/react-native/metro');
const path = require('path');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  projectRoot: __dirname,
  watchFolders: [
    path.resolve(__dirname, '../react-native/react-native-pulsar'),
    path.resolve(__dirname, '../react-native/react-native-pulsar-lottie'),
  ],
  resolver: {
    extraNodeModules: {
      'react-native': path.resolve(__dirname, './node_modules/react-native'),
      react: path.resolve(__dirname, './node_modules/react'),
      'react-native-worklets': path.resolve(__dirname, './node_modules/react-native-worklets'),
      'react-native-reanimated': path.resolve(__dirname, './node_modules/react-native-reanimated'),
      'lottie-react-native': path.resolve(__dirname, './node_modules/lottie-react-native'),
      'react-native-pulsar': path.resolve(__dirname, './node_modules/react-native-pulsar'),
    },
    blockList: [
      // Prevent Metro from using react-native from library's node_modules
      /react-native\/react-native-pulsar\/node_modules\/react-native\/.*/,
      /react-native\/react-native-pulsar\/node_modules\/react\/.*/,
      /react-native\/react-native-pulsar\/node_modules\/react-native-worklets\/.*/,
      // ...and the same for the Lottie wrapper package.
      /react-native\/react-native-pulsar-lottie\/node_modules\/react-native\/.*/,
      /react-native\/react-native-pulsar-lottie\/node_modules\/react\/.*/,
      /react-native\/react-native-pulsar-lottie\/node_modules\/react-native-worklets\/.*/,
      /react-native\/react-native-pulsar-lottie\/node_modules\/react-native-reanimated\/.*/,
      /react-native\/react-native-pulsar-lottie\/node_modules\/lottie-react-native\/.*/,
      /react-native\/react-native-pulsar-lottie\/node_modules\/react-native-pulsar\/.*/,
    ],
  },
};

module.exports = mergeConfig(getSentryExpoConfig(__dirname), config);
