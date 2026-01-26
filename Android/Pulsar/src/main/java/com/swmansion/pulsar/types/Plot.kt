package com.swmansion.pulsar.types

import com.swmansion.pulsar.audio.PatternPoint

/**
 * Represents vibration plot.
 *
 * @param intensity list of points creating plot.
 * @param sharpness list of points with sharpness change.
 */
data class Plot(
  val intensity: List<PatternPoint>,
  val sharpness: List<PatternPoint>,
) {
  init {
    verifyIntensity()
    verifySharpness()

    if (intensity.isNotEmpty() && sharpness.isNotEmpty()) {
      if (intensity.last().time < sharpness.last().time) {
        throwInitException(
          "Intensity max relative time must be greater o equal than sharpness max relative time."
        )
      }
    }
  }

  private fun verifyIntensity() {
    if (intensity.isEmpty()) {
      return
    }

    val intensityTime = intensity.map { it.time }
    if (intensityTime != intensityTime.sorted()) {
      throwInitException("Intensity relative time must be in ascending order.")
    }

    val firstIntensityPoint = intensity.first()
    val lastIntensityPoint = intensity.last()

    if (firstIntensityPoint.time != 0f) {
//      throwInitException("Intensity first element relativeTime must be 0.")
    }

    if (firstIntensityPoint.value != 0f || lastIntensityPoint.value != 0f) {
//      throwInitException("Intensity first and last element intensity must be 0.")
    }
  }

  private fun verifySharpness() {
    if (sharpness.isEmpty()) {
      return
    }

    val sharpnessTime = sharpness.map { it.time }
    if (sharpnessTime != sharpnessTime.sorted()) {
      throwInitException("Sharpness relative time must be in ascending order.")
    }

    if (sharpnessTime != sharpnessTime.distinct()) {
      throwInitException("Sharpness relative time cannot be duplicated.")
    }

    if (sharpness.first().time != 0f) {
//      throwInitException("Sharpness first element relativeTime must be 0.")
    }
  }

  private fun throwInitException(message: String) {
    throw Exception("Failed to init Plot. $message")
  }
}
