---
name: pulsar-haptics-android
description: >
  Pulsar haptics implementation for Android apps using the Kotlin SDK (com.swmansion:pulsar).
  Use when the user is writing Kotlin/Android code and needs haptics, CompatibilityMode,
  VibrationEffect, RealtimeComposerStrategy, or PatternComposer.
---

# Pulsar Haptics — Android

Kotlin SDK (`com.swmansion:pulsar`) built on `VibrationEffect`, Composition API, and Envelope API. Handles API-level differences and hardware fragmentation automatically via `CompatibilityMode`. Audio simulation is enabled by default in debug builds so haptic patterns can be heard on the Android Emulator.

## References

- **[design-principles.md](../common/design-principles.md)** — Universal design principles (shared across all platforms) with an expanded Android-specific section: hardware fragmentation across manufacturers, API-level feature breakdown (API 24 basic vibration, API 26 `VibrationEffect`, API 33 Composition API, API 36 Envelope API), runtime `CompatibilityMode` checking with Kotlin examples for graceful degradation, `RealtimeComposerStrategy` comparison across all four strategies, and practical device-tier recommendations.

- **[presets-guide.md](presets-guide.md)** — Same preset groups as the React Native guide with Kotlin syntax examples. Each section includes an Android note explaining which presets reproduce well across the device ecosystem and which may feel weaker or indistinguishable on budget hardware or older API levels. Full preset list at the bottom.

- **[api-overview.md](api-overview.md)** — Complete Kotlin API reference. Covers: Gradle installation; `Pulsar` class setup; using presets directly and by name; all system presets (cross-platform and Android-only) with their `HapticFeedbackConstants`/`VibrationEffect` constants mapping; `PatternComposer` with all Kotlin types (`PatternData`, `ContinuousPattern`, `ValuePoint`, `ConfigPoint`) and a full example; `RealtimeComposer` with all four `RealtimeComposerStrategy` descriptions and a gesture example; caching/preloading; all configuration methods including the Android-only ones (`forceCompatibilityMode`, `enableImpulseCompositionMode`, `setRealtimeComposerStrategy`); `CompatibilityMode` enum with per-level explanation and device capability context; all Kotlin type definitions; and a complete end-to-end game activity example.
