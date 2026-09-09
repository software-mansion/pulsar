# pulsar-kmp-lottie

Play [Pulsar](https://github.com/software-mansion/pulsar) haptics **in sync with a Lottie animation** in Compose Multiplatform (Android + iOS).

Built on the `pulsar-kmp` core (reuses its haptic engine — no haptics reimplemented) and
[compottie](https://github.com/alexzhirkevich/compottie) for rendering.

## Install

```kotlin
commonMain.dependencies {
    implementation("com.swmansion:pulsar-kmp-lottie:0.1.0")
}
```

## Usage

A `.pulsar` bundle preset carries its animation, pattern and duration, so `HapticLottie` loads
the composition for you:

```kotlin
import com.swmansion.pulsar.lottie.HapticLottie

HapticLottie(preset = pack.celebration, modifier = Modifier.size(200.dp))
```

Otherwise it takes the same `LottieComposition` you already hand to compottie's
`rememberLottiePainter`, so an existing screen only swaps its `Image`:

```kotlin
val composition by rememberLottieComposition { LottieCompositionSpec.JsonString(json) }

HapticLottie(composition, haptics = pattern, modifier = Modifier.size(200.dp))
```

## Rendering with something else

`HapticLottieSync` draws nothing and follows the `progress` you feed it, so it adds haptics to any
Compose Lottie renderer without touching how it draws:

```kotlin
val progress by animateLottieCompositionAsState(composition, isPlaying = playing)

Image(rememberLottiePainter(composition, progress = { progress }), contentDescription = null)

HapticLottieSync(
    progress = progress,
    isPlaying = playing,
    haptics = pattern,
    durationMs = composition?.duration?.inWholeMilliseconds ?: 0,
)
```

`preset.animationJson()` hands a preset's Lottie to your renderer as a JSON string.

## Options

Both composables take the same haptic arguments:

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `preset` | `PresetHandle?` | `null` | Bundle preset supplying the animation, pattern and authored duration. |
| `haptics` | `PatternData?` | `null` | Pattern to sync. Overrides the preset's pattern. |
| `hapticMode` | `HapticMode?` | `REALTIME` | `REALTIME` (progress-driven) or `PATTERN` (aligned-start). |
| `hapticOffset` | `Long` | `0` | Shift haptics ± relative to the animation. |
| `hapticsEnabled` | `Boolean` | `true` | Turn haptics off without touching the animation. |
| `durationMs` | `Long` | `0` | Clock length in ms; `0` derives it from the preset, composition, then pattern. |
| `pulsar` | `Pulsar` | `Pulsar.create()` | Provide your platform-initialized instance. |

`HapticLottie` adds `composition` (or `preset`), `modifier`, `isPlaying`, `iterations`,
`contentDescription`, `alignment` and `contentScale`; `HapticLottieSync` takes `progress` and
`isPlaying` instead.

Prefer to drive it yourself? `HapticLottieEngine` is the pure, framework-agnostic engine behind
both (`setPlaying`, `onProgress`, `stop`).

## Engine modes

- **`REALTIME`** (default) — the animation progress is the master clock; the pattern is sampled into `RealtimeComposer.set` / `playDiscrete`. Honours pause / seek / loop.
- **`PATTERN`** — the pre-parsed pattern plays whole via `PatternComposer`, aligned to the start (best native fidelity).

There is **no playback-speed control** — the haptic timeline can't be rate-shifted coherently, so the animation runs at its authored speed.

## License

MIT
