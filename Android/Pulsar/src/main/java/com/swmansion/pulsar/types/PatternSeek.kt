package com.swmansion.pulsar.types

/**
 * Re-anchors an authored pattern so playing it from zero feels like playing the original from
 * `fromMs`. The composer only ever starts at zero.
 */
internal object PatternSeek {
    fun interpolatedValueAt(points: List<ValuePoint>, atMs: Long): Float {
        val first = points.firstOrNull() ?: return 0f
        val last = points.last()
        if (atMs <= first.time) return first.value
        if (atMs >= last.time) return last.value
        val nextIndex = points.indexOfFirst { it.time > atMs }
        if (nextIndex <= 0) return last.value
        val before = points[nextIndex - 1]
        val after = points[nextIndex]
        val span = after.time - before.time
        if (span <= 0L) return after.value
        return before.value + (after.value - before.value) * (atMs - before.time).toFloat() / span
    }

    fun envelopeFrom(points: List<ValuePoint>, fromMs: Long, remainingMs: Long): List<ValuePoint> {
        if (points.isEmpty()) return emptyList()
        val valueAtSeek = ValuePoint(time = 0L, value = interpolatedValueAt(points, fromMs))
        val pointsAfterSeek = points
            .filter { it.time > fromMs }
            .map { ValuePoint(it.time - fromMs, it.value) }
        if (pointsAfterSeek.isNotEmpty()) return listOf(valueAtSeek) + pointsAfterSeek
        return holdingLastValue(valueAtSeek, remainingMs)
    }

    /**
     * Emptying an envelope would silence BOTH continuous channels — the composer builds that
     * line only when the amplitude and frequency curves are each non-empty.
     */
    private fun holdingLastValue(point: ValuePoint, remainingMs: Long): List<ValuePoint> =
        if (remainingMs > 0L) listOf(point, ValuePoint(remainingMs, point.value)) else listOf(point)

    fun lastTimestampOf(pattern: PatternData): Long = maxOf(
        pattern.discretePattern.maxOfOrNull { it.time } ?: 0L,
        pattern.continuousPattern.amplitude.maxOfOrNull { it.time } ?: 0L,
        pattern.continuousPattern.frequency.maxOfOrNull { it.time } ?: 0L,
    )

    fun patternFrom(pattern: PatternData, fromMs: Long): PatternData {
        if (fromMs <= 0L) return pattern
        val remainingMs = lastTimestampOf(pattern) - fromMs
        return PatternData(
            continuousPattern = ContinuousPattern(
                amplitude = envelopeFrom(pattern.continuousPattern.amplitude, fromMs, remainingMs),
                frequency = envelopeFrom(pattern.continuousPattern.frequency, fromMs, remainingMs),
            ),
            discretePattern = pattern.discretePattern
                .filter { it.time >= fromMs }
                .map { it.copy(time = it.time - fromMs) },
        )
    }

    /**
     * Audio offset by [SoundData.offset] sits at file position `t - offset` when the haptics are
     * at `t`, so a seek is spent on the lead-in first and only then on the file.
     */
    fun soundFrom(sound: SoundData, fromMs: Long): SoundData {
        val leadIn = maxOf(0L, sound.offset)
        val seekIntoFile = maxOf(0L, fromMs - leadIn)
        val playsToEndOfFile = sound.durationMs <= 0L
        return sound.copy(
            offset = maxOf(0L, leadIn - fromMs),
            startMs = sound.startMs + seekIntoFile,
            durationMs = if (playsToEndOfFile) 0L else maxOf(0L, sound.durationMs - seekIntoFile),
        )
    }
}
