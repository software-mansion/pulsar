# pulsar_haptics_lottie

Play [Pulsar](https://github.com/software-mansion/pulsar) haptics **in sync with a Lottie animation** in Flutter.

Built on [`pulsar_haptics`](https://pub.dev/packages/pulsar_haptics) and the [`lottie`](https://pub.dev/packages/lottie) package — it reuses Pulsar's haptic engine (no haptics reimplemented) and follows the Lottie `AnimationController` clock.

## Install

```yaml
dependencies:
  pulsar_haptics_lottie: ^0.1.0
```

## Usage — the widget

```dart
import 'package:pulsar_haptics_lottie/pulsar_haptics_lottie.dart';
import 'package:pulsar_haptics/pulsar.dart';

final pattern = PatternData.fromArrays(
  amplitude: [[0, 0], [400, 1], [800, 0]],
  frequency: [[0, 0.3], [800, 0.8]],
  discrete: [[0, 1, 0.5]],
);

HapticLottie.asset(
  'assets/success.json',
  haptics: pattern,
  autoPlay: true,
  onControllerCreated: (c) => _controller = c, // drive transport later
);
```

## Usage — from a bundle preset

A `.pulsar` bundle preset carries its animation, pattern, duration and any synced audio, so the widget needs nothing else:

```dart
final pack = await pulsar.loadBundleAsync(acmePack);

HapticLottie.preset(pack.celebration, autoPlay: true);
```

## Usage — attach to your own `AnimationController`

If you already drive Lottie with an `AnimationController`, wrap it:

```dart
final anim = AnimationController(vsync: this);
final haptic = HapticLottieController(
  animationController: anim,
  haptics: pattern,
);
// ...
Lottie.asset('assets/success.json', controller: anim, onLoaded: (c) {
  anim.duration = c.duration;
});
// transport steers both animation + haptics:
haptic.play();
haptic.setTimestamp(1200);
haptic.pause();
```

## Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `preset` | `PresetHandle?` | `null` | Bundle preset supplying the animation, pattern and authored duration. |
| `haptics` | `PatternData?` | `null` | Pattern to sync. Overrides the preset's pattern; omit both for a plain animation. |
| `hapticMode` | `HapticMode?` | `realtime` | `realtime` (progress-driven) or `pattern` (aligned-start). |
| `hapticOffset` | `double` (ms) | `0` | Shift haptics ± relative to the animation. |
| `hapticsEnabled` | `bool` | `true` | Turn haptics off without touching the animation. |
| `durationMs` | `double?` | `null` | Clock length in ms. Overrides every derived duration. |
| `autoPlay` / `repeat` / `repeatCount` / `repeatReverse` | | | Standard Lottie steering. |

## Engine modes

- **`realtime`** (default) — the `AnimationController` is the master clock; the pattern is sampled every frame into `RealtimeComposer.set` / `playDiscrete`. Honours pause / `setTimestamp` / loop. Continuous fidelity is realtime-grade (coarser on Android).
- **`pattern`** — the pre-parsed pattern plays whole via `PatternComposer`, aligned to the start (best native fidelity), and the only mode that plays a preset's synced audio. Seek/pause on the haptic side are best-effort.

`hapticMode` defaults to `realtime`, except for a preset that carries audio, which starts in `pattern` so that audio plays.

There is **no playback-speed control** — the haptic timeline can't be rate-shifted coherently, so the animation runs at its authored speed.

## License

MIT
