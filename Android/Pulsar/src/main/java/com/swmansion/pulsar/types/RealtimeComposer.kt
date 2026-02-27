package com.swmansion.pulsar.types

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
 */
enum class RealtimeComposerStrategy {
    ENVELOPE,
    PRIMITIVE_TICK,
    PRIMITIVE_COMPLEX
}

interface RealtimeComposable {
    fun set(amplitude: Float, frequency: Float)
    fun playDiscrete(amplitude: Float, frequency: Float)
    fun stop()
    fun isActive(): Boolean
}