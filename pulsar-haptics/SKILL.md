---
name: pulsar-haptics
description: >
  Expert guide for implementing haptic feedback using the Pulsar SDK across iOS (Swift),
  Android (Kotlin), and React Native (TypeScript). Use this skill whenever the user is
  working with haptics, vibrations, tactile feedback, or the Pulsar library in a mobile
  app — including preset selection, custom pattern composition, real-time gesture-driven
  haptics, migration from expo-haptics or UIKit/CoreHaptics, CompatibilityMode handling,
  and haptic design decisions. Trigger even if the user only mentions "vibration", "buzz",
  "taptic", "feel", or wants their app to "feel right".
---

# Pulsar Haptics

Pulsar is a cross-platform haptic feedback SDK with 150+ named presets, custom pattern composition, real-time gesture-driven haptics, and audio simulation for simulator/emulator testing. Available for iOS (Swift), Android (Kotlin), and React Native (TypeScript).

## How to Use This Skill

1. **Identify the platform** from the user's code (file extensions, imports, framework).
   - TypeScript / React Native / Expo → read [React Native](references/react-native/SKILL.md)
   - Swift / SwiftUI / UIKit → read [iOS](references/ios/SKILL.md)
   - Kotlin / Android → read [Android](references/android/SKILL.md)
   - If unclear, ask: "Are you working in React Native, iOS Swift, or Android Kotlin?"

2. **Load the platform SKILL.md** — it lists which reference files to read for the task.

3. **Use the presets-guide** for preset selection questions; use the api-overview for implementation help; use design-principles when the user asks about best practices.

## What these skills cover

Each platform skill is split into four files covering the same topics:

- **migration** (React Native only) — How to replace `expo-haptics` with Pulsar. Includes a full mapping table, before/after code examples, and an explanation of what Pulsar adds beyond `expo-haptics`.

- **design-principles** ([common/design-principles.md](references/common/design-principles.md)) — Shared across all platforms. Platform-agnostic design rules: one action per haptic, matching physical metaphor, scaling intensity to stakes, avoiding redundancy with visuals, respecting the app's emotional arc, consistency, and testing on hardware. Includes when to use haptics, when to avoid them, an emotion-to-preset mapping table, iOS hardware notes (Taptic Engine by device generation, iPad/Mac Catalyst), and Android limitations (hardware fragmentation, API-level requirements, CompatibilityMode, RealtimeComposerStrategy).

- **presets-guide** ([common/presets-guide.md](references/common/presets-guide.md)) — How to choose the right preset for each occasion. Includes the preset selection workflow, clarifying questions, tag selection guide, response format rules, and the full categorized preset reference (150+ presets grouped by use case with descriptions and tags). Full list of all preset names at the bottom.

- **api-overview** — Full platform API reference: installation, using built-in presets, system presets with platform mapping, custom pattern composition (`PatternComposer`) with the `Pattern` type (discrete taps and continuous amplitude/frequency envelopes), real-time gesture-driven haptics (`RealtimeComposer`), caching vs. preloading, the configuration/settings API, and the `HapticSupport` / `CompatibilityMode` enum for graceful degradation on lower-capability devices.

## Platform Skills

- **[React Native](references/react-native/SKILL.md)** — TypeScript SDK (`react-native-pulsar`) for React Native and Expo. Ships with 150+ ready-to-use named presets (`Presets.ping()`, `Presets.fanfare()`, `Presets.buzz()`, …) plus system presets (`Presets.System.impactMedium()`, `Presets.System.notificationSuccess()`, …). All preset functions and hook methods are Reanimated worklet-compatible. Hooks: `usePatternComposer`, `useRealtimeComposer`, `useAdaptiveHaptics`. Migrates from `expo-haptics`.

- **[iOS](references/ios/SKILL.md)** — Swift SDK built on CoreHaptics (iOS 13+). Wraps `CHHapticEngine` lifecycle, pattern compilation, and player management. Composers: `PatternComposer`, `RealtimeComposer`. Migrates from UIKit haptics and raw CoreHaptics.

- **[Android](references/android/SKILL.md)** — Kotlin SDK (`com.swmansion:pulsar`) built on `VibrationEffect`, Composition API, and Envelope API. Handles API-level differences and hardware fragmentation via `CompatibilityMode` and `RealtimeComposerStrategy`. Migrates from `Vibrator`, `VibrationEffect`, and `HapticFeedbackConstants`.
