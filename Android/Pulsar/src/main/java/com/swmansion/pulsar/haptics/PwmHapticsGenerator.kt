package com.swmansion.pulsar.haptics

import com.swmansion.pulsar.types.ConfigPoint
import com.swmansion.pulsar.types.ControlPoint
import kotlin.math.max
import kotlin.math.min
import kotlin.math.roundToLong

data class PwmHapticsGenerator(
    val minPulseMs: Long,
    val maxPulseMs: Long,
    val minPauseMs: Long,
    val maxPauseMs: Long,
) {

    /**
     * Pulse width for a given intensity. [capMs] bounds the pulse so it never outruns the room left
     * in the segment it belongs to (a short segment cannot host a long pulse); it never shrinks the
     * pulse below [minPulseMs], otherwise the motor would not engage.
     */
    fun resolveShotWidth(intensity: Float, capMs: Long): Long {
        val clamped = intensity.coerceIn(0f, 1f)
        val maxShot = min(maxPulseMs, max(minPulseMs, capMs))
        return lerp(minPulseMs, maxShot, clamped)
    }

    /** Gap after a pulse for a given frequency. Higher frequency → shorter gap → denser train. */
    fun resolvePauseWidth(frequency: Float): Long {
        val clamped = frequency.coerceIn(0f, 1f)
        return lerp(maxPauseMs, minPauseMs, clamped)
    }

    /**
     * Turns a continuous control line into a PWM on/off waveform in the shape
     * `VibrationEffect.createWaveform(timings, -1)` expects: `[off, on, off, on, …]` starting with
     * an off segment (which may be `0`).
     *
     * Each control point contributes pulses at *its* intensity (pulse width) and frequency (gap
     * width); walking a cursor across the whole timeline makes the pulse train follow the curve.
     * Silent stretches (intensity `0`) are skipped and become gaps. Returns `null` when there is
     * nothing playable.
     */
    fun buildPwmTimings(points: List<ControlPoint>): LongArray? {
        if (points.isEmpty()) return null

        val starts = LongArray(points.size)
        var total = 0L
        for (i in points.indices) {
            starts[i] = total
            total += max(0L, points[i].duration)
        }
        if (total <= 0L) return null

        val onSpans = ArrayList<LongArray>()
        var cursor = 0L
        var segIndex = 0

        while (cursor < total) {
            while (
                segIndex < points.lastIndex &&
                cursor >= starts[segIndex] + max(0L, points[segIndex].duration)
            ) {
                segIndex++
            }

            val point = points[segIndex]
            val segEnd = starts[segIndex] + max(0L, point.duration)

            if (point.intensity <= 0f) {
                // Silence — skip to the end of this stretch; it reads as a gap.
                cursor = max(segEnd, cursor + 1L)
                continue
            }

            val shot = resolveShotWidth(point.intensity, total - cursor)
            val pause = resolvePauseWidth(point.sharpness)
            val shotEnd = min(cursor + shot, total)

            val last = onSpans.lastOrNull()
            if (last != null && cursor <= last[1]) {
                last[1] = max(last[1], shotEnd)
            } else {
                onSpans.add(longArrayOf(cursor, shotEnd))
            }

            cursor = shotEnd + max(1L, pause)
        }

        if (onSpans.isEmpty()) return null
        val timings = spansToTimings(onSpans)
        return if (hasPlayableWaveform(timings)) timings else null
    }

    /**
     * Maps discrete impulses straight to pulses — one felt pulse per impulse, no line building in
     * between. Intensity sets the pulse width (floored to the felt threshold); the impulse
     * timestamps set the gaps, and each pulse is capped so it never swallows the next tap. Returns
     * the `[off, on, off, on, …]` timing array, or `null` when empty.
     */
    fun buildImpulseTimings(impulses: List<ConfigPoint>): LongArray? {
        if (impulses.isEmpty()) return null

        val sorted = impulses.sortedBy { it.time }
        val timings = ArrayList<Long>()
        var cursor = 0L

        for (i in sorted.indices) {
            val impulse = sorted[i]
            val start = max(cursor, max(0L, impulse.time))

            val cap = if (i < sorted.lastIndex) {
                max(minPulseMs, (sorted[i + 1].time - start) - minPauseMs)
            } else {
                maxPulseMs
            }
            val width = resolveShotWidth(impulse.amplitude, cap)

            timings.add(max(0L, start - cursor))
            timings.add(width)
            cursor = start + width
        }

        val array = timings.toLongArray()
        return if (hasPlayableWaveform(array)) array else null
    }

    private fun spansToTimings(onSpans: List<LongArray>): LongArray {
        val timings = ArrayList<Long>()
        var cursor = 0L
        for (span in onSpans) {
            timings.add(max(0L, span[0] - cursor))
            timings.add(max(0L, span[1] - span[0]))
            cursor = span[1]
        }
        return timings.toLongArray()
    }

    private fun hasPlayableWaveform(timings: LongArray): Boolean {
        return timings.isNotEmpty() && timings.any { it > 0L }
    }

    companion object {
        const val DEFAULT_MAX_PULSE_MS = 160L
        const val DEFAULT_MIN_PAUSE_MS = 25L
        const val DEFAULT_MAX_PAUSE_MS = 160L

        fun forActuator(minPulseMs: Long): PwmHapticsGenerator {
            val floor = max(1L, minPulseMs)
            return PwmHapticsGenerator(
                minPulseMs = floor,
                maxPulseMs = max(floor, DEFAULT_MAX_PULSE_MS),
                minPauseMs = DEFAULT_MIN_PAUSE_MS,
                maxPauseMs = DEFAULT_MAX_PAUSE_MS,
            )
        }

        private fun lerp(start: Long, end: Long, amount: Float): Long =
            (start + (end - start) * amount).roundToLong()
    }
}
