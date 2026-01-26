package com.swmansion.pulsar.types

import com.swmansion.pulsar.audio.ValuePoint
import kotlin.math.pow
import kotlin.math.round

data class Line(val point1: ValuePoint, val point2: ValuePoint) {
  init {
    if (point1.time > point2.time) {
      throw Exception(
        "Line init failed. Start relative time cannot be greater than end relative time."
      )
    }
  }

  val a =
    (point2.value - point1.value) /
      (point2.time - point1.time)
  val b = point1.value - a * point1.time

  fun isVertical(): Boolean {
    return point1.time == point2.time
  }

  fun isHorizontal(): Boolean {
    return point1.value == point2.value
  }

  fun getPoint(x: Long): ValuePoint? {
    if (isVertical()) {
      return null
    }
    return if (point1.time <= x && x <= point2.time)
      ValuePoint(x.toFloat(), roundDecimal(a * x + b))
    else null
  }

  private fun roundDecimal(value: Float, decimalPlaces: Int = 2): Float {
    val multiplier = 10.0.pow(decimalPlaces.toDouble())
    val roundedValue = round(value * multiplier) / multiplier
    return roundedValue.toFloat()
  }
}
