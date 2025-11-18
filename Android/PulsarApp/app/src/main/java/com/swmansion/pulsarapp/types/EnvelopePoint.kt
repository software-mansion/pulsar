package com.swmansion.pulsarapp.types

/**
 * Represents single point of waveform.
 *
 * @param intensity - should be value from [0-1].
 * @param sharpness - should be value from (0-1].
 * @param relativeTime - time relative to the beginning of the vibration.
 */
data class EnvelopePoint(val intensity: Float, val sharpness: Float, val relativeTime: Long)
