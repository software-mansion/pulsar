---
name: pulsar-haptics
description: >
  Expert guide for implementing haptic feedback using the Pulsar SDK across iOS (Swift),
  Android (Kotlin), and React Native (TypeScript). Use this skill whenever the user is
  working with haptics, vibrations, tactile feedback, or the Pulsar library in a mobile
  app — including preset selection, custom pattern composition, real-time gesture-driven
  haptics, migration from expo-haptics or UIKit/CoreHaptics, CompatibilityMode handling,
  and haptic design decisions. Always use this skill even if the user only mentions
  "vibration", "buzz", "taptic", "rumble", "pulse", "motor feedback", "tactile", "shake",
  "UIFeedbackGenerator", "CHHapticEngine", or "VibrationEffect" — or wants their app to
  "feel right". Vague phrases like "make it feel more responsive" or "add some feedback"
  in a mobile context should also trigger this skill.
---

# Pulsar Haptics

Pulsar is a cross-platform haptic feedback SDK with 150+ named presets, custom pattern composition, real-time gesture-driven haptics, and audio simulation for simulator/emulator testing. Available for iOS (Swift), Android (Kotlin), and React Native (TypeScript).

## How to Use This Skill

1. **Identify the platform** from the user's code (file extensions, imports, framework).
   - TypeScript / React Native / Expo → use the [React Native API](references/react-native-api.md)
   - Swift / SwiftUI / UIKit → use the [iOS API](references/ios-api.md)
   - Kotlin / Android → use the [Android API](references/android-api.md)
   - If unclear, ask: "Are you working in React Native, iOS Swift, or Android Kotlin?"

2. **Load only the references needed for the task:**
   - Choosing a preset → read [preset selection](references/preset-selection.md), [preset catalog](references/preset-catalog.md), and the platform preset reference: [React Native](references/react-native-presets.md), [iOS](references/ios-presets.md), or [Android](references/android-presets.md).
   - Installation, API calls, composer usage, caching, preloading, configuration, or compatibility → read the relevant platform API: [React Native](references/react-native-api.md), [iOS](references/ios-api.md), or [Android](references/android-api.md).
   - Best practices, accessibility, when to use or avoid haptics, or custom pattern design → read [design principles](references/design-principles.md).
   - Real-time haptics driven by drag, swipe, or pan gestures using RealtimeComposer → read [gesture haptics](references/gesture-haptics.md), the platform API, and the platform notes: [React Native](references/react-native-gesture-haptics.md), [iOS](references/ios-gesture-haptics.md), or [Android](references/android-gesture-haptics.md).
   - Replacing `expo-haptics` with Pulsar → read [React Native migration](references/react-native-migration.md) and the [React Native API](references/react-native-api.md).

3. **Always prefer presets over custom patterns.** First consult [preset selection](references/preset-selection.md) and the [preset catalog](references/preset-catalog.md) — Pulsar ships 150+ named presets covering most interactions. Only reach for `PatternComposer` / `RealtimeComposer` via [design principles](references/design-principles.md) and the relevant platform API when no preset fits the interaction well.

## Reference Files

- **migration** ([references/react-native-migration.md](references/react-native-migration.md)) — Full `expo-haptics` → Pulsar mapping table, before/after code examples, and an explanation of what Pulsar adds beyond `expo-haptics`.

- **design-principles** ([references/design-principles.md](references/design-principles.md)) — Shared across all platforms. Design rules, emotion-to-preset mapping table, accessibility guidance, iOS hardware notes (Taptic Engine by device generation, iPad/Mac Catalyst), and Android limitations (hardware fragmentation, API-level requirements, CompatibilityMode, RealtimeComposerStrategy).

- **gesture-haptics** ([references/gesture-haptics.md](references/gesture-haptics.md)) — Shared across all platforms. Real-time gesture-driven haptics with RealtimeComposer: parameter mapping, phase tables, and patterns for drag-and-drop, snap points, pull-to-refresh, and swipe-to-delete.

- **preset-selection** ([references/preset-selection.md](references/preset-selection.md)) — Preset selection workflow, clarifying questions, tag selection guide, and response format rules.

- **preset-catalog** ([references/preset-catalog.md](references/preset-catalog.md)) — Full 150+ preset reference with descriptions and tags.

- **platform APIs** — Full API references for [React Native](references/react-native-api.md), [iOS](references/ios-api.md), and [Android](references/android-api.md): installation, presets, system presets with platform mapping, PatternComposer, RealtimeComposer, caching/preloading, the configuration API, and HapticSupport/CompatibilityMode for graceful degradation.
