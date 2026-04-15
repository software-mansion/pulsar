package com.swmansion.pulsar.androidimpl.types

/**
 * Since Android doesn't support a true continuous mode, it must be simulated. There are a couple
 * of different approaches, but every strategy has its own cons and feels different. Try them out
 * to see which one works best for you.
 *
 * @param ENVELOPE - Approximation based on the Envelope API. This allows for control over
 * amplitude and frequency; however, the signal oscillates and can be unstable. Available starting
 * with Android API 36.
 *
 * @param PRIMITIVE_TICK - Approximation based on the Composition API using the TICK primitive at
 * varying intervals. While amplitude can be controlled, the frequency is simulated by the timing
 * between ticks. Consequently, the signal consists of discrete impulses rather than
 * a continuous signal.
 *
 * @param PRIMITIVE_COMPLEX - Similar to PRIMITIVE_TICK, but utilizes multiple primitives
 * depending on the requested frequency.
 *
 * @param ENVELOPE_WITH_DISCRETE_PRIMITIVES - Hybrid strategy that uses the Envelope API for
 * continuous events (same as ENVELOPE) but plays platform composition primitives for discrete
 * events (same as PRIMITIVE_COMPLEX). Requires Android API 36 for continuous mode and API 33
 * (TIRAMISU) for discrete primitives.
 */
enum class RealtimeComposerStrategy {
    ENVELOPE,
    PRIMITIVE_TICK,
    PRIMITIVE_COMPLEX,
    ENVELOPE_WITH_DISCRETE_PRIMITIVES
}

interface RealtimeComposable {
    fun set(amplitude: Float, frequency: Float)
    fun playDiscrete(amplitude: Float, frequency: Float)
    fun stop()
    fun isActive(): Boolean
}