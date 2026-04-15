# Pulsar React Native — API Overview

## Installation

```bash
# Expo
npx expo install react-native-pulsar
npx expo prebuild

# Yarn / npm / pnpm / Bun
yarn add react-native-pulsar react-native-worklets
```

**Requirements:** React Native 0.71+, New Architecture enabled, `react-native-worklets` for gesture/Reanimated integration.

---

## Using Presets

Presets are the simplest way to add haptics. Import `Presets` and call any named function directly.

```ts
import { Presets } from 'react-native-pulsar';

Presets.ping();
Presets.fanfare();
Presets.buzz();
```

All preset functions are **synchronous** (no `await`), **worklet-compatible**, and take no parameters.

```tsx
// In a React event handler
<Button onPress={() => Presets.stamp()} title="Confirm" />

// In a gesture handler (worklet context)
const tap = Gesture.Tap().onEnd(() => {
  Presets.ping(); // safe — preset is a worklet
});
```

See [Presets Guide](presets-guide.md) for the full list of available presets, with descriptions and usage guidance.

---

## System Presets

System presets mirror the platform's built-in haptic vocabulary and are cross-platform safe.

```ts
import { Presets } from 'react-native-pulsar';

// Common system presets (iOS + Android)
Presets.System.impactLight();
Presets.System.impactMedium();
Presets.System.impactHeavy();
Presets.System.impactSoft();
Presets.System.impactRigid();
Presets.System.notificationSuccess();
Presets.System.notificationWarning();
Presets.System.notificationError();
Presets.System.selection();

// Android-only system presets — standard Android API (not vendor-specific)
// VibrationEffect (API 26+)
Presets.System.Android.effectClick();
Presets.System.Android.effectDoubleClick();
Presets.System.Android.effectHeavyClick();
Presets.System.Android.effectTick();

// VibrationEffect.Composition primitives (API 33+)
Presets.System.Android.primitiveClick();
Presets.System.Android.primitiveLowTick();
Presets.System.Android.primitiveQuickFall();
Presets.System.Android.primitiveQuickRise();
Presets.System.Android.primitiveSlowRise();
Presets.System.Android.primitiveSpin();
Presets.System.Android.primitiveThud();
Presets.System.Android.primitiveTick();
```

**iOS UIKit mapping:**

| Pulsar | iOS equivalent |
|---|---|
| `impactLight()` | `UIImpactFeedbackGenerator.light` |
| `impactMedium()` | `UIImpactFeedbackGenerator.medium` |
| `impactHeavy()` | `UIImpactFeedbackGenerator.heavy` |
| `impactSoft()` | `UIImpactFeedbackGenerator.soft` |
| `impactRigid()` | `UIImpactFeedbackGenerator.rigid` |
| `notificationSuccess()` | `UINotificationFeedbackGenerator.success` |
| `notificationWarning()` | `UINotificationFeedbackGenerator.warning` |
| `notificationError()` | `UINotificationFeedbackGenerator.error` |
| `selection()` | `UISelectionFeedbackGenerator.selection` |

**Android API mapping:**

| Pulsar | Android equivalent | API level |
|---|---|---|
| `impactLight()` | `VibrationEffect.createPredefined(EFFECT_CLICK)` | 29+ |
| `impactMedium()` | `VibrationEffect.createPredefined(EFFECT_HEAVY_CLICK)` | 29+ |
| `impactHeavy()` | `VibrationEffect.createPredefined(EFFECT_HEAVY_CLICK)` | 29+ |
| `impactSoft()` | `VibrationEffect.createPredefined(EFFECT_TICK)` | 29+ |
| `impactRigid()` | `VibrationEffect.createPredefined(EFFECT_CLICK)` | 29+ |
| `notificationSuccess()` | `VibrationEffect.createPredefined(EFFECT_DOUBLE_CLICK)` | 29+ |
| `notificationWarning()` | `VibrationEffect.createPredefined(EFFECT_HEAVY_CLICK)` | 29+ |
| `notificationError()` | `VibrationEffect.createPredefined(EFFECT_DOUBLE_CLICK)` | 29+ |
| `selection()` | `VibrationEffect.createPredefined(EFFECT_TICK)` | 29+ |
| `effectClick()` | `VibrationEffect.EFFECT_CLICK` | 29+ |
| `effectDoubleClick()` | `VibrationEffect.EFFECT_DOUBLE_CLICK` | 29+ |
| `effectHeavyClick()` | `VibrationEffect.EFFECT_HEAVY_CLICK` | 29+ |
| `effectTick()` | `VibrationEffect.EFFECT_TICK` | 29+ |
| `primitiveClick()` | `VibrationEffect.Composition.PRIMITIVE_CLICK` | 31+ |
| `primitiveLowTick()` | `VibrationEffect.Composition.PRIMITIVE_LOW_TICK` | 31+ |
| `primitiveQuickFall()` | `VibrationEffect.Composition.PRIMITIVE_QUICK_FALL` | 31+ |
| `primitiveQuickRise()` | `VibrationEffect.Composition.PRIMITIVE_QUICK_RISE` | 31+ |
| `primitiveSlowRise()` | `VibrationEffect.Composition.PRIMITIVE_SLOW_RISE` | 31+ |
| `primitiveSpin()` | `VibrationEffect.Composition.PRIMITIVE_SPIN` | 31+ |
| `primitiveThud()` | `VibrationEffect.Composition.PRIMITIVE_THUD` | 31+ |
| `primitiveTick()` | `VibrationEffect.Composition.PRIMITIVE_TICK` | 31+ |

---

## Custom Patterns with usePatternComposer

When no built-in preset fits, define a custom `Pattern`. A pattern combines **discrete** events (individual taps / impulses) and **continuous** envelopes (sustained vibration that evolves over time).

**Pattern type:**
```ts
type Pattern = {
  discretePattern: Array<{
    time: number;      // ms from pattern start
    amplitude: number; // 0–1, intensity
    frequency: number; // 0–1, sharpness (0 = soft, 1 = crisp)
  }>;
  continuousPattern: {
    amplitude: Array<{ time: number; value: number }>; // amplitude envelope
    frequency: Array<{ time: number; value: number }>; // frequency envelope
  };
};
```

**Hook API:**
```ts
const { play, stop, parse, isParsed } = usePatternComposer(pattern?);
```

| Method | Description |
|---|---|
| `play()` | Play the parsed pattern |
| `stop()` | Stop active playback |
| `parse(pattern)` | Parse a new pattern programmatically |
| `isParsed()` | Returns `true` if pattern is ready to play |

The pattern is parsed on mount (if provided) and re-parsed whenever `pattern` changes. Resources are released automatically on unmount. If no `pattern` is provided to the hook, you can supply one later by calling `parse(pattern)` directly on the returned object.

**Example:**
```tsx
import { usePatternComposer } from 'react-native-pulsar';

const pattern = {
  discretePattern: [
    { time: 0,   amplitude: 1.0, frequency: 0.8 }, // sharp opening tap
    { time: 100, amplitude: 0.5, frequency: 0.4 }, // softer second tap
    { time: 200, amplitude: 0.2, frequency: 0.2 }, // gentle close
  ],
  continuousPattern: {
    amplitude: [
      { time: 0,   value: 0.3 },
      { time: 150, value: 1.0 },
      { time: 300, value: 0.0 },
    ],
    frequency: [
      { time: 0,   value: 0.2 },
      { time: 300, value: 0.7 },
    ],
  },
};

function MyComponent() {
  const composer = usePatternComposer(pattern);

  return <Button onPress={() => composer.play()} title="Custom Haptic" />;
}
```

For pattern design tips — amplitude ranges, frequency ranges, and when to use discrete vs. continuous patterns — see [Design Principles — Custom Pattern Parameters](../common/design-principles.md#custom-pattern-parameters).

---

## Gesture-Based Haptics with useRealtimeComposer

> **Gesture design guide:** For design principles, parameter mapping, phase tables, and common gesture patterns (drag-and-drop, snap points, pull-to-refresh, swipe-to-delete), see [Gesture-Based Haptics](../common/gesture-haptics.md). This section covers the React Native hook API only.

`useRealtimeComposer` lets you modulate haptic intensity and sharpness in real time, synchronized with user gestures.

**Hook API:**
```ts
const { set, playDiscrete, stop, isActive } = useRealtimeComposer();
```

| Method | Description |
|---|---|
| `set(amplitude, frequency)` | Update ongoing haptic in real time (0–1 each) |
| `playDiscrete(amplitude, frequency)` | Fire a single discrete event (0–1 each) |
| `stop()` | Stop active haptic |
| `isActive()` | Returns `true` if haptic is currently playing |

**Pan gesture example:**
```tsx
import { useRealtimeComposer } from 'react-native-pulsar';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

function DraggableSlider() {
  const realtime = useRealtimeComposer();

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      const amplitude = Math.min(Math.abs(e.velocityX) / 800, 1);
      realtime.set(amplitude, 0.5);
    })
    .onEnd(() => {
      realtime.stop();
    });

  return (
    <GestureDetector gesture={pan}>
      <View style={styles.slider} />
    </GestureDetector>
  );
}
```

**Android note:** Android has no native continuous haptic API. Pulsar simulates it. Configure the strategy if the default doesn't meet your needs:

```ts
import { Settings, RealtimeComposerStrategy } from 'react-native-pulsar';

Settings.setRealtimeComposerStrategy(RealtimeComposerStrategy.ENVELOPE_WITH_DISCRETE_PRIMITIVES);
```

| Strategy | Requirements | Notes |
|---|---|---|
| `ENVELOPE_WITH_DISCRETE_PRIMITIVES` | API 33+ / 36+ | **Default.** Best of both worlds. |
| `ENVELOPE` | API 36+ | Continuous control, can oscillate. |
| `PRIMITIVE_TICK` | API 33+ | Tick-based, max compatibility. |
| `PRIMITIVE_COMPLEX` | API 33+ | Multi-primitive, better frequency simulation. |

---

## Cross-Platform Adaptive Haptics

`useAdaptiveHaptics` lets you define different haptic configs per platform within a single preset object.

```ts
type AdaptivePresetConfig = (() => void) | Pattern;

type AdaptivePreset = {
  ios: AdaptivePresetConfig;
  android: AdaptivePresetConfig;
};
```

```tsx
import { useAdaptiveHaptics, Presets } from 'react-native-pulsar';

const myPreset = {
  ios: Presets.fanfare,   // function reference, NOT called here
  android: {              // custom pattern tuned for Android
    discretePattern: [
      { time: 0,   amplitude: 1.0, frequency: 0.6 },
      { time: 120, amplitude: 0.5, frequency: 0.3 },
    ],
    continuousPattern: { amplitude: [], frequency: [] },
  },
};

function MyComponent() {
  const haptics = useAdaptiveHaptics(myPreset);
  return <Button onPress={haptics.play} title="Celebrate" />;
}
```

Use this hook when a Pulsar preset feels meaningfully different between platforms and you need platform-specific tuning.

---

## Caching, Preloading & Startup Optimization

### How caching works

By default, Pulsar caches preset instances. The first play creates and stores a player; subsequent calls reuse it.

- **First play:** Small initialization cost.
- **Subsequent plays:** Near-zero latency.

### Preloading

For interactions where the first play must feel instant, preload critical presets at app startup:

```ts
import { Settings } from 'react-native-pulsar';

// Call early — before any haptics play
Settings.preloadPresets(['Fanfare', 'Ping', 'Buzz', 'Stamp']);
```

Preset names are **PascalCase strings** (e.g., `'Fanfare'` for `Presets.fanfare()`). Preloading automatically enables caching.

**When to preload:**
- When the latency of the first play is noticeable and detrimental to UX.
- Button taps that must fire without perceptible delay.
- Game events where multiple presets must be ready simultaneously.
- Onboarding flows with a known preset set.

### Caching vs. Preloading

| | Caching | Preloading |
|---|---|---|
| **Initialization** | On first play | At startup |
| **First-play latency** | Small | Minimal |
| **Default** | Enabled | Opt-in |
| **Memory** | Grows as used | Allocated upfront |

```ts
Settings.enableCache(true);   // Enable (default)
Settings.enableCache(false);  // Disable — forces fresh init every play
Settings.clearCache();        // Free all cached players
```

---

## Settings API Reference

```ts
import { Settings } from 'react-native-pulsar';
```

| Method | Description |
|---|---|
| `Settings.enableHaptics(state: boolean)` | Globally enable or disable all haptic feedback |
| `Settings.enableSound(state: boolean)` | Enable/disable audio simulation (default: on in debug) |
| `Settings.enableCache(state: boolean)` | Enable/disable preset caching (default: enabled) |
| `Settings.clearCache()` | Clear all cached preset players |
| `Settings.preloadPresets(names: string[])` | Preload named presets at startup |
| `Settings.stopHaptics()` | Stop all currently playing haptics |
| `Settings.shutDownEngine()` | Shut down the haptic engine and release resources |
| `Settings.getHapticsSupportLevel()` | Returns `HapticSupport` level for current device |
| `Settings.forceHapticsSupportLevel(level)` | *(Android only)* Override detected support level |
| `Settings.enableImpulseCompositionMode(state)` | *(Android only)* Enable impulse composition mode |
| `Settings.setRealtimeComposerStrategy(strategy)` | *(Android only)* Set realtime composer strategy |

**Audio simulation** generates sound from haptic parameters for testing on simulators. Enabled by default in debug builds. Disable via `Settings.enableSound(false)`.

---

## HapticSupport Enum

```ts
import { HapticSupport, Settings } from 'react-native-pulsar';

enum HapticSupport {
  NO_SUPPORT       = 0,
  MINIMAL_SUPPORT  = 1,
  LIMITED_SUPPORT  = 2,
  STANDARD_SUPPORT = 3,
  ADVANCED_SUPPORT = 4,
}

const level = Settings.getHapticsSupportLevel();

if (level >= HapticSupport.ADVANCED_SUPPORT) {
  Presets.explosion();
} else if (level >= HapticSupport.STANDARD_SUPPORT) {
  Presets.System.notificationSuccess();
} else if (level >= HapticSupport.LIMITED_SUPPORT) {
  Presets.System.impactMedium();
}
// Skip entirely on NO_SUPPORT or MINIMAL_SUPPORT
```

---

## Haptics Inside Worklets

All Pulsar preset functions and hook methods contain the `'worklet'` directive — safe to call inside any Reanimated gesture handler without leaving the worklet context.

```tsx
import { Presets, useRealtimeComposer, usePatternComposer } from 'react-native-pulsar';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSharedValue, withSpring } from 'react-native-reanimated';

function InteractiveCard() {
  const offset = useSharedValue(0);
  const realtime = useRealtimeComposer();
  const composer = usePatternComposer(myPattern);

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      offset.value = e.translationX;
      const amplitude = Math.min(Math.abs(e.velocityX) / 1000, 1);
      realtime.set(amplitude, 0.4);  // worklet-safe
    })
    .onEnd(() => {
      offset.value = withSpring(0);
      realtime.stop();               // worklet-safe
      Presets.snap();                // worklet-safe
    });

  const tap = Gesture.Tap()
    .onEnd((e) => {
      if (e.x > 200) {
        Presets.ping();              // worklet-safe
      } else {
        composer.play();             // worklet-safe
      }
    });

  return (
    <GestureDetector gesture={Gesture.Simultaneous(pan, tap)}>
      <Animated.View style={[styles.card, { transform: [{ translateX: offset }] }]} />
    </GestureDetector>
  );
}
```

---

## Official Documentation

For anything not covered here, refer to the official Pulsar documentation:

- [Pulsar SDK Overview](https://docs.swmansion.com/pulsar/sdk/overview/)
- [Pulsar React Native SDK](https://docs.swmansion.com/pulsar/sdk/react-native/)

