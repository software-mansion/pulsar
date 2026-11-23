# Changelog

All notable changes to the Pulsar iOS SDK are documented here.

## Unreleased

### Fixed

- **A pattern parsed while the app was inactive stayed silent until relaunch.** `PatternComposer` only created its
  players at parse time, which is skipped while the app isn't active (a background launch, or mid-resign), and `play()`
  never retried. `play()` now creates any missing player.

### Added

- **`SeekablePatternPlayer`** (`Pulsar.getSeekablePatternPlayer()`) plays a pattern in time with another clock, such
  as a video's: it parses once, starts at a host time, and seeks, resumes or changes rate in place. Its continuous layer
  isn't cut off at 30 s.

### Changed

- `PatternData`, `ContinuousPattern`, `ValuePoint` and `DiscretePoint` are now `final` and `Sendable`, so they can no
  longer be subclassed.

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
