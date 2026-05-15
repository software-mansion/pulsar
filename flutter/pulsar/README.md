<p align="center">
  <img src="https://github.com/software-mansion/pulsar/blob/main/docs/src/assets/og.png" alt="Pulsar - Rich and ready-to use haptics library" />
</p>

A haptic feedback SDK for Flutter. Pulsar gives you 150+ ready-to-play presets, a pattern composer for fully custom sequences, and a realtime composer for gesture-driven feedback — all behind a single Dart-friendly API that bridges to native CoreHaptics on iOS and the platform vibrator on Android.

## Features

- **150+ built-in presets** – Expressive patterns (`hammer`, `dogBark`, `heartbeat`, `fanfare`…) plus system feedback (impact, notification, selection)
- **Pattern Composer** – Build custom haptics from discrete events and continuous amplitude/frequency envelopes
- **Realtime Composer** – Live amplitude and frequency control for sliders, gestures, and continuously evolving feedback
- **Adaptive presets** – Define iOS and Android variants in one object and let Pulsar pick the right one per platform
- **Audio simulation** – Optional companion audio so haptics feel right even on devices with weaker vibration motors
- **Cross-platform** – The same Dart API runs on iOS 13+ and Android API 24+

## Quick start

> **Note:** This package is published as **`pulsar_haptics`**, not `pulsar`. The shorter `pulsar` name on pub.dev was reserved by an unrelated author before this project was published and is not maintained by Software Mansion. Always depend on `pulsar_haptics`.

<!-- GENERATED:FLUTTER_VERSION_START -->
Latest available version: `0.0.3`
<!-- GENERATED:FLUTTER_VERSION_END -->

<!-- GENERATED:FLUTTER_INSTALL_SNIPPET_START -->
```yaml
dependencies:
  pulsar_haptics: ^0.0.3
```
<!-- GENERATED:FLUTTER_INSTALL_SNIPPET_END -->

On Android, declare the vibration permission in your `AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.VIBRATE" />
```

### Preset example

```dart
import 'package:pulsar_haptics/pulsar.dart';

final pulsar = Pulsar();

// Built-in expressive preset
await pulsar.getPresets().hammer();
pulsar.getSyncPresets().hammer();

// System feedback
await pulsar.getPresets().systemImpactMedium();
await pulsar.getPresets().systemNotificationSuccess();
pulsar.syncPresets.systemNotificationSuccess();
```

### Pattern composer example

Compose a "double tap → swell" haptic that mixes discrete pulses with a smooth continuous envelope:

```dart
import 'package:pulsar_haptics/pulsar.dart';

final pulsar = Pulsar();

final composer = pulsar.getPatternComposer();

await composer.playPattern(
  PatternData(
    discretePattern: const [
      DiscretePoint(time: 0,  amplitude: 1.0, frequency: 0.6),
      DiscretePoint(time: 90, amplitude: 0.8, frequency: 0.6),
    ],
    continuousPattern: const ContinuousPattern(
      amplitude: [
        ValuePoint(time: 200, value: 0.0),
        ValuePoint(time: 350, value: 0.9),
        ValuePoint(time: 600, value: 0.0),
      ],
      frequency: [
        ValuePoint(time: 200, value: 0.3),
        ValuePoint(time: 600, value: 0.9),
      ],
    ),
  ),
);
```

### Realtime composer example

Drive haptic intensity from a `Slider` for tactile UI feedback:

```dart
import 'package:flutter/material.dart';
import 'package:pulsar_haptics/pulsar.dart';

final pulsar = Pulsar();
final realtime = pulsar.getRealtimeComposer();

Slider(
  value: intensity,
  onChanged: (value) {
    setState(() => intensity = value);
    realtime.set(value, 0.5); // amplitude, frequency
  },
  onChangeEnd: (_) => realtime.stop(),
);
```

### Adaptive preset example

Pick the best implementation per platform from one declaration:

```dart
final adaptive = AdaptivePreset(
  ios: AdaptivePresetCallback(() => pulsar.presets.systemNotificationSuccess()),
  android: AdaptivePresetPattern(
    PatternData(
      discretePattern: const [
        DiscretePoint(time: 0,   amplitude: 1.0, frequency: 0.5),
        DiscretePoint(time: 150, amplitude: 0.6, frequency: 0.4),
      ],
      continuousPattern: const ContinuousPattern(amplitude: [], frequency: []),
    ),
  ),
);

final haptics = await pulsar.createAdaptiveHaptics(adaptive);
await haptics.play();
```

## Documentation

Full API reference and guides are available at the [documentation site](https://docs.swmansion.com/pulsar).

- [SDK Overview](https://docs.swmansion.com/pulsar/sdk/overview) – Core concepts: types of haptics, preloading, and caching
- [Flutter SDK](https://docs.swmansion.com/pulsar/sdk/flutter) – Dart API reference

## Try the Pulsar App

Download the Pulsar companion app to feel haptic presets directly on your device:

- [App Store](https://apps.apple.com/pl/app/haptics-presets-pulsar/id6761362104)
- [Google Play](https://play.google.com/store/apps/details?id=com.swmansion.pulsar.app)

## Community Discord

[Join the Software Mansion Community Discord](https://discord.swmansion.com) to chat about haptics or other Software Mansion libraries.

## License

Pulsar library is licensed under [The MIT License](LICENSE).

## Pulsar is created by Software Mansion

Since 2012 [Software Mansion](https://swmansion.com) is a software agency with experience in building web and mobile apps. We are Core React Native Contributors and experts in dealing with all kinds of mobile and cross-platform issues. We can help you build your next dream product – [Hire us](https://swmansion.com/contact/projects?utm_source=pulsar&utm_medium=readme).
