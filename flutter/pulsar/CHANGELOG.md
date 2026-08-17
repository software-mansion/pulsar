## 0.0.1

* Initial Flutter plugin release for Pulsar.
* Added preset playback, pattern composer, and realtime composer APIs.
* Added Android and iOS platform support.

## 0.0.2

* Fix pub.dev score

## 0.0.3

* Fix SwiftPM support for iOS platform.

## 0.1.0

* Rename the iOS podspec to `pulsar_haptics.podspec` so CocoaPods resolves the plugin under its pub package name.
* Depend on the renamed `PulsarHaptics` CocoaPod, which builds under every CocoaPods linkage mode — including `use_frameworks!` with both `:static` and `:dynamic` linkage.
* Declare the `pulsar-ios` Swift package dependency in the SPM manifest so the plugin builds with Flutter's Swift Package Manager support.
* Bump the native cores to pulsar-ios `1.4.0` and pulsar-android `1.3.0`.

  No Dart API changes — this release is packaging and native dependency work only.

## 0.1.1

* Fix the Android build failing with `Namespace 'com.swmansion.pulsar' is used in multiple modules and/or libraries`. The plugin shared its Android namespace with the `com.swmansion:pulsar` artifact it depends on, which newer Android Gradle Plugin versions reject; it now uses `com.swmansion.pulsar.flutter`.

  No Dart API changes.
