---
capability: pattern-playback
title: Haptic pattern playback
code_id: PLAY
code:
  - "iOS/Pulsar/Sources/Pulsar/Composers/*.swift"
  - "iOS/Pulsar/Sources/Pulsar/HapticEngineWrapper.swift"
  - "iOS/Pulsar/Sources/Pulsar/Pulsar.swift"
  - "iOS/Pulsar/Sources/Pulsar/Lines/*.swift"
  - "iOS/Pulsar/Sources/Pulsar/Audio/AudioSimulator.swift"
  - "iOS/Pulsar/Sources/Pulsar/Types/*.swift"
  - "Android/Pulsar/src/main/java/com/swmansion/pulsar/Pulsar.kt"
  - "Android/Pulsar/src/main/java/com/swmansion/pulsar/composers/*.kt"
  - "Android/Pulsar/src/main/java/com/swmansion/pulsar/haptics/*.kt"
  - "Android/Pulsar/src/main/java/com/swmansion/pulsar/audio/*.kt"
  - "Android/Pulsar/src/main/java/com/swmansion/pulsar/types/*.kt"
  - "kmp/Pulsar/library/src/commonMain/kotlin/com/swmansion/pulsar/PatternSeek.kt"
  - "web/Pulsar/src/PatternComposer.ts"
  - "web/Pulsar/src/RealtimeComposer.ts"
  - "web/Pulsar/src/Engine.ts"
  - "web/Pulsar/src/Settings.ts"
  - "web/Pulsar/src/types.ts"
tests:
  - "iOS/Pulsar/Tests/PulsarTests/*.swift"
  - "Android/Pulsar/src/test/java/com/swmansion/pulsar/**/*.kt"
  - "kmp/Pulsar/library/src/commonTest/kotlin/com/swmansion/pulsar/PatternSeekTest.kt"
  - "web/Pulsar/tests/PatternComposer.test.js"
  - "web/Pulsar/tests/RealtimeComposer.test.js"
  - "web/Pulsar/tests/Settings.test.js"
---
# Haptic pattern playback

A pattern composer turns an authored haptic pattern — discrete impulses plus continuous amplitude/frequency
envelopes on mobile, timed segments on web — into whatever the platform can play (Core Haptics on iOS, a
`VibrationEffect` on Android, `navigator.vibrate` on web), optionally alongside a synced sound. A realtime composer
drives haptics live from gesture input. This spec covers how patterns are rendered, seeked and gated, and how Android
degrades on actuators without envelope or amplitude control.

## Requirements

### REQ-PLAY-001: Mobile pattern format
A mobile pattern (`PatternData`) SHALL consist of `discretePattern` — impulses with `time` (ms), `amplitude` and
`frequency` (0…1) — and `continuousPattern` with separate `amplitude` and `frequency` envelopes of `{ time, value }`
points. iOS (`Types.swift`), Android (`Points.kt`) and the React Native `Pattern` type SHALL use this shape.

### REQ-PLAY-002: iOS rendering
The iOS `PatternComposer` SHALL render each discrete impulse as a Core Haptics transient event (amplitude → intensity,
frequency → sharpness) and the envelopes as one `hapticContinuous` event driven by intensity and sharpness parameter
curves. The continuous event SHALL be built only when both the amplitude and the frequency envelope are non-empty.
Re-parsing SHALL release the previously created players and audio resources.

### REQ-PLAY-003: Seeking with fromMs
Parsing with `fromMs > 0` SHALL re-anchor the pattern so playback from zero feels like the original from `fromMs`
(iOS `PatternSeek`, Android `PatternSeek`, KMP `PatternSeek`): impulses before `fromMs` are dropped and the rest
shifted earlier by `fromMs`; each envelope starts with its interpolated value at `fromMs` followed by its later points
shifted; an envelope that ends before `fromMs` holds its last value until the pattern's last timestamp. `fromMs <= 0`
SHALL leave the pattern unchanged.

### REQ-PLAY-004: Pattern with a synced sound
`parsePatternWithSound` SHALL play an audio file with the pattern, where `start`/`duration` select a trim window in the
file (`duration` 0 = to the end) and `offset` delays the audio. A seek SHALL consume the offset lead-in before
advancing into the file. iOS SHALL resolve the uri as `file://`, an existing path, or a main-bundle resource (default
extension `wav`), slice a trimmed window to a temporary file, and register it as a Core Haptics audio event. Android
SHALL use the file's baked haptic channels instead of Pulsar haptics only for an explicit `.ogg` uri with
`hapticChannels` on a device supporting audio-coupled haptics; otherwise it plays the audio and the pattern's
vibration in parallel.

### REQ-PLAY-005: Gating when haptics cannot play
Haptic output SHALL be skipped, without error, when it cannot play. iOS SHALL create or play players only when
haptics are enabled, the app is active and the hardware `supportsHaptics`. Android SHALL skip `vibrate` when haptics
are disabled, `android.permission.VIBRATE` is not granted, or the API level is below 26, and SHALL log and skip a
pattern that fails `VibrationEffect` validation or yields no playable effect. Web `PatternComposer.play()` SHALL return
`false` when haptics are disabled or unavailable (no `navigator.vibrate`, or the `(pointer: coarse)` media query does
not match).

### REQ-PLAY-006: Enabling, disabling and stopping haptics
`enableHaptics(false)` SHALL stop any playing haptics and suppress later output until re-enabled; `stopHaptics()`
SHALL cancel current haptics (iOS stops all players and the engine; Android cancels the vibrator; web calls
registered stop handlers and `navigator.vibrate(0)`). iOS `shutDownEngine()` SHALL stop haptics and discard the engine.

### REQ-PLAY-007: Audio simulation of haptics
On iOS and Android, the composer SHALL render a synthesized audio preview of each parsed pattern and play it on
`play()` when the pattern has no authored sound. Audio simulation SHALL default to on in debug builds and on the
iOS simulator / Android emulator, off otherwise, and `enableSound(state)` SHALL override it (disabling stops current
audio).

### REQ-PLAY-008: Android effect selection by capability
The Android `VibrationEffectsGenerator` SHALL pick, in order: an envelope effect when the API is 36+, envelopes are
supported and the forced support level is at least `STANDARD_SUPPORT` (a Hz-based waveform envelope when a frequency
profile exists and the level is `ADVANCED_SUPPORT`, else a basic sharpness envelope); otherwise an amplitude waveform
when the vibrator has amplitude control and the level is at least `STANDARD_SUPPORT`; otherwise a PWM on/off timing
waveform.

### REQ-PLAY-009: Android impulse-only patterns
When impulse composition mode is enabled (the default) and a pattern is impulses-only (non-empty `discretePattern` and
no continuous amplitude above 0), Android SHALL play it as a `VibrationEffect.Composition` of primitives (frequency
> 0.66 → `PRIMITIVE_CLICK`, > 0.33 → `PRIMITIVE_TICK`, else `PRIMITIVE_LOW_TICK` on API 33+ / `PRIMITIVE_TICK` below)
on API 30+ when every needed primitive is supported. Otherwise it SHALL fall back to one timing pulse per impulse
(`PwmHapticsGenerator.buildImpulseTimings`) on timing-only actuators, or to the regular envelope/amplitude path.
`enableImpulseCompositionMode(false)` SHALL send all patterns through REQ-PLAY-008.

### REQ-PLAY-010: Android PWM for timing-only actuators
`PwmHapticsGenerator` SHALL emulate intensity by pulse width — interpolated from `minPulseMs` to at most `maxPulseMs`
(150 ms), never below `minPulseMs` — and frequency by the gap after each pulse, interpolated from 150 ms down to 30 ms
as frequency rises; stretches with intensity 0 SHALL become gaps, and an empty or all-silent input SHALL produce no
effect. `minPulseMs` SHALL be the actuator's minimum control-point duration: the vendor value (default 15 ms) with
envelope support, 35 ms without primitive support, 15 ms otherwise.

### REQ-PLAY-011: Support level and capabilities
Android `hapticSupport()` SHALL report `ADVANCED_SUPPORT` on API 36+ with a frequency profile, otherwise
`STANDARD_SUPPORT` with amplitude control, otherwise `LIMITED_SUPPORT`; `forceHapticsSupportLevel(mode)` SHALL make
effect generation and audio simulation behave as that level. `hapticCapabilities()` SHALL report amplitude control,
primitive support, envelope support, frequency-profile support and the minimum control-point duration; on iOS the
first three equal hardware `supportsHaptics`, frequency-profile support is `false` and the duration is 0.

### REQ-PLAY-012: iOS realtime composer
The iOS `RealtimeComposer.set(amplitude, frequency)` SHALL start a continuous realtime player on first call and update
its intensity/sharpness (clamped to 0…1) on later calls; `playDiscrete` SHALL play one transient; `stop()` SHALL stop
the player and `isActive` SHALL report whether it is running. Both `set` and `playDiscrete` SHALL do nothing while
haptics are disabled.

### REQ-PLAY-013: Android realtime composer strategies
The Android `RealtimeComposer` SHALL delegate to the strategy chosen at creation: `ENVELOPE`, `PRIMITIVE_TICK`,
`PRIMITIVE_COMPLEX` or `ENVELOPE_WITH_DISCRETE_PRIMITIVES`. The default strategy SHALL be
`ENVELOPE_WITH_DISCRETE_PRIMITIVES` at `STANDARD_SUPPORT` or above, `PRIMITIVE_COMPLEX` at `LIMITED_SUPPORT`, else
`PRIMITIVE_TICK`. Primitive strategies SHALL use a PWM composer (`RealtimePwmComposer`) when the device lacks
primitive support, and widen their tick interval range to 60–200 ms at `LIMITED_SUPPORT`.

### REQ-PLAY-014: Web pattern compilation
The web `PatternComposer.parse` SHALL compile `continuous`, `pulse` and `line` segments into time intervals, merge
overlapping or touching intervals, and emit a `navigator.vibrate` pattern of alternating vibrate/pause durations
(leading `0` when the first vibration is delayed). Pulse and line segments SHALL map intensity to shot length and
frequency to pause length within 20–200 ms; negative timestamps and durations SHALL clamp to 0, and a line segment
with no control points SHALL use a constant 0.5 curve.

### REQ-PLAY-015: Web realtime composer
The web `RealtimeComposer.set(intensity, frequency)` SHALL run a repeating shot/pause loop that picks up the latest
values on each cycle without restarting; intensity 0 SHALL be silence, and any intensity above 0 SHALL produce a shot
of at least 60 ms. It SHALL stop when haptics are disabled or unavailable, when `navigator.vibrate` refuses a shot, on
`stop()`, and on a global `stopHaptics()`.
