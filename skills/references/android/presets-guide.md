# Choosing the Right Preset

See (../common/presets-guide.md) for the full categorized preset reference — all descriptions and "when to use" guidance apply equally to Android.

All presets are called on the object returned by `pulsar.getPresets()`.

```kotlin
val pulsar = Pulsar(context)
val presets = pulsar.getPresets()
```

## Usage Examples

```kotlin
presets.fanfare()
presets.coinDrop()
presets.buzz()
```

## System Presets

Android exposes system-level haptic constants (e.g. `EFFECT_CLICK`, `EFFECT_HEAVY_CLICK`, `EFFECT_DOUBLE_CLICK`) that Pulsar surfaces as system presets. These map to the device's own haptic style rather than Pulsar's cross-platform patterns.

Keep in mind that some system presets are vendor-specific — manufacturers like Samsung, Google, or OnePlus define their own implementations, so the same system preset can feel substantially different from one device to another. Use system presets when you want to match the device's native feel; use Pulsar's standard presets when you need consistent behavior across the Android ecosystem.

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
