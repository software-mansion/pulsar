package com.swmansion.pulsarapp.types

/**
 * Represents vibration plot.
 *
 * @param intensity list of points creating plot.
 * @param sharpness list of points with sharpness change.
 */
data class Plot(
  val intensity: ArrayList<IntensityPoint>,
  val sharpness: ArrayList<SharpnessPoint>,
) {
  init {
    verifyIntensity()
    verifySharpness()

    if (intensity.last().relativeTime <= sharpness.last().relativeTime) {
      throwInitException(
        "Intensity max relative time must be greater than sharpness max relative time."
      )
    }
  }

  private fun verifyIntensity() {
    if (intensity.size < 2) {
      throwInitException("Intensity must contain at least 2 elements.")
    }

    val intensityTime = intensity.map { it.relativeTime }
    if (intensityTime != intensityTime.sorted()) {
      throwInitException("Intensity relative time must be in ascending order.")
    }

    val firstIntensityPoint = intensity.first()
    val lastIntensityPoint = intensity.last()

    if (firstIntensityPoint.relativeTime != 0L) {
      throwInitException("Intensity first element relativeTime must be 0.")
    }

    if (firstIntensityPoint.intensity != 0f || lastIntensityPoint.intensity != 0f) {
      throwInitException("Intensity first and last element intensity must be 0.")
    }
  }

  private fun verifySharpness() {
    if (sharpness.isEmpty()) {
      throwInitException("Sharpness cannot be empty.")
    }

    val sharpnessTime = sharpness.map { it.relativeTime }
    if (sharpnessTime != sharpnessTime.sorted()) {
      throwInitException("Sharpness relative time must be in ascending order.")
    }

    if (sharpnessTime != sharpnessTime.distinct()) {
      throwInitException("Sharpness relative time cannot be duplicated.")
    }

    if (sharpness.first().relativeTime != 0L) {
      throwInitException("Sharpness first element relativeTime must be 0.")
    }
  }

  private fun throwInitException(message: String) {
    throw Exception("Failed to init Plot. $message")
  }
}
