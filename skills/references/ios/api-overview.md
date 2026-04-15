# Pulsar iOS — API Overview

## Installation

### Swift Package Manager (Xcode)

1. Go to **File > Add Package Dependencies...**
2. Enter the repository URL: `https://github.com/software-mansion-labs/pulsar-ios`
3. Select the **Pulsar** library product and add it to your target.

### Swift Package Manager (Package.swift)

```swift
// Package.swift
dependencies: [
  .package(url: "https://github.com/software-mansion-labs/pulsar-ios")
],
targets: [
  .target(
    name: "YourApp",
    dependencies: ["Pulsar"]
  )
]
```

**Requirements:** iOS 13.0+, Swift 5.9+

---

## Setup

Create one `Pulsar` instance and keep it alive for the lifetime of your app or view controller. All SDK features are accessed through this instance.

```swift
import Pulsar

// App-level singleton
let pulsar = Pulsar()
```

`Pulsar()` initializes the CoreHaptics engine internally. The engine is started immediately on devices that support haptics. On unsupported hardware (iPad, simulator without audio simulation), the engine is not started and all calls are safe no-ops.

---

## Using Presets

Get a `PresetsWrapper` from the `Pulsar` instance and call any named preset method directly.

```swift
let presets = pulsar.getPresets()

presets.ping()
presets.fanfare()
presets.buzz()
```

`getPresets()` returns the same `PresetsWrapper` instance on every call — it is lazily created and then reused. Preset methods are synchronous and return immediately.

See [Presets Guide](presets-guide.md) for the full list of available presets, with descriptions and usage guidance.

---

## System Presets

System presets wrap the platform's built-in UIKit feedback generators. They use the same underlying Taptic Engine but go through `UIImpactFeedbackGenerator`, `UINotificationFeedbackGenerator`, and `UISelectionFeedbackGenerator` rather than CoreHaptics.

```swift
let presets = pulsar.getPresets()

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

### UIKit mapping

| Pulsar method | UIKit equivalent |
|---|---|
| `systemImpactLight()` | `UIImpactFeedbackGenerator(style: .light).impactOccurred()` |
| `systemImpactMedium()` | `UIImpactFeedbackGenerator(style: .medium).impactOccurred()` |
| `systemImpactHeavy()` | `UIImpactFeedbackGenerator(style: .heavy).impactOccurred()` |
| `systemImpactSoft()` | `UIImpactFeedbackGenerator(style: .soft).impactOccurred()` |
| `systemImpactRigid()` | `UIImpactFeedbackGenerator(style: .rigid).impactOccurred()` |
| `systemNotificationSuccess()` | `UINotificationFeedbackGenerator().notificationOccurred(.success)` |
| `systemNotificationWarning()` | `UINotificationFeedbackGenerator().notificationOccurred(.warning)` |
| `systemNotificationError()` | `UINotificationFeedbackGenerator().notificationOccurred(.error)` |
| `systemSelection()` | `UISelectionFeedbackGenerator().selectionChanged()` |

System presets are available without CoreHaptics support (they go through UIKit's own haptic pipeline). However, `UIImpactFeedbackGenerator` also requires haptic hardware, so they are similarly unavailable on iPad.

---

## Playing Presets by Name

When you need to select a preset dynamically — for example, from a configuration or user preference — use `getByName(_:)`. It returns a `Preset?` that you call `play()` on.

```swift
let presets = pulsar.getPresets()

// Returns nil if the name is unrecognized
presets.getByName("Fanfare")?.play()
presets.getByName("Ping")?.play()
presets.getByName("SystemNotificationSuccess")?.play()
```

Preset names are **PascalCase strings** matching the canonical name (e.g., `"CoinDrop"` for `coinDrop()`, `"KeyboardMechanical"` for `keyboardMechanical()`).

The `Preset` protocol:

```swift
public protocol Preset {
  func play()
  static func getInstance(haptics: Pulsar) -> Preset
  static var name: String { get }
}
```

---

## Custom Patterns with PatternComposer

When no built-in preset fits your use case, compose a custom haptic pattern using `PatternComposer`. A pattern combines **discrete** events (individual taps at specific moments) and a **continuous** envelope (sustained vibration with evolving amplitude and frequency).

Get a new `PatternComposer` instance from `pulsar.getPatternComposer()`. Each call returns a fresh instance — you can hold multiple composers for different patterns independently.

```swift
let composer = pulsar.getPatternComposer()
```

### Types

#### `PatternData`

The top-level container for a complete haptic pattern.

```swift
class PatternData: NSObject, Codable {
  let continuousPattern: ContinuousPattern
  let discretePattern: [DiscretePoint]

  init(
    continuousPattern: ContinuousPattern,
    discretePattern: [DiscretePoint]
  )
}
```

#### `ContinuousPattern`

Two envelope curves — one for amplitude, one for frequency — that shape the sustained part of the haptic.

```swift
class ContinuousPattern: NSObject, Codable {
  let amplitude: [ValuePoint]
  let frequency: [ValuePoint]

  init(amplitude: [ValuePoint], frequency: [ValuePoint])
}
```

#### `ValuePoint`

A single control point on a continuous curve.

```swift
class ValuePoint: NSObject, Codable {
  let time: Double    // Milliseconds from pattern start
  let value: Float    // Normalized value 0–1

  init(time: Double, value: Float)
}
```

#### `DiscretePoint`

A single discrete (transient) haptic event.

```swift
class DiscretePoint: NSObject, Codable {
  let time: Double      // Milliseconds from pattern start
  let amplitude: Float  // Intensity 0–1
  let frequency: Float  // Sharpness 0–1 (0 = round/soft, 1 = crisp)

  init(time: Double, amplitude: Float, frequency: Float)
}
```

### PatternComposer Methods

| Method | Description |
|---|---|
| `parsePattern(hapticsData:)` | Parse a `PatternData` and prepare it for playback |
| `playPattern(hapticsData:)` | Parse and immediately play a pattern (combines `parsePattern` + `play`) |
| `play()` | Play the previously parsed pattern |
| `stop()` | Stop active playback |

### Example

```swift
import Pulsar

let pulsar = Pulsar()
let composer = pulsar.getPatternComposer()

let pattern = PatternData(
  continuousPattern: ContinuousPattern(
    amplitude: [
      ValuePoint(time: 0,   value: 0.0),
      ValuePoint(time: 50,  value: 1.0),
      ValuePoint(time: 300, value: 0.0),
    ],
    frequency: [
      ValuePoint(time: 0,   value: 0.3),
      ValuePoint(time: 300, value: 0.8),
    ]
  ),
  discretePattern: [
    DiscretePoint(time: 0,   amplitude: 1.0, frequency: 0.8),  // crisp opening tap
    DiscretePoint(time: 100, amplitude: 0.5, frequency: 0.4),  // softer follow-up
    DiscretePoint(time: 200, amplitude: 0.2, frequency: 0.2),  // gentle close
  ]
)

// Parse once, play many times
composer.parsePattern(hapticsData: pattern)
composer.play()

// Or parse and play in one call
composer.playPattern(hapticsData: pattern)
```

### Using PatternComposer in SwiftUI

```swift
import SwiftUI
import Pulsar

struct CustomHapticView: View {
  private let pulsar = Pulsar()

  private let pattern = PatternData(
    continuousPattern: ContinuousPattern(
      amplitude: [
        ValuePoint(time: 0,   value: 0.0),
        ValuePoint(time: 200, value: 0.8),
        ValuePoint(time: 400, value: 0.0),
      ],
      frequency: [
        ValuePoint(time: 0,   value: 0.2),
        ValuePoint(time: 400, value: 0.6),
      ]
    ),
    discretePattern: [
      DiscretePoint(time: 0, amplitude: 1.0, frequency: 0.7),
    ]
  )

  var body: some View {
    Button("Custom Haptic") {
      // playPattern parses and plays in one call — fine for one-shot use
      pulsar.getPatternComposer().playPattern(hapticsData: pattern)
    }
  }
}
```

### Pattern Design Tips

See [Design Principles — Custom Pattern Parameters](../common/design-principles.md#custom-pattern-parameters) for amplitude and frequency range guidance, and when to use discrete vs. continuous patterns.

---

## Real-Time Haptics with RealtimeComposer

> **Gesture design guide:** For design principles, parameter mapping, phase tables, and common gesture patterns (drag-and-drop, snap points, pull-to-refresh, swipe-to-delete), see [Gesture-Based Haptics](../common/gesture-haptics.md). This section covers the iOS API surface only.

`RealtimeComposer` lets you modulate haptic intensity and sharpness in real time, synchronized with live gesture values. Get the shared instance from `pulsar.getRealtimeComposer()`.

```swift
let realtime = pulsar.getRealtimeComposer()
```

Unlike `PatternComposer`, `getRealtimeComposer()` returns the **same shared instance** every time. There is one realtime haptic channel per `Pulsar` instance.

### Methods and Properties

| Member | Type | Description |
|---|---|---|
| `set(amplitude:frequency:)` | Method | Update ongoing haptic in real time (0–1 each). Auto-starts if not already active. Values are clamped to 0–1. |
| `playDiscrete(amplitude:frequency:)` | Method | Fire a single discrete haptic event. Default: amplitude 1.0, frequency 0.5. |
| `stop()` | Method | Stop the active continuous haptic. |
| `isActive` | Property (`Bool`) | Returns `true` if a continuous haptic is currently playing. |

### Example — UIKit Pan Gesture

```swift
import UIKit
import Pulsar

class DraggableViewController: UIViewController {
  let pulsar = Pulsar()
  lazy var realtime = pulsar.getRealtimeComposer()

  override func viewDidLoad() {
    super.viewDidLoad()
    let pan = UIPanGestureRecognizer(target: self, action: #selector(handlePan(_:)))
    view.addGestureRecognizer(pan)
  }

  @objc func handlePan(_ gesture: UIPanGestureRecognizer) {
    let velocity = gesture.velocity(in: view)
    let speed = hypot(velocity.x, velocity.y)

    switch gesture.state {
    case .changed:
      let amplitude = Float(min(speed / 1000.0, 1.0))
      realtime.set(amplitude: amplitude, frequency: 0.5)
    case .ended, .cancelled:
      realtime.stop()
    default:
      break
    }
  }
}
```

### Example — SwiftUI Drag Gesture

```swift
import SwiftUI
import Pulsar

struct DraggableCard: View {
  @State private var offset = CGSize.zero
  private let pulsar = Pulsar()

  var body: some View {
    RoundedRectangle(cornerRadius: 16)
      .fill(Color.blue)
      .frame(width: 200, height: 120)
      .offset(offset)
      .gesture(
        DragGesture()
          .onChanged { value in
            offset = value.translation
            let speed = Float(hypot(value.velocity.width, value.velocity.height))
            let amplitude = min(speed / 1000.0, 1.0)
            // getRealtimeComposer() returns the shared instance — safe to call inline
            pulsar.getRealtimeComposer().set(amplitude: amplitude, frequency: 0.5)
          }
          .onEnded { _ in
            offset = .zero
            pulsar.getRealtimeComposer().stop()
            pulsar.getPresets().snap()
          }
      )
  }
}
```

### Mixing Realtime and Discrete Events

Call `playDiscrete` while the continuous haptic is active to layer a sharp tap on top of the ongoing rumble:

```swift
// Sustained continuous haptic
realtime.set(amplitude: 0.4, frequency: 0.3)

// Add a discrete event on top — for example, when the user crosses a threshold
realtime.playDiscrete(amplitude: 1.0, frequency: 0.9)
```

---

## Caching and Preloading

### How Caching Works

By default, Pulsar caches preset players. The first play for any preset creates a player and stores it. Subsequent plays reuse the cached player with near-zero overhead.

1. On play, check the cache.
2. **Cache hit:** reuse the stored player, play immediately.
3. **Cache miss:** create a new player, store it, then play.

### Preloading

For interactions where the first play must feel instant, preload critical presets at startup. Preloading moves the initialization cost to an early point — before any user interaction occurs.

```swift
// Call at app startup or screen entry — before any user interaction
pulsar.preloadPresets(presetNames: ["Fanfare", "Ping", "Buzz", "Stamp"])
```

Preset names for preloading are **PascalCase strings** (e.g., `"Fanfare"` for `fanfare()`, `"CoinDrop"` for `coinDrop()`).

Preloading automatically enables caching.

**When to preload:**
- Button taps that must fire without perceptible delay.
- Game events where multiple presets must be ready simultaneously.
- Onboarding flows that use a known, finite set of presets.

### Caching API

```swift
pulsar.enableCache(state: true)   // Enable caching (default)
pulsar.enableCache(state: false)  // Disable — forces fresh player creation on every play
pulsar.clearCache()               // Release all cached players
```

### Caching vs. Preloading

| | Caching | Preloading |
|---|---|---|
| **Initialization** | On first play | At startup |
| **First-play latency** | Small cost | Minimal |
| **Default** | Enabled | Opt-in |
| **Memory** | Grows as presets are played | Allocated upfront |

---

## Settings / Configuration API

All configuration methods are called directly on the `Pulsar` instance.

```swift
let pulsar = Pulsar()
```

| Method | Description |
|---|---|
| `pulsar.enableHaptics(state: Bool)` | Globally enable or disable all haptic feedback. When disabled, all preset and composer calls are no-ops. |
| `pulsar.enableSound(state: Bool)` | Enable or disable audio simulation (plays synthesized sound in place of haptics on Simulator). Enabled by default in debug builds. |
| `pulsar.enableCache(state: Bool)` | Enable or disable preset caching. Default: enabled. |
| `pulsar.clearCache()` | Release all cached preset players. |
| `pulsar.preloadPresets(presetNames: [String])` | Preload named presets by PascalCase string. |
| `pulsar.stopHaptics()` | Stop all currently playing haptics and halt the engine. |
| `pulsar.shutDownEngine()` | Stop the engine and release the CoreHaptics engine instance. |
| `pulsar.isHapticsSupported() -> Bool` | Returns `true` if the current device supports CoreHaptics (i.e., has a Taptic Engine). |
| `pulsar.isHapticsEnabled` | `Bool` property — current state of the haptics enabled flag. |

### Example — Respecting Hardware Support

```swift
import Pulsar

let pulsar = Pulsar()
let presets = pulsar.getPresets()

func handleAchievement() {
  if pulsar.isHapticsSupported() {
    presets.fanfare()
  }
  // Visual feedback always shown regardless
  showAchievementBanner()
}
```

### Example — User Preference Toggle

```swift
// User disables haptics in app settings
func userToggledHaptics(isEnabled: Bool) {
  pulsar.enableHaptics(state: isEnabled)
}
```

### Example — Startup Preloading

```swift
// AppDelegate or @main App struct
func applicationDidFinishLaunching(_ application: UIApplication) {
  pulsar.preloadPresets(presetNames: [
    "Ping",    // list selection
    "Stamp",   // dialog confirm
    "Buzz",    // error/reject
    "Fanfare", // achievement
  ])
}
```

### Audio Simulation

On the iOS Simulator, CoreHaptics is unavailable. Pulsar automatically generates audio output from haptic pattern parameters — amplitude, frequency, and timing — so you can hear the shape of any preset or custom pattern while iterating. Each discrete event produces a short tone; continuous envelopes produce a sustained tone whose pitch and volume track the frequency and amplitude curves.

Audio simulation is enabled by default in debug builds. Disable if you prefer a silent debugging experience:

```swift
pulsar.enableSound(state: false)
```

---

## Hardware Support Check

Use `isHapticsSupported()` to check whether the device has CoreHaptics hardware before conditionally branching your UI.

```swift
let pulsar = Pulsar()

if pulsar.isHapticsSupported() {
  // Device has a Taptic Engine (iPhone 7+)
  presets.fanfare()
} else {
  // iPad, old simulator, Mac Catalyst — haptics unavailable
  // Show purely visual feedback
}
```

`isHapticsSupported()` wraps `CHHapticEngine.capabilitiesForHardware().supportsHaptics`. Calling preset methods on unsupported hardware is always safe — they are silent no-ops — but you may want to check support if your UI has affordances (like a "feel it" button) that only make sense when haptics are available.

### Support by Device

| Device | `isHapticsSupported()` | Notes |
|---|---|---|
| iPhone 7 and later | `true` | Taptic Engine present |
| iPad (all models) | `false` | No Taptic Engine |
| iPhone Simulator | `false` | No hardware; audio simulation active |
| Mac Catalyst | `false` | CoreHaptics not available on macOS |

---

## Official Documentation

For anything not covered here, refer to the official Pulsar documentation:

- [Pulsar SDK Overview](https://docs.swmansion.com/pulsar/sdk/overview/)
- [Pulsar iOS SDK](https://docs.swmansion.com/pulsar/sdk/ios/)

---

## Complete Integration Example

```swift
import UIKit
import Pulsar

final class CheckoutViewController: UIViewController {

  // One Pulsar instance for the screen
  private let pulsar = Pulsar()
  private lazy var presets = pulsar.getPresets()
  private lazy var realtime = pulsar.getRealtimeComposer()

  override func viewDidLoad() {
    super.viewDidLoad()

    // Preload presets used in this screen
    pulsar.preloadPresets(presetNames: ["Stamp", "Buzz", "CoinDrop", "Wobble"])
  }

  // MARK: - User actions

  @IBAction func confirmOrderTapped(_ sender: UIButton) {
    presets.stamp()
    submitOrder()
  }

  @IBAction func cancelTapped(_ sender: UIButton) {
    presets.latch()
    dismiss(animated: true)
  }

  // MARK: - Outcomes

  func handleOrderSuccess() {
    presets.coinDrop()
    showSuccessBanner()
  }

  func handleOrderFailure(message: String) {
    presets.buzz()
    showErrorAlert(message: message)
  }

  func handleValidationError() {
    presets.wobble()
    highlightInvalidFields()
  }

  // MARK: - Slider with real-time haptics

  @IBAction func amountSliderChanged(_ sender: UISlider) {
    let amplitude = sender.value  // 0–1
    realtime.set(amplitude: amplitude, frequency: 0.5)
  }

  @IBAction func amountSliderEnded(_ sender: UISlider) {
    realtime.stop()
    presets.ping()
  }

  // MARK: - Custom pattern

  func playCustomConfirmation() {
    let composer = pulsar.getPatternComposer()
    let pattern = PatternData(
      continuousPattern: ContinuousPattern(
        amplitude: [
          ValuePoint(time: 0,   value: 0.0),
          ValuePoint(time: 100, value: 0.8),
          ValuePoint(time: 300, value: 0.0),
        ],
        frequency: [
          ValuePoint(time: 0,   value: 0.4),
          ValuePoint(time: 300, value: 0.7),
        ]
      ),
      discretePattern: [
        DiscretePoint(time: 0,   amplitude: 1.0, frequency: 0.8),
        DiscretePoint(time: 150, amplitude: 0.4, frequency: 0.3),
      ]
    )
    composer.playPattern(hapticsData: pattern)
  }
}
```
