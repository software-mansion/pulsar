# Pulsar bundles (KMP)

Load a `.pulsar` bundle authored in Pulsar Studio at runtime and play its presets with full
autocomplete.

## Generating the typed accessor

KMP ships this API under `com.swmansion.pulsar.kmp.bundle`, not the Android SDK's
`com.swmansion.pulsar.bundle`, so the generator needs to be told:

```bash
npx @swmansion/pulsar-gen acme-pack.pulsar --target kotlin \
  --package com.example.app.bundles \
  --runtime-package com.swmansion.pulsar.kmp.bundle \
  --out composeApp/src/commonMain/kotlin/com/example/app/bundles/
```

## Usage

If the `.pulsar` ships as a platform asset — `src/androidMain/assets/` on Android, the app bundle on
iOS — the descriptor resolves it by name:

```kotlin
val pulsar = Pulsar.create()
val bundle = pulsar.loadBundleSync(AcmePack.descriptor)

bundle.heartbeatV2.play()
bundle.explosion.stop()
```

`loadBundleAsync(AcmePack.descriptor)` is the `suspend` equivalent, and `loadBundleFromPath(path)` /
`loadBundleFromAsset(name)` are the untyped forms.

Anywhere else the bytes come from — Compose Resources, a download, your own resource loader — pass
them yourself:

```kotlin
val bytes = Res.readBytes("files/acme-pack.pulsar")
val bundle = pulsar.loadBundleSync(AcmePack.descriptor, bytes)
```

Compose Resources packages files under its own directory rather than the platform asset location, so
a bundle stored there always takes the `bytes` overload — which is what the example app does.

The loaded bundle's content hash is asserted against the generated types, failing loudly on a stale
bundle/types mismatch. Pass `strict = false` to skip it.

## Limits

KMP v1 plays a preset's haptics and exposes its animation bytes (`preset.animation`) for the host
app's own Lottie view. **Synced bundle audio is not wired yet** — it needs platform temp-file
extraction — so use the native iOS/Android SDKs for audio-synced packs.

## Untyped surface

```kotlin
val loaded = pulsar.loadBundle(bytes)   // no descriptor
loaded.presetIds                        // -> List<String>
loaded.play("heartbeatV2")              // -> Boolean
```
