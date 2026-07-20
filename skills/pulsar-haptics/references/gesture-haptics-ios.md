# Gesture-Driven Haptics: iOS

## API structure

`Pulsar` owns the haptic engine. `getRealtimeComposer()` returns one shared realtime channel per `Pulsar` instance:

- `set(amplitude:frequency:)` updates continuous output.
- `playDiscrete(amplitude:frequency:)` overlays a snap impulse without stopping continuous output.
- `stop()` ends continuous output.
- `isActive` reports whether continuous output is running.
- `getPresets()` provides discrete landing or completion events.

There are no selectable realtime strategies on iOS. Core Haptics provides the native continuous implementation when supported; methods safely do nothing when haptics are disabled or unavailable. Feed these methods from `UIGestureRecognizer` state changes. Stop on `.ended`, `.cancelled`, and `.failed`; use a preset only when the resulting state is meaningful.

## Example

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
