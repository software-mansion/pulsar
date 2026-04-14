---
name: pulsar-haptics-ios
description: >
  Pulsar haptics implementation for iOS apps using the Swift SDK. Use when the user is
  writing Swift/SwiftUI/UIKit code and needs haptics, CoreHaptics wrapping, PatternComposer,
  RealtimeComposer, or migration from UIKit haptics.
---

# Pulsar Haptics — iOS

Swift SDK built on CoreHaptics (iOS 13+). Wraps `CHHapticEngine` lifecycle, pattern compilation, and player management behind a simple preset and composer API. Audio simulation is enabled by default in debug builds so haptic patterns can be heard on the iOS Simulator.

## References

- **[design-principles.md](../common/design-principles.md)** — Universal design principles (shared across all platforms). Includes an iOS-specific section covering Taptic Engine quality differences across iPhone generations (older iPhones have weaker actuators), iPad and Mac Catalyst considerations (`isHapticsSupported()` returns `false` on most iPads), automatic engine lifecycle handling by Pulsar (no foreground/background management needed), and audio simulation on the iOS Simulator.

- **[presets-guide.md](presets-guide.md)** — Same preset groups as the React Native guide but with Swift syntax examples. Includes a "playing by name" section (`pulsar.play(named:)`). Full preset list at the bottom.

- **[api-overview.md](api-overview.md)** — Full Swift API reference. Covers: Swift Package Manager installation; `Pulsar()` initializer and SwiftUI vs. UIKit integration; playing presets and system presets with UIKit mapping; `PatternComposer` with the four Swift types (`PatternData`, `ContinuousPattern`, `ValuePoint`, `DiscretePoint`) and a complete UIKit example; `RealtimeComposer` with UIKit pan gesture and SwiftUI drag gesture examples; caching/preloading API; the full configuration method table; audio simulation control; and a hardware support matrix showing which iPhone generations support which features.
