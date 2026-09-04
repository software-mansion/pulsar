const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { withPulsar } = require('react-native-pulsar/metro');
const path = require('path');

// Packages linked with `file:` live outside `projectRoot`, so Metro has to watch them directly.
const linkedPackages = {
  'react-native-pulsar': path.resolve(__dirname, '../react-native-pulsar'),
  'react-native-pulsar-lottie': path.resolve(__dirname, '../PulsarLottie'),
};

// Modules that must resolve to exactly one copy — the app's. Each linked package installs its own
// dev copies at its own versions, and picking one of those up breaks at runtime: worklets, for
// instance, compares the version of its JS against the version of the Babel plugin that compiled
// the app.
const sharedModules = [
  ...Object.keys(linkedPackages),
  'react',
  'react-native',
  'react-native-worklets',
  'react-native-reanimated',
  'lottie-react-native',
  'react-native-gesture-handler',
  'react-native-safe-area-context',
];

const isSharedModule = moduleName =>
  sharedModules.some(name => moduleName === name || moduleName.startsWith(`${name}/`));

/** @type {import('@react-native/metro-config').MetroConfig} */
const config = {
  projectRoot: __dirname,
  watchFolders: Object.values(linkedPackages),
  resolver: {
    // Keep the linked packages' own copies out of the graph entirely, so they are neither crawled
    // nor reachable by a relative path that sidesteps `resolveRequest`.
    blockList: Object.values(linkedPackages).flatMap(dir =>
      sharedModules.map(name => new RegExp(`^${escapeRegExp(path.join(dir, 'node_modules', name))}/`)),
    ),
    resolveRequest: (context, moduleName, platform) => {
      // Resolve shared modules as if the import came from the app root, whatever imported them.
      const origin = isSharedModule(moduleName)
        ? { ...context, originModulePath: path.join(__dirname, 'metro.config.js') }
        : context;
      return context.resolveRequest(origin, moduleName, platform);
    },
  },
};

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// `withPulsar` lets generated bundle modules statically require their `.pulsar` asset.
module.exports = withPulsar(mergeConfig(getDefaultConfig(__dirname), config));
