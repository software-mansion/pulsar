module.exports = function (api) {
  api.cache(true);

  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-compiler',
      // Keep reanimated plugin last.
      'react-native-reanimated/plugin',
    ],
  };
};
