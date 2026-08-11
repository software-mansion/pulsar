# Preset bundles (React Native)

Load a `.pulsar` bundle authored in Pulsar Studio at runtime and play its presets with full
autocomplete — no `.d.ts` codegen. See [`docs/bundle-format.md`](../../docs/bundle-format.md).

## Setup

1. Register `.pulsar` as a metro asset:

   ```js
   // metro.config.js
   const { getDefaultConfig } = require('@react-native/metro-config');
   const { withPulsar } = require('react-native-pulsar/metro');
   module.exports = withPulsar(getDefaultConfig(__dirname));
   ```

2. Generate the `.presets.json` sidecar (the source of the types). Either add the Expo plugin
   (regenerates on prebuild) or run the CLI:

   ```bash
   npx pulsar-gen-rn assets        # scans ./assets for *.pulsar
   ```

   Expo:
   ```json
   { "expo": { "plugins": [["react-native-pulsar", { "bundleDirs": ["assets"] }]] } }
   ```

## Usage

```ts
import sidecar from './assets/acme-pack.presets.json';
import { createBundle, loadBundle } from 'react-native-pulsar';

const AcmePack = createBundle(sidecar, require('./assets/acme-pack.pulsar'));

const bundle = await loadBundle(AcmePack);
bundle.presets.heartbeatV2.play();   // ← autocompletes; unknown ids are a compile error
bundle.presets.explosion.stop();
```

Types come from `keyof` inference over the imported sidecar (the nano-icons approach). Rename a
preset and re-export, and any stale reference fails at compile time; the bundle's content hash also
guards against a stale sidecar at load.

Animation: the SDK carries and time-aligns Lottie bytes; render them in your own
`lottie-react-native` view (expose via a future `bundle.presets.x.animation` accessor).
