package com.swmansion.pulsar.haptics

/**
 * Simulates haptic intensity and frequency on devices that only expose on/off
 * vibration control (no amplitude control — e.g. older ERM phones).
 *
 * It mirrors the PWM / duty-cycle approach used by the web engine (see
 * web/Pulsar/src/PatternComposer.ts and RealtimeComposer.ts): when the only knob
 * available is "vibrate for N ms", intensity is encoded as the ON pulse length
 * (duty cycle) and frequency as the OFF gap between pulses (a shorter gap means a
 * higher perceived pulse rate).
 *
 * The timing bounds are tuned for ERM / no-amplitude LRA actuators. A pulse shorter
 * than the motor's engagement threshold cannot spin it up to a perceptible level, so
 * the minimum ON time is floored above that threshold instead of scaling all the way
 * to zero — the same reasoning documented for the web RealtimeComposer. The values
 * are empirical; adjust them together if a device family feels off.
 */
object PwmTimingSimulator {
    /**
     * Minimum ON time (ms). Floored near the ERM engagement threshold so that even
     * low intensities produce a fully-engaged (just shorter) pulse instead of a weak
     * partial buzz that perceptually undershoots.
     */
    const val MIN_PULSE_MS = 40L

    /** Maximum ON time (ms) at full intensity. */
    const val MAX_PULSE_MS = 160L

    /** Minimum OFF gap (ms), reached at the highest frequency. */
    const val MIN_PAUSE_MS = 25L

    /** Maximum OFF gap (ms), reached at the lowest frequency. */
    const val MAX_PAUSE_MS = 180L

    /**
     * ON pulse length (ms) for [intensity] (0-1). Returns 0 for non-positive
     * intensity so callers can treat it as silence. [maxDurationMs] caps the pulse so
     * a short segment never emits a pulse longer than itself.
     */
    fun shotLength(intensity: Float, maxDurationMs: Long = MAX_PULSE_MS): Long {
        if (intensity <= 0f) {
            return 0L
        }
        val maxShot = maxDurationMs.coerceIn(MIN_PULSE_MS, MAX_PULSE_MS)
        return lerp(MIN_PULSE_MS, maxShot, intensity)
    }

    /**
     * OFF gap length (ms) for [frequency] (0-1). The mapping is inverted: a higher
     * frequency yields a shorter gap and therefore a faster pulse rate. [maxDurationMs]
     * caps the gap so it never overruns the remaining segment.
     */
    fun pauseLength(frequency: Float, maxDurationMs: Long = MAX_PAUSE_MS): Long {
        val maxPause = maxDurationMs.coerceIn(MIN_PAUSE_MS, MAX_PAUSE_MS)
        return lerp(maxPause, MIN_PAUSE_MS, frequency)
    }

    private fun lerp(start: Long, end: Long, amount: Float): Long {
        val clamped = amount.coerceIn(0f, 1f)
        return (start + (end - start) * clamped).toLong()
    }
}
