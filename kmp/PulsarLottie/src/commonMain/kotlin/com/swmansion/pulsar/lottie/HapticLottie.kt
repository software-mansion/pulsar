package com.swmansion.pulsar.lottie

import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.Box
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.ContentScale
import com.swmansion.pulsar.kmp.PatternData
import com.swmansion.pulsar.kmp.Pulsar
import com.swmansion.pulsar.kmp.bundle.PresetHandle
import io.github.alexzhirkevich.compottie.LottieCompositionSpec
import io.github.alexzhirkevich.compottie.animateLottieCompositionAsState
import io.github.alexzhirkevich.compottie.rememberLottieComposition
import io.github.alexzhirkevich.compottie.rememberLottiePainter

/**
 * Renders a Lottie animation and plays Pulsar haptics locked to its timeline.
 *
 * A bundle [preset] supplies the animation, the pattern and the authored duration at once:
 *
 * ```kotlin
 * HapticLottie(preset = pack.celebration, modifier = Modifier.size(200.dp))
 * ```
 *
 * Pass [animation] and [haptics] instead to bring your own of each:
 *
 * ```kotlin
 * HapticLottie(
 *     animation = LottieCompositionSpec.JsonString(json),
 *     haptics = pattern,
 * )
 * ```
 *
 * Renders through [compottie](https://github.com/alexzhirkevich/compottie). To drive a renderer
 * of your own, use [HapticLottieSync], which follows a progress value and draws nothing.
 */
@Composable
fun HapticLottie(
    modifier: Modifier = Modifier,
    preset: PresetHandle? = null,
    animation: LottieCompositionSpec? = null,
    haptics: PatternData? = null,
    hapticMode: HapticMode? = null,
    hapticOffset: Long = 0,
    hapticsEnabled: Boolean = true,
    durationMs: Long = 0,
    isPlaying: Boolean = true,
    iterations: Int = 1,
    contentDescription: String? = null,
    contentScale: ContentScale = ContentScale.Fit,
    pulsar: Pulsar = remember { Pulsar.create() },
) {
    val spec = remember(animation, preset) {
        animation ?: preset?.animationJson()?.let(LottieCompositionSpec::JsonString)
    }
    if (spec == null) {
        Box(modifier)
        return
    }

    val composition by rememberLottieComposition(spec) { spec }
    val progress by animateLottieCompositionAsState(
        composition,
        isPlaying = isPlaying,
        iterations = iterations,
    )

    Image(
        painter = rememberLottiePainter(composition, progress = { progress }),
        contentDescription = contentDescription,
        modifier = modifier,
        contentScale = contentScale,
    )

    HapticLottieSync(
        progress = progress,
        isPlaying = isPlaying,
        preset = preset,
        haptics = haptics,
        hapticMode = hapticMode,
        hapticOffset = hapticOffset,
        hapticsEnabled = hapticsEnabled,
        durationMs = if (durationMs > 0) durationMs else composition?.duration?.inWholeMilliseconds ?: 0,
        pulsar = pulsar,
    )
}

/**
 * Plays Pulsar haptics in sync with a Lottie animation rendered by something else.
 *
 * Place it next to your own renderer and feed it the same [progress], [durationMs] and
 * [isPlaying]:
 *
 * ```kotlin
 * val composition by rememberLottieComposition { /* spec */ }
 * val progress by animateLottieCompositionAsState(composition, isPlaying = playing)
 * Image(painter = rememberLottiePainter(composition, progress = { progress }), null)
 * HapticLottieSync(
 *     progress = progress,
 *     isPlaying = playing,
 *     haptics = pattern,
 *     durationMs = composition?.duration?.inWholeMilliseconds ?: 0,
 * )
 * ```
 *
 * It emits no UI of its own — it holds the haptic engine across recompositions and reacts to
 * [progress]. Prefer [HapticLottie] unless you render with something other than compottie.
 * Pass neither [preset] nor [haptics] to disable.
 */
@Composable
fun HapticLottieSync(
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
