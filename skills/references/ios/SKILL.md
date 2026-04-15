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

- **api-overview.md** — Load to know how to use the library API, and library capabilities.

- **presets-guide.md** — Load when choosing a preset for a specific interaction / emotion / use case in the app.

- **../common/design-principles.md** — Load to understand how to use haptics in mobile apps, and how to design custom patterns. It covers best practices and guidelines.

- **gesture-haptics.md** — Load when implementing gesture-driven haptics. Also load **../common/gesture-haptics.md** for the full design principles and patterns.
