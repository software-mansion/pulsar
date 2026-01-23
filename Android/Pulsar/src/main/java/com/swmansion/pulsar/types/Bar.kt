package com.swmansion.pulsar.types

data class Bar(val x1: Long, val x2: Long, val intensity: Float, val sharpness: Float) {
  init {
    verifyRelativeTime(x1)
    verifyRelativeTime(x2)
    if (x1 >= x2) {
      throw Exception("Bar init failed. Property x2 must be greater than x1.")
    }

    verifyIntensity(intensity)
    verifySharpness(sharpness)
  }

  val point1 = IntensityPoint(x1, intensity)
  val point2 = IntensityPoint(x2, intensity)
}
