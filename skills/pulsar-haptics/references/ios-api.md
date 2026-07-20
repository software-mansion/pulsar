# Pulsar iOS API

## Contents

- [Install](#install)
- [Initialize](#initialize)
- [Play presets](#play-presets)
- [System presets](#system-presets)
- [Caching and configuration](#caching-and-configuration)
- [Hardware support](#hardware-support)

## Install

Add `https://github.com/software-mansion-labs/pulsar-ios` with Swift Package Manager and select the `Pulsar` product. Requirements: iOS 13+ and Swift 5.9+.

```swift
dependencies: [
  .package(url: "https://github.com/software-mansion-labs/pulsar-ios")
]
```

## Initialize

Keep one `Pulsar` instance alive for the app or owning view controller:

```swift
import Pulsar

let pulsar = Pulsar()
let presets = pulsar.getPresets()
```

Calls safely become no-ops when haptic hardware is unavailable. Debug builds can simulate patterns with audio.

## Play Presets

```swift
presets.ping()
presets.fanfare()
presets.buzz()
```

Preset methods are synchronous. `getPresets()` lazily creates and reuses one wrapper. Use PascalCase names for dynamic lookup:

```swift
presets.getByName("CoinDrop")?.play()
```

Use `scripts/find_presets.py` to discover valid names and lower-camel methods.

## System Presets

These wrap UIKit feedback generators:

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

## Caching and Configuration

Caching is enabled by default. Preload only latency-critical presets:

```swift
pulsar.preloadPresets(presetNames: ["Ping", "Stamp", "Fanfare"])
pulsar.enableCache(state: true)
pulsar.clearCache()
```

| Method or property | Purpose |
|---|---|
| `enableHaptics(state:)` | Globally toggle haptics. |
| `enableSound(state:)` | Toggle simulator audio. |
| `enableCache(state:)` | Toggle preset caching. |
| `preloadPresets(presetNames:)` | Preload PascalCase names. |
| `stopHaptics()` | Stop active playback. |
| `shutDownEngine()` | Release Core Haptics resources. |
| `isHapticsSupported()` | Report Core Haptics hardware support. |
| `isHapticsEnabled` | Current enabled state. |

## Hardware Support

```swift
if pulsar.isHapticsSupported() {
  presets.fanfare()
}
showAchievementBanner() // visual feedback remains available
```

Do not infer hardware support from device name. Use the runtime check. Simulator audio does not reproduce physical feel.

Read the [Pulsar iOS SDK documentation](https://docs.swmansion.com/pulsar/sdk/ios/) only when this reference does not cover the requested API or when current version and installation details must be verified.
