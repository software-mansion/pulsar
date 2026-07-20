# PatternComposer

## Contents

- [Choose a pattern model](#choose-a-pattern-model)
- [React Native](#react-native)
- [iOS](#ios)
- [Android](#android)
- [Design and lifecycle](#design-and-lifecycle)

## Choose a Pattern Model

A custom pattern can combine:

- discrete points: individual taps with `time`, `amplitude`, and `frequency`
- continuous envelopes: time/value curves for amplitude and frequency

Values use `0...1`; time uses milliseconds. Use discrete points for impacts or rhythms. Use continuous envelopes for sustained, evolving texture. Use [RealtimeComposer](gesture-haptics.md) instead when live gesture values control output.

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

Hook surface:

```ts
const { play, stop, parse, isParsed } = usePatternComposer(pattern?);
```

The hook reparses when `pattern` changes and releases resources on unmount. Composer methods are worklet-compatible.

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
