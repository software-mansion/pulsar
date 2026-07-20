# Haptic Design Principles

## Contents

- [Use haptics intentionally](#use-haptics-intentionally)
- [Avoid harmful patterns](#avoid-harmful-patterns)
- [Accessibility](#accessibility)
- [Custom pattern guidance](#custom-pattern-guidance)
- [Platform realities](#platform-realities)

## Use Haptics Intentionally

- Fire at a meaningful state change: selection landed, action completed, boundary crossed, or error occurred.
- Match physical metaphor and stakes. Routine UI needs less intensity than destructive actions or game impacts.
- Keep a small, consistent vocabulary across the app.
- Synchronize haptic and visual state changes closely; validate timing by feel on hardware.
- Use one haptic per meaningful action unless a deliberate sequence communicates distinct phases.

## Avoid Harmful Patterns

- Do not vibrate on passive reading, ordinary scrolling, hover, or low-information layout changes.
- Do not use alarming feedback to manipulate paywall, consent, or opt-out decisions.
- Do not run continuous haptics through a long background operation. Prefer start/completion cues; if ongoing feedback is essential, make it sparse and user-controlled.
- Do not make haptics the only channel for errors, warnings, or safety-critical information.
- Stop RealtimeComposer when a gesture ends or cancels.

## Accessibility

- Respect system settings and provide an in-app off switch when the app uses frequent or expressive haptics.
- Let accessibility-focused products offer intensity choices.
- Expect perception to vary with age, sensory sensitivity, neuropathy, grip, device, and actuator hardware.
- Avoid surprise vibration and ensure every flow remains usable without tactile feedback.
- Test with representative users and real devices rather than relying on simulator audio.

## Custom Pattern Guidance

- Use discrete events for taps, ticks, impacts, and rhythm.
- Use continuous envelopes for sustained effects whose intensity or texture evolves.
- Keep amplitude and frequency normalized to `0...1`; start conservatively and tune on hardware.
- Lower frequency feels softer; higher frequency feels crisper where hardware supports frequency control.
- Align pattern duration with interaction duration. A tap should not produce a lingering sequence.
- Prefer RealtimeComposer, not a fixed PatternComposer pattern, when live gesture values drive output.

## Platform Realities

- iOS Core Haptics requires supported hardware; simulator audio is only an approximation.
- Android fidelity depends on OS APIs, vendor implementation, and actuator hardware. Use compatibility fallbacks.
- React Native calls may be worklet-compatible, but lifecycle cleanup and platform degradation still matter.

Primary platform guidance: [Apple Human Interface Guidelines: Playing haptics](https://developer.apple.com/design/human-interface-guidelines/playing-haptics) and [Android Developers: Haptics design principles](https://developer.android.com/develop/ui/views/haptics/haptics-principles).
