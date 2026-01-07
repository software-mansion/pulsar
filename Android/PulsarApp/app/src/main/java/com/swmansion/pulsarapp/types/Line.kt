package com.swmansion.pulsarapp.types

import kotlin.math.pow
import kotlin.math.round

/**
 * Represents intensity interval.
 *
 * @param point1 - interval start.
 * @param point2 - interval end.
 */
data class Line(val point1: IntensityPoint, val point2: IntensityPoint) {
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

  // return line point if x is within line interval
  fun getPointOnLine(x: Long): IntensityPoint? {
    if (isVertical()) {
      return null
    }

    val point = IntensityPoint(x, roundTo(a * x + b, 2))
    return if (
      point1.relativeTime <= point.relativeTime && point.relativeTime <= point2.relativeTime
    )
      point
    else null
  }

  private fun roundTo(value: Float, decimalPlaces: Int): Float {
    val multiplier = 10.0.pow(decimalPlaces.toDouble())
    val roundedValue = round(value * multiplier) / multiplier
    return roundedValue.toFloat()
  }
}
