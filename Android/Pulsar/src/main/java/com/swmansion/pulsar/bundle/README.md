# Pulsar bundles (Android)

Load a `.pulsar` bundle authored in Pulsar Studio at runtime and play its presets with full
autocomplete.

## Kotlin usage

```kotlin
val pulsar = Pulsar(context)
val bundle = pulsar.loadBundle(AcmePack.descriptor)   // AcmePack is generated
bundle.heartbeatV2.play()                      // ← autocompletes
bundle.explosion.stop()

// Animation bytes for the app's own Lottie view (Pulsar times, the app renders):
bundle.heartbeatV2.animation?.let { myLottieView.setAnimation(it.data.inputStream(), null) }
```

`loadBundle(descriptor, strict = true)` asserts the loaded bundle's content hash matches the
generated types, failing loudly on a stale bundle/types mismatch.

## Zero-manual codegen (Gradle plugin)

```kotlin
plugins { id("com.swmansion.pulsar.gen") }
```

Drop `.pulsar` files into `src/pulsarBundles/`. On every build the plugin generates the typed
`object` per bundle and packages the bundle into the APK assets (under `assets/pulsar/`) — the
FlutterGen / Compose-Resources model, no manual step. Configure via:

```kotlin
pulsarBundles {
    // bundlesDir.set(layout.projectDirectory.dir("src/pulsarBundles")) // default
    packageName.set("com.acme.haptics")
}
```

## Bridge surface (React Native / Flutter)

```kotlin
val loaded = pulsar.loadBundle(bytes)   // or loadBundle(path) / loadBundleFromAsset("pulsar/acme-pack.pulsar")
loaded.presetIds                        // -> List<String>
loaded.play("heartbeatV2")              // -> Boolean
```
