package com.swmansion.pulsar.types

import kotlin.math.pow
import kotlin.math.round

data class Line(val point1: IntensityPoint, val point2: IntensityPoint) {
  init {
    if (point1.relativeTime > point2.relativeTime) {
      throw Exception(
        "Line init failed. Start relative time cannot be greater than end relative time."
      )
    }
  }

  val a =
    (point2.intensity - point1.intensity) /
      (point2.relativeTime.toFloat() - point1.relativeTime.toFloat())
  val b = point1.intensity - a * point1.relativeTime.toFloat()

  fun isVertical(): Boolean {
    return point1.relativeTime == point2.relativeTime
  }

  fun isHorizontal(): Boolean {
    return point1.intensity == point2.intensity
  }

  fun getPoint(x: Long): IntensityPoint? {
    if (isVertical()) {
      return null
    }
    return if (point1.relativeTime <= x && x <= point2.relativeTime)
      IntensityPoint(x, roundDecimal(a * x + b))
    else null
  }

  private fun roundDecimal(value: Float, decimalPlaces: Int = 2): Float {
    val multiplier = 10.0.pow(decimalPlaces.toDouble())
    val roundedValue = round(value * multiplier) / multiplier
    return roundedValue.toFloat()
  }
}
