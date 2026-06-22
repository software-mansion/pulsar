<p align="center">
  <img src="https://github.com/software-mansion/pulsar/raw/main/docs/src/assets/og.png" alt="Pulsar - Rich and ready-to use haptics library" />
</p>

A haptic feedback SDK for iOS, Android, React Native, Kotlin Multiplatform, Flutter, and the Web. Pulsar provides ready-to-use haptic presets, a pattern composer for custom haptic sequences, and a real-time composer for gesture-driven feedback.

## Features

- **Presets** - Library of built-in haptic patterns (hammer, dogBark, buzz, pulse) and system feedback styles (impacts, notifications, selection)
- **Pattern Composer** - Define custom haptic patterns using discrete events and continuous amplitude/frequency envelopes
- **Realtime Composer** - Live amplitude and frequency control for gesture-driven haptics
- **Cross-platform** - Consistent API across iOS (Swift), Android (Kotlin), React Native (TypeScript), and Kotlin Multiplatform
- **Worklet-compatible** - All React Native preset functions and hook methods work inside Reanimated worklets

## Packages

| Platform | Package | Documentation |
|----------|---------|---------------|
| React Native | [![npm](https://img.shields.io/npm/v/react-native-pulsar)](https://www.npmjs.com/package/react-native-pulsar) | [React Native SDK](https://docs.swmansion.com/pulsar/sdk/react-native) |
| iOS | [Swift Package](https://github.com/software-mansion-labs/pulsar-ios) | [iOS SDK](https://docs.swmansion.com/pulsar/sdk/ios) |
| Android | [Maven Central](https://central.sonatype.com/artifact/com.swmansion/pulsar) | [Android SDK](https://docs.swmansion.com/pulsar/sdk/android) |
| Kotlin Multiplatform | [Maven Central](https://central.sonatype.com/artifact/com.swmansion/pulsar-kmp) | [Kotlin Multiplatform SDK](https://docs.swmansion.com/pulsar/sdk/kmp) |
| Flutter | [pub.dev](https://pub.dev/packages/pulsar_haptics) | [Flutter SDK](https://docs.swmansion.com/pulsar/sdk/flutter) |
| Web | [![npm](https://img.shields.io/npm/v/pulsar-haptics)](https://www.npmjs.com/package/pulsar-haptics) | [Web SDK](https://docs.swmansion.com/pulsar/sdk/web/) |

Full API reference and guides are available at the [documentation site](https://docs.swmansion.com/pulsar). Start with the [SDK Overview](https://docs.swmansion.com/pulsar/sdk/overview) for core concepts: types of haptics, preloading, and caching.

## Quick start

### React Native

```bash
npx expo install react-native-pulsar react-native-worklets
```

```ts
import { Presets, usePatternComposer, useRealtimeComposer } from 'react-native-pulsar';

// Play a preset
Presets.dogBark();

// Play a system haptic
Presets.System.impactMedium();
```

### Web

<!-- GENERATED:WEB_VERSION_START -->
Latest available version: `0.2.0`
<!-- GENERATED:WEB_VERSION_END -->

```bash
npm install pulsar-haptics
```

```ts
import { Presets } from 'pulsar-haptics';

// Play a preset
Presets.tap();
```

> Plays through the Web Vibration API, with an audio fallback. Real vibration is unavailable on iOS/iPadOS Safari (Apple does not implement the Web Vibration API) — see the [Web SDK docs](https://docs.swmansion.com/pulsar/sdk/web/).

### iOS

<!-- GENERATED:IOS_VERSION_START -->
Latest available version: `1.1.4`
<!-- GENERATED:IOS_VERSION_END -->

Add Pulsar as a Swift Package dependency in Xcode, or add it to your `Package.swift`:

<!-- GENERATED:IOS_INSTALL_SNIPPET_START -->
```swift
dependencies: [
  .package(url: "https://github.com/software-mansion-labs/pulsar-ios", from: "1.1.4")
]
```
<!-- GENERATED:IOS_INSTALL_SNIPPET_END -->

```swift
import Pulsar

let pulsar = Pulsar()
pulsar.getPresets().hammer()
```

### Android

<!-- GENERATED:ANDROID_VERSION_START -->
Latest available version: `1.1.2`
<!-- GENERATED:ANDROID_VERSION_END -->

Add Pulsar as a Gradle dependency:

<!-- GENERATED:ANDROID_INSTALL_SNIPPET_START -->
```kotlin
dependencies {
  implementation("com.swmansion:pulsar:1.1.2")
}
```
<!-- GENERATED:ANDROID_INSTALL_SNIPPET_END -->

```kotlin
import com.swmansion.pulsar.Pulsar

val pulsar = Pulsar(context)
pulsar.getPresets().hammer()
```

### Kotlin Multiplatform

<!-- GENERATED:KMP_VERSION_START -->
Latest available version: `0.0.3`
<!-- GENERATED:KMP_VERSION_END -->

Add Pulsar KMP as a Gradle dependency in your shared module (works on Android and iOS targets):

<!-- GENERATED:KMP_INSTALL_SNIPPET_START -->
```kotlin
dependencies {
  implementation("com.swmansion:pulsar-kmp:0.0.3")
}
```
<!-- GENERATED:KMP_INSTALL_SNIPPET_END -->

```kotlin
import com.swmansion.pulsar.kmp.Pulsar

val pulsar = Pulsar.create()
pulsar.getPresets().play("Hammer")
```

### Flutter

> **Note:** Published on pub.dev as **`pulsar_haptics`**, not `pulsar`. The shorter `pulsar` name was reserved by an unrelated author before this project was published and is not maintained by Software Mansion.

<!-- GENERATED:FLUTTER_VERSION_START -->
Latest available version: `0.0.3`
<!-- GENERATED:FLUTTER_VERSION_END -->

Add Pulsar to your `pubspec.yaml`:

<!-- GENERATED:FLUTTER_INSTALL_SNIPPET_START -->
```yaml
dependencies:
  pulsar_haptics: ^0.0.3
```
<!-- GENERATED:FLUTTER_INSTALL_SNIPPET_END -->

```dart
import 'package:pulsar_haptics/pulsar.dart';

final pulsar = Pulsar();
await pulsar.getPresets().hammer();
```

<!-- ## AI Skills

Install the `pulsar-haptics` skill from the [software-mansion-labs/skills](https://github.com/software-mansion-labs/skills) repository:

```text
/plugin marketplace add software-mansion-labs/skills
/plugin install skills@swmansion
/reload-plugins
```

Or with `npx`:

```bash
npx skills add software-mansion-labs/skills
``` -->

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and guidelines.

## License

Pulsar library is licensed under [The MIT License](LICENSE).

## Try the Pulsar App

Download the Pulsar companion app to feel haptic presets directly on your device:

- [App Store](https://apps.apple.com/pl/app/haptics-presets-pulsar/id6761362104)
- [Google Play](https://play.google.com/store/apps/details?id=com.swmansion.pulsar.app)

## Community Discord

[Join the Software Mansion Community Discord](https://discord.swmansion.com) to chat about haptics or other Software Mansion libraries.

## Pulsar is created by Software Mansion

Since 2012 [Software Mansion](https://swmansion.com) is a software agency with experience in building web and mobile apps. We are Core React Native Contributors and experts in dealing with all kinds of React Native issues. We can help you build your next dream product – [Hire us](https://swmansion.com/contact/projects?utm_source=reanimated&utm_medium=readme).
