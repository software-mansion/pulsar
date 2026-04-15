# Pulsar Android — API Overview

## Installation

Add Pulsar to your module's `build.gradle` (Groovy DSL):

```groovy
dependencies {
    implementation 'com.swmansion:pulsar:1.0.0'
}
```

Or with the Kotlin DSL (`build.gradle.kts`):

```kotlin
dependencies {
    implementation("com.swmansion:pulsar:1.0.0")
}
```

**Requirements:** Android API 24+ (Android 7.0), Kotlin 1.9+.

---

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

---

## Using Presets

Get the presets object from `pulsar.getPresets()` and call any named method:

```kotlin
val presets = pulsar.getPresets()

presets.ping()
presets.fanfare()
presets.buzz()
```

All preset calls are synchronous. There is no async or coroutine API needed.

```kotlin
// In an OnClickListener
button.setOnClickListener {
    pulsar.getPresets().stamp()
}

// In a RecyclerView adapter
adapter.onItemClick = { item ->
    pulsar.getPresets().ping()
    // handle item selection
}

// In a custom touch handler
override fun onTouchEvent(event: MotionEvent): Boolean {
    if (event.action == MotionEvent.ACTION_DOWN) {
        pulsar.getPresets().peck()
    }
    return super.onTouchEvent(event)
}
```

See [Presets Guide](presets-guide.md) for the full list of available presets, with descriptions and usage guidance.

### Playing a Preset by Name

Use `getByName(name: String): Preset?` to play presets dynamically. Names are **PascalCase strings**. Returns `null` if the name is not recognized.

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

---

## System Presets

System presets mirror standard haptic feedback styles. They map to platform-defined haptics and are the lowest-risk option for common interactions.

### Common System Presets (cross-platform equivalents)

These match the standard cross-platform haptic vocabulary shared with iOS UIKit:

```kotlin
val presets = pulsar.getPresets()

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

| Pulsar method | iOS equivalent | Android equivalent |
|---|---|---|
| `systemImpactLight()` | `UIImpactFeedbackGenerator.light` | `VibrationEffect.EFFECT_TICK` approx. |
| `systemImpactMedium()` | `UIImpactFeedbackGenerator.medium` | `VibrationEffect.EFFECT_CLICK` approx. |
| `systemImpactHeavy()` | `UIImpactFeedbackGenerator.heavy` | `VibrationEffect.EFFECT_HEAVY_CLICK` approx. |
| `systemImpactSoft()` | `UIImpactFeedbackGenerator.soft` | Soft waveform approximation |
| `systemImpactRigid()` | `UIImpactFeedbackGenerator.rigid` | Rigid waveform approximation |
| `systemNotificationSuccess()` | `UINotificationFeedbackGenerator.success` | Success waveform pattern |
| `systemNotificationWarning()` | `UINotificationFeedbackGenerator.warning` | Warning waveform pattern |
| `systemNotificationError()` | `UINotificationFeedbackGenerator.error` | Error waveform pattern |
| `systemSelection()` | `UISelectionFeedbackGenerator.selection` | `HapticFeedbackConstants.CLOCK_TICK` approx. |

### Android-Specific System Presets

These expose Android's native `HapticFeedbackConstants` and `VibrationEffect` system primitives directly. No iOS equivalent exists.

```kotlin
val presets = pulsar.getPresets()

// HapticFeedbackConstants
presets.systemCalendarDate()        // HapticFeedbackConstants.CALENDAR_DATE
presets.systemClockTick()           // HapticFeedbackConstants.CLOCK_TICK
presets.systemConfirm()             // HapticFeedbackConstants.CONFIRM
presets.systemContextClick()        // HapticFeedbackConstants.CONTEXT_CLICK
presets.systemDragCrossing()        // HapticFeedbackConstants.DRAG_CROSSING
presets.systemDragStart()           // HapticFeedbackConstants.DRAG_START
presets.systemEdgeRelease()         // HapticFeedbackConstants.EDGE_RELEASE
presets.systemEdgeSqueeze()         // HapticFeedbackConstants.EDGE_SQUEEZE
presets.systemGestureEnd()          // HapticFeedbackConstants.GESTURE_END
presets.systemGestureStart()        // HapticFeedbackConstants.GESTURE_START
presets.systemKeyboardPress()       // HapticFeedbackConstants.KEYBOARD_PRESS
presets.systemKeyboardRelease()     // HapticFeedbackConstants.KEYBOARD_RELEASE
presets.systemKeyboardTap()         // HapticFeedbackConstants.KEYBOARD_TAP
presets.systemLongPress()           // HapticFeedbackConstants.LONG_PRESS
presets.systemReject()              // HapticFeedbackConstants.REJECT
presets.systemScrollItemFocus()     // HapticFeedbackConstants.SCROLL_ITEM_FOCUS
presets.systemScrollLimit()         // HapticFeedbackConstants.SCROLL_LIMIT
presets.systemScrollTick()          // HapticFeedbackConstants.SCROLL_TICK
presets.systemSegmentFrequentTick() // HapticFeedbackConstants.SEGMENT_FREQUENT_TICK
presets.systemSegmentTick()         // HapticFeedbackConstants.SEGMENT_TICK
presets.systemTextHandleMove()      // HapticFeedbackConstants.TEXT_HANDLE_MOVE
presets.systemToggleOff()           // HapticFeedbackConstants.TOGGLE_OFF
presets.systemToggleOn()            // HapticFeedbackConstants.TOGGLE_ON
presets.systemVirtualKey()          // HapticFeedbackConstants.VIRTUAL_KEY
presets.systemVirtualKeyRelease()   // HapticFeedbackConstants.VIRTUAL_KEY_RELEASE

// VibrationEffect predefined
presets.systemEffectClick()         // VibrationEffect.EFFECT_CLICK
presets.systemEffectDoubleClick()   // VibrationEffect.EFFECT_DOUBLE_CLICK
presets.systemEffectHeavyClick()    // VibrationEffect.EFFECT_HEAVY_CLICK
presets.systemEffectTick()          // VibrationEffect.EFFECT_TICK

// VibrationEffect.Composition primitives (API 33+)
presets.systemPrimitiveClick()      // VibrationEffect.Composition.PRIMITIVE_CLICK
presets.systemPrimitiveLowTick()    // VibrationEffect.Composition.PRIMITIVE_LOW_TICK
presets.systemPrimitiveTick()       // VibrationEffect.Composition.PRIMITIVE_TICK
presets.systemPrimitiveThud()       // VibrationEffect.Composition.PRIMITIVE_THUD
presets.systemPrimitiveSpin()       // VibrationEffect.Composition.PRIMITIVE_SPIN
presets.systemPrimitiveQuickRise()  // VibrationEffect.Composition.PRIMITIVE_QUICK_RISE
presets.systemPrimitiveSlowRise()   // VibrationEffect.Composition.PRIMITIVE_SLOW_RISE
presets.systemPrimitiveQuickFall()  // VibrationEffect.Composition.PRIMITIVE_QUICK_FALL
```

---

## Custom Patterns with PatternComposer

When no built-in preset fits, define a custom `PatternData`. A pattern combines **discrete** events (individual taps/impacts at specific moments) and a **continuous** envelope (sustained vibration whose amplitude and frequency evolve over time).

Get a fresh `PatternComposer` from `pulsar.getPatternComposer()`. Each call returns a new instance — manage multiple patterns independently by holding multiple composers.

### PatternData Types

```kotlin
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.types.ContinuousPattern
import com.swmansion.pulsar.types.ConfigPoint
import com.swmansion.pulsar.types.ValuePoint

// ConfigPoint — one discrete haptic event
data class ConfigPoint(
    val time: Long,        // Milliseconds from pattern start
    val amplitude: Float,  // Intensity (0–1)
    val frequency: Float   // Sharpness (0–1); 0 = soft/round, 1 = crisp/sharp
)

// ValuePoint — one control point in a continuous envelope
data class ValuePoint(
    val time: Long,   // Milliseconds from pattern start
    val value: Float  // Amplitude or frequency value (0–1)
)

// ContinuousPattern — two time-varying envelopes
data class ContinuousPattern(
    val amplitude: List<ValuePoint>,  // Amplitude envelope
    val frequency: List<ValuePoint>   // Frequency envelope
)

// PatternData — the complete pattern passed to PatternComposer
data class PatternData(
    val continuousPattern: ContinuousPattern,
    val discretePattern: List<ConfigPoint>
)
```

### PatternComposer Methods

```kotlin
val composer = pulsar.getPatternComposer()

fun parsePattern(hapticsData: PatternData)  // Parse and prepare for playback
fun play()                                   // Play the parsed pattern
fun stop()                                   // Stop active playback
```

### Example

```kotlin
import com.swmansion.pulsar.composers.PatternComposer
import com.swmansion.pulsar.types.*

val composer = pulsar.getPatternComposer()

val pattern = PatternData(
    discretePattern = listOf(
        ConfigPoint(time = 0,   amplitude = 1.0f, frequency = 0.8f), // sharp opening tap
        ConfigPoint(time = 100, amplitude = 0.5f, frequency = 0.4f), // softer second tap
        ConfigPoint(time = 200, amplitude = 0.2f, frequency = 0.2f), // gentle close
    ),
    continuousPattern = ContinuousPattern(
        amplitude = listOf(
            ValuePoint(time = 0,   value = 0.3f),
            ValuePoint(time = 150, value = 1.0f),
            ValuePoint(time = 300, value = 0.0f),
        ),
        frequency = listOf(
            ValuePoint(time = 0,   value = 0.2f),
            ValuePoint(time = 300, value = 0.7f),
        )
    )
)

composer.parsePattern(pattern)

// Later — in a click handler or gesture callback
button.setOnClickListener {
    composer.play()
}
```

### Pattern Design Tips

See [Design Principles — Custom Pattern Parameters](../common/design-principles.md#custom-pattern-parameters) for amplitude and frequency range guidance, and when to use discrete vs. continuous patterns.

**Android-specific notes:**
- On devices without Envelope API (below API 36), `continuousPattern` frequency is ignored; only amplitude is used.
- On devices below API 26, only the presence/absence of vibration at each time point is meaningful (no amplitude control).

---

## Gesture-Based Haptics with RealtimeComposer

> **Gesture design guide:** For design principles, parameter mapping, phase tables, and common gesture patterns (drag-and-drop, snap points, pull-to-refresh, swipe-to-delete), see [Gesture-Based Haptics](../common/gesture-haptics.md). This section covers the Android API surface and strategy selection only.

`RealtimeComposer` provides real-time haptic control — update amplitude and frequency continuously as a gesture evolves.

Get the shared instance from `pulsar.getRealtimeComposer()`. The strategy can be specified at creation time. Calling `getRealtimeComposer()` a second time with the same strategy returns the cached instance; calling it with a different strategy creates a new instance.

```kotlin
val realtime = pulsar.getRealtimeComposer()

// Or with an explicit strategy:
val realtime = pulsar.getRealtimeComposer(
    strategy = RealtimeComposerStrategy.PRIMITIVE_COMPLEX
)
```

### RealtimeComposer Methods

```kotlin
fun set(amplitude: Float, frequency: Float)      // Update ongoing haptic (0–1 each); starts playback if not active
fun playDiscrete(amplitude: Float, frequency: Float) // Fire a single discrete haptic event
fun stop()                                        // Stop active continuous haptic
fun isActive(): Boolean                           // Returns true if a haptic is currently playing
```

### Example — Drag Gesture

```kotlin
import com.swmansion.pulsar.composers.RealtimeComposer

val realtime = pulsar.getRealtimeComposer()

// In a custom View's onTouchEvent:
override fun onTouchEvent(event: MotionEvent): Boolean {
    when (event.action) {
        MotionEvent.ACTION_DOWN -> {
            realtime.playDiscrete(amplitude = 0.6f, frequency = 0.5f)
        }
        MotionEvent.ACTION_MOVE -> {
            val normalizedVelocity = computeVelocity(event).coerceIn(0f, 1f)
            realtime.set(amplitude = normalizedVelocity, frequency = 0.5f)
        }
        MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> {
            realtime.stop()
        }
    }
    return true
}
```

---

## RealtimeComposerStrategy

Android has no native continuous haptic API. `RealtimeComposer` simulates continuous haptics using one of four strategies. Configure via `pulsar.getRealtimeComposer(strategy = ...)` or `pulsar.enableRealtimeComposerStrategy(strategy)`.

```kotlin
import com.swmansion.pulsar.types.RealtimeComposerStrategy

enum class RealtimeComposerStrategy {
    ENVELOPE,                          // Envelope API approximation (API 36+)
    PRIMITIVE_TICK,                    // Composition API with varying tick intervals (API 33+)
    PRIMITIVE_COMPLEX,                 // Multiple primitives selected by frequency (API 33+)
    ENVELOPE_WITH_DISCRETE_PRIMITIVES, // Default: envelope for continuous, primitives for discrete
}
```

| Strategy | API requirement | Description |
|---|---|---|
| `ENVELOPE_WITH_DISCRETE_PRIMITIVES` | API 36+ (envelope) / API 33+ (primitives) | **Default.** Hybrid. Envelope API for continuous events; composition primitives for discrete events. Best overall. |
| `ENVELOPE` | API 36+ | Pure envelope-based approximation. Allows continuous amplitude and frequency control. Signal can oscillate — best when smooth sustained feedback matters most. |
| `PRIMITIVE_TICK` | API 33+ | `PRIMITIVE_TICK` at varying intervals. Amplitude controllable; frequency simulated by timing between ticks. Discrete feel, widest compatibility. |
| `PRIMITIVE_COMPLEX` | API 33+ | Multiple primitives (`PRIMITIVE_CLICK`, `PRIMITIVE_TICK`, `PRIMITIVE_LOW_TICK`, etc.) selected based on frequency value. Better frequency simulation than `PRIMITIVE_TICK`. |

Pulsar sets the default strategy automatically based on the device's `CompatibilityMode`:
- `CompatibilityMode.STANDARD_SUPPORT` or higher → `ENVELOPE_WITH_DISCRETE_PRIMITIVES`
- `CompatibilityMode.LIMITED_SUPPORT` → `PRIMITIVE_COMPLEX`
- Lower → `PRIMITIVE_TICK`

---

## Caching and Preloading

### How Caching Works

By default, Pulsar caches preset instances. The first play creates and stores a player; subsequent calls reuse it.

- **First play:** Small initialization cost (pattern parsing, engine allocation).
- **Subsequent plays:** Near-zero latency.

```kotlin
pulsar.enableCache(true)    // Enable (default)
pulsar.enableCache(false)   // Disable — forces fresh init on every play
pulsar.clearCache()         // Free all cached players
```

### Preloading

For interactions where the first play must feel instant, preload critical presets early — at `Activity.onCreate()` or before the user reaches a flow that uses them:

```kotlin
// Preload by PascalCase name strings
pulsar.preloadPresets(listOf("Fanfare", "Ping", "Buzz", "Stamp"))
```

Preset names are **PascalCase strings** matching the preset method name (e.g., `"Fanfare"` for `presets.fanfare()`, `"CoinDrop"` for `presets.coinDrop()`).

Preloading automatically enables caching. A preloaded preset stays in memory until you call `clearCache()`.

**When to preload:**
- Button taps that must fire without perceptible delay.
- Game events where multiple presets must be ready simultaneously.
- Onboarding flows with a known, fixed set of presets.

### Caching vs. Preloading

| | Caching | Preloading |
|---|---|---|
| **Initialization** | On first play | At startup / before first play |
| **First-play latency** | Small | Minimal |
| **Default** | Enabled | Opt-in |
| **Memory** | Grows as presets are used | Allocated upfront |

---

## Settings / Configuration API

All configuration methods are available directly on the `Pulsar` instance.

```kotlin
val pulsar = Pulsar(context)
```

| Method | Description |
|---|---|
| `pulsar.enableHaptics(state: Boolean)` | Globally enable or disable all haptic feedback |
| `pulsar.enableSound(state: Boolean)` | Enable or disable audio simulation (enabled by default in debug) |
| `pulsar.enableCache(state: Boolean)` | Enable or disable preset caching (enabled by default) |
| `pulsar.clearCache()` | Free all cached preset players |
| `pulsar.preloadPresets(presetNames: List<String>)` | Preload named presets at startup |
| `pulsar.stopHaptics()` | Stop all currently playing haptics |
| `pulsar.hapticSupport()` | Returns `CompatibilityMode` for the current device |
| `pulsar.forceHapticsSupportLevel(mode: CompatibilityMode)` | Override the detected support level (testing/debug) |
| `pulsar.enableImpulseCompositionMode(state: Boolean)` | Enable or disable `VibrationEffect.Composition` for impulse-only presets |

### Audio Simulation

Pulsar generates audio from haptic parameters in debug builds, giving you audible feedback when running on an emulator without haptic hardware. Each haptic event produces a tone that reflects its amplitude, frequency, and duration.

```kotlin
// Disable audio simulation (e.g. for silent debug or automated tests)
pulsar.enableSound(false)

// Re-enable
pulsar.enableSound(true)
```

### forceHapticsSupportLevel

Overrides the automatically detected `CompatibilityMode`. Use during development to test how your app degrades on lower-capability devices without needing to own the hardware.

```kotlin
import com.swmansion.pulsar.types.CompatibilityMode

// Simulate a device with only amplitude control (no composition primitives)
pulsar.forceHapticsSupportLevel(CompatibilityMode.LIMITED_SUPPORT)

// Simulate a device with no haptic support
pulsar.forceHapticsSupportLevel(CompatibilityMode.NO_SUPPORT)

// Restore real detection
pulsar.forceHapticsSupportLevel(pulsar.hapticSupport())
```

### enableImpulseCompositionMode

By default, Pulsar uses `VibrationEffect.Composition` for impulse-only presets (discrete-only patterns with no continuous envelope) on API 33+ devices. This produces sharper, more faithful taps and clicks. Toggle this if you encounter unexpected behavior on specific devices.

```kotlin
// Disable composition mode — use amplitude waveforms for all presets
pulsar.enableImpulseCompositionMode(false)

// Re-enable (default behavior)
pulsar.enableImpulseCompositionMode(true)
```

---

## CompatibilityMode

The `CompatibilityMode` enum describes the haptic capability level of the current device. It is returned by `pulsar.hapticSupport()` and used internally by Pulsar to select the best available implementation.

```kotlin
import com.swmansion.pulsar.types.CompatibilityMode

enum class CompatibilityMode {
    NO_SUPPORT,        // No meaningful haptic support (very old or non-haptic devices)
    MINIMAL_SUPPORT,   // Timing-only vibration — on/off patterns, no amplitude control (API 24–25)
    LIMITED_SUPPORT,   // Amplitude control via VibrationEffect waveforms (API 26–32)
    STANDARD_SUPPORT,  // VibrationEffect.Composition primitives available (API 33–35)
    ADVANCED_SUPPORT,  // Full Envelope API — amplitude and frequency envelopes (API 36+)
}
```

### Using CompatibilityMode

```kotlin
val support = pulsar.hapticSupport()

when {
    support >= CompatibilityMode.ADVANCED_SUPPORT -> {
        // Full envelope API — richest preset fidelity
        // All named presets, RealtimeComposer with envelope strategy
        pulsar.getPresets().explosion()
    }
    support >= CompatibilityMode.STANDARD_SUPPORT -> {
        // Composition primitives — most named presets feel good
        // RealtimeComposer with PRIMITIVE_COMPLEX or ENVELOPE_WITH_DISCRETE_PRIMITIVES
        pulsar.getPresets().fanfare()
    }
    support >= CompatibilityMode.LIMITED_SUPPORT -> {
        // Amplitude control — simpler presets work, subtle ones may be indistinct
        // Fall back to system presets or high-amplitude named presets
        pulsar.getPresets().systemNotificationSuccess()
    }
    support >= CompatibilityMode.MINIMAL_SUPPORT -> {
        // Timing-only — only on/off patterns; intensity is not controllable
        // Only high-contrast presets are meaningful
        pulsar.getPresets().jolt()
    }
    else -> {
        // NO_SUPPORT — skip haptics entirely
    }
}
```

### CompatibilityMode vs Android API Level

| `CompatibilityMode` | Typical API level | Available Android APIs |
|---|---|---|
| `NO_SUPPORT` | Any (device-specific) | None — device lacks a haptic actuator |
| `MINIMAL_SUPPORT` | API 24–25 | `Vibrator.vibrate(long)` — timing only |
| `LIMITED_SUPPORT` | API 26–32 | `VibrationEffect.createWaveform()` — amplitude control |
| `STANDARD_SUPPORT` | API 33–35 | `VibrationEffect.Composition` — named primitives (CLICK, TICK, THUD, etc.) |
| `ADVANCED_SUPPORT` | API 36+ | Envelope API — continuous amplitude and frequency curves |

Note: `CompatibilityMode` is device-capability-based, not purely API-level-based. A device running API 33 may still report `LIMITED_SUPPORT` if the manufacturer has not implemented the composition primitives. Pulsar detects actual capability, not just OS version.

---

## Full Types Reference

### PatternData

```kotlin
data class PatternData(
    val continuousPattern: ContinuousPattern,
    val discretePattern: List<ConfigPoint>
)
```

Convenience constructor also available for raw float arrays (used internally):

```kotlin
PatternData(
    rawContinuousPattern: List<List<List<Float>>> = listOf(listOf(), listOf()),
    rawDiscretePattern: List<List<Float>> = listOf()
)
```

### ContinuousPattern

```kotlin
data class ContinuousPattern(
    val amplitude: List<ValuePoint>,  // Amplitude envelope control points
    val frequency: List<ValuePoint>   // Frequency envelope control points
)
```

### ValuePoint

```kotlin
data class ValuePoint(
    val time: Long,   // Milliseconds from pattern start
    val value: Float  // Normalized value (0–1)
)
```

### ConfigPoint

```kotlin
data class ConfigPoint(
    val time: Long,        // Milliseconds from pattern start
    val amplitude: Float,  // Intensity (0–1)
    val frequency: Float   // Sharpness (0–1); ignored on devices without envelope support
)
```

### Preset (interface)

```kotlin
interface Preset {
    fun play()
}
```

All built-in preset objects implement `Preset`. `presets.getByName(name)` returns a `Preset?`.

### CompatibilityMode

```kotlin
enum class CompatibilityMode {
    NO_SUPPORT,
    MINIMAL_SUPPORT,
    LIMITED_SUPPORT,
    STANDARD_SUPPORT,
    ADVANCED_SUPPORT,
}
```

Comparable — `CompatibilityMode.STANDARD_SUPPORT >= CompatibilityMode.LIMITED_SUPPORT` is `true`.

### RealtimeComposerStrategy

```kotlin
enum class RealtimeComposerStrategy {
    ENVELOPE,
    PRIMITIVE_TICK,
    PRIMITIVE_COMPLEX,
    ENVELOPE_WITH_DISCRETE_PRIMITIVES,
}
```

# Hardware and System API Limitations

Haptic output on Android varies depending on the Android version, device vendor's haptic implementation, and physical actuator hardware. The same preset may feel noticeably different — or in some cases imperceptible — across devices. Pulsar automatically falls back to the best available option for the current device, so you don't need to handle degradation manually, but some variation in feel across the Android ecosystem is expected and normal.

---

## Official Documentation

For anything not covered here, refer to the official Pulsar documentation:

- [Pulsar SDK Overview](https://docs.swmansion.com/pulsar/sdk/overview/)
- [Pulsar Android SDK](https://docs.swmansion.com/pulsar/sdk/android/)
