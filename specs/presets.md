---
capability: presets
title: Built-in haptic presets
code_id: PRE
code:
  - "iOS/Pulsar/Sources/Pulsar/Presets/**/*.swift"
  - "Android/Pulsar/src/main/java/com/swmansion/pulsar/presets/**/*.kt"
  - "Android/Pulsar/src/main/java/com/swmansion/pulsar/types/Points.kt"
  - "kmp/Pulsar/library/src/commonMain/kotlin/com/swmansion/pulsar/PulsarControllers.kt"
  - "kmp/Pulsar/library/src/iosMain/kotlin/com/swmansion/pulsar/iosimpl/presets/**/*.kt"
  - "kmp/Pulsar/library/src/androidMain/kotlin/com/swmansion/pulsar/AndroidPulsarFactory.kt"
  - "flutter/pulsar/lib/src/pulsar_presets.dart"
  - "flutter/pulsar/lib/src/pulsar_preset.dart"
  - "react-native/react-native-pulsar/src/Presets.ts"
  - "react-native/react-native-pulsar/src/PresetsLight.ts"
  - "react-native/react-native-pulsar/src/presetNames.ts"
  - "web/Pulsar/src/Presets.ts"
  - "web/Pulsar/src/builtin-presets.ts"
  - "web/Pulsar/src/generated-presets.ts"
tests:
  - "iOS/Pulsar/Tests/PulsarTests/PresetsWrapperTests.swift"
  - "react-native/react-native-pulsar/src/__tests__/presetNames.test.ts"
  - "react-native/react-native-pulsar/src/__tests__/PresetsLight.test.ts"
  - "web/Pulsar/tests/Presets.test.js"
  - "web/Pulsar/tests/Preset.test.js"
  - "web/Pulsar/tests/builtin-presets.test.js"
  - "flutter/pulsar/test/pulsar_test.dart"
  - "kmp/Pulsar/library/src/commonTest/kotlin/com/swmansion/pulsar/PulsarFacadeTest.kt"
---
# Built-in haptic presets

Pulsar ships a catalog of named, ready-to-play haptic patterns. On mobile (iOS, Android, and the React Native,
Flutter and KMP bindings that sit on them) every preset is a generated class holding a discrete + continuous
pattern, resolved by name through a `PresetsWrapper` that caches instances. The web SDK has its own, smaller
catalog of Web Vibration segment patterns with its own name lookup. This spec covers what is in the catalogs,
how a name resolves to a preset, what happens for unknown names, and the preset data format.

## Requirements

### REQ-PRE-001: Mobile generated catalog
The mobile SDKs SHALL ship the same generated catalog of named presets on iOS and Android: one class per preset in
`iOS/Pulsar/Sources/Pulsar/Presets/Generated/` and `Android/Pulsar/src/main/java/com/swmansion/pulsar/presets/generated/`
(151 non-system presets each, e.g. `AlarmPreset`), each registered in its platform `PresetsWrapper` name mapper
under its PascalCase `name` and exposed as a camelCase play method (e.g. `alarm()`).

### REQ-PRE-002: System presets
The SDK SHALL expose `System*` presets alongside the generated catalog. iOS SHALL register the 9 cross-platform
system presets (`SystemImpactLight|Medium|Heavy|Soft|Rigid`, `SystemNotificationSuccess|Warning|Error`,
`SystemSelection`), which play a UIKit feedback generator together with an audio-only rendering of their pattern.
Android SHALL register those 9 plus the Android-only effect, primitive and view-based presets (46 `System*` names in
total); an Android effect/primitive/view-based preset SHALL play its authored fallback pattern when the platform
effect is unavailable (`Player.playSystemOrFallback`).

#### Scenario: predefined effect unsupported
- WHEN `SystemEffectClick` is played on a device below API 29 or where `EFFECT_CLICK` is reported unsupported
- THEN the preset's own discrete pattern is played through the pattern composer instead

### REQ-PRE-003: Case-insensitive lookup by name on mobile
`PresetsWrapper.getByName(name)` on iOS and Android (and the KMP iOS implementation) SHALL match names
case-insensitively by lower-casing both the registered names and the requested name.

#### Scenario: camelCase name from Flutter
- WHEN Flutter calls `presets.play('systemImpactLight')`
- THEN the native `SystemImpactLight` preset plays

### REQ-PRE-004: Unknown names on mobile are a silent no-op
For a name with no registered preset, mobile lookup SHALL return no preset without raising: iOS `getByName` returns
`nil`, Android `getByName` returns `null`, KMP `PulsarPresets.getByName` returns `null` and `play` returns `false`,
Flutter `PulsarPresets.getByName` resolves to `null`, and the React Native `Pulsar_play` bridge call plays nothing.

### REQ-PRE-005: Preset instance cache
`PresetsWrapper` SHALL cache preset instances by normalized name with caching enabled by default. With caching on,
repeated lookups SHALL return the same instance; `enableCache(false)` SHALL clear the cache and make every lookup
build a fresh instance; `resetCache()` SHALL drop cached instances; `preloadPresetByName(s)` SHALL re-enable caching
and warm the cache for each known name, ignoring unknown names.

### REQ-PRE-006: Mobile preset data format
A generated mobile preset SHALL be defined by `rawContinuousPattern` — a two-element list of `[time, value]` points,
amplitude first then frequency — and `rawDiscretePattern` — a list of `[time, amplitude, frequency]` impulses, times in
milliseconds and values in 0…1. The `Player` base class SHALL convert this into `PatternData` and parse it once into
the preset's pattern composer at construction. On iOS, malformed points with too few components are skipped.

### REQ-PRE-007: React Native preset names
The React Native `Presets` object SHALL expose every preset as a worklet function that calls `Pulsar_play` with the
preset's PascalCase name, grouped as `Presets.System.*` (cross-platform system presets), `Presets.System.Android.*`
(Android-only system presets) and top-level camelCase entries. The `PresetName` union in
`react-native/react-native-pulsar/src/presetNames.ts` SHALL contain exactly the names `Presets` plays, and
`PresetsLight.playByName(name)` SHALL forward `name` unchanged to `Pulsar_play`.

### REQ-PRE-008: Web catalog
The web SDK SHALL define its catalog in `BUILTIN_PRESETS` (`web/Pulsar/src/builtin-presets.ts`), keyed by camelCase
name (e.g. `tap`, `doubleTap`, `heartbeat`), each value a non-empty `HapticPattern` of `continuous`, `pulse` or `line`
segments. `PRESETS` (generated from it) SHALL map each key to a PascalCase display name, and `Presets` SHALL expose one
play method per key (e.g. `Presets.tap()`).

### REQ-PRE-009: Web lookup by name and unknown names
`Presets.has(name)` SHALL be true only for an own key of the catalog; names inherited from `Object.prototype`
(`toString`, `constructor`, `hasOwnProperty`, `__proto__`) SHALL be unknown. `Presets.get(name)` SHALL return the same
`Preset` instance on every call for a known name and SHALL throw `Error("Unknown haptic preset: <name>")` for an
unknown one; `Presets.play(name)` SHALL reject with that error. Lookup is case-sensitive.

#### Scenario: inherited prototype name
- WHEN `Presets.get("constructor")` is called
- THEN it throws `Error` with message `Unknown haptic preset: constructor`
- AND `Presets.play("constructor")` rejects with the same message

### REQ-PRE-010: Web listing
`Presets.list()` SHALL return the catalog keys and `Presets.all()` the `Preset` instances in the same order.

### REQ-PRE-011: Web preset playback and audio fallback
`Preset.play()` SHALL stop its in-flight audio first, then try haptics; it SHALL fall back to rendering the pattern as
audio only when haptics did not play and sound is enabled, rendering the audio at most once per preset, and resolve to
`{ haptics, audio, usedAudioFallback }`. Starting another preset via `Presets` SHALL stop the previous preset's audio
but SHALL NOT cancel its vibration; `Presets.stop()` SHALL stop haptics and the current preset's audio and return
whether either stopped.
