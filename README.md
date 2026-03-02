<p align="center">
  <img src="docs/src/assets/og.png" alt="Pulsar - Rich and ready-to use haptics library" />
</p>

A haptic feedback SDK for iOS, Android, and React Native. Pulsar provides ready-to-use haptic presets, a pattern composer for custom haptic sequences, and a real-time composer for gesture-driven feedback.

## Features

- **Presets** - Library of built-in haptic patterns (earthquake, success, fail, tap) and system feedback styles (impacts, notifications, selection)
- **Pattern Composer** - Define custom haptic patterns using discrete events and continuous amplitude/frequency envelopes
- **Realtime Composer** - Live amplitude and frequency control for gesture-driven haptics
- **Cross-platform** - Consistent API across iOS (Swift), Android (Kotlin), and React Native (TypeScript)
- **Worklet-compatible** - All React Native preset functions and hook methods work inside Reanimated worklets

## Quick start

### React Native

```bash
npx expo install react-native-pulsar
```

```ts
import { Presets, usePatternComposer, useRealtimeComposer } from 'react-native-pulsar';

// Play a preset
Presets.Success();

// Play a system haptic
Presets.System.ImpactMedium();
```

### iOS

Add Pulsar as a Swift Package dependency in Xcode, or add it to your `Package.swift`:

```swift
dependencies: [
  .package(url: "https://github.com/software-mansion/pulsar", from: "0.1.0")
]
```

```swift
import Pulsar

let pulsar = Pulsar()
pulsar.getPresets().success()
```

### Android

Add Pulsar as a Gradle dependency:

```kotlin
dependencies {
  implementation("com.swmansion:pulsar:0.1.0")
}
```

```kotlin
import com.swmansion.pulsar.Pulsar

val pulsar = Pulsar(context)
pulsar.getPresets().success()
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
├── PulsarApp/          # React Native Expo showcase app
└── docs/               # Documentation site (Astro/Starlight)
```

## Documentation

Full API reference and guides are available at the [documentation site](https://pulsar.swmansion.com).

- [SDK Overview](https://pulsar.swmansion.com/sdk) - Core concepts: types of haptics, preloading, and caching
- [iOS SDK](https://pulsar.swmansion.com/sdk/ios) - Swift API reference
- [Android SDK](https://pulsar.swmansion.com/sdk/android) - Kotlin API reference
- [React Native SDK](https://pulsar.swmansion.com/sdk/react-native) - TypeScript API reference

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and guidelines.

## License

[MIT](LICENSE)
