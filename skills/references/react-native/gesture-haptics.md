# Gesture-Based Haptics — React Native

For general design principles, gesture phases, snap points, and common patterns see **[../common/gesture-haptics.md](../common/gesture-haptics.md)**.

---

## React Native Platform Notes

`useRealtimeComposer` exposes the same `set` / `playDiscrete` / `stop` interface. All methods carry the `'worklet'` directive — safe to call directly inside Reanimated gesture handlers without bridging to JS.

```tsx
const realtime = useRealtimeComposer();

const pan = Gesture.Pan()
  .onUpdate((e) => {
    const amplitude = Math.min(Math.abs(e.velocityX) / 800, 1);
    realtime.set(amplitude, 0.5); // runs on UI thread
  })
  .onEnd(() => {
    realtime.stop();
    Presets.snap(); // landing event
  });
```

Configure the Android strategy globally if the default doesn't suit your use case:

```ts
import { Settings, RealtimeComposerStrategy } from 'react-native-pulsar';
Settings.setRealtimeComposerStrategy(RealtimeComposerStrategy.PRIMITIVE_COMPLEX);
```
