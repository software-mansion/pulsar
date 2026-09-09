package com.swmansion.pulsar.lottie

import com.swmansion.pulsar.kmp.PatternComposer
import com.swmansion.pulsar.kmp.PatternData
import com.swmansion.pulsar.kmp.Pulsar
import com.swmansion.pulsar.kmp.RealtimeComposer
import com.swmansion.pulsar.kmp.bundle.PresetHandle

/** How the haptics are produced while the animation plays. */
enum class HapticMode {
    /**
     * The animation timeline is the master clock: the pattern is sampled every
     * progress update into `RealtimeComposer` events. Honours pause/seek/loop.
     * Requires a [PatternData] source.
     */
    REALTIME,

    /**
     * A whole pattern is played once via `PatternComposer`, aligned to the start
     * (best native fidelity). Seek/pause on the haptic side are best-effort.
     */
    PATTERN,
}

/**
 * The Lottie JSON a bundle preset was authored against, as a string — ready for a
 * Compose Lottie renderer (e.g. compottie's `LottieCompositionSpec.JsonString`).
 * `null` when the preset carries no animation.
 */
fun PresetHandle.animationJson(): String? = animation?.data?.decodeToString()

/**
 * Pure haptic-sync engine driven by animation progress. Framework-agnostic (no
 * Compose): [HapticLottie] wires a Compose Lottie animation to it, but you can
 * drive it from any progress source.
 *
 * A bundle [preset] supplies the pattern and authored duration; an explicit [haptics]
 * overrides it.
 */
class HapticLottieEngine(
    pulsar: Pulsar,
    preset: PresetHandle? = null,
    haptics: PatternData? = null,
    hapticMode: HapticMode? = null,
    private val hapticOffset: Long = 0,
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
            pulsar.getPatternComposer().also { it.parsePattern(pattern) } // pre-parse / warm
        } else {
            null
        }

    /**
     * Clock length in ms: an explicit duration, else the preset's authored one, else the
     * length passed to [onProgress], else the pattern's own length.
     */
    private val fixedDurationMs: Long? =
        durationMs?.takeIf { it > 0L } ?: preset?.duration?.takeIf { it > 0L }
    private val fallbackDurationMs: Long = pattern?.let { patternDurationMs(it) } ?: 0L

    /** The clock length this engine resolved, for a caller that has no duration of its own. */
    val resolvedDurationMs: Long get() = fixedDurationMs ?: fallbackDurationMs

    private var lastT: Long = 0
    private var playing = false

    /** Notify a play/pause transition. In `PATTERN` mode fires the buffered pattern. */
    fun setPlaying(isPlaying: Boolean) {
        if (isPlaying == playing) return
        playing = isPlaying
        if (isPlaying) {
            lastT = 0
            if (!useRealtime && hapticsEnabled) {
                if (audioPreset != null) audioPreset.play() else composer?.play()
            }
        } else {
            stop()
        }
    }

    /**
     * Feed the current animation [progress] (0..1). [durationMs] is the animation's own
     * length; pass 0 (the default) to use the duration this engine already resolved.
     */
    fun onProgress(progress: Float, durationMs: Long = 0) {
        if (!hapticsEnabled || !useRealtime || pattern == null || !playing) return
        val dur = fixedDurationMs ?: durationMs.takeIf { it > 0L } ?: fallbackDurationMs
        val t = (progress.toDouble() * dur).toLong()
        val ht = t + hapticOffset
        if (hasContinuous) {
            realtime?.set(
                clamp01(sampleEnvelope(pattern.continuousPattern.amplitude, ht)),
                clamp01(sampleEnvelope(pattern.continuousPattern.frequency, ht)),
            )
        }
        var prev = lastT
        if (t < prev) prev = 0 // wrapped on loop
        for (e in pattern.discretePattern) {
            if (e.time > prev && e.time <= t) {
                realtime?.playDiscrete(clamp01(e.amplitude), clamp01(e.frequency))
            }
        }
        lastT = t
    }

    /** Stop haptics and reset the discrete window. */
    fun stop() {
        lastT = 0
        when {
            useRealtime -> if (hasContinuous) realtime?.stop()
            audioPreset != null -> audioPreset.stop()
            else -> composer?.stop()
        }
    }
}
