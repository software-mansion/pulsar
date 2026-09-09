# Preset bundles (React Native)

Generate one typed module from a `.pulsar` bundle, import it, then choose whether to
load the binary assets. Preset names autocomplete and unknown names are TypeScript errors.

## Setup

Generate a `*.bundle.ts` module next to every `.pulsar` file:

```bash
npx pulsar-gen-rn assets
```

The generated module embeds haptic patterns and JSON Lottie animations. It also contains a
static `require('./name.pulsar')`, so the application does not import the binary separately —
which also means the `.pulsar` ships in the app even if you only ever call `loadBundleSync()`.
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

Each generated module exports exactly two loaders:

```ts
import { loadBundleSync } from './assets/hapticsBundle.bundle';

const Haptics = loadBundleSync();

Haptics.fanfare.play();
Haptics.fanfare.stop();
Haptics.get(someRuntimeId)?.play();
```

`loadBundleSync()` does not read the `.pulsar` binary at all — it plays the patterns embedded
in the generated module, parsing each one lazily on its first `play()`. Authored audio is not
played on this path.

To get the authored audio, load the binary:

```ts
import { loadBundleAsync } from './assets/hapticsBundle.bundle';

const Haptics = await loadBundleAsync();

Haptics.fanfare.play(); // still synchronous after the load
```

Native code reads the `.pulsar` before the promise settles — the binary no longer travels
through JavaScript as base64. After the load, `play()` is synchronous either way.

`loadBundleSync(true)` reads the binary too, but on the calling thread. In release that is a
local file read; in development it is a **blocking HTTP round trip to Metro**, so prefer
`loadBundleAsync()` unless you genuinely cannot await.

## Playing from a position

`play(fromMs)` starts the preset that far into its own timeline instead of at the top, so a
progress bar can seek:

```ts
Haptics.fanfare.play(2500); // start 2.5s in
Haptics.fanfare.play();     // ...and from the top, as before
```

Audio and haptics move together: the pattern is re-anchored — discrete events before the seek
are dropped, the rest rebased, and the continuous envelopes re-anchored on their value at that
instant — and the audio seeks to the matching position in the file. A preset authored with an
audio `offset` keeps its lead-in until the seek passes it.

Each non-zero `fromMs` re-parses the preset; `play()` from the start reuses the cached parse, so
plain playback costs exactly what it always did.

## Presets and animations

Each preset handle carries `id`, `name`, `duration`, `play(fromMs?)`, `stop()`, the raw
`pattern`, and media metadata:

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

Call `dispose()` when a loaded bundle is no longer needed. A disposed bundle is inert: further
`play()` / `stop()` calls are ignored (and warn once in `__DEV__`) rather than silently
re-parsing. Loading the same pack twice gives two independent bundles, so disposing one does
not disturb the other.

Re-run `pulsar-gen-rn` after every Studio export so the generated module, content hash, and
`.pulsar` asset stay in sync.

## Other SDKs

Every SDK offers the same pair — `loadBundleSync` and `loadBundleAsync` — except Flutter, which
crosses a platform channel and so is async only. React Native is the only target with an inline,
no-binary path, because only it can embed the patterns in the app's JS bundle.
