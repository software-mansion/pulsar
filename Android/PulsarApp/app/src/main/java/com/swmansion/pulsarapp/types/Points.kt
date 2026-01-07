package com.swmansion.pulsarapp.types

/**
 * Represents single point of intensity plot.
 *
 * @param relativeTime - time relative to the beginning of the vibration.
 * @param intensity - should be value from [0-1].
 */
data class IntensityPoint(val relativeTime: Long, var intensity: Float) {
  override fun toString(): String {
    return "(${relativeTime}, ${intensity})"
  }
}

/**
 * Represents single sharpness point change applied to intensity plot.
 *
 * @param relativeTime - time relative to the beginning of the vibration.
 * @param sharpness - should be value from (0-1].
 */
class SharpnessPoint(val relativeTime: Long, val sharpness: Float) {
  override fun toString(): String {
    return "(${relativeTime}, ${sharpness})"
  }
}

/**
 * Represents single point of result plot.
 *
 * @param relativeTime - time relative to the beginning of the vibration.
 * @param intensity - should be value from [0-1].
 * @param sharpness - should be value from (0-1].
 */
data class PlotPoint(val relativeTime: Long, var intensity: Float, val sharpness: Float) {
  override fun toString(): String {
    return "($relativeTime, $intensity, $sharpness)"
  }
}
