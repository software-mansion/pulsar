# react-native-pulsar-lottie

Play [Pulsar](https://github.com/software-mansion/pulsar) haptics **in sync with a Lottie animation**.

`HapticLottieView` is a **non-breaking superset** of [`lottie-react-native`](https://github.com/lottie-react-native/lottie-react-native)'s `LottieView`: it accepts every prop and ref method you already use, and adds a few haptic-only props. With `haptics` omitted it behaves exactly like `LottieView`.

## Install

```sh
npm install react-native-pulsar-lottie
```

Peer dependencies (you almost certainly already have these): `react-native-pulsar`, `lottie-react-native`, `react-native-reanimated`, `react-native-worklets`, `react`, `react-native`.

## Usage

```tsx
import { HapticLottieView } from 'react-native-pulsar-lottie';

// `pattern` is a Pulsar Pattern — e.g. exported from Pulsar Studio, or hand-built.
const pattern = {
  discretePattern: [{ time: 0, amplitude: 1, frequency: 0.5 }],
  continuousPattern: {
    amplitude: [{ time: 0, value: 0 }, { time: 400, value: 1 }, { time: 800, value: 0 }],
    frequency: [{ time: 0, value: 0.3 }, { time: 800, value: 0.8 }],
  },
};

function Success() {
  return (
    <HapticLottieView
      source={require('./success.json')}
      haptics={pattern}
      autoPlay
      style={{ width: 200, height: 200 }}
    />
  );
}
```

Anything you can do with `LottieView` still works — `source`, `loop`, `autoPlay`, `style`, `resizeMode`, the imperative `ref` (`play` / `pause` / `resume` / `reset`), and so on. You only **add** haptics.

## Haptic props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `haptics` | `Pattern \| () => void` | – | Pattern to sync, or a preset trigger fn (`pattern` mode only). |
| `hapticMode` | `'realtime' \| 'pattern'` | `'realtime'` | Engine mode — see below. |
| `hapticOffset` | `number` (ms) | `0` | Shift haptics ± relative to the animation (device tuning). |
| `hapticsEnabled` | `boolean` | `true` | Turn haptics off without touching the animation. |
| `durationMs` | `number` | derived | `realtime` clock length. Derived from the Lottie JSON (`fr`/`ip`/`op`) or the pattern; set it when neither is available. |

## Engine modes

- **`realtime`** (default) — the animation timeline is the master clock. A Reanimated frame callback drives the Lottie `progress` on the UI thread and samples your pattern into `RealtimeComposer` events. Honours `pause`, `setTimestamp`, `loop`, and segments coherently. Requires a `Pattern` source. Continuous fidelity is realtime-grade (coarser on Android). **No playback-speed control** — the haptic timeline can't be rate-shifted coherently, so the animation runs at its authored speed.
- **`pattern`** — the pattern (or a preset) plays whole via `PatternComposer`, aligned to the animation start (best native fidelity). Limitations: `pause` stops the haptic, and there is no mid-pattern seek. Best for short, mostly start-aligned animations.

## Imperative control

```tsx
const ref = useRef<HapticLottieRef>(null);
// ...
ref.current?.play();          // start animation + haptics together
ref.current?.pause();         // pause both
ref.current?.setTimestamp(1200); // seek both to 1.2s (realtime mode)
ref.current?.reset();
```

## Attach to a `LottieView` you already own

If you'd rather not swap the component, `useHapticLottie` fires a pattern/preset alongside your own transport (aligned-start / `pattern` mode):

```tsx
const haptics = useHapticLottie({ haptics: pattern });
// call haptics.play() next to your lottieRef.play(); haptics.stop() on pause.
```

## License

MIT
