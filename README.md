<p align="center">
  <img src="https://github.com/software-mansion/pulsar/blob/main/docs/src/assets/og.png" alt="Pulsar - Rich and ready-to use haptics library" />
</p>

A haptic feedback SDK for iOS, Android, React Native, and Kotlin Multiplatform. Pulsar provides ready-to-use haptic presets, a pattern composer for custom haptic sequences, and a real-time composer for gesture-driven feedback.

## Features

- **Presets** - Library of built-in haptic patterns (hammer, dogBark, buzz, pulse) and system feedback styles (impacts, notifications, selection)
- **Pattern Composer** - Define custom haptic patterns using discrete events and continuous amplitude/frequency envelopes
- **Realtime Composer** - Live amplitude and frequency control for gesture-driven haptics
- **Cross-platform** - Consistent API across iOS (Swift), Android (Kotlin), React Native (TypeScript), and Kotlin Multiplatform
- **Worklet-compatible** - All React Native preset functions and hook methods work inside Reanimated worklets

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

### iOS

<!-- GENERATED:IOS_VERSION_START -->
Latest available version: `1.1.1`
<!-- GENERATED:IOS_VERSION_END -->

Add Pulsar as a Swift Package dependency in Xcode, or add it to your `Package.swift`:

<!-- GENERATED:IOS_INSTALL_SNIPPET_START -->
```swift
dependencies: [
  .package(url: "https://github.com/software-mansion-labs/pulsar-ios", from: "1.1.1")
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
Latest available version: `1.1.0`
<!-- GENERATED:ANDROID_VERSION_END -->

Add Pulsar as a Gradle dependency:

<!-- GENERATED:ANDROID_INSTALL_SNIPPET_START -->
```kotlin
dependencies {
  implementation("com.swmansion:pulsar:1.1.0")
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
Latest available version: `0.0.2`
<!-- GENERATED:KMP_VERSION_END -->

Add Pulsar KMP as a Gradle dependency in your shared module (works on Android and iOS targets):

<!-- GENERATED:KMP_INSTALL_SNIPPET_START -->
```kotlin
dependencies {
  implementation("com.swmansion:pulsar-kmp:0.0.2")
}
```
<!-- GENERATED:KMP_INSTALL_SNIPPET_END -->

```kotlin
import com.swmansion.pulsar.kmp.Pulsar

val pulsar = Pulsar.create()
pulsar.getPresets().play("Hammer")
```

## Repository structure

```
pulsar/
├── iOS/
│   ├── Pulsar/         # iOS Swift SDK (Swift Package, iOS 13+)
│   └── PulsarApp/      # iOS native demo app
├── Android/
│   ├── Pulsar/         # Android Kotlin SDK (Gradle library, API 24+)
│   └── PulsarApp/      # Android native demo app
├── react-native/
│   └── react-native-pulsar/  # React Native Turbo Module
│   └── PulsarApp/            # React Native native demo app
├── kmp/
│   ├── Pulsar/         # Kotlin Multiplatform SDK (Android + iOS targets)
│   └── PulsarApp/      # Compose Multiplatform demo app
├── PulsarApp/          # React Native Expo showcase app
└── docs/               # Documentation site (Astro/Starlight)
```

## Packages

| Platform | Package |
|----------|---------|
| React Native | [![npm](https://img.shields.io/npm/v/react-native-pulsar)](https://www.npmjs.com/package/react-native-pulsar) |
| iOS | [Swift Package](https://github.com/software-mansion-labs/pulsar-ios) |
| Android | [Maven Central](https://central.sonatype.com/artifact/com.swmansion/pulsar) |
| Kotlin Multiplatform | [Maven Central](https://central.sonatype.com/artifact/com.swmansion/pulsar-kmp) |

## Documentation

Full API reference and guides are available at the [documentation site](https://docs.swmansion.com/pulsar).

- [SDK Overview](https://docs.swmansion.com/pulsar/sdk/overview) - Core concepts: types of haptics, preloading, and caching
- [iOS SDK](https://docs.swmansion.com/pulsar/sdk/ios) - Swift API reference
- [Android SDK](https://docs.swmansion.com/pulsar/sdk/android) - Kotlin API reference
- [React Native SDK](https://docs.swmansion.com/pulsar/sdk/react-native) - TypeScript API reference
- [Kotlin Multiplatform SDK](https://docs.swmansion.com/pulsar/sdk/kmp) - Kotlin Multiplatform API reference

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
