package com.swmansion.pulsarapp.types

/**
 * Represents single point of waveform with adjusted frequency and duration based on device
 * specification.
 *
 * @param intensity - should be value from [0-1].
 * @param sharpness - value from (0-1] or greater if HZ.
 * @param duration - transition time in ms.
 */
data class ControlPoint(val intensity: Float, val sharpness: Float, val duration: Long) {
  init {
    // TODO: verify sharpness?
    verifyIntensity(intensity)
    if (duration <= 0) {
      throw Exception("duration should be greater than 0.")
    }
  }
}
