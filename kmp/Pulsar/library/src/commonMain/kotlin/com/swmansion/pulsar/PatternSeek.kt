package com.swmansion.pulsar.kmp

/**
 * Re-anchors an authored pattern so that playing it from zero feels like playing the original
 * from `fromMs`. The composer only ever starts at zero, so seeking replays a shifted copy.
 */
internal object PatternSeek {
    /** The value the envelope holds at [atMs], interpolating between the surrounding points. */
    fun valueAt(points: List<ValuePoint>, atMs: Long): Float {
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

    /**
     * An envelope whose points all sit before the seek HOLDS its last value for the rest of the
     * pattern rather than emptying. Emptying it would silence the whole continuous channel: the
     * composer builds that channel only when the amplitude AND frequency curves are both
     * non-empty, so seeking past the end of either one kills both.
     */
    fun envelopeFrom(points: List<ValuePoint>, fromMs: Long, remainingMs: Long): List<ValuePoint> {
        if (points.isEmpty()) return emptyList()
        val held = ValuePoint(time = 0L, value = valueAt(points, fromMs))
        val rest = points.filter { it.time > fromMs }.map { ValuePoint(it.time - fromMs, it.value) }
        if (rest.isNotEmpty()) return listOf(held) + rest
        return if (remainingMs > 0L) listOf(held, ValuePoint(remainingMs, held.value)) else listOf(held)
    }

    /** The last authored timestamp in the pattern, across both lines. */
    fun durationOf(pattern: PatternData): Long = maxOf(
        pattern.discretePattern.maxOfOrNull { it.time } ?: 0L,
        pattern.continuousPattern.amplitude.maxOfOrNull { it.time } ?: 0L,
        pattern.continuousPattern.frequency.maxOfOrNull { it.time } ?: 0L,
    )

    /** Drops the discrete events before [fromMs], rebases the rest, re-anchors both envelopes. */
    fun patternFrom(pattern: PatternData, fromMs: Long): PatternData {
        if (fromMs <= 0L) return pattern
        val remainingMs = durationOf(pattern) - fromMs
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
     * Where the audio file and the haptics line up after a seek.
     *
     * A sound offset by `offset` ms is at file position `t - offset` when the haptics are at `t`,
     * so seeking to [fromMs] either advances into the file or eats into the lead-in.
     */
    fun soundFrom(sound: SoundData, fromMs: Long): SoundData {
        val lead = maxOf(0L, sound.offset)
        val intoFile = maxOf(0L, fromMs - lead)
        return sound.copy(
            offset = maxOf(0L, lead - fromMs),
            startMs = sound.startMs + intoFile,
            // A zero duration means "to the end of the file", so only an authored window shrinks.
            durationMs = if (sound.durationMs > 0L) maxOf(0L, sound.durationMs - intoFile) else 0L,
        )
    }
}
