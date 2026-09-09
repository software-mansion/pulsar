# PulsarLottie (iOS)

Play [Pulsar](https://github.com/software-mansion/pulsar) haptics **in sync with a Lottie animation** on iOS.

Built on **PulsarHaptics** (reuses its haptic engine — no haptics reimplemented) and **lottie-ios**.

## Install

**Swift Package Manager** — add the package and depend on the `PulsarLottie` product. **CocoaPods** — `pod 'PulsarLottie'`.

## Usage — SwiftUI

```swift
import PulsarLottie
import Pulsar

let pattern = PatternData(
  continuousPattern: ContinuousPattern(
    amplitude: [ValuePoint(time: 0, value: 0), ValuePoint(time: 400, value: 1), ValuePoint(time: 800, value: 0)],
    frequency: [ValuePoint(time: 0, value: 0.3), ValuePoint(time: 800, value: 0.8)]
  ),
  discretePattern: [DiscretePoint(time: 0, amplitude: 1, frequency: 0.5)]
)

HapticLottieView("success", haptics: pattern, autoPlay: true)
  .frame(width: 200, height: 200)
```

## Usage — from a bundle preset

A `.pulsar` bundle preset carries its animation, pattern, duration and any synced audio, so the view needs nothing else:

```swift
let pack = try pulsar.loadBundleSync(AcmePack.descriptor)

HapticLottieView(preset: pack.celebration)
  .frame(width: 200, height: 200)
```

## Usage — UIKit / attach to an existing view

```swift
let animationView = LottieAnimationView(name: "success")
let controller = PulsarLottie.bind(animationView, pulsar: pulsar, haptics: pattern)
// …or from a bundle preset: PulsarLottie.bind(animationView, pulsar: pulsar, preset: pack.celebration)

controller.play()
controller.setTimestamp(1200) // seek both animation + haptics to 1.2s
controller.pause()
```

## Engine modes

- **`.realtime`** (default) — a `CADisplayLink` makes the animation timeline the master clock, driving `currentProgress` and sampling the pattern into `RealtimeComposer.set` / `playDiscrete`. Honours pause / `setTimestamp` / loop.
- **`.pattern`** — the pre-parsed pattern plays whole via `PatternComposer`, aligned to the start (best native fidelity), and the only mode that plays a preset's synced audio.

`hapticMode` defaults to `.realtime`, except for a preset that carries audio, which starts in `.pattern` so that audio plays.

There is **no playback-speed control** — the haptic timeline can't be rate-shifted coherently, so the animation runs at its authored speed.

## License

MIT
