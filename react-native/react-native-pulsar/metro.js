// Metro helper: register `.pulsar` as an asset so `require('./x.pulsar')` resolves.
//
//   // metro.config.js
//   const { withPulsar } = require('react-native-pulsar/metro');
//   module.exports = withPulsar(getDefaultConfig(__dirname));

function withPulsar(config) {
  config.resolver = config.resolver || {};
  const assetExts = config.resolver.assetExts || [];
  if (!assetExts.includes('pulsar')) {
    config.resolver.assetExts = [...assetExts, 'pulsar'];
  }
  return config;
}

module.exports = { withPulsar };
