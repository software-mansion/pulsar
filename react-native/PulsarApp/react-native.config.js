const path = require('path');

module.exports = {
  project: {
    ios: {
      automaticPodsInstallation: true,
    },
  },
  dependencies: {
    'react-native-pulsar': {
      root: path.join(__dirname, '../react-native-pulsar'),
      platforms: {
        ios: {},
        android: {},
      },
    },
  },
};
