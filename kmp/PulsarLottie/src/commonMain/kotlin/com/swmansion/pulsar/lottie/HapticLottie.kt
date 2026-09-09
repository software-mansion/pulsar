package com.swmansion.pulsar.lottie

import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.Box
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.ContentScale
import com.swmansion.pulsar.kmp.PatternData
import com.swmansion.pulsar.kmp.Pulsar
import com.swmansion.pulsar.kmp.bundle.PresetHandle
import io.github.alexzhirkevich.compottie.LottieComposition
import io.github.alexzhirkevich.compottie.LottieCompositionSpec
import io.github.alexzhirkevich.compottie.animateLottieCompositionAsState
import io.github.alexzhirkevich.compottie.rememberLottieComposition
import io.github.alexzhirkevich.compottie.rememberLottiePainter

/**
 * Renders a bundle [preset]'s Lottie animation and plays its haptics locked to the timeline.
 *
 * ```kotlin
 * HapticLottie(preset = pack.celebration, modifier = Modifier.size(200.dp))
 * ```
 *
 * The preset supplies the animation, the pattern and the authored duration; [haptics] and
 * [durationMs] override its own. Renders an empty `Box` when the preset carries no animation.
 */
@Composable
fun HapticLottie(
    preset: PresetHandle,
    modifier: Modifier = Modifier,
    haptics: PatternData? = null,
    hapticMode: HapticMode? = null,
    hapticOffset: Long = 0,
    hapticsEnabled: Boolean = true,
    durationMs: Long = 0,
    isPlaying: Boolean = true,
    iterations: Int = 1,
    contentDescription: String? = null,
    alignment: Alignment = Alignment.Center,
    contentScale: ContentScale = ContentScale.Fit,
    pulsar: Pulsar = remember { Pulsar.create() },
) {
    val json = remember(preset) { preset.animationJson() }
    if (json == null) {
        Box(modifier)
        return
    }
    val composition by rememberLottieComposition(json) { LottieCompositionSpec.JsonString(json) }

    HapticLottie(
        composition = composition,
        modifier = modifier,
        preset = preset,
        haptics = haptics,
        hapticMode = hapticMode,
        hapticOffset = hapticOffset,
        hapticsEnabled = hapticsEnabled,
        durationMs = durationMs,
        isPlaying = isPlaying,
        iterations = iterations,
        contentDescription = contentDescription,
        alignment = alignment,
        contentScale = contentScale,
        pulsar = pulsar,
    )
}

/**
 * Renders [composition] and plays Pulsar haptics locked to its timeline.
 *
 * A drop-in for compottie's own render call — it takes the same [LottieComposition] you would
 * hand to `rememberLottiePainter`, so an existing screen only swaps the `Image`:
 *
 * ```kotlin
 * val composition by rememberLottieComposition { LottieCompositionSpec.JsonString(json) }
 *
 * HapticLottie(composition, haptics = pattern, modifier = Modifier.size(200.dp))
 * ```
 *
 * Pass neither [preset] nor [haptics] to render without haptics.
 */
@Composable
fun HapticLottie(
    composition: LottieComposition?,
    modifier: Modifier = Modifier,
    preset: PresetHandle? = null,
    haptics: PatternData? = null,
    hapticMode: HapticMode? = null,
    hapticOffset: Long = 0,
    hapticsEnabled: Boolean = true,
    durationMs: Long = 0,
    isPlaying: Boolean = true,
    iterations: Int = 1,
    contentDescription: String? = null,
    alignment: Alignment = Alignment.Center,
    contentScale: ContentScale = ContentScale.Fit,
    pulsar: Pulsar = remember { Pulsar.create() },
) {
    val progress by animateLottieCompositionAsState(
        composition,
        isPlaying = isPlaying,
        iterations = iterations,
    )

    Image(
        painter = rememberLottiePainter(composition, progress = { progress }),
        contentDescription = contentDescription,
        modifier = modifier,
        alignment = alignment,
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
 * Add it next to your own renderer and feed it the same [progress], [durationMs] and
 * [isPlaying] — nothing about the existing rendering changes:
 *
 * ```kotlin
 * val composition by rememberLottieComposition { /* spec */ }
 * val progress by animateLottieCompositionAsState(composition, isPlaying = playing)
 * Image(rememberLottiePainter(composition, progress = { progress }), null)
 *
 * HapticLottieSync(
 *     progress = progress,
 *     isPlaying = playing,
 *     haptics = pattern,
 *     durationMs = composition?.duration?.inWholeMilliseconds ?: 0,
 * )
 * ```
 *
 * It emits no UI of its own. Pass neither [preset] nor [haptics] to disable.
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
