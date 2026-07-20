---
name: pulsar-haptics
description: >
  Design and implement mobile haptic feedback with the Pulsar SDK for React Native,
  iOS Swift, and Android Kotlin. Use for Pulsar installation, named preset selection,
  custom PatternComposer patterns, gesture-driven RealtimeComposer haptics, device
  compatibility, caching, configuration, accessibility, or migration from expo-haptics.
  Do not use for visual animation, UI performance, device-motion or shake detection,
  or audio-only feedback unless the user explicitly asks for haptics.
---

# Pulsar Haptics

Use Pulsar to add intentional, accessible haptics across React Native, iOS, and Android.

## Workflow

1. Infer platform and interaction context from code. Ask at most two questions, and only when missing context would materially change the result.
2. Route to the smallest required resource:

| Task | Action or reference |
|---|---|
| Choose a named preset | Read [preset selection](references/preset-selection.md), then run `python3 scripts/find_presets.py` with mapped tags. |
| Add React Native or Expo code | Read [React Native API](references/react-native-api.md). |
| Add Swift, SwiftUI, or UIKit code | Read [iOS API](references/ios-api.md). |
| Add Kotlin or Android code | Read [Android API](references/android-api.md). |
| Build a custom timed pattern | Read [PatternComposer](references/pattern-composer.md) and the platform API. |
| Drive haptics from a gesture | Read [gesture haptics](references/gesture-haptics.md). |
| Review design, safety, or accessibility | Read [design principles](references/design-principles.md). |
| Replace `expo-haptics` | Read [React Native migration](references/react-native-migration.md). |

3. Prefer a preset for ordinary events. Use a custom pattern when the user explicitly requests one, requires exact timing or an evolving envelope, or no preset fits.
4. Load a platform API only when code or platform behavior is needed. Do not read every reference.

## Non-negotiable Rules

- Respect system and in-app haptic settings; the experience must work without haptics.
- Never use urgent haptics to pressure consent, purchases, or retention decisions.
- Avoid uncontrolled continuous loops. For long operations, prefer one cue at start and one at completion; use sparse cues only when ongoing feedback is essential.
- Pair critical haptics with visible or audible feedback.
- Trigger feedback at the meaningful state change, not on hover or before success is known.
- Test final choices on physical hardware; Android output varies across devices.

## Response Rules

- Give one primary recommendation with brief reasoning.
- Include paste-ready code only when platform is known.
- Mention up to three alternatives only when they clarify a real tradeoff.
- State compatibility or graceful-degradation behavior when relevant.
