---
capability: react-native-api
title: React Native JS API
code_id: RNAPI
code:
  - "react-native/react-native-pulsar/src/*.ts"
  - "react-native/react-native-pulsar/src/*.tsx"
  - "react-native/react-native-pulsar/jest-mock.js"
  - "react-native/react-native-pulsar/package.json"
  - "react-native/react-native-pulsar/ios/Haptics.mm"
  - "react-native/react-native-pulsar/android/src/main/java/com/swmansion/pulsar/reactnative/*.kt"
tests:
  - "react-native/react-native-pulsar/src/__tests__/*.ts"
  - "react-native/react-native-pulsar/src/__tests__/*.tsx"
---
# React Native JS API

`react-native-pulsar` exposes Pulsar to React Native apps through a TurboModule (`RNPulsar`). Its JS surface is
`Presets`, `Settings`, three hooks (`usePatternComposer`, `useRealtimeComposer`, `useAdaptiveHaptics`),
`defineBundle` for generated preset bundles, the `HapticSupport` / `RealtimeComposerStrategy` enums, a lighter
"react-native-pulsar/light" entry, and a ready-made Jest mock. Play-path functions are worklets so they can be called
from the UI thread.

## Requirements

### REQ-RNAPI-001: Package entry points
The main entry (`react-native/react-native-pulsar/src/index.tsx`) SHALL export `Presets`, `Settings`, `useRealtimeComposer`, `usePatternComposer`,
`useAdaptiveHaptics`, `defineBundle`, `HapticSupport` and `RealtimeComposerStrategy`, plus the public types.
The "react-native-pulsar/light" entry (`react-native/react-native-pulsar/src/light.ts`) SHALL export the same members except that `PresetsLight`
replaces `Presets`, and SHALL additionally export the `PresetName` type. The package SHALL also export
the "./unstable/NativeRNPulsar", "./metro", "./app.plugin.js" and "./jest-mock" subpaths.

### REQ-RNAPI-002: Preset playback functions
`Presets` leaves and `PresetsLight.playByName(name)` SHALL be worklets that call the native `Pulsar_play` with the
preset's PascalCase name and return nothing. Native playback of an unknown name SHALL be a silent no-op. On iOS, a
play request while the app is not active SHALL be ignored, and a native exception during play SHALL be logged and
swallowed.

### REQ-RNAPI-003: Settings
`Settings` SHALL forward `enableHaptics`, `enableSound`, `enableCache`, `clearCache`, `preloadPresets`,
`stopHaptics`, `shutDownEngine`, `forceHapticsSupportLevel`, `enableImpulseCompositionMode` and
`setRealtimeComposerStrategy` to the matching native method, and return the native results from
`getHapticsSupportLevel()` (a `HapticSupport` value) and `getHapticCapabilities()` (one native call). On iOS,
`forceHapticsSupportLevel`, `enableImpulseCompositionMode` and `setRealtimeComposerStrategy` SHALL do nothing and
`getHapticsSupportLevel()` SHALL return `ADVANCED_SUPPORT` (3) when Core Haptics is supported, else `NO_SUPPORT` (0).

### REQ-RNAPI-004: Enum values
`HapticSupport` SHALL be `NO_SUPPORT=0`, `LIMITED_SUPPORT=1`, `STANDARD_SUPPORT=2`, `ADVANCED_SUPPORT=3`, and
`RealtimeComposerStrategy` SHALL be `ENVELOPE=0`, `PRIMITIVE_TICK=1`, `PRIMITIVE_COMPLEX=2`,
`ENVELOPE_WITH_DISCRETE_PRIMITIVES=3`.

### REQ-RNAPI-005: usePatternComposer
`usePatternComposer(pattern?)` SHALL return `{ play, stop, parse, isParsed }`. When given a pattern it SHALL parse it
natively on mount and whenever the pattern changes, and release the native composer on unmount or before the next
parse. `parse` SHALL release any previously parsed composer before registering the new one. `play`/`stop` SHALL be
worklets that act on the last parsed composer and do nothing before a parse; `isParsed()` SHALL report whether a
composer is registered.

#### Scenario: re-parse
- WHEN `parse` is called a second time on the same hook instance
- THEN the first native composer is released before the second is created
- AND `play()` plays the second one

### REQ-RNAPI-006: Pattern sound
When `pattern.sound` is set and its `uri` resolves, `usePatternComposer` SHALL parse via
`PatternComposer_parsePatternWithSound` with `volume` (default 1), `offset`, `start` and `duration` (default 0); a numeric
`uri` from `require()` SHALL be resolved with `Image.resolveAssetSource`. Without a resolvable sound it SHALL parse the
pattern alone.

### REQ-RNAPI-007: useRealtimeComposer
`useRealtimeComposer()` SHALL return worklet functions `set(amplitude, frequency)`, `playDiscrete(amplitude, frequency)`,
`stop()` and `isActive()` bound to the native realtime composer, and SHALL call `stop()` when the component unmounts.

### REQ-RNAPI-008: useAdaptiveHaptics
`useAdaptiveHaptics({ ios, android })` SHALL select the config for `Platform.OS === 'ios'`, otherwise the `android`
config, and return `{ play }`. If the selected config is a function, `play` SHALL call it; if it is a `Pattern`, the
hook SHALL parse it with `usePatternComposer` and `play` SHALL play that composer.

### REQ-RNAPI-009: defineBundle validation
`defineBundle(definition)` SHALL throw immediately unless `definition.schema` is the string "pulsar.sidecar/1", and SHALL return
`{ loadBundleSync, loadBundleAsync }` without loading or parsing anything.

### REQ-RNAPI-010: Loading a bundle
`loadBundleSync()` SHALL return a bundle backed by the inline patterns without reading the `.pulsar` asset.
`loadBundleSync(true)` and `loadBundleAsync()` SHALL resolve the asset with `Image.resolveAssetSource`, load it
natively, and play presets through the native bundle (with synced audio). Both SHALL throw / reject when the asset
cannot be resolved or the native load returns an empty token.

### REQ-RNAPI-011: Bundle shape and playback
A loaded bundle SHALL expose each preset as an enumerable member `PresetHandle` (`id`, `name`, `duration`, `pattern`,
`animation`, `hasAudio`, `hasAnimation`, `play(fromMs?)`, `stop()`) and non-enumerable `id`, `contentHash`, `get(id)`
and `dispose()`. `play(fromMs)` SHALL clamp `fromMs` to at least 0; on the inline path it SHALL parse a preset once per
seek position and re-parse (releasing the old composer) only when the position changes.

### REQ-RNAPI-012: Disposing a bundle
`dispose()` SHALL release every parsed composer and the native bundle exactly once; later `dispose()` calls SHALL do
nothing, and later `play`/`stop` calls SHALL be ignored (with a `console.warn` in `__DEV__`).

### REQ-RNAPI-013: Jest mock
The "react-native-pulsar/jest-mock" module (`react-native/react-native-pulsar/jest-mock.js`) SHALL replace the main entry with `jest.fn()` mocks: `Presets` as a deep proxy where
any property path is a stable callable mock, every `Settings` method (with `getHapticsSupportLevel` returning
`ADVANCED_SUPPORT` and `getHapticCapabilities` reporting full support), the three hooks returning mocked composers
(`isActive`/`isParsed` returning `false`), the real enum values, and `defineBundle` whose loaders return a bundle
with one mocked handle per preset in the definition and the same non-enumerable metadata as a real bundle.
