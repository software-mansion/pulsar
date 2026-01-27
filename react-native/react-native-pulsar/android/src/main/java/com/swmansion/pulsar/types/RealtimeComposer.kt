package com.swmansion.pulsar.types

/**
 * @param ENVELOPE - TODO
 * @param PRIMITIVE_TICK - TODO
 * @param PRIMITIVE_COMPLEX - TODO
 */
enum class RealtimeComposerStrategy {
    ENVELOPE,
    PRIMITIVE_TICK,
    PRIMITIVE_COMPLEX
}

interface RealtimeComposable {
    fun update(amplitude: Float, frequency: Float)
    fun playDiscrete(amplitude: Float, frequency: Float)
    fun stop()
    fun isActive(): Boolean
}