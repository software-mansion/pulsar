// Expo config plugin: regenerates `.presets.json` sidecars from `.pulsar` bundles on prebuild,
// so the typed `bundle.presets.<id>` view stays in sync automatically.
//
//   // app.json
//   { "expo": { "plugins": [["react-native-pulsar", { "bundleDirs": ["assets"] }]] } }

const path = require('node:path');
const { execFileSync } = require('node:child_process');

let withDangerousMod;
try {
  ({ withDangerousMod } = require('@expo/config-plugins'));
} catch {
  // @expo/config-plugins not installed (bare RN) — the plugin is a no-op; use the CLI instead.
}

module.exports = function withPulsarBundles(config, options = {}) {
  const bundleDirs = options.bundleDirs || ['assets'];
  if (!withDangerousMod) return config;

  return withDangerousMod(config, [
    'ios',
    (cfg) => {
      try {
        const script = path.join(__dirname, 'scripts', 'pulsar-gen-rn.mjs');
        execFileSync('node', [script, ...bundleDirs], {
          cwd: cfg.modRequest.projectRoot,
          stdio: 'inherit',
        });
      } catch (e) {
        console.warn('[react-native-pulsar] sidecar generation failed:', e.message);
      }
      return cfg;
    },
  ]);
};
