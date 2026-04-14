---
name: pulsar-haptics-react-native
description: >
  Pulsar haptics implementation for React Native and Expo apps using react-native-pulsar.
  Use when the user is writing TypeScript/React Native code and needs haptics, presets,
  worklet-compatible haptic calls, usePatternComposer, useRealtimeComposer, or migration
  from expo-haptics.
---

# Pulsar Haptics — React Native

`react-native-pulsar` — TypeScript SDK for React Native and Expo apps. Requires New Architecture (RN 0.71+) and `react-native-worklets`. All preset functions and hook methods are Reanimated worklet-compatible: safe to call inside gesture handlers without leaving the worklet context.

## References

- **[migration.md](migration.md)** — How to replace `expo-haptics` with Pulsar. Covers the full mapping of every `expo-haptics` function (`impactAsync`, `notificationAsync`, `selectionAsync`) to its Pulsar equivalent, with before/after code and an explanation of what Pulsar adds: synchronous worklet-safe calls, 150+ named presets, caching, and real-time composers that have no `expo-haptics` equivalent.

- **[design-principles.md](../common/design-principles.md)** — Platform-agnostic design rules. Covers 7 core design rules (one action / one haptic, match physical metaphor, scale intensity to stakes, avoid redundancy with visuals, respect the emotional arc, app-wide consistency, test on hardware), when to use haptics and when to avoid them, an emotion-to-preset mapping table (joy, success, warning, error, sadness, suspense, calm, surprise, playful), iOS hardware notes (Taptic Engine by generation, iPad/Mac Catalyst), and Android hardware fragmentation: API-level requirements, runtime `HapticSupport` checking, and continuous haptic strategy selection.

- **[presets-guide.md](presets-guide.md)** — Preset selection guide organized by occasion: Confirmations & Completions, Achievements & Celebrations, Errors & Rejections, Notifications & Alerts, Warnings & Tension, UI Interactions, Ambient & Background, Games & Physical Metaphors, and Keyboard & Typing. Each entry includes the preset name, the situation it fits, and the official description from the Pulsar docs. Full list of all 150+ preset names at the bottom.

- **[api-overview.md](api-overview.md)** — Complete TypeScript API reference. Covers: using presets directly (synchronous, no `await`, worklet-safe); system presets with UIKit mapping table; `usePatternComposer` hook with the full `Pattern` type (discrete events with `time`/`amplitude`/`frequency`, continuous amplitude and frequency envelopes), pattern design tips, and a complete example; `useRealtimeComposer` for gesture-driven haptics with a pan gesture example and the four `RealtimeComposerStrategy` options for Android; `useAdaptiveHaptics` for per-platform preset configuration; caching vs. preloading comparison table with the `Settings.preloadPresets()` API; full `Settings` method table; `HapticSupport` enum with a graceful-degradation example; and a complete worklet example combining pan, tap, preset call, and pattern playback inside Reanimated.
