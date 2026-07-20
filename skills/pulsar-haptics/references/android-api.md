# Pulsar Android API

## Contents

- [Install](#install)
- [Initialize](#initialize)
- [Play presets](#play-presets)
- [System presets](#system-presets)
- [Caching and configuration](#caching-and-configuration)
- [CompatibilityMode](#compatibilitymode)

## Install

```kotlin
dependencies {
    implementation("com.swmansion:pulsar:1.0.0")
}
```

Add vibration permission:

```xml
<uses-permission android:name="android.permission.VIBRATE" />
```

Requirements: Android API 24+ and Kotlin 1.9+.

## Initialize

Create and reuse one `Pulsar` instance. `getPresets()` needs an Activity context; headless composer use can accept a plain Context.

```kotlin
import com.swmansion.pulsar.Pulsar

val pulsar = Pulsar(activity)
val presets = pulsar.getPresets()
```

## Play Presets

```kotlin
presets.ping()
presets.fanfare()
presets.buzz()
```

Preset calls are synchronous. Dynamic lookup uses PascalCase and returns nullable `Preset`:

```kotlin
presets.getByName("CoinDrop")?.play()
```

Use `scripts/find_presets.py` to discover valid names and lower-camel methods.

## System Presets

Cross-platform vocabulary:

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

Android-specific methods also expose `HapticFeedbackConstants`, predefined `VibrationEffect` values, and composition primitives. Prefer cross-platform methods unless native Android feel or an Android-only API is required.

## Caching and Configuration

Caching is enabled by default. Preload only latency-critical presets:

```kotlin
pulsar.preloadPresets(listOf("Ping", "Stamp", "Fanfare"))
pulsar.enableCache(true)
pulsar.clearCache()
```

| Method | Purpose |
|---|---|
| `enableHaptics(Boolean)` | Globally toggle haptics. |
| `enableSound(Boolean)` | Toggle emulator audio. |
| `enableCache(Boolean)` | Toggle preset caching. |
| `preloadPresets(List<String>)` | Preload PascalCase names. |
| `stopHaptics()` | Stop active playback. |
| `hapticSupport()` | Return detected `CompatibilityMode`. |
| `forceHapticsSupportLevel(mode)` | Override support for testing. |
| `enableImpulseCompositionMode(Boolean)` | Toggle composition for impulse-only presets. |

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

For custom patterns, read [PatternComposer](pattern-composer.md). For `RealtimeComposer` strategies, read [gesture haptics](gesture-haptics.md).

Official docs: [Pulsar Android SDK](https://docs.swmansion.com/pulsar/sdk/android/).
