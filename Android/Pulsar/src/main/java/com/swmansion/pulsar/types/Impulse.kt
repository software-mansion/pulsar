package com.swmansion.pulsar.types

/**
 * Represents single vibration impulse.
 *
 * @param x relative time.
 * @param intensity value from range [0-1].
 * @param sharpness value from range (0-1]. Ignored for devices that do not support envelopes.
 */
data class Impulse(val x: Long, val intensity: Float, val sharpness: Float) {
  init {
    verifyRelativeTime(x)
    verifyIntensity(intensity)
    verifySharpness(sharpness)
  }
}
