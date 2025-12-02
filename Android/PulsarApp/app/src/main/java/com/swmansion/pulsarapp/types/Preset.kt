package com.swmansion.pulsarapp.types

data class Preset(
  val name: String,
  val bars: ArrayList<Bar>? = null,
  val points: ArrayList<Point>? = null,
) {
  init {
    checkBars()
    checkPoints()
  }

  private fun checkBars() {
    bars?.let {
      val barsComparator = Comparator { bar1: Bar, bar2: Bar -> compareBars(bar1, bar2) }
      if (it != it.sortedWith(barsComparator))
        throw getInitException(
          "Property bars is invalid. Relative time should be in ascending order."
        )

      val n = it.size
      for (i in 0..n - 1) {
        val currBar = it[i]

        checkIntensity(currBar.intensity)
        checkSharpness(currBar.sharpness)

        if (currBar.intensity == 0f) {
          throw getInitException(
            "Found invalid bar: ${currBar.x1}-${currBar.x2}. Bar intensity cannot be 0."
          )
        }

        if (currBar.x1 >= currBar.x2) {
          throw getInitException(
            "Found invalid bar interval: ${currBar.x1}-${currBar.x2}. Bar end must be greater than start."
          )
        }

        if (i > 0) {
          val prevBar = it[i - 1]
          if (prevBar.x1 == currBar.x2 || prevBar.x2 > currBar.x1) {
            throw getInitException("Found invalid bars: $prevBar, $currBar. Bars cannot overlap.")
          }
        }
      }
    }
  }

  fun compareBars(b1: Bar, b2: Bar): Int {
    val firstCoordinateDiff = b1.x1 - b2.x1
    val diff = if (firstCoordinateDiff != 0L) firstCoordinateDiff else b1.x2 - b2.x2
    return diff.toInt()
  }

  private fun checkPoints() {
    points?.let {
      for (point in it) {
        checkIntensity(point.intensity)
        checkSharpness(point.sharpness)
      }

      val n = it.size
      if (n > 0) {
        val firstPoint = it[0]
        val lastPoint = it[n - 1]

        if (firstPoint.relativeTime != 0L) {
          throw getInitException(
            "Property points is invalid. First element relativeTime must be 0."
          )
        } else if (n == 1) {
          throw getInitException("Property points is invalid. It must contain at least two points.")
        } else if (firstPoint.intensity != 0f || lastPoint.intensity != 0f) {
          throw getInitException(
            "Property points is invalid. First and last element intensity must be 0."
          )
        }
      }
    }
  }

  private fun checkIntensity(intensity: Float) {
    if (intensity < 0 || intensity > 1) {
      throw getInitException(
        "Found invalid intensity: ${intensity}. Intensity must be value from [0,1]."
      )
    }
  }

  private fun checkSharpness(sharpness: Float) {
    if (sharpness <= 0 || sharpness > 1) {
      throw getInitException(
        "Found invalid sharpness: $sharpness. Sharpness must be value from (0,1]."
      ) // TODO correct for bars
    }
  }

  fun getInitException(message: String): Exception {
    return Exception("Failed to init ${name.uppercase()}_PRESET. $message")
  }
}
