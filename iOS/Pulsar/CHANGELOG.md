# Changelog

All notable changes to the Pulsar iOS SDK are documented here.

## 1.3.0

### Changed

- **CocoaPods: the pod now exposes its module as `Pulsar`.** Previously the
  `Pulsar-haptics` pod had no explicit `module_name`, so CocoaPods derived
  `Pulsar_haptics` from the pod name — inconsistent with Swift Package Manager,
  which has always exposed the module as `Pulsar`, and with the documentation,
  which has always shown `import Pulsar`. The podspec now sets
  `s.module_name = 'Pulsar'` so both integration paths agree.

  **Migration (CocoaPods only):** if your code imported the derived module name,
  change `import Pulsar_haptics` to `import Pulsar`. This is a compile-time change
  only — the API is unchanged. Swift Package Manager users are unaffected (the
  module was already `Pulsar`), as is anyone who followed the documented
  `import Pulsar`.

  This also removes a case-insensitive module-name collision with the Flutter
  plugin pod `pulsar_haptics`, which had prevented Flutter apps that use
  `use_frameworks!` (dynamic frameworks, common with Firebase and other Swift
  pods) from adopting the plugin.
