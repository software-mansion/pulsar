# Choosing the Right Preset

See [common/presets-guide.md](../common/presets-guide.md) for the full categorized preset reference — all descriptions and "when to use" guidance apply equally to iOS.

All presets are called on the `PresetsWrapper` object returned by `pulsar.getPresets()`.

```swift
import Pulsar

let pulsar = Pulsar()
let presets = pulsar.getPresets()
```

## Usage Examples

```swift
presets.stamp()
presets.fanfare()
presets.buzz()
```

## Playing a Preset by Name

When you need to select a preset dynamically at runtime, use `getByName(_:)` with the PascalCase preset name:

```swift
let presets = pulsar.getPresets()

// Returns Preset? — call play() on it
presets.getByName("Fanfare")?.play()
presets.getByName("Ping")?.play()
presets.getByName("SystemNotificationSuccess")?.play()
```

Preset names are PascalCase strings matching the class name (e.g., `"CoinDrop"` for `coinDrop()`).

## System Presets

iOS exposes additional system-matched presets not available on other platforms. They wrap UIKit's built-in feedback generators (`UIImpactFeedbackGenerator`, `UINotificationFeedbackGenerator`, `UISelectionFeedbackGenerator`) rather than CoreHaptics, so they are available even without CoreHaptics support (though still unavailable on iPad).

| Preset | UIKit equivalent | When to use |
|---|---|---|
| `systemImpactLight()` | `UIImpactFeedbackGenerator(style: .light)` | Subtle taps, lightweight interactions |
| `systemImpactMedium()` | `UIImpactFeedbackGenerator(style: .medium)` | Standard button presses, mid-weight feedback |
| `systemImpactHeavy()` | `UIImpactFeedbackGenerator(style: .heavy)` | Strong, decisive impacts |
| `systemImpactSoft()` | `UIImpactFeedbackGenerator(style: .soft)` | Gentle, rounded taps (iOS 13+) |
| `systemImpactRigid()` | `UIImpactFeedbackGenerator(style: .rigid)` | Crisp, mechanical clicks (iOS 13+) |
| `systemNotificationSuccess()` | `UINotificationFeedbackGenerator().notificationOccurred(.success)` | Operation completed successfully |
| `systemNotificationWarning()` | `UINotificationFeedbackGenerator().notificationOccurred(.warning)` | Caution or partial failure |
| `systemNotificationError()` | `UINotificationFeedbackGenerator().notificationOccurred(.error)` | Operation failed or was rejected |
| `systemSelection()` | `UISelectionFeedbackGenerator().selectionChanged()` | Scroll picker tick, segmented control change |
