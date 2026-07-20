# Gesture-Driven Haptics

## Contents

- [Interaction model](#interaction-model)
- [Parameter mapping](#parameter-mapping)
- [Gesture phases](#gesture-phases)
- [React Native](#react-native)
- [iOS](#ios)
- [Android](#android)
- [Performance and cleanup](#performance-and-cleanup)

## Interaction Model

Use RealtimeComposer when haptic output must track a changing gesture. The signal should feel physically coupled to motion: quiet when movement pauses, stronger with speed or resistance, and stopped when the gesture ends.

Use a preset instead for a single threshold, tick, landing, or completed state change.

## Parameter Mapping

- velocity to amplitude: `clamp(abs(velocity) / expectedMaximum, 0, 1)`
- distance to a boundary to frequency: rise from soft/neutral toward crisp as resistance increases
- snap point: layer one short discrete event over any continuous signal

Choose normalization constants from actual gesture telemetry and tune on hardware. Do not copy example divisors blindly.

## Gesture Phases

| Phase | Action |
|---|---|
| began | Prepare composer; avoid feedback until motion or a meaningful event occurs. |
| changed | Update amplitude and frequency from normalized values. |
| threshold or snap | Fire one discrete event such as `ping`, `chip`, or `snap`. |
| completed | Stop continuous output; optionally play a landing preset. |
| cancelled | Stop immediately; normally play no completion event. |

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

## Performance and Cleanup

- Create or obtain composer once per interaction owner, not per move event.
- Keep update callbacks cheap and allocation-free.
- Stop on end, cancellation, interruption, and unmount/disposal.
- Avoid continuous feedback for ordinary scrolling or long uncontrolled operations.
- Pair important snap, drop, or delete outcomes with the corresponding visual state change.
