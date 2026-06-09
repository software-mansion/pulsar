# pulsar-haptics

A lightweight TypeScript library for playing haptic feedback on the web, with optional audio fallback for devices that don't support the Vibration API.

Works in any modern browser, in any framework — React, Vue, Svelte, Solid, vanilla JS — and ships with ESM, CJS, UMD, and IIFE builds plus full TypeScript types and a first-class React hooks adapter.

## Install

```bash
npm install pulsar-haptics
```

Or use it straight from a CDN:

```html
<script src="https://unpkg.com/pulsar-haptics"></script>
<script>
  const pulsar = new Pulsar.default();
  pulsar.getPresets().play('tap');
</script>
```

## Quick start

### Vanilla JS / TypeScript

```ts
import Pulsar from 'pulsar-haptics';

const pulsar = new Pulsar();

if (pulsar.isHapticsSupported()) {
  pulsar.getPresets().play('tap');
}
```

### React

```tsx
import { usePreset } from 'pulsar-haptics/react';

function LikeButton() {
  const playSuccess = usePreset('success');
  return <button onClick={playSuccess}>Like</button>;
}
```

### Custom patterns

```ts
import { PatternComposer } from 'pulsar-haptics';

const composer = new PatternComposer();
composer.parse([
  { type: 'continuous', timestamp: 0, duration: 40 },
  { type: 'continuous', timestamp: 90, duration: 55 },
  { type: 'continuous', timestamp: 180, duration: 90 },
]);
composer.play();
```

### Realtime (gesture-driven) haptics

```ts
import Pulsar from 'pulsar-haptics';

const pulsar = new Pulsar();
const realtime = pulsar.getRealtimeComposer();

window.addEventListener('pointermove', (e) => {
  const intensity = e.clientX / window.innerWidth;
  const frequency = e.clientY / window.innerHeight;
  realtime.set(intensity, frequency);
});

window.addEventListener('pointerup', () => realtime.stop());
```

## React hooks API (`pulsar-haptics/react`)

| Hook | Returns | Use for |
| ---- | ------- | ------- |
| `useHaptics()` | shared `Pulsar` instance | direct access to the root API |
| `usePresets()` | shared `Presets` registry | listing / playing built-in presets |
| `usePreset(name)` | `() => Promise<...>` | stable callback for a single preset |
| `useHapticsSupport()` | `boolean` (SSR-safe) | feature gating in UI |
| `usePatternComposer(pattern?)` | `{ play, stop, parse, getPattern, isParsed }` | one-shot custom patterns; auto-parses on mount |
| `useRealtimeComposer()` | `{ set, stop, isPlaying, getCurrentValues }` | continuous gesture-driven haptics; auto-stops on unmount |

Pattern + realtime composers are owned per-component and automatically stopped on unmount.

```tsx
import { usePatternComposer, useRealtimeComposer, type HapticPattern } from 'pulsar-haptics/react';

const heartbeat: HapticPattern = [
  { type: 'continuous', timestamp: 0,   duration: 45 },
  { type: 'continuous', timestamp: 120, duration: 70 },
];

function Heart() {
  const composer = usePatternComposer(heartbeat);
  return <button onClick={composer.play}>Beat</button>;
}

function GestureKnob() {
  const realtime = useRealtimeComposer();
  return (
    <div
      onPointerMove={(e) => realtime.set(e.clientX / innerWidth, e.clientY / innerHeight)}
      onPointerUp={() => realtime.stop()}
    />
  );
}
```

## Core API

- `Pulsar` — main entry, exposes presets, pattern composer, realtime composer, global settings
- `Presets` — built-in haptic patterns; call `presets.play('tap')`
- `PatternComposer` — build and play one-shot patterns from segment descriptors
- `RealtimeComposer` — continuously update intensity/frequency for gesture-driven haptics
- `AudioGenerator` — renders an audible fallback when the device has no vibration motor
- `Settings` — global haptics/sound enable flags

Full TypeScript types are bundled with the package.

## Browser support

`navigator.vibrate` is required for haptic output and is available in Chrome, Edge, Firefox, and Chromium-based mobile browsers. Use `pulsar.isHapticsSupported()` (or `useHapticsSupport()` in React) to feature-detect. On unsupported devices, call `pulsar.enableSound(true)` to use the audio fallback.

## License

MIT
