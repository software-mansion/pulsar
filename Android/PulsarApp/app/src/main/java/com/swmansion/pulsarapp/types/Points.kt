package com.swmansion.pulsarapp.types

data class IntensityPoint(val relativeTime: Long, var intensity: Float) {
  init {
    verifyRelativeTime(relativeTime)
    verifyIntensity(intensity)
  }
}

class SharpnessPoint(val relativeTime: Long, val sharpness: Float) {
  init {
    verifyRelativeTime(relativeTime)
    verifySharpness(sharpness)
  }
}

/**
 * Represents single control point of envelope builder.
 *
 * @param intensity should be value from [0-1].
 * @param sharpness can be passed as value from (0,1] or value in Hz based on used envelope type.
 *   // TODO: verify sharpness ?
 * @param duration - transition time in ms.
 */
data class ControlPoint(val intensity: Float, val sharpness: Float, val duration: Long) {
  init {
    verifyIntensity(intensity)

    if (duration <= 0) {
      throw Exception("duration should be greater than 0.")
    }
  }
}

/**
 * Represents single point of result plot.
 *
 * @param relativeTime time relative to the beginning of the vibration.
 * @param intensity should be value from [0-1].
 * @param sharpness can be passed as value from (0,1] or value in Hz based on used envelope type.
 *   // TODO: verify sharpness ?
 */
data class PlotPoint(val relativeTime: Long, var intensity: Float, val sharpness: Float) {
  init {
    verifyRelativeTime(relativeTime)
    verifyIntensity(intensity)
  }
}
