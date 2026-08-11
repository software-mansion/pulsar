package com.swmansion.pulsar.lottie

import com.swmansion.pulsar.kmp.PatternComposer
import com.swmansion.pulsar.kmp.PatternData
import com.swmansion.pulsar.kmp.Pulsar
import com.swmansion.pulsar.kmp.RealtimeComposer

/** How the haptics are produced while the animation plays. */
enum class HapticMode {
    /**
     * The animation timeline is the master clock: the pattern is sampled every
     * progress update into `RealtimeComposer` events. Honours pause/seek/loop.
     * Requires a [PatternData] source.
     */
    Realtime,

    /**
     * A whole pattern is played once via `PatternComposer`, aligned to the start
     * (best native fidelity). Seek/pause on the haptic side are best-effort.
     */
    Pattern,
}

/**
 * Pure haptic-sync engine driven by animation progress. Framework-agnostic (no
 * Compose): [HapticLottie] wires a Compose Lottie animation to it, but you can
 * drive it from any progress source.
 */
class HapticLottieEngine(
    pulsar: Pulsar,
    private val haptics: PatternData?,
    private val mode: HapticMode = HapticMode.Realtime,
    private val offsetMs: Long = 0,
    private val enabled: Boolean = true,
) {
    private val useRealtime = mode == HapticMode.Realtime && haptics != null
    private val hasContinuous = haptics != null &&
        haptics.continuousPattern.amplitude.isNotEmpty() &&
        haptics.continuousPattern.frequency.isNotEmpty()

    private val realtime: RealtimeComposer? =
        if (useRealtime) pulsar.getRealtimeComposer() else null
    private val pattern: PatternComposer? =
        if (!useRealtime && haptics != null) {
            pulsar.getPatternComposer().also { it.parsePattern(haptics) } // pre-parse / warm
        } else {
            null
        }

    private var lastT: Long = 0
    private var playing = false

    /** Notify a play/pause transition. In `pattern` mode fires the buffered pattern. */
    fun setPlaying(isPlaying: Boolean) {
        if (isPlaying == playing) return
        playing = isPlaying
        if (isPlaying) {
            lastT = 0
            if (!useRealtime) pattern?.play()
        } else {
            stop()
        }
    }

    /** Feed the current animation [progress] (0..1) and total [durationMs]. */
    fun onProgress(progress: Float, durationMs: Long) {
        if (!enabled || !useRealtime || haptics == null || !playing) return
        val t = (progress.toDouble() * durationMs).toLong()
        val ht = t + offsetMs
        if (hasContinuous) {
            realtime?.set(
                clamp01(sampleEnvelope(haptics.continuousPattern.amplitude, ht)),
                clamp01(sampleEnvelope(haptics.continuousPattern.frequency, ht)),
            )
        }
        var prev = lastT
        if (t < prev) prev = 0 // wrapped on loop
        for (e in haptics.discretePattern) {
            if (e.time > prev && e.time <= t) {
                realtime?.playDiscrete(clamp01(e.amplitude), clamp01(e.frequency))
            }
        }
        lastT = t
    }

    /** Stop haptics and reset the discrete window. */
    fun stop() {
        lastT = 0
        if (useRealtime) {
            if (hasContinuous) realtime?.stop()
        } else {
            pattern?.stop()
        }
    }
}
