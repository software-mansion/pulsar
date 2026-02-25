const { mergeConfig } = require('@react-native/metro-config');
const { getDefaultConfig } = require('expo/metro-config');
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
  ],
  resolver: {
    extraNodeModules: {
      'react-native': path.resolve(__dirname, './node_modules/react-native'),
      react: path.resolve(__dirname, './node_modules/react'),
    },
    blockList: [
      // Prevent Metro from using react-native from library's node_modules
      /react-native\/react-native-pulsar\/node_modules\/react-native\/.*/,
      /react-native\/react-native-pulsar\/node_modules\/react\/.*/,
    ],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
