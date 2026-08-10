# Changelog

All notable changes to the Pulsar iOS SDK are documented here.

## Unreleased

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
