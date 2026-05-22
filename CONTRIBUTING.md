# Contributing to Pulsar

Thanks for your interest in contributing to Pulsar. All contributions are welcome!

## Repository structure

```
pulsar/
├── iOS/
│   ├── Pulsar/         # iOS Swift SDK (Swift Package, iOS 13+)
│   └── PulsarApp/      # iOS native demo app (Xcode project)
├── Android/
│   ├── Pulsar/         # Android Kotlin SDK (Gradle library)
│   └── PulsarApp/      # Android native demo app (Gradle project)
├── react-native/
│   ├── react-native-pulsar/  # React Native Turbo Module
│   │   ├── src/              # TypeScript API
│   │   ├── ios/              # ObjC/Swift bridge
│   │   └── android/          # Kotlin bridge layer
│   └── PulsarApp/            # React Native example app
├── flutter/
│   ├── pulsar/         # Flutter plugin (Dart API + iOS/Android bridge)
│   └── PulsarApp/      # Flutter example app
├── PulsarApp/          # React Native Expo showcase app
└── docs/               # Astro/Starlight documentation site
```

## SDK architecture

The iOS and Android SDKs are standalone native libraries. The React Native (Turbo Module) and Flutter (method-channel plugin) SDKs each ship a thin bridge and consume the published native artifacts rather than vendoring a copy of the native sources:

- **iOS:** the bridge podspec (`react-native/react-native-pulsar/Pulsar.podspec`, `flutter/pulsar/ios/pulsar.podspec`) depends on the published `Pulsar-haptics` CocoaPod by default. For local development in the example app, set `USE_LOCAL_PULSAR_IOS=1` before `pod install` to use `iOS/Pulsar/` instead.
- **Android:** the bridge Gradle module (`react-native/react-native-pulsar/android/build.gradle`, `flutter/pulsar/android/build.gradle.kts`) depends on the published `com.swmansion:pulsar` Maven artifact by default. For local development, set `USE_LOCAL_PULSAR_ANDROID=1` to compile against `Android/Pulsar/src/main/java/` instead.

The Kotlin Multiplatform SDK (`kmp/Pulsar/library`) follows the same convention on Android:

- **Android:** `kmp/Pulsar/library/build.gradle.kts` depends on the published `com.swmansion:pulsar` Maven artifact by default. Set `USE_LOCAL_PULSAR_ANDROID=1` (property or env var) to compile `androidMain` against `Android/Pulsar/src/main/java/` instead.
- **iOS:** `iosMain` still vendors a Kotlin/Native implementation under `iosimpl/`. The Swift `Pulsar-haptics` SDK exposes `@objc` symbols so it can be consumed from Kotlin/Native via cinterop, but the KMP library is not yet wired to it (doing so would require downstream iOS apps to supply the pod at link time).

The native pod/artifact version can be overridden with `PULSAR_IOS_POD_VERSION` / `PULSAR_ANDROID_MAVEN_VERSION`.

When you change native SDK code in `iOS/` or `Android/`, publish a new native artifact (or use the local overrides above) instead of copying shared sources into the RN or Flutter bridge.

## Development

### Setup

From the repo root, install all JS/TS dependencies (PulsarApp, React Native lib, docs):

```bash
npm run install:all
```

Other root scripts:

```bash
npm run lint         # Run JS, Kotlin, and Swift linters
npm run lint:js      # ESLint in PulsarApp + RN lib
npm run lint:kotlin  # ktlint (requires: brew install ktlint)
npm run lint:swift   # swiftlint (requires: brew install swiftlint)
```

### iOS Swift SDK

Open `iOS/Pulsar/` as a Swift Package in Xcode to work on the library, or open `iOS/PulsarApp/PulsarApp.xcodeproj` to run the native demo app.

### Android Kotlin SDK

Open `Android/` as a Gradle project in Android Studio. The `Pulsar` module is the library and `PulsarApp` is the demo app.

```bash
cd Android
./gradlew :Pulsar:build
./gradlew :PulsarApp:installDebug
```

### React Native SDK

```bash
cd react-native/react-native-pulsar
npm run prepare    # Build TypeScript output to lib/
npm run typecheck  # TypeScript check
npm run lint       # ESLint
npm test           # Jest tests
```

Run the example app:

```bash
cd react-native/PulsarApp
npm run ios      # iOS simulator
npm run android  # Android emulator
```

For native changes (Swift/Kotlin), rebuild the app after running the above. For JS-only changes, Metro hot reload handles updates automatically. To test local native SDK changes without publishing, run `USE_LOCAL_PULSAR_IOS=1 pod install` in `react-native/PulsarApp/ios` or `USE_LOCAL_PULSAR_ANDROID=1 ./gradlew app:assembleDebug` in `react-native/PulsarApp/android`.

### React Native Expo showcase app

```bash
cd PulsarApp
npm run ios      # Build and run on iOS
npm run android  # Build and run on Android
npm run start    # Start Metro bundler
```

The app references the RN library locally via `"react-native-pulsar": "file:../react-native/react-native-pulsar"`. After making library changes, run `npm run prepare` in the library directory, then restart Metro.

### Flutter SDK

The Flutter plugin lives in `flutter/pulsar` (only `PulsarPlugin.swift` / `PulsarPlugin.kt` are bridge code; the haptics implementation comes from the published native artifacts). Run the example app:

```bash
cd flutter/PulsarApp
flutter run            # Build and run on a connected device/simulator
```

To test local native SDK changes without publishing, run with `USE_LOCAL_PULSAR_IOS=1 flutter run` (CocoaPods picks up `iOS/Pulsar/` on the next `pod install`) or `USE_LOCAL_PULSAR_ANDROID=1 flutter run` (Gradle compiles `Android/Pulsar/src/main/java/`).

### Documentation site

```bash
cd docs
npm run dev    # Start dev server
npm run build  # Production build
```
