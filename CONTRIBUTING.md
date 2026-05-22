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
│   │   └── android/          # Kotlin bridge + Android SDK sources
│   └── PulsarApp/            # React Native example app
├── PulsarApp/          # React Native Expo showcase app
└── docs/               # Astro/Starlight documentation site
```

## SDK architecture

The iOS and Android SDKs are standalone native libraries. The React Native SDK is a Turbo Module that integrates with each native implementation in a platform-appropriate way:

- **iOS:** `Pulsar.podspec` depends on the published `Pulsar-haptics` CocoaPod by default. For local development in the example app, set `USE_LOCAL_PULSAR_IOS=1` before `pod install` to use `iOS/Pulsar/` instead.
- **Android:** `android/src/main/java/com/swmansion/pulsar/` mirrors `Android/Pulsar/src/main/java/com/swmansion/pulsar/`, with `PulsarModule.kt` and `PulsarPackage.kt` added as the RN bridge layer

When you change Android SDK code in `Android/`, mirror those changes in the corresponding RN library path. For iOS, publish or locally override the native pod instead of copying Swift sources into the RN package.

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

For native changes (Swift/Kotlin), rebuild the app after running the above. For JS-only changes, Metro hot reload handles updates automatically. To test local iOS SDK changes without publishing a pod, run `USE_LOCAL_PULSAR_IOS=1 pod install` in `react-native/PulsarApp/ios`.

### React Native Expo showcase app

```bash
cd PulsarApp
npm run ios      # Build and run on iOS
npm run android  # Build and run on Android
npm run start    # Start Metro bundler
```

The app references the RN library locally via `"react-native-pulsar": "file:../react-native/react-native-pulsar"`. After making library changes, run `npm run prepare` in the library directory, then restart Metro.

### Documentation site

```bash
cd docs
npm run dev    # Start dev server
npm run build  # Production build
```
