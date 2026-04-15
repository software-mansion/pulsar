# Gesture-Based Haptics — iOS

For general design principles, gesture phases, snap points, and common patterns see **[../common/gesture-haptics.md](../common/gesture-haptics.md)**.

---

## iOS Platform Notes

`RealtimeComposer` drives a CoreHaptics `CHHapticPatternPlayer` in dynamic mode. `set(amplitude:frequency:)` sends a parameter update event to the running player — no new player is created on each call.

```swift
let realtime = pulsar.getRealtimeComposer()

// In UIPanGestureRecognizer handler:
case .changed:
    let speed = hypot(velocity.x, velocity.y)
    let amplitude = Float(min(speed / 1000.0, 1.0))
    realtime.set(amplitude: amplitude, frequency: 0.5)
case .ended, .cancelled:
    realtime.stop()
    pulsar.getPresets().snap() // landing event
```

`playDiscrete(amplitude:frequency:)` fires a single transient event without stopping the ongoing continuous haptic — use this for snap point clicks while a drag is in progress.
