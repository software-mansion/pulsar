# Pulsar Android API

## Contents

- [Installation](#installation)
- [Setup](#setup)
- [Using Presets](#using-presets)
- [System Presets](#system-presets)
- [Settings / Configuration API](#settings--configuration-api)
- [CompatibilityMode](#compatibilitymode)

## Installation

Groovy DSL (`build.gradle`):

```groovy
dependencies {
    implementation 'com.swmansion:pulsar:1.0.0'
}
```

Kotlin DSL (`build.gradle.kts`):

```kotlin
dependencies {
    implementation("com.swmansion:pulsar:1.0.0")
}
```

Requirements: Android API 24+ (Android 7.0), Kotlin 1.9+.

Pulsar requires vibration permission in app manifest:

```xml
<manifest ...>
    <uses-permission android:name="android.permission.VIBRATE" />

    <application ...>
        ...
    </application>
</manifest>
```

Without `android.permission.VIBRATE`, Android refuses vibration calls. Pulsar logs a warning and skips playback instead of crashing.

## Setup

Create a `Pulsar` instance with an Android `Context`. A `Pulsar` instance manages the haptic engine, caching, composers, and settings. Create it once and reuse it — typically in an `Activity`, `Fragment`, or a dependency-injected singleton.

```kotlin
import com.swmansion.pulsar.Pulsar

class MainActivity : AppCompatActivity() {
    private lateinit var pulsar: Pulsar

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        pulsar = Pulsar(this)
    }
}
```

The `Pulsar` constructor requires an `Activity` context (not `Application` context) when calling `getPresets()`, because the presets wrapper needs to access haptic feedback APIs through the window. For headless use cases (e.g. `PatternComposer` or `RealtimeComposer` only), a plain `Context` suffices.

## Using Presets

Get the presets object from `pulsar.getPresets()` and call any named method:

```kotlin
val presets = pulsar.getPresets()

presets.ping()
presets.fanfare()
presets.buzz()
```

All preset calls are synchronous. There is no async or coroutine API needed.

### Playing a Preset by Name

Use `getByName(name: String): Preset?` to play presets dynamically. Names are PascalCase strings. Returns `null` if the name is not recognized.

```kotlin
val presets = pulsar.getPresets()

// Direct call
presets.dogBark()

// By name
presets.getByName("DogBark")?.play()
presets.getByName("SystemImpactMedium")?.play()

// Safe call with fallback
val preset = presets.getByName(dynamicPresetName)
    ?: presets.getByName("Ping") // default
preset?.play()
```

## System Presets

Cross-platform methods and their Android equivalents:

```kotlin
presets.systemImpactLight()
presets.systemImpactMedium()
presets.systemImpactHeavy()
presets.systemImpactSoft()
presets.systemImpactRigid()
presets.systemNotificationSuccess()
presets.systemNotificationWarning()
presets.systemNotificationError()
presets.systemSelection()
```

| Pulsar method | Android equivalent |
|---|---|
| `systemImpactLight()` | `VibrationEffect.EFFECT_TICK` approx. |
| `systemImpactMedium()` | `VibrationEffect.EFFECT_CLICK` approx. |
| `systemImpactHeavy()` | `VibrationEffect.EFFECT_HEAVY_CLICK` approx. |
| `systemImpactSoft()` | Soft waveform approximation |
| `systemImpactRigid()` | Rigid waveform approximation |
| `systemNotificationSuccess()` | Success waveform pattern |
| `systemNotificationWarning()` | Warning waveform pattern |
| `systemNotificationError()` | Error waveform pattern |
| `systemSelection()` | `HapticFeedbackConstants.CLOCK_TICK` approx. |

Android-specific methods also expose `HapticFeedbackConstants`, predefined `VibrationEffect` values, and composition primitives. Prefer cross-platform methods unless native Android feel or an Android-only API is required.

## Settings / Configuration API

All configuration methods are available directly on the `Pulsar` instance.

```kotlin
val pulsar = Pulsar(context)
```

| Method | Purpose |
|---|---|
| `pulsar.enableHaptics(state: Boolean)` | Globally enable or disable all haptic feedback. |
| `pulsar.enableSound(state: Boolean)` | Enable or disable audio simulation (enabled by default in debug). |
| `pulsar.enableCache(state: Boolean)` | Enable or disable preset caching (enabled by default). |
| `pulsar.clearCache()` | Free all cached preset players. |
| `pulsar.preloadPresets(presetNames: List<String>)` | Preload named presets at startup. |
| `pulsar.stopHaptics()` | Stop all currently playing haptics. |
| `pulsar.hapticSupport()` | Return `CompatibilityMode` for the current device. |
| `pulsar.forceHapticsSupportLevel(mode: CompatibilityMode)` | Override detected support level for testing/debug. |
| `pulsar.enableImpulseCompositionMode(state: Boolean)` | Enable or disable `VibrationEffect.Composition` for impulse-only presets. |

### Audio Simulation

In debug builds, Pulsar generates audio from haptic parameters for audible emulator feedback. Disable it for silent debug runs or automated tests:

```kotlin
pulsar.enableSound(false)
```

### Support and Composition Overrides

Use `forceHapticsSupportLevel` during development to test fallback behavior without matching hardware:

```kotlin
pulsar.forceHapticsSupportLevel(CompatibilityMode.LIMITED_SUPPORT)
pulsar.forceHapticsSupportLevel(CompatibilityMode.NO_SUPPORT)
pulsar.forceHapticsSupportLevel(pulsar.hapticSupport()) // restore detection
```

On API 33+ devices, `VibrationEffect.Composition` is enabled by default for impulse-only presets. Toggle it if a device behaves unexpectedly:

```kotlin
pulsar.enableImpulseCompositionMode(false)
```

## CompatibilityMode

`CompatibilityMode` reflects device capability, not only Android version:

| Level | Behavior |
|---|---|
| `NO_SUPPORT` | Skip haptics. |
| `LIMITED_SUPPORT` | Timing-based fallback. |
| `STANDARD_SUPPORT` | Amplitude-capable playback. |
| `ADVANCED_SUPPORT` | Rich envelope and frequency behavior where hardware permits. |

```kotlin
when {
    pulsar.hapticSupport() >= CompatibilityMode.STANDARD_SUPPORT -> presets.fanfare()
    pulsar.hapticSupport() >= CompatibilityMode.LIMITED_SUPPORT -> presets.systemImpactMedium()
    else -> Unit
}
```

Expect output variation across vendors and actuators. Test multiple physical devices.

Read the [Pulsar Android SDK documentation](https://docs.swmansion.com/pulsar/sdk/android/) only when this reference does not cover the requested API or when current version and installation details must be verified.
