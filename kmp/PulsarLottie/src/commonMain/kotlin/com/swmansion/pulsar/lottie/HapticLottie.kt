package com.swmansion.pulsar.lottie

import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import com.swmansion.pulsar.kmp.PatternData
import com.swmansion.pulsar.kmp.Pulsar
import com.swmansion.pulsar.kmp.bundle.PresetHandle

/**
 * Plays Pulsar haptics in sync with a Lottie animation in Compose Multiplatform.
 *
 * Place it next to your Lottie renderer (e.g. compottie's `Image` /
 * `animateLottieCompositionAsState`) and feed it the same [progress],
 * [durationMs], and [isPlaying]:
 *
 * ```kotlin
 * val composition by rememberLottieComposition { /* spec */ }
 * val progress by animateLottieCompositionAsState(composition, isPlaying = playing)
 * Image(painter = rememberLottiePainter(composition, progress = { progress }), null)
 * HapticLottie(
 *     progress = progress,
 *     durationMs = composition?.durationMillis?.toLong() ?: 0,
 *     isPlaying = playing,
 *     haptics = pattern,
 * )
 * ```
 *
 * A bundle [preset] supplies the pattern and the authored duration, so only
 * [progress] and [isPlaying] are left to wire. Render its animation with
 * [animationJson] — this package is renderer-agnostic and draws nothing itself:
 *
 * ```kotlin
 * val composition by rememberLottieComposition {
 *     LottieCompositionSpec.JsonString(pack.celebration.animationJson()!!)
 * }
 * HapticLottie(progress = progress, isPlaying = playing, preset = pack.celebration)
 * ```
 *
 * It holds the haptic engine across recompositions and emits as [progress]
 * advances. Pass neither [preset] nor [haptics] to disable.
 */
@Composable
fun HapticLottie(
    progress: Float,
    isPlaying: Boolean,
    preset: PresetHandle? = null,
    haptics: PatternData? = null,
    hapticMode: HapticMode? = null,
    hapticOffset: Long = 0,
    hapticsEnabled: Boolean = true,
    durationMs: Long = 0,
    pulsar: Pulsar = remember { Pulsar.create() },
) {
    val engine = remember(pulsar, preset, haptics, hapticMode, hapticOffset, hapticsEnabled) {
        HapticLottieEngine(
            pulsar = pulsar,
            preset = preset,
            haptics = haptics,
            hapticMode = hapticMode,
            hapticOffset = hapticOffset,
            hapticsEnabled = hapticsEnabled,
        )
    }
    LaunchedEffect(engine, isPlaying) {
        engine.setPlaying(isPlaying)
    }
    LaunchedEffect(engine, progress, durationMs) {
        engine.onProgress(progress, durationMs)
    }
    DisposableEffect(engine) {
        onDispose { engine.stop() }
    }
}
