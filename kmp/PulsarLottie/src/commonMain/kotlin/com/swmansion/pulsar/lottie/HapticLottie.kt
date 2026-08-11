package com.swmansion.pulsar.lottie

import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import com.swmansion.pulsar.kmp.PatternData
import com.swmansion.pulsar.kmp.Pulsar

/**
 * Plays Pulsar haptics in sync with a Lottie animation in Compose Multiplatform.
 *
 * Place it next to your Lottie renderer (e.g. compottie's `Image` /
 * `animateLottieCompositionAsState`) and feed it the same [progress],
 * [durationMillis], and [isPlaying]:
 *
 * ```kotlin
 * val composition by rememberLottieComposition { /* spec */ }
 * val progress by animateLottieCompositionAsState(composition, isPlaying = playing)
 * Image(painter = rememberLottiePainter(composition, progress = { progress }), null)
 * HapticLottie(
 *     progress = progress,
 *     durationMillis = composition?.durationMillis?.toLong() ?: 0,
 *     isPlaying = playing,
 *     haptics = pattern,
 * )
 * ```
 *
 * It holds the haptic engine across recompositions and emits as [progress]
 * advances. Pass `haptics = null` to disable.
 */
@Composable
fun HapticLottie(
    progress: Float,
    durationMillis: Long,
    isPlaying: Boolean,
    haptics: PatternData?,
    mode: HapticMode = HapticMode.Realtime,
    hapticOffsetMs: Long = 0,
    hapticsEnabled: Boolean = true,
    pulsar: Pulsar = remember { Pulsar.create() },
) {
    val engine = remember(pulsar, haptics, mode, hapticOffsetMs, hapticsEnabled) {
        HapticLottieEngine(pulsar, haptics, mode, hapticOffsetMs, hapticsEnabled)
    }
    LaunchedEffect(engine, isPlaying) {
        engine.setPlaying(isPlaying)
    }
    LaunchedEffect(engine, progress, durationMillis) {
        engine.onProgress(progress, durationMillis)
    }
    DisposableEffect(engine) {
        onDispose { engine.stop() }
    }
}
