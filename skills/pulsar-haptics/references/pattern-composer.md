# PatternComposer

## Contents

- [Choose a pattern model](#choose-a-pattern-model)
- [React Native](#react-native)
- [iOS](#ios)
- [Android](#android)
- [Design and lifecycle](#design-and-lifecycle)

## Choose a Pattern Model

React Native represents a fixed pattern with this type; Swift and Kotlin use the equivalent platform types shown below.

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

PatternComposer plays static patterns whose complete timeline is defined before playback. It does not accept values that change while an interaction is running.

## React Native

```tsx
import { usePatternComposer } from 'react-native-pulsar';

const pattern = {
  discretePattern: [
    { time: 0, amplitude: 1.0, frequency: 0.8 },
    { time: 120, amplitude: 0.5, frequency: 0.4 },
  ],
  continuousPattern: {
    amplitude: [
      { time: 0, value: 0.2 },
      { time: 300, value: 0.0 },
    ],
    frequency: [
      { time: 0, value: 0.3 },
      { time: 300, value: 0.7 },
    ],
  },
};

function CustomHapticButton() {
  const composer = usePatternComposer(pattern);
  return <Button title="Play" onPress={composer.play} />;
}
```

### Hook API

```ts
const { play, stop, parse, isParsed } = usePatternComposer(pattern); // argument optional
```

- `play(): void` — play the parsed pattern. Does nothing when no pattern is parsed.
- `stop(): void` — stop playback of the parsed pattern. Does nothing when no pattern is parsed.
- `parse(pattern: Pattern): void` — prepare a static pattern natively and store its pattern ID for later, reusable playback.
- `isParsed(): boolean` — return whether the hook currently holds a parsed pattern ID.

Pass a fixed pattern to `usePatternComposer(pattern)` for automatic parsing. Call `parse` explicitly when the pattern becomes available or is selected after hook creation, or when it must be prepared before a latency-sensitive interaction. Do not parse again for every playback; call `play` on the prepared pattern.

Example with explicit preparation:

```tsx
function PatternControls() {
  const composer = usePatternComposer();

  return (
    <>
      <Button title="Prepare" onPress={() => composer.parse(pattern)} />
      <Button title="Play" onPress={() => composer.isParsed() && composer.play()} />
      <Button title="Stop" onPress={composer.stop} />
    </>
  );
}
```

The hook reparses when its optional `pattern` argument changes and releases the current pattern on unmount. `play` and `stop` are worklet-compatible.

## iOS

```swift
import Pulsar

let composer = pulsar.getPatternComposer()
let pattern = PatternData(
  continuousPattern: ContinuousPattern(
    amplitude: [
      ValuePoint(time: 0, value: 0.2),
      ValuePoint(time: 300, value: 0.0)
    ],
    frequency: [
      ValuePoint(time: 0, value: 0.3),
      ValuePoint(time: 300, value: 0.7)
    ]
  ),
  discretePattern: [
    DiscretePoint(time: 0, amplitude: 1.0, frequency: 0.8),
    DiscretePoint(time: 120, amplitude: 0.5, frequency: 0.4)
  ]
)

composer.parsePattern(hapticsData: pattern)
composer.play()
```

Use `playPattern(hapticsData:)` to parse and play once. Each `getPatternComposer()` call returns a fresh composer.

## Android

```kotlin
import com.swmansion.pulsar.types.*

val composer = pulsar.getPatternComposer()
val pattern = PatternData(
    continuousPattern = ContinuousPattern(
        amplitude = listOf(
            ValuePoint(time = 0, value = 0.2f),
            ValuePoint(time = 300, value = 0.0f),
        ),
        frequency = listOf(
            ValuePoint(time = 0, value = 0.3f),
            ValuePoint(time = 300, value = 0.7f),
        ),
    ),
    discretePattern = listOf(
        ConfigPoint(time = 0, amplitude = 1.0f, frequency = 0.8f),
        ConfigPoint(time = 120, amplitude = 0.5f, frequency = 0.4f),
    ),
)

composer.parsePattern(pattern)
composer.play()
```

Below advanced envelope support, Android may approximate continuous frequency or reduce the pattern to amplitude/timing behavior. Let `CompatibilityMode` handle normal degradation.

## Design and Lifecycle

- Parse reusable patterns once; do not recreate a composer on every event.
- Stop playback when the owning interaction ends or the screen disposes.
- Keep timelines ordered and within the intended interaction duration.
- Use empty arrays for an unused discrete or continuous layer.
- Tune final amplitude, frequency, and timing on real hardware.
- Keep visual behavior independent of haptic support.
