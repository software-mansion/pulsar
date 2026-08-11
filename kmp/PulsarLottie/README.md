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

Render the animation however you like and pass its `progress` / `durationMillis` / `isPlaying` to `HapticLottie`:

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
        durationMillis = composition?.durationMillis?.toLong() ?: 0,
        isPlaying = playing,
        haptics = pattern,
    )
}
```

## Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `haptics` | `PatternData?` | – | Pattern to sync. `null` disables. |
| `mode` | `HapticMode` | `Realtime` | `Realtime` (progress-driven) or `Pattern` (aligned-start). |
| `hapticOffsetMs` | `Long` | `0` | Shift haptics ± relative to the animation. |
| `hapticsEnabled` | `Boolean` | `true` | Turn haptics off without touching the animation. |
| `pulsar` | `Pulsar` | `Pulsar.create()` | Provide your platform-initialized instance. |

Prefer to drive it yourself? Use `HapticLottieEngine` directly — a pure, framework-agnostic engine (`setPlaying`, `onProgress`, `stop`).

## Engine modes

- **`Realtime`** (default) — the animation progress is the master clock; the pattern is sampled into `RealtimeComposer.set` / `playDiscrete`. Honours pause / seek / loop.
- **`Pattern`** — the pre-parsed pattern plays whole via `PatternComposer`, aligned to the start (best native fidelity).

There is **no playback-speed control** — the haptic timeline can't be rate-shifted coherently, so the animation runs at its authored speed.

## License

MIT
