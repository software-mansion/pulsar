package com.swmansion.pulsar.lottie

import android.animation.ValueAnimator
import com.airbnb.lottie.LottieAnimationView
import com.airbnb.lottie.LottieDrawable
import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.bundle.PresetHandle
import com.swmansion.pulsar.composers.PatternComposer
import com.swmansion.pulsar.composers.RealtimeComposer
import com.swmansion.pulsar.types.PatternData

/** How the haptics are produced while the animation plays. */
enum class HapticMode {
    /**
     * The animation timeline is the master clock: the pattern is sampled every
     * frame into `RealtimeComposer` events. Honours pause/seek/loop. Requires a
     * [PatternData] source.
     */
    REALTIME,

    /**
     * A whole pattern is played once via `PatternComposer`, aligned to the start
     * (best native fidelity). Seek/pause on the haptic side are best-effort.
     */
    PATTERN,
}

/**
 * Drives Pulsar haptics from a [LottieAnimationView].
 *
 * Attach it to a `LottieAnimationView` you already use; the transport
 * ([play]/[pause]/[resume]/[stop]/[reset]/[setTimestamp]/[setLoop]) steers both
 * the animation and the haptics. In [HapticMode.REALTIME] it follows the view's
 * animator (the per-frame clock) and samples the pattern; in [HapticMode.PATTERN]
 * it fires a pre-parsed pattern aligned to the start.
 *
 * A bundle [preset] supplies the pattern and authored duration; an explicit [haptics]
 * overrides it. [hapticMode] defaults to [HapticMode.REALTIME], or to [HapticMode.PATTERN]
 * for a preset carrying audio, which only sounds there.
 *
 * Call [release] when done to detach the animator listener and stop haptics.
 */
class HapticLottieController @JvmOverloads constructor(
    private val lottieView: LottieAnimationView,
    pulsar: Pulsar,
    preset: PresetHandle? = null,
    haptics: PatternData? = null,
    hapticMode: HapticMode? = null,
    private val hapticOffset: Long = 0L,
    private val hapticsEnabled: Boolean = true,
    durationMs: Long? = null,
) {
    private val pattern: PatternData? = haptics ?: preset?.pattern
    private val playsOwnAudio = haptics == null && preset?.hasAudio == true
    private val mode = hapticMode ?: if (playsOwnAudio) HapticMode.PATTERN else HapticMode.REALTIME

    private val useRealtime = mode == HapticMode.REALTIME && pattern != null
    private val hasContinuous = pattern != null &&
        pattern.continuousPattern.amplitude.isNotEmpty() &&
        pattern.continuousPattern.frequency.isNotEmpty()

    private val realtime: RealtimeComposer? =
        if (useRealtime) pulsar.getRealtimeComposer() else null

    private val audioPreset: PresetHandle? = if (!useRealtime && playsOwnAudio) preset else null

    private val composer: PatternComposer? =
        if (!useRealtime && !playsOwnAudio && pattern != null) {
            // Pre-parse so the engine is warm and play() fires without delay.
            pulsar.getPatternComposer().apply { parsePattern(pattern) }
        } else {
            null
        }

    /**
     * Clock length in ms: an explicit duration, else the preset's authored one, else the
     * Lottie composition once loaded, else the pattern's own length.
     */
    private val fixedDurationMs: Long? =
        durationMs?.takeIf { it > 0L } ?: preset?.duration?.takeIf { it > 0L }
    private var resolvedDurationMs: Long = fixedDurationMs
        ?: pattern?.let { patternDurationMs(it) }
        ?: 0L
    private var lastT: Long = 0L

    private val updateListener = ValueAnimator.AnimatorUpdateListener { anim ->
        onTick(anim.animatedFraction)
    }

    init {
        if (pattern != null && hapticsEnabled) {
            if (fixedDurationMs == null) {
                lottieView.addLottieOnCompositionLoadedListener { composition ->
                    resolvedDurationMs = composition.duration.toLong()
                }
            }
            if (useRealtime) lottieView.addAnimatorUpdateListener(updateListener)
        }
    }

    private fun onTick(fraction: Float) {
        if (!hapticsEnabled || !useRealtime || pattern == null) return
        val t = (fraction * resolvedDurationMs).toLong()
        val ht = t + hapticOffset
        if (hasContinuous) {
            realtime?.set(
                clamp01(sampleEnvelope(pattern.continuousPattern.amplitude, ht)),
                clamp01(sampleEnvelope(pattern.continuousPattern.frequency, ht)),
            )
        }
        var prev = lastT
        if (t < prev) prev = 0L // wrapped on loop
        for (e in pattern.discretePattern) {
            if (e.time > prev && e.time <= t) {
                realtime?.playDiscrete(clamp01(e.amplitude), clamp01(e.frequency))
            }
        }
        lastT = t
    }

    private fun fireHaptics() {
        if (!hapticsEnabled) return
        when {
            useRealtime -> lastT = 0L
            audioPreset != null -> audioPreset.play()
            else -> composer?.play()
        }
    }

    private fun stopHaptics() {
        when {
            useRealtime -> {
                lastT = 0L
                if (hasContinuous) realtime?.stop()
            }
            audioPreset != null -> audioPreset.stop()
            else -> composer?.stop()
        }
    }

    /** Play from the start, animation and haptics together. */
    fun play() {
        lastT = 0L
        lottieView.progress = 0f
        lottieView.playAnimation()
        fireHaptics()
    }

    /** Pause both animation and haptics. */
    fun pause() {
        lottieView.pauseAnimation()
        stopHaptics()
    }

    /** Resume from the current position. */
    fun resume() {
        lottieView.resumeAnimation()
    }

    /** Stop and rewind to the start. */
    fun stop() {
        lottieView.cancelAnimation()
        lottieView.progress = 0f
        lastT = 0L
        stopHaptics()
    }

    /** Rewind to the start (also stops haptics). */
    fun reset() = stop()

    /** Seek both animation and haptics to [ms] from the start. */
    fun setTimestamp(ms: Long) {
        if (resolvedDurationMs > 0L) {
            lottieView.progress = clamp01(ms.toFloat() / resolvedDurationMs)
        }
        lastT = ms
    }

    /**
     * Loop the animation. [count] limits iterations ([LottieDrawable.INFINITE] =
     * forever); [reverse] plays a boomerang.
     */
    @JvmOverloads
    fun setLoop(loop: Boolean, count: Int = LottieDrawable.INFINITE, reverse: Boolean = false) {
        lottieView.repeatCount = if (loop) count else 0
        lottieView.repeatMode = if (reverse) LottieDrawable.REVERSE else LottieDrawable.RESTART
    }

    /** Detach the animator listener and release haptic resources. */
    fun release() {
        if (useRealtime) lottieView.removeUpdateListener(updateListener)
        stopHaptics()
    }
}

/**
 * Attach Pulsar haptics to this [LottieAnimationView] without swapping the view.
 * Returns a [HapticLottieController] you drive; call [HapticLottieController.release]
 * when done.
 *
 * This binds haptics only — the view keeps whatever animation you gave it. Use
 * [HapticLottieView.bindHaptics] to have a bundle [preset]'s Lottie rendered for you.
 */
@JvmOverloads
fun LottieAnimationView.bindHaptics(
    pulsar: Pulsar,
    preset: PresetHandle? = null,
    haptics: PatternData? = null,
    hapticMode: HapticMode? = null,
    hapticOffset: Long = 0L,
    hapticsEnabled: Boolean = true,
    durationMs: Long? = null,
): HapticLottieController = HapticLottieController(
    this,
    pulsar,
    preset,
    haptics,
    hapticMode,
    hapticOffset,
    hapticsEnabled,
    durationMs,
)
