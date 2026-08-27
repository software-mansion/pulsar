# Pulsar bundles (iOS)

Load a `.pulsar` bundle authored in Pulsar Studio at runtime and play its presets with full
autocomplete.

## Native Swift usage

1. Add the `.pulsar` file to your app target (Copy Bundle Resources).
2. Generate the typed accessor — either apply the build plugin (below) or run the CLI once and
   commit the output.
3. Load and play:

```swift
let pulsar = Pulsar()
let bundle = try pulsar.loadBundle(AcmePack.descriptor)   // AcmePack is generated
bundle.heartbeatV2.play()                          // ← autocompletes
bundle.explosion.stop()

// Animation bytes for the app's own Lottie view (Pulsar times, the app renders):
if let anim = bundle.heartbeatV2.animation {
    myLottieView.load(data: anim.data)
}
```

`loadBundle(_:strict:)` — pass `strict: true` to assert the loaded bundle's content hash matches
the generated types (fails loudly on a stale bundle/types mismatch instead of a silent surprise).

## Zero-manual codegen (build plugin)

Apply the plugin to your target and drop `.pulsar` files into its sources — the typed accessor
regenerates on every build (like Xcode 15 asset symbols):

```swift
.target(
    name: "MyApp",
    plugins: [.plugin(name: "PulsarGenPlugin", package: "Pulsar")]
)
```

The plugin runs the self-contained `pulsar-gen-swift` host tool — no Node or network in the build.
CocoaPods consumers (React Native / Flutter) instead run `@swmansion/pulsar-gen` in a script phase.

## Bridge surface (React Native / Flutter)

The wrappers use the untyped, string-keyed surface:

```swift
let loaded = try pulsar.loadBundle(path: bundlePath)   // or loadBundle(data:)
loaded.presetIds                                       // -> [String]
loaded.play("heartbeatV2")                             // -> Bool
```
