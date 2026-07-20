# Gesture-Driven Haptics: Android

## API structure

`Pulsar` owns the haptic engine. `getRealtimeComposer()` returns the realtime composer:

- `set(amplitude = ..., frequency = ...)` updates continuous output.
- `playDiscrete(amplitude, frequency)` overlays a short event without stopping continuous output.
- `stop()` ends continuous output.
- `isActive()` reports whether continuous output is running.
- `getPresets()` provides discrete landing or completion events.
- Realtime strategy is selected automatically or passed to `getRealtimeComposer(strategy = ...)` for device-specific tuning.

Unlike iOS, Android has no single true continuous-haptics path. It simulates realtime output with one of these strategies:

| Strategy | Use |
|---|---|
| `ENVELOPE_WITH_DISCRETE_PRIMITIVES` | Default on standard-support devices: Envelope API for continuous output and composition primitives for discrete events. Uses waveform/one-shot fallbacks on lower API levels or capability tiers. |
| `ENVELOPE` | Envelope API approximation with amplitude and frequency control on Android API 36+; may oscillate or feel unstable. Older or unsupported devices fall back to amplitude/timing waveforms. |
| `PRIMITIVE_COMPLEX` | Uses multiple vibration primitives to approximate requested frequency; below API 33, falls back to short one-shot pulses. |
| `PRIMITIVE_TICK` | Uses timed tick primitives; broadest fallback, with frequency represented by tick intervals and short one-shot pulses below API 33. |

`playDiscrete` requests a separate vibration effect, but Android does not guarantee that it layers over the active continuous effect; behavior can vary by strategy and device. Feed `set` from motion updates, then stop on `ACTION_UP` and `ACTION_CANCEL`. Use a preset or discrete event only for a meaningful snap or completed state.

## Example

```kotlin
val realtime = pulsar.getRealtimeComposer()

when (event.action) {
    MotionEvent.ACTION_MOVE -> {
        val amplitude = computeVelocity(event).coerceIn(0f, 1f)
        realtime.set(amplitude = amplitude, frequency = 0.5f)
    }
    MotionEvent.ACTION_UP -> {
        realtime.stop()
        pulsar.getPresets().snap()
    }
    MotionEvent.ACTION_CANCEL -> realtime.stop()
}
```
