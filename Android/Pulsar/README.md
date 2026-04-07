<p align="center">
	<img src="../../docs/src/assets/og.png" alt="Pulsar - Rich and ready-to use haptics library" />
</p>

A haptic feedback SDK for Android, written in Kotlin. Pulsar provides ready-to-use haptic presets, a pattern composer for custom haptic sequences, and a real-time composer for gesture-driven feedback.

## Features

- **Presets** - Library of built-in haptic patterns (earthquake, success, fail, tap) and system feedback styles (impacts, notifications, selection)
- **Pattern Composer** - Define custom haptic patterns using discrete events and continuous amplitude/frequency envelopes
- **Realtime Composer** - Live amplitude and frequency control for gesture-driven haptics
- **Android-native** - Built on Android haptics APIs with graceful compatibility fallbacks
- **Kotlin-first** - Clean Kotlin API for Android apps and SDK integrations

## Quick start

### Installation

Add Pulsar as a Gradle dependency:

```kotlin
dependencies {
	implementation("com.swmansion:pulsar")
}
```

### Preset example

```kotlin
import com.swmansion.pulsar.Pulsar

val pulsar = Pulsar(context)
val presets = pulsar.getPresets()

// Play a preset
presets.hammer()

// Play a system haptic
presets.systemImpactMedium()
```

### PatternComposer example

```kotlin
import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.types.ConfigPoint
import com.swmansion.pulsar.types.ContinuousPattern
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.types.ValuePoint

val pulsar = Pulsar(context)
val composer = pulsar.getPatternComposer()

val pattern = PatternData(
	continuousPattern = ContinuousPattern(
		amplitude = listOf(
			ValuePoint(time = 0, value = 0f),
			ValuePoint(time = 200, value = 1f),
			ValuePoint(time = 400, value = 0f),
		),
		frequency = listOf(
			ValuePoint(time = 0, value = 0.3f),
			ValuePoint(time = 400, value = 0.8f),
		)
	),
	discretePattern = listOf(
		ConfigPoint(time = 0, amplitude = 1f, frequency = 0.5f),
		ConfigPoint(time = 100, amplitude = 0.5f, frequency = 0.5f),
	)
)

composer.parsePattern(pattern)
composer.play()
```

### RealtimeComposer example

```kotlin
import com.swmansion.pulsar.Pulsar

val pulsar = Pulsar(context)
val realtime = pulsar.getRealtimeComposer()

realtime.set(amplitude = 0.7f, frequency = 0.5f)
realtime.stop()
```

## Documentation

Full API reference and guides are available at the [documentation site](https://docs.swmansion.com/pulsar).

- [SDK Overview](https://docs.swmansion.com/pulsar/sdk) - Core concepts: types of haptics, preloading, and caching
- [Android SDK](https://docs.swmansion.com/pulsar/sdk/android) - Kotlin API reference

## License

Pulsar library is licensed under [The MIT License](../../LICENSE).

## Try the Pulsar App

Download the Pulsar companion app to feel haptic presets directly on your device:

- [Google Play](https://play.google.com/store/apps/details?id=com.swmansion.pulsar.app)

## Community Discord

[Join the Software Mansion Community Discord](https://discord.swmansion.com) to chat about haptics or other Software Mansion libraries.

## Pulsar is created by Software Mansion

Since 2012 [Software Mansion](https://swmansion.com) is a software agency with experience in building web and mobile apps. We are Core React Native Contributors and experts in dealing with all kinds of React Native issues. We can help you build your next dream product - [Hire us](https://swmansion.com/contact/projects?utm_source=reanimated&utm_medium=readme).
