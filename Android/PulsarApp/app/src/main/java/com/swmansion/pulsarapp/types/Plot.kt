package com.swmansion.pulsarapp.types

// TODO: check if ascending order

data class PresetPlot(
  val intensity: ArrayList<IntensityPoint>,
  val sharpness: ArrayList<SharpnessPoint>,
) {
  init {
    // intensity
    if (intensity.size < 2) {
      throw Exception("Preset plot is invalid. Intensity must contain at least 2 points.")
    }

    val firstIntensityPoint = intensity.first()
    val lastIntensityPoint = intensity.last()

    if (firstIntensityPoint.relativeTime != 0L) {
      throw Exception("Preset plot is invalid. Intensity first element relativeTime must be 0.")
    }

    if (firstIntensityPoint.intensity != 0f || lastIntensityPoint.intensity != 0f) {
      throw Exception(
        "Preset plot is invalid. Intensity first and last element intensity must be 0."
      )
    }

    // sharpness
    if (sharpness.isEmpty()) {
      throw Exception("Preset plot is invalid. Sharpness cannot be empty.")
    }

    val firstSharpnessPoint = sharpness.first()
    val lastSharpnessPoint = sharpness.last()

    if (firstSharpnessPoint.relativeTime != 0L) {
      throw Exception("Preset plot is invalid. Sharpness first element relativeTime must be 0.")
    }

    // common
    if (lastIntensityPoint.relativeTime < lastSharpnessPoint.relativeTime) {
      throw Exception(
        "Preset plot is invalid. Sharpness max relativeTime cannot be greater than intensity max relativeTime."
      )
    }
  }
}
