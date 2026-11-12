# Changelog

All notable changes to the Pulsar iOS SDK are documented here.

## Unreleased

### Added

- **`SeekablePatternPlayer`**, from `Pulsar.getSeekablePatternPlayer()`, plays a pattern in time with another clock,
  such as a video's. It parses the pattern once, and `play(fromMs:rate:atHostTime:)` starts it at a set host time,
  seeks, resumes or changes rate in place. `pause()` also drops a start that's still to come. It has its own engine and
  can be called from any thread, and it picks up where the pattern should be after the engine stops or resets. Patterns
  of any length play in full: `PatternComposer` plays a continuous layer for at most 30 s, Core Haptics' limit for one
  event.

### Changed (CocoaPods only — breaking)

- **The CocoaPod is renamed `Pulsar-haptics` → `PulsarHaptics`**, and its module is
  now `PulsarHaptics` (the pod no longer overrides `module_name`). Pod name and
  module name now agree, which is what makes the pod build under **all** CocoaPods
  linkage modes — including `use_frameworks!` (`:linkage => :static` and
  `:dynamic`), where the previous `Pulsar-haptics` pod with a `module_name = 'Pulsar'`
  override failed to compile (`'Pulsar-Swift.h' file not found`).

  **Migration (CocoaPods):**
  - `pod 'Pulsar-haptics'` → `pod 'PulsarHaptics'`
  - `import Pulsar_haptics` (or `import Pulsar`) → `import PulsarHaptics`

  This is a compile-time change only; the public API is unchanged (`Pulsar()`,
  `getPresets()`, …). **Swift Package Manager is unaffected** — it still exposes the
  module as `Pulsar`, so SPM users keep `import Pulsar`.
