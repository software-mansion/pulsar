package com.swmansion.pulsar.lottie

import android.animation.ValueAnimator
import com.airbnb.lottie.LottieAnimationView
import com.airbnb.lottie.LottieDrawable
import com.swmansion.pulsar.Pulsar
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
 * Call [release] when done to detach the animator listener and stop haptics.
 */
class HapticLottieController @JvmOverloads constructor(
    private val lottieView: LottieAnimationView,
    pulsar: Pulsar,
    private val haptics: PatternData? = null,
    private val mode: HapticMode = HapticMode.REALTIME,
    private val offsetMs: Long = 0L,
    private val enabled: Boolean = true,
) {
    private val useRealtime = mode == HapticMode.REALTIME && haptics != null
    private val hasContinuous = haptics != null &&
        haptics.continuousPattern.amplitude.isNotEmpty() &&
        haptics.continuousPattern.frequency.isNotEmpty()

    private val realtime: RealtimeComposer? =
        if (useRealtime) pulsar.getRealtimeComposer() else null
    private val pattern: PatternComposer? =
        if (!useRealtime && haptics != null) {
            // Pre-parse so the engine is warm and play() fires without delay.
            pulsar.getPatternComposer().apply { parsePattern(haptics) }
        } else {
            null
        }

    private var durationMs: Long = haptics?.let { patternDurationMs(it) } ?: 0L
    private var lastT: Long = 0L

    private val updateListener = ValueAnimator.AnimatorUpdateListener { anim ->
        onTick(anim.animatedFraction)
    }

    init {
        if (haptics != null && enabled) {
            lottieView.addLottieOnCompositionLoadedListener { composition ->
                durationMs = composition.duration.toLong()
            }
            if (useRealtime) lottieView.addAnimatorUpdateListener(updateListener)
        }
    }

    private fun onTick(fraction: Float) {
        if (!enabled || !useRealtime || haptics == null) return
        val t = (fraction * durationMs).toLong()
        val ht = t + offsetMs
        if (hasContinuous) {
            realtime?.set(
                clamp01(sampleEnvelope(haptics.continuousPattern.amplitude, ht)),
                clamp01(sampleEnvelope(haptics.continuousPattern.frequency, ht)),
            )
        }
        var prev = lastT
        if (t < prev) prev = 0L // wrapped on loop
        for (e in haptics.discretePattern) {
            if (e.time > prev && e.time <= t) {
                realtime?.playDiscrete(clamp01(e.amplitude), clamp01(e.frequency))
            }
        }
        lastT = t
    }

    private fun fireHaptics() {
        if (!enabled || haptics == null) return
        if (useRealtime) lastT = 0L else pattern?.play()
    }

    private fun stopHaptics() {
        if (useRealtime) {
            lastT = 0L
            if (hasContinuous) realtime?.stop()
        } else {
            pattern?.stop()
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
        if (durationMs > 0L) lottieView.progress = clamp01(ms.toFloat() / durationMs)
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
 */
@JvmOverloads
fun LottieAnimationView.bindHaptics(
    pulsar: Pulsar,
    haptics: PatternData,
    mode: HapticMode = HapticMode.REALTIME,
    offsetMs: Long = 0L,
    enabled: Boolean = true,
): HapticLottieController = HapticLottieController(this, pulsar, haptics, mode, offsetMs, enabled)
