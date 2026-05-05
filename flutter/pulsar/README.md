# pulsar

Pulsar is a Flutter plugin for rich haptic feedback on Android and iOS. It exposes built-in presets, a pattern composer, and a realtime composer through a Dart-friendly API.

## Features

- 200+ built-in haptic presets
- System impact, notification, and selection haptics
- Pattern-based custom haptic playback
- Realtime haptic control for gestures and sliders
- Shared Flutter API for Android and iOS

## Installation

```yaml
dependencies:
  pulsar: ^0.1.0
```

## Usage

```dart
import 'package:pulsar/pulsar.dart';

final pulsar = Pulsar();

await pulsar.getPresets().systemImpactMedium();
await pulsar.getPresets().systemNotificationSuccess();
await pulsar.getRealtimeComposer().set(0.8, 0.5);
await pulsar.getRealtimeComposer().stop();
```

## Documentation

- Repository: https://github.com/software-mansion/pulsar
- Docs: https://docs.swmansion.com/pulsar

## Publishing

This package is configured to publish from GitHub Actions when a tag matching `pulsar-v{{version}}` is pushed. Before the workflow can publish successfully:

1. In `pub.dev/packages/pulsar/admin`, enable automated publishing from GitHub Actions for `software-mansion/pulsar`.
2. Set the tag pattern to `pulsar-v{{version}}`.
3. If this repository has never published the package before, publish the first version manually on pub.dev.

After that, bump `version` in `pubspec.yaml`, push a matching tag such as `pulsar-v0.1.1`, and GitHub Actions will publish from `flutter/pulsar`.
