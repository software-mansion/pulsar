package com.swmansion.pulsar.lottie

import com.swmansion.pulsar.kmp.PatternData
import com.swmansion.pulsar.kmp.ValuePoint

/**
 * Pure helpers that turn a Pulsar [PatternData] into per-frame RealtimeComposer
 * inputs. No Compose or platform dependencies, so they are trivially testable.
 */

/** Linear-interpolate a breakpoint envelope at time [t] (ms). */
internal fun sampleEnvelope(points: List<ValuePoint>, t: Long): Float {
    val n = points.size
    if (n == 0) return 0f
    val first = points[0]
    if (t <= first.time) return first.value
    val last = points[n - 1]
    if (t >= last.time) return last.value
    for (i in 1 until n) {
        val b = points[i]
        if (t <= b.time) {
            val a = points[i - 1]
            val span = (b.time - a.time).toFloat()
            if (span <= 0f) return b.value
            val k = (t - a.time).toFloat() / span
            return a.value + (b.value - a.value) * k
        }
    }
    return last.value
}

/** Total pattern length in ms — the largest timestamp across all channels. */
internal fun patternDurationMs(pattern: PatternData): Long {
    var max = 0L
    for (e in pattern.discretePattern) if (e.time > max) max = e.time
    for (e in pattern.continuousPattern.amplitude) if (e.time > max) max = e.time
    for (e in pattern.continuousPattern.frequency) if (e.time > max) max = e.time
    return max
}

/** Clamp [v] into `[0, 1]`. */
internal fun clamp01(v: Float): Float = if (v < 0f) 0f else if (v > 1f) 1f else v
