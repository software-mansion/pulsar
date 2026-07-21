# Pulsar iOS API

## Contents

- [Installation](#installation)
- [Setup](#setup)
- [Using Presets](#using-presets)
- [System Presets](#system-presets)
- [Settings / Configuration API](#settings--configuration-api)
- [Compatibility](#compatibility)

## Installation

Add Pulsar through Swift Package Manager:

```swift
dependencies: [
  .package(url: "https://github.com/software-mansion-labs/pulsar-ios")
]
```

Then select the `Pulsar` product for the app target. CocoaPods is also supported:

```ruby
pod 'Pulsar-haptics'
```

Requirements: iOS 13+ and Swift 5.9+.

## Setup

Create one `Pulsar` instance and keep it alive for the app or owning view controller. It owns the haptic engine and preset wrapper:

```swift
import Pulsar

let pulsar = Pulsar()
let presets = pulsar.getPresets()
```

`getPresets()` lazily creates and reuses one wrapper.

Calls safely become no-ops when haptics are disabled or unavailable. Debug builds can simulate patterns with audio.

## Using Presets

Get the presets object from `pulsar.getPresets()` and call named methods:

```swift
let presets = pulsar.getPresets()

presets.ping()
presets.fanfare()
presets.buzz()
```

Preset calls are synchronous. Use PascalCase names for dynamic lookup; `getByName` returns `nil` when a name is not recognized:

```swift
let preset = presets.getByName("CoinDrop")
preset?.play()

let fallback = presets.getByName(dynamicPresetName)
  ?? presets.getByName("Ping")
fallback?.play()
```

Use `scripts/find_presets.py` to discover valid preset names and lower-camel methods.

## System Presets

Cross-platform system methods wrap UIKit feedback generators:

```swift
presets.systemImpactLight()
presets.systemImpactMedium()
presets.systemImpactHeavy()
presets.systemImpactSoft()
presets.systemImpactRigid()
presets.systemNotificationSuccess()
presets.systemNotificationWarning()
presets.systemNotificationError()
presets.systemSelection()
```

| Pulsar method | UIKit equivalent |
|---|---|
| `systemImpactLight()` | `UIImpactFeedbackGenerator(style: .light)` |
| `systemImpactMedium()` | `UIImpactFeedbackGenerator(style: .medium)` |
| `systemImpactHeavy()` | `UIImpactFeedbackGenerator(style: .heavy)` |
| `systemImpactSoft()` | `UIImpactFeedbackGenerator(style: .soft)` |
| `systemImpactRigid()` | `UIImpactFeedbackGenerator(style: .rigid)` |
| `systemNotificationSuccess()` | `UINotificationFeedbackGenerator` success notification |
| `systemNotificationWarning()` | `UINotificationFeedbackGenerator` warning notification |
| `systemNotificationError()` | `UINotificationFeedbackGenerator` error notification |
| `systemSelection()` | `UISelectionFeedbackGenerator` selection feedback |

Prefer cross-platform methods unless UIKit-specific behavior is intentional.

## Settings / Configuration API

Configuration methods are available directly on the `Pulsar` instance:

```swift
let pulsar = Pulsar()
```

| Method or property | Purpose |
|---|---|
| `pulsar.enableHaptics(state:)` | Globally enable or disable haptic feedback. |
| `pulsar.enableSound(state:)` | Enable or disable audio simulation. |
| `pulsar.enableCache(state:)` | Enable or disable preset caching. |
| `pulsar.clearCache()` | Release cached preset players. |
| `pulsar.preloadPresets(presetNames:)` | Preload named presets before latency-sensitive playback. |
| `pulsar.stopHaptics()` | Stop all currently playing haptics. |
| `pulsar.shutDownEngine()` | Release Core Haptics engine resources. |
| `pulsar.isHapticsEnabled` | Return whether haptics are globally enabled. |
| `pulsar.isHapticsSupported()` | Return whether device hardware supports Core Haptics. |
| `pulsar.canPlayHaptics()` | Return whether haptics are enabled, supported, and app is active. |

### Audio Simulation

Debug builds can generate audio from haptic parameters for audible simulator feedback. Disable it for silent debug runs or automated tests:

```swift
pulsar.enableSound(state: false)
```

## Compatibility

Check both hardware support and current playback availability:

```swift
if pulsar.canPlayHaptics() {
  presets.fanfare()
} else {
  showAchievementBanner() // visual feedback remains available
}
```

`isHapticsSupported()` reports hardware capability. `canPlayHaptics()` additionally checks the global enabled state and app activity. Do not infer support from device name. Simulator audio does not reproduce physical feel.

Read the [Pulsar iOS SDK documentation](https://docs.swmansion.com/pulsar/sdk/ios/) only when this reference does not cover the requested API or when current version and installation details must be verified.
