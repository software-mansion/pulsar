const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
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
    path.resolve(__dirname, '../react-native-pulsar'),
    path.resolve(__dirname, '../PulsarLottie'),
  ],
  resolver: {
    extraNodeModules: {
      'react-native': path.resolve(__dirname, './node_modules/react-native'),
      react: path.resolve(__dirname, './node_modules/react'),
      'react-native-reanimated': path.resolve(__dirname, './node_modules/react-native-reanimated'),
      'react-native-worklets': path.resolve(__dirname, './node_modules/react-native-worklets'),
      'lottie-react-native': path.resolve(__dirname, './node_modules/lottie-react-native'),
    },
    blockList: [
      // Prevent Metro from using react-native from a library's node_modules
      /react-native-pulsar\/node_modules\/react-native\/.*/,
      /react-native-pulsar\/node_modules\/react\/.*/,
      // ...and the same for the Lottie wrapper package.
      /PulsarLottie\/node_modules\/react-native\/.*/,
      /PulsarLottie\/node_modules\/react\/.*/,
      /PulsarLottie\/node_modules\/react-native-reanimated\/.*/,
      /PulsarLottie\/node_modules\/react-native-worklets\/.*/,
      /PulsarLottie\/node_modules\/lottie-react-native\/.*/,
      /PulsarLottie\/node_modules\/react-native-pulsar\/.*/,
    ],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
