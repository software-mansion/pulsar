# Web Pulsar Agent Context

This file captures the current state of the `web/Pulsar` package so a future agent can get productive quickly without re-discovering the architecture.

## Package Purpose

`web/Pulsar` is the web implementation of the Pulsar haptics SDK.

On the web, there is no native control over haptic intensity or frequency. Because of that, the library simulates those dimensions with PWM-style vibration timing:

- longer "on" shots simulate stronger intensity
- shorter pauses simulate higher frequency

The package currently focuses on:

- custom pattern playback through the Web Vibration API
- realtime gesture-style haptics through a looping PWM strategy
- audio simulation for hearing pattern shape in environments where vibration is limited or unavailable
- a `Pulsar` class as the main library entry point

## Important Files

- [src/Pulsar.ts](/Users/piaskowyk/projects/pulsar-web/web/Pulsar/src/Pulsar.ts:1)
  Main public entry point class.
- [src/PatternComposer.ts](/Users/piaskowyk/projects/pulsar-web/web/Pulsar/src/PatternComposer.ts:1)
  Compiles timestamped haptic descriptions into `navigator.vibrate()` patterns.
- [src/RealtimeComposer.ts](/Users/piaskowyk/projects/pulsar-web/web/Pulsar/src/RealtimeComposer.ts:1)
  Runs continuous gesture-driven PWM haptics.
- [src/AudioGenerator.ts](/Users/piaskowyk/projects/pulsar-web/web/Pulsar/src/AudioGenerator.ts:1)
  Generates Web Audio buffers from haptic patterns, aligned to web PWM behavior.
- [src/Settings.ts](/Users/piaskowyk/projects/pulsar-web/web/Pulsar/src/Settings.ts:1)
  Global runtime toggles for haptics and sound.
- [src/Engine.ts](/Users/piaskowyk/projects/pulsar-web/web/Pulsar/src/Engine.ts:1)
  Shared timing capabilities source.
- [src/types.ts](/Users/piaskowyk/projects/pulsar-web/web/Pulsar/src/types.ts:1)
  Public types for haptic patterns.
- [src/index.ts](/Users/piaskowyk/projects/pulsar-web/web/Pulsar/src/index.ts:1)
  Package export surface.
- [tests](/Users/piaskowyk/projects/pulsar-web/web/Pulsar/tests)
  Node-based test suite.

## Public API Today

### `Pulsar`

Current methods on `Pulsar`:

- `getPresets()`
- `getPatternComposer()`
- `getRealtimeComposer()`
- `isHapticsSupported()`
- `enableHaptics(state)`
- `enableSound(state)`
- `stopHaptics()`

Current instance lifetime behavior:

- `getPresets()` returns the same shared instance
- `getPatternComposer()` returns a fresh instance on every call
- `getRealtimeComposer()` returns the same shared instance

Important note:

- `AudioGenerator` is exported from `src/index.ts`, but `Pulsar` does **not** currently expose `getAudioGenerator()`
- if a future task expects `pulsar.getAudioGenerator()`, that is a missing feature, not current behavior

### `PatternComposer`

`PatternComposer` accepts `HapticPattern`, where entries are either:

- `continuous`
- `pulse`
- `line`

Behavior:

- `continuous` becomes one uninterrupted vibration interval
- `pulse` becomes repeated vibration shots separated by pauses
- `line` becomes repeated vibration shots separated by pauses, but the shot/pause sizes are
  interpolated over time from control points
- higher `intensity` means longer shots
- higher `frequency` means shorter pauses
- overlapping intervals are merged before producing the final vibrate sequence

Current public methods:

- `parse(pattern)`
- `play()`
- `stop()`
- `getPattern()`

### `RealtimeComposer`

`RealtimeComposer` is intended for gesture-driven haptics.

Behavior:

- `set(intensity, frequency)` starts playback if needed and updates the active PWM parameters
- it replays short vibration shots in a loop using `setTimeout`
- `stop()` cancels the loop and stops browser vibration
- it is integrated with `Settings`, so disabling haptics globally stops the loop

Current public methods:

- `set(intensity, frequency)`
- `stop()`
- `isPlaying()`
- `getCurrentValues()`

### `AudioGenerator`

The web audio simulation intentionally follows the same timing that actual web haptics use.

Design choice:

- it first uses `PatternComposer.parse()` to get the final vibration timeline
- then it gates a single fixed buzz across the resulting "on" windows
- this keeps audio preview aligned with actual web haptic playback

Core constraint (must not be violated):

- web haptics drive the vibration motor at one **fixed frequency** and one **fixed amplitude**; `navigator.vibrate` can only control *when* the motor is on
- so every "on" window is rendered with the exact same carrier frequency (`CARRIER_FREQUENCY_HZ`), the same amplitude (`PULSE_VOLUME`), and the same fixed harmonic timbre (`BUZZ_HARMONICS`)
- `renderInterval` must never derive pitch or loudness from a window's duration — intensity and frequency are expressed purely through the PWM timing (longer shots feel stronger, tighter shots feel buzzier), exactly as the real web haptic does

Current public methods:

- `parse(pattern)`
- `play()`
- `stop()`
- `isPlaying()`
- `getBufferInfo()`

### `Settings`

`Settings` is global module-level state, not per-`Pulsar` instance.

Current capabilities:

- enable/disable haptics globally
- enable/disable sound globally
- detect browser haptics availability
- stop all active haptics
- register stop handlers for long-lived haptic producers like `RealtimeComposer`

## Shared Timing Model

Timing capabilities are centralized in `Engine.ts` via:

- `getHapticTimingCapabilities()`

Current returned values:

- `minPulseMs: 20`
- `maxPulseMs: 200`
- `minPauseMs: 20`
- `maxPauseMs: 200`

Important implementation detail:

- composers cache these values once per object instance
- the helper exists so device-specific timing can be introduced later without rewriting the composers

## Architectural Decisions Already Made

### 1. Web haptics are modeled as intervals, not native intensity/frequency controls

This package does not pretend the browser can do amplitude control. Instead, it simulates feel through timing.

### 2. `PatternComposer` is the source of truth for final web haptic timing

When behavior questions come up, the generated vibrate timeline is the truth.

### 3. Audio simulation should track web playback behavior, not mobile-native behavior

The audio layer is not trying to emulate Core Haptics or Android amplitude APIs directly. It is trying to sound like the web PWM approximation.

### 4. Global settings must actively stop running haptics

Disabling haptics is not just a stored flag. It must stop active realtime playback immediately.

## Testing Setup

Tests live in `web/Pulsar/tests`.

Current runner:

- `npm test`
- uses Node's built-in test runner with `--experimental-strip-types`

Useful commands:

```bash
cd web/Pulsar
npm test
npm run typecheck
```

The package is currently green on both:

- runtime tests
- TypeScript typecheck

## Existing Test Coverage

There are tests for:

- `PatternComposer` parsing and playback behavior
- `RealtimeComposer` loop behavior and live parameter updates
- `Settings` global enable/disable and stop propagation
- `Pulsar` object lifetime and delegation behavior
- `AudioGenerator` timing fidelity and playback behavior

If a future change touches any of those areas, update tests alongside the implementation.

## Known Gaps / Incomplete Areas

- `Presets.ts` is only a placeholder right now
- `Pulsar.getPresets()` is structurally present, but named web presets are not implemented
- sound is globally configurable in `Settings`, but there is no higher-level automatic "play sound instead of haptics" orchestration yet
- `AudioGenerator` exists as a standalone tool, but is not yet connected into a fallback path inside `Pulsar`, `PatternComposer`, or `RealtimeComposer`
- `Pulsar` does not currently expose `getAudioGenerator()`, despite `AudioGenerator` being exported from `index.ts`

## Good Next Steps For Future Work

Depending on the task, the most natural next areas are:

1. Implement real web presets in `Presets.ts`
2. Decide whether `Pulsar` should expose `getAudioGenerator()`
3. Add automatic audio fallback behavior when haptics are unavailable but sound is enabled
4. Move more shared timing/math helpers into `Engine.ts`
5. Add package-level README docs specifically for the web SDK

## Things To Be Careful About

- `Settings` is global state, so tests and runtime code need to reset assumptions cleanly
- `RealtimeComposer` depends on registered stop handlers; if you change stop behavior, keep global disable semantics intact
- `PatternComposer` overlap merging is necessary for valid final vibration output
- Node test execution requires explicit `.ts` source imports because the package relies on ESM plus Node's strip-types mode
- strict TS config includes `noUncheckedIndexedAccess`, so tuple/array indexing often needs defensive structure
