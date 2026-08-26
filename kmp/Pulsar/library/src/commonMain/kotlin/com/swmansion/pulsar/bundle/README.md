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

KMP has no shared asset API, so the app supplies the bytes — with Compose Resources, that means a
suspending read:

```kotlin
val pulsar = Pulsar.create()
val bytes = Res.readBytes("files/acme-pack.pulsar")
val bundle = pulsar.loadBundle(AcmePack.descriptor, bytes, strict = true)

bundle.heartbeatV2.play()
bundle.explosion.stop()
```

`strict = true` asserts the loaded bundle's content hash matches the generated types, failing loudly
on a stale bundle/types mismatch.

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
