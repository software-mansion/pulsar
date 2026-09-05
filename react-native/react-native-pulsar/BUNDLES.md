# Preset bundles (React Native)

Generate one typed module from a `.pulsar` bundle, import it, then choose whether to
load the binary assets. Preset names autocomplete and unknown names are TypeScript errors.

## Setup

Generate a `*.bundle.ts` module next to every `.pulsar` file:

```bash
npx pulsar-gen-rn assets
```

The generated module embeds haptic patterns and JSON Lottie animations. It also contains
a static `require('./name.pulsar')`, so the application does not import the binary separately.
Do not edit generated modules.

Expo can regenerate them on every prebuild:

```json
{
  "expo": { "plugins": [["react-native-pulsar", { "bundleDirs": ["assets"] }]] }
}
```

Register the binary extension with Metro once:

```js
// metro.config.js
const { getDefaultConfig } = require('@react-native/metro-config');
const { withPulsar } = require('react-native-pulsar/metro');
module.exports = withPulsar(getDefaultConfig(__dirname));
```

## Usage

The generated file is the only Pulsar bundle import the application needs:

```ts
import { loadBundle } from './assets/hapticsBundle.bundle';

const Haptics = loadBundle({ withAssets: false });

Haptics.fanfare.play();
Haptics.fanfare.stop();
Haptics.get(someRuntimeId)?.play();
```

`withAssets: false` is synchronous. It does not read the `.pulsar` binary. Each haptic
pattern is parsed lazily on its first `play()`. Authored audio is not played.

To include authored audio, load the same generated module with assets:

```ts
const Haptics = await loadBundle({ withAssets: true });

Haptics.fanfare.play(); // still synchronous after the load
```

`withAssets: true` returns a `Promise`. It resolves the Metro asset URI and native code
reads the `.pulsar` file before the promise settles. The binary no longer travels through
JavaScript as base64. After that, `play()` is synchronous in both modes.

## Presets and animations

Each preset handle carries `id`, `name`, `duration`, `play()`, `stop()`, the raw `pattern`,
and media metadata:

```ts
Haptics.fanfare.hasAudio;
Haptics.fanfare.hasAnimation;
Haptics.fanfare.animation;
```

`play()` does not render animations. A JSON Lottie is embedded in the generated module and
can be passed to `react-native-pulsar-lottie`:

```tsx
import { HapticLottieView } from 'react-native-pulsar-lottie';

<HapticLottieView preset={Haptics.celebration} autoPlay />;
```

A binary dotLottie (`.lottie`) cannot be embedded in TypeScript; codegen warns and leaves
`animation` undefined while preserving `hasAnimation: true`.

The bundle metadata members `id`, `contentHash`, `get`, and `dispose` are non-enumerable.
Therefore `Object.values(Haptics)` contains only preset handles.

Call `dispose()` when a loaded bundle is no longer needed. Re-run `pulsar-gen-rn` after
every Studio export so the generated module, content hash, and `.pulsar` asset stay in sync.
