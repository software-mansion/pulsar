# Gesture-Driven Haptics

## Contents

- [Core design principle: physical coupling](#core-design-principle-physical-coupling)
- [Mapping gesture values to haptic parameters](#mapping-gesture-values-to-haptic-parameters)
- [Gesture phases and when to fire](#gesture-phases-and-when-to-fire)
- [Resistance and boundary haptics](#resistance-and-boundary-haptics)
- [Common patterns](#common-patterns)
- [React Native](#react-native)
- [iOS](#ios)
- [Android](#android)
- [Throttling, performance, and cleanup](#throttling-performance-and-cleanup)

## Core Design Principle: Physical Coupling

Gesture haptics should feel caused by the gesture, not merely triggered by it. Use `RealtimeComposer`, not `PatternComposer`, when values change during interaction:

- Update parameters on gesture callbacks, not only at start or end.
- Track speed or pressure with amplitude.
- Quiet output when movement pauses; intensify it when movement accelerates or resistance rises.
- Use a preset or discrete event for one threshold, tick, landing, or completed state change.

## Mapping Gesture Values to Haptic Parameters

Velocity to amplitude is useful for swipes, drags, and scrolls where force matters:

```ts
amplitude = clamp(abs(velocity) / maxExpectedVelocity, 0, 1)
```

Apply a square-root or logarithmic curve if linear mapping feels too twitchy at low speeds.

Position or distance to a boundary can drive frequency for resistance feedback:

- Raise frequency as the drag approaches its limit; use `0.3–0.5` in free space and up to `0.7` near a boundary.
- Choose normalization constants from actual gesture telemetry and tune on hardware. Do not copy example divisors blindly.

## Gesture Phases and When to Fire

| Phase | Action |
|---|---|
| **Began** | Prepare or start `RealtimeComposer`; do not fire a discrete event yet. |
| **Changed** | Update amplitude and frequency continuously from gesture values. |
| **Snap point hit** | Layer one crisp discrete event (`ping`, `chip`, `snap`, or `peck`) over the continuous signal. Fire exactly when UI snaps, within the 45–75 ms sync window. For scroll tickers, fire the same light event at each tick. |
| **Boundary reached** | Briefly spike amplitude, then return to the continuous level. See [Resistance and boundary haptics](#resistance-and-boundary-haptics). |
| **Ended — settled** | Stop continuous output; fire one landing event (`stamp`, `lock`, or `snap`). |
| **Ended — released mid-drag** | Stop output; optionally fire a release event sized to release velocity. |
| **Cancelled, interrupted, or failed** | Stop immediately; normally fire no completion event, or use a very soft fade. |

## React Native

Composer methods are worklet-compatible:

```tsx
const realtime = useRealtimeComposer();

const pan = Gesture.Pan()
  .onUpdate((event) => {
    const amplitude = Math.min(Math.abs(event.velocityX) / 800, 1);
    realtime.set(amplitude, 0.5);
  })
  .onEnd(() => {
    realtime.stop();
    Presets.snap();
  })
  .onFinalize(() => {
    realtime.stop();
  });
```

Hook surface:

```ts
const { set, playDiscrete, stop, isActive } = useRealtimeComposer();
```

Android strategy can be selected globally:

```ts
Settings.setRealtimeComposerStrategy(
  RealtimeComposerStrategy.ENVELOPE_WITH_DISCRETE_PRIMITIVES
);
```

## iOS

`getRealtimeComposer()` returns one shared realtime channel per `Pulsar` instance:

```swift
let realtime = pulsar.getRealtimeComposer()

switch gesture.state {
case .changed:
  let speed = hypot(velocity.x, velocity.y)
  realtime.set(amplitude: Float(min(speed / 1000, 1)), frequency: 0.5)
case .ended:
  realtime.stop()
  pulsar.getPresets().snap()
case .cancelled, .failed:
  realtime.stop()
default:
  break
}
```

Use `playDiscrete(amplitude:frequency:)` for a snap point without stopping the continuous channel.

## Android

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

Android simulates realtime output according to device support:

| Strategy | Use |
|---|---|
| `ENVELOPE_WITH_DISCRETE_PRIMITIVES` | Default hybrid when supported. |
| `ENVELOPE` | Smooth sustained envelopes on advanced devices. |
| `PRIMITIVE_COMPLEX` | Better frequency approximation with primitives. |
| `PRIMITIVE_TICK` | Broadest lower-capability fallback. |

Pass a strategy to `getRealtimeComposer(strategy = ...)` when device-specific tuning is necessary. Otherwise keep automatic selection.

## Resistance and Boundary Haptics

For spring boundaries, rubberband edges, and pull-to-refresh thresholds:

- Gradually raise amplitude as the drag nears the limit: about `0.3` for free drag, `0.7` near the limit, and `0.9` at the limit.
- Increase frequency to signal stiffness.
- At the hard boundary, fire a brief spike, then let amplitude fall.
- When the user crosses a meaningful threshold, fire a distinct confirmation event such as `stamp()` or `lock()`.

## Common Patterns

| Gesture | Continuous signal | Discrete events |
|---|---|---|
| Drag-and-drop | Low amplitude (`0.2`), neutral frequency (`0.4`) | Snap on drop-target enter; `stamp()` on release. |
| Rubberband edge | Rising amplitude and frequency as drag extends | Spike at maximum extension. |
| Scroll ticker | Usually none | Light `ping()` or `chip()` at each tick. |
| Swipe-to-delete | Rising amplitude past threshold | `cleave()` on delete confirmation. |
| Pull-to-refresh | None during pull; slight rumble (`0.2`) above threshold | `lock()` or `stamp()` at release-to-refresh. |
| Pinch-to-zoom | Low amplitude (`0.15–0.25`), velocity-mapped | Event only at zoom boundary. |
| Slider knob | Low amplitude (`0.1–0.2`) or none | `ping()` at each notch or step. |

## Throttling, Performance, and Cleanup

- Create or obtain composer once per interaction owner, not per move event.
- Update on gesture callbacks; 60 Hz is safe on most devices.
- Keep callbacks cheap and allocation-free; pre-compute parameter curves when calculations are expensive.
- Stop on end, cancellation, interruption, and unmount/disposal.
- A running composer without an attached gesture drains battery and can interfere with other haptics.
- Avoid continuous feedback for ordinary scrolling or long uncontrolled operations.
- Pair important snap, drop, or delete outcomes with the corresponding visual state change.
