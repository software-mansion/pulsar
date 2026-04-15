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

- **migration.md** — Load when replacing `expo-haptics` with Pulsar.

- **api-overview.md** — Load to know how to use the library API, and library capabilities.

- **presets-guide.md** — Load when choosing a preset for a specific interaction / emotion / use case in the app.

- **../common/design-principles.md** — Load to understand how to use haptics in mobile apps, and how to design custom patterns. It covers best practices and guidelines.

- **gesture-haptics.md** — Load when implementing gesture-driven haptics. Also load **../common/gesture-haptics.md** for the full design principles and patterns.
