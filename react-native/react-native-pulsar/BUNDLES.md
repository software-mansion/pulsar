# Preset bundles (React Native)

Load a `.pulsar` bundle authored in Pulsar Studio and play its presets with full autocomplete — no
`.d.ts` codegen.

## Setup

Generate the sidecar. It carries the haptic patterns inline, so it is the only file your app
imports — there is no binary asset to resolve, and nothing to configure in Metro.

```bash
npx pulsar-gen-rn assets        # scans ./assets for *.pulsar → *.bundle.json
```

Expo — regenerate on every prebuild instead:

```json
{ "expo": { "plugins": [["react-native-pulsar", { "bundleDirs": ["assets"] }]] } }
```

## Usage

```ts
import hapticsBundle from './assets/hapticsBundle.bundle.json';
import { createBundle } from 'react-native-pulsar';

export const Haptics = createBundle(hapticsBundle);
export type PresetName = keyof typeof hapticsBundle.presets;
```

```ts
Haptics.fanfare.play();   // ← autocompletes; unknown ids are a compile error
Haptics.fanfare.stop();

Haptics.get(someRuntimeId)?.play();   // dynamic escape hatch → PresetHandle | undefined
```

Presets are direct members of the bundle. The bundle's own members — `id`, `contentHash`, `get`,
`dispose` — sit alongside them without ambiguity: `pulsar-gen` rejects a manifest that names a
preset after one of them. They are also non-enumerable, so `Object.keys(Haptics)` is exactly the
preset ids, which is handy for rendering a list of everything in a pack.

Each preset handle carries `id`, `name`, `duration`, `play()`, `stop()`, the raw `pattern`, and:

```ts
Haptics.fanfare.hasAudio       // authored with a synced sound
Haptics.fanfare.hasAnimation   // authored with a Lottie animation
Haptics.fanfare.animation      // the Lottie itself, when carried in JS (see below)
```

### Rendering a preset's animation

A JSON Lottie is inlined into the sidecar, because `lottie-react-native` renders it in JS anyway.
`react-native-pulsar-lottie` takes the preset directly and plays the animation and the haptics
together:

```tsx
import { HapticLottieView } from 'react-native-pulsar-lottie';

<HapticLottieView preset={Haptics.celebration} autoPlay />
```

Or drive your own Lottie view from `preset.animation.source`. A dotLottie (`.lottie`) is binary and
is not inlined — `pulsar-gen-rn` warns, `hasAnimation` stays true, and `animation` is `undefined`.

`createBundle` is synchronous and free — each pattern is handed to the native composer lazily, on
its first `play()`. Types come from `keyof` inference over the imported JSON (the same trick as
nano-icons' glyphmaps), so renaming a preset and re-exporting turns every stale reference into a
compile error.

Call `dispose()` if you are done with a bundle and want its native patterns released early; a bundle
that lives for the life of the app does not need it. Playing a preset after `dispose()` re-parses
it, so a disposed bundle stays usable.

## Bundles with audio or animation

Audio is decoded natively, so it can never be inlined: a preset with a sound plays its haptics
alone on this path, and `pulsar-gen-rn` warns. (Animations are different — they render in JS, so
JSON ones are carried, as above.) To get the audio, ship the `.pulsar` itself:

1. Register the extension with Metro:

   ```js
   // metro.config.js
   const { getDefaultConfig } = require('@react-native/metro-config');
   const { withPulsar } = require('react-native-pulsar/metro');
   module.exports = withPulsar(getDefaultConfig(__dirname));
   ```

2. Bind the same sidecar to the binary and load it:

   ```ts
   import { createBundleFromAsset, loadBundle } from 'react-native-pulsar';

   const Descriptor = createBundleFromAsset(hapticsBundle, require('./assets/hapticsBundle.pulsar'));
   const bundle = await loadBundle(Descriptor);   // async: reads the asset, hands bytes to native
   bundle.arcadeBonusAlert.play();                // haptics + audio
   bundle.dispose();
   ```

One sidecar drives both paths — the types are identical either way.

## Regenerating

Re-run `pulsar-gen-rn` after every Studio export. The sidecar embeds the bundle's `contentHash`, and
a file left over from the pre-inline format (`*.presets.json`) is rejected by `createBundle` with a
message telling you to regenerate rather than silently playing nothing.
