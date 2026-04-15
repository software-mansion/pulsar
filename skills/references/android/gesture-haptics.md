# Gesture-Based Haptics — Android

For general design principles, gesture phases, snap points, and common patterns see **[../common/gesture-haptics.md](../common/gesture-haptics.md)**.

---

## Android Platform Notes

Android has no native continuous haptic API. `RealtimeComposer` simulates it using one of four strategies (`ENVELOPE_WITH_DISCRETE_PRIMITIVES` is the default). The strategy affects fidelity:

| Strategy | Best for |
|---|---|
| `ENVELOPE_WITH_DISCRETE_PRIMITIVES` (default) | Most gestures — smooth continuous + crisp discrete |
| `ENVELOPE` | Long sustained feedback where smooth amplitude matters most |
| `PRIMITIVE_COMPLEX` | Devices below API 36 that need reasonable frequency simulation |
| `PRIMITIVE_TICK` | Maximum compatibility on lower-end devices |

```kotlin
val realtime = pulsar.getRealtimeComposer() // uses default strategy

// In onTouchEvent:
MotionEvent.ACTION_MOVE -> {
    val normalizedVelocity = computeVelocity(event).coerceIn(0f, 1f)
    realtime.set(amplitude = normalizedVelocity, frequency = 0.5f)
}
MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> {
    realtime.stop()
    pulsar.getPresets().snap() // landing event
}
```

On devices with `CompatibilityMode.MINIMAL_SUPPORT` or `NO_SUPPORT`, `RealtimeComposer` calls are silent no-ops — no crash, no feedback. Check `pulsar.hapticSupport()` if you need to adapt your UI.
