package com.swmansion.pulsar.types

import com.swmansion.pulsar.audio.ValuePoint

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

  val point1 = ValuePoint(x1.toFloat(), intensity)
  val point2 = ValuePoint(x2.toFloat(), intensity)
}
