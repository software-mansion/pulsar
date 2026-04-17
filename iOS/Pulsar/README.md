<p align="center">
  <img src="https://github.com/software-mansion/pulsar/raw/main/docs/src/assets/og.png" alt="Pulsar - Rich and ready-to use haptics library" />
</p>

A haptic feedback SDK for iOS, written in Swift. Pulsar provides ready-to-use haptic presets, a pattern composer for custom haptic sequences, and a real-time composer for gesture-driven feedback.

> **Note:** This repository is a mirror of the iOS implementation from the [Pulsar monorepo](https://github.com/software-mansion/pulsar). The monorepo is the primary source of development and also contains example apps for both Android and iOS. For the full source and examples, visit the main repository.

## Features

- **Presets** - Library of built-in haptic patterns (hammer, dogBark, buzz, pulse) and system feedback styles (impacts, notifications, selection)
- **Pattern Composer** - Define custom haptic patterns using discrete events and continuous amplitude/frequency envelopes
- **Realtime Composer** - Live amplitude and frequency control for gesture-driven haptics
- **Apple-native** - Built with Core Haptics and UIKit feedback generators
- **Swift-first** - Clean Swift API for iOS apps and SDK integrations

## Quick start

### Installation

<!-- GENERATED:IOS_VERSION_START -->
Latest available version: `1.0.0`
<!-- GENERATED:IOS_VERSION_END -->

In Xcode, go to **File > Add Package Dependencies...** and use:

```text
https://github.com/software-mansion-labs/pulsar-ios
```

Or add Pulsar to your `Package.swift`:

<!-- GENERATED:IOS_INSTALL_SNIPPET_START -->
```swift
dependencies: [
  .package(url: "https://github.com/software-mansion-labs/pulsar-ios", from: "1.0.0")
]
```
<!-- GENERATED:IOS_INSTALL_SNIPPET_END -->

Then add `"Pulsar"` to your target dependencies.

### Preset example

```swift
import Pulsar

let pulsar = Pulsar()
let presets = pulsar.getPresets()

// Play a preset
presets.hammer()

// Play a system haptic
presets.systemImpactMedium()
```

### PatternComposer example

```swift
import Pulsar

let pulsar = Pulsar()
let composer = pulsar.getPatternComposer()

let pattern = PatternData(
  continuousPattern: ContinuousPattern(
    amplitude: [
      ValuePoint(time: 0, value: 0),
      ValuePoint(time: 200, value: 1),
      ValuePoint(time: 400, value: 0),
    ],
    frequency: [
      ValuePoint(time: 0, value: 0.3),
      ValuePoint(time: 400, value: 0.8),
    ]
  ),
  discretePattern: [
    DiscretePoint(time: 0, amplitude: 1, frequency: 0.5),
    DiscretePoint(time: 100, amplitude: 0.5, frequency: 0.5),
  ]
)

composer.playPattern(hapticsData: pattern)
```

### RealtimeComposer example

```swift
import Pulsar

let pulsar = Pulsar()
let realtime = pulsar.getRealtimeComposer()

realtime.set(amplitude: 0.7, frequency: 0.5)
realtime.stop()
```

## Documentation

Full API reference and guides are available at the [documentation site](https://docs.swmansion.com/pulsar).

- [SDK Overview](https://docs.swmansion.com/pulsar/sdk/overview) - Core concepts: types of haptics, preloading, and caching
- [iOS SDK](https://docs.swmansion.com/pulsar/sdk/ios) - Swift API reference

## AI Skills

Install the `pulsar-haptics` skill from the [software-mansion-labs/skills](https://github.com/software-mansion-labs/skills) repository:

```text
/plugin marketplace add software-mansion-labs/skills
/plugin install skills@swmansion
/reload-plugins
```

Or with `npx`:

```bash
npx skills add software-mansion-labs/skills
```

## License

Pulsar library is licensed under [The MIT License](../../LICENSE).

## Try the Pulsar App

Download the Pulsar companion app to feel haptic presets directly on your device:

- [Download on the App Store](https://apps.apple.com/pl/app/haptics-presets-pulsar/id6761362104)

## Community Discord

[Join the Software Mansion Community Discord](https://discord.swmansion.com) to chat about haptics or other Software Mansion libraries.

## Pulsar is created by Software Mansion

Since 2012 [Software Mansion](https://swmansion.com) is a software agency with experience in building web and mobile apps. We are Core React Native Contributors and experts in dealing with all kinds of React Native issues. We can help you build your next dream product – [Hire us](https://swmansion.com/contact/projects?utm_source=reanimated&utm_medium=readme).
