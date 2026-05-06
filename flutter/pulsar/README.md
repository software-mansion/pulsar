# pulsar_haptics

Pulsar is a Flutter plugin for rich haptic feedback on Android and iOS. It exposes built-in presets, a pattern composer, and a realtime composer through a Dart-friendly API.

## Features

- 200+ built-in haptic presets
- System impact, notification, and selection haptics
- Pattern-based custom haptic playback
- Realtime haptic control for gestures and sliders
- Shared Flutter API for Android and iOS

## Installation

> **Note:** This package is published as **`pulsar_haptics`**, not `pulsar`. The shorter `pulsar` name on pub.dev was reserved by an unrelated author before this project was published and is not maintained by Software Mansion. Always depend on `pulsar_haptics`.

<!-- GENERATED:FLUTTER_VERSION_START -->
Latest available version: `0.0.1`
<!-- GENERATED:FLUTTER_VERSION_END -->

<!-- GENERATED:FLUTTER_INSTALL_SNIPPET_START -->
```yaml
dependencies:
  pulsar_haptics: ^0.0.1
```
<!-- GENERATED:FLUTTER_INSTALL_SNIPPET_END -->

## Usage

```dart
import 'package:pulsar_haptics/pulsar.dart';

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

This package is configured to publish from GitHub Actions when a tag matching `pulsar_haptics-v{{version}}` is pushed. Before the workflow can publish successfully:

1. In `pub.dev/packages/pulsar_haptics/admin`, enable automated publishing from GitHub Actions for `software-mansion/pulsar`.
2. Set the tag pattern to `pulsar_haptics-v{{version}}`.
3. If this repository has never published the package before, publish the first version manually on pub.dev.

After that, bump `version` in `pubspec.yaml`, push a matching tag such as `pulsar_haptics-v0.1.1`, and GitHub Actions will publish from `flutter/pulsar`.
