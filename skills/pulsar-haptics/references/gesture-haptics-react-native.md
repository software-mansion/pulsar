# Gesture-Driven Haptics: React Native

## API structure

`useRealtimeComposer()` returns a composer facade with worklet-compatible methods:

- `set(amplitude, frequency)` updates continuous output.
- `playDiscrete(...)` layers a short event over continuous output.
- `stop()` ends continuous output and should run on completion and cancellation.
- `isActive()` reports composer state when the UI needs it.

Drive `set` from gesture updates, use `playDiscrete` for snap points, and clean up in the final gesture callback. The hook also stops the composer automatically on component unmount. Configure Android realtime strategy separately through `Settings` when needed.

## Example

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
