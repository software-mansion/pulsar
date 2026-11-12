# Pulsar bundles (Android)

Load a `.pulsar` bundle authored in Pulsar Studio at runtime and play its presets with full
autocomplete.

## Kotlin usage

```kotlin
val pulsar = Pulsar(context)
val bundle = pulsar.loadBundleSync(AcmePack.descriptor)   // AcmePack is generated
bundle.heartbeatV2.play()                      // ← autocompletes
bundle.heartbeatV2.play(fromMs = 2500)         // starts 2.5s in
bundle.explosion.stop()

// Animation bytes for the app's own Lottie view (Pulsar times, the app renders):
bundle.heartbeatV2.animation?.let { myLottieView.setAnimation(it.data.inputStream(), null) }
```

A preset authored against a video carries it as `video` instead of an animation — Pulsar times it,
your ExoPlayer renders it:

```kotlin
bundle.intro.video?.let { video ->
    player.setMediaItem(MediaItem.fromUri(Uri.fromFile(File(video.path))))
    player.volume = if (video.isMuted) 0f else 1f
    player.prepare()
    player.seekTo(2500)
    bundle.intro.play(fromMs = 2500)
    player.play()
}
```

The MP4 is extracted to a cache file when the bundle loads, so any player can stream it. Its time runs
1:1 with the preset's — seek the player to the same `fromMs` you pass to `play`. When the preset also
carries audio, that track replaces the video's own sound: `isMuted` is then `true`, and the player must
stay muted while `play()` plays the audio with the haptics.

`loadBundleSync(descriptor)` asserts the loaded bundle's content hash matches the generated types,
failing loudly on a stale bundle/types mismatch. Pass `strict = false` to skip it.

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
loaded.play("heartbeatV2", fromMs = 2500)   // seeks audio + haptics
```
