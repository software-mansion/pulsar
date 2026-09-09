# pulsar-kmp-lottie

Play [Pulsar](https://github.com/software-mansion/pulsar) haptics **in sync with a Lottie animation** in Compose Multiplatform (Android + iOS).

Built on the `pulsar-kmp` core (reuses its haptic engine — no haptics reimplemented). It follows your Lottie **progress**, so it works with any Compose Lottie renderer (e.g. [compottie](https://github.com/alexzhirkevich/compottie)) — this package depends only on `compose-runtime`, not on a specific Lottie library.

## Install

```kotlin
commonMain.dependencies {
    implementation("com.swmansion:pulsar-kmp-lottie:0.1.0")
}
```

## Usage

Render the animation however you like and pass its `progress` / `durationMs` / `isPlaying` to `HapticLottie`:

```kotlin
import com.swmansion.pulsar.lottie.HapticLottie
import io.github.alexzhirkevich.compottie.*

@Composable
fun Success(pattern: PatternData, playing: Boolean) {
    val composition by rememberLottieComposition { LottieCompositionSpec.JsonString(json) }
    val progress by animateLottieCompositionAsState(composition, isPlaying = playing)

    Image(painter = rememberLottiePainter(composition, progress = { progress }), contentDescription = null)

    HapticLottie(
        progress = progress,
        durationMs = composition?.durationMillis?.toLong() ?: 0,
        isPlaying = playing,
        haptics = pattern,
    )
}
```

## Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `preset` | `PresetHandle?` | `null` | Bundle preset supplying the pattern and authored duration. |
| `haptics` | `PatternData?` | `null` | Pattern to sync. Overrides the preset's pattern. |
| `hapticMode` | `HapticMode?` | `REALTIME` | `REALTIME` (progress-driven) or `PATTERN` (aligned-start). |
| `hapticOffset` | `Long` | `0` | Shift haptics ± relative to the animation. |
| `hapticsEnabled` | `Boolean` | `true` | Turn haptics off without touching the animation. |
| `durationMs` | `Long` | `0` | Animation length in ms; `0` falls back to the preset's or pattern's own length. |
| `pulsar` | `Pulsar` | `Pulsar.create()` | Provide your platform-initialized instance. |

A `.pulsar` bundle preset supplies the pattern and duration; this package renders nothing itself, so hand its animation to your renderer with `preset.animationJson()`:

```kotlin
val composition by rememberLottieComposition {
    LottieCompositionSpec.JsonString(pack.celebration.animationJson()!!)
}
HapticLottie(progress = progress, isPlaying = playing, preset = pack.celebration)
```

Prefer to drive it yourself? Use `HapticLottieEngine` directly — a pure, framework-agnostic engine (`setPlaying`, `onProgress`, `stop`).

## Engine modes

- **`REALTIME`** (default) — the animation progress is the master clock; the pattern is sampled into `RealtimeComposer.set` / `playDiscrete`. Honours pause / seek / loop.
- **`PATTERN`** — the pre-parsed pattern plays whole via `PatternComposer`, aligned to the start (best native fidelity).

There is **no playback-speed control** — the haptic timeline can't be rate-shifted coherently, so the animation runs at its authored speed.

## License

MIT
