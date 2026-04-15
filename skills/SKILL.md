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
   - TypeScript / React Native / Expo → read [React Native](references/react-native/SKILL.md)
   - Swift / SwiftUI / UIKit → read [iOS](references/ios/SKILL.md)
   - Kotlin / Android → read [Android](references/android/SKILL.md)
   - If unclear, ask: "Are you working in React Native, iOS Swift, or Android Kotlin?"

2. **Load the platform SKILL.md** — it lists which reference files to read for the task.

3. **Use the right reference for the task:**
   - **presets-guide** — choosing which preset to use
   - **api-overview** — implementation help (installation, API calls, composer usage)
   - **design-principles** — best practices, accessibility, when to use or avoid haptics
   - **gesture-haptics** — real-time haptics driven by drag, swipe, or pan gestures using RealtimeComposer
   - **migration** (React Native only) — replacing `expo-haptics` with Pulsar

4. **Always prefer presets over custom patterns.** First consult `presets-guide` — Pulsar ships 150+ named presets covering most interactions. Only reach for `PatternComposer` / `RealtimeComposer` (via `design-principles` and `api-overview`) when no preset fits the interaction well.

## Reference Files

- **migration** (references/react-native/migration.md) — Full `expo-haptics` → Pulsar mapping table, before/after code examples, and an explanation of what Pulsar adds beyond `expo-haptics`.

- **design-principles** (references/common/design-principles.md) — Shared across all platforms. Design rules, emotion-to-preset mapping table, accessibility guidance, iOS hardware notes (Taptic Engine by device generation, iPad/Mac Catalyst), and Android limitations (hardware fragmentation, API-level requirements, CompatibilityMode, RealtimeComposerStrategy).

- **gesture-haptics** (references/common/gesture-haptics.md) — Shared across all platforms. Real-time gesture-driven haptics with RealtimeComposer: parameter mapping, phase tables, and patterns for drag-and-drop, snap points, pull-to-refresh, and swipe-to-delete.

- **presets-guide** (references/common/presets-guide.md) — Preset selection workflow, clarifying questions, tag selection guide, and the full 150+ preset reference with descriptions and tags.

- **api-overview** (references/<ios|android|react-native>/api-overview.md) — Per-platform. Full API reference: installation, presets, system presets with platform mapping, PatternComposer, RealtimeComposer, caching/preloading, the configuration API, and HapticSupport/CompatibilityMode for graceful degradation.

## Platform Skills

- **[React Native](references/react-native/SKILL.md)** — Use when the project is React Native or Expo (TypeScript/JavaScript).

- **[iOS](references/ios/SKILL.md)** — Use when the project is native iOS (Swift/Objective-C).

- **[Android](references/android/SKILL.md)** — Use when the project is native Android (Kotlin/Java).
