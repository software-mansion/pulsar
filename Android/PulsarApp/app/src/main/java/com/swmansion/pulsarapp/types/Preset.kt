package com.swmansion.pulsarapp.types

data class PresetPlot(
  val intensity: ArrayList<IntensityPoint>,
  val sharpness: ArrayList<SharpnessPoint>,
)

data class Preset(
  val name: String,
  val bars: ArrayList<Bar>? = null,
  val plot: PresetPlot? = null,
) {
  init {
    if (bars == null && plot == null) {
      throw getInitException("At least one of bars or plot must be declared.")
    }

    bars?.let { verifyBars(it) }
    plot?.let { verifyPlot(it) }

    if (bars != null && plot != null) {
      val maxPlotIntensity = plot.intensity.last().relativeTime
      val maxBarsIntensity = bars.last().x2

      if (maxBarsIntensity > maxPlotIntensity) {
        throw getInitException(
          "Bars max relativeTime (${bars.last().x2}) cannot be greater than plot max relativeTime (${plot.intensity.last().relativeTime})."
        )
      }
    }
  }

  private fun verifyBars(bars: ArrayList<Bar>) {

    if (bars.isEmpty())
      throw getInitException(
        "Property bars is invalid. When bars is passed it must contain at least one bar."
      )

    val barsComparator = Comparator { bar1: Bar, bar2: Bar -> compareBars(bar1, bar2) }
    if (bars != bars.sortedWith(barsComparator))
      throw getInitException(
        "Property bars is invalid. Bars start relative time should be in ascending order."
      )

    val nBars = bars.size
    for (i in 0..nBars - 1) {
      val currBar = bars[i]

      checkIntensity(currBar.intensity)
      checkSharpness(currBar.sharpness)

      if (currBar.intensity == 0f) {
        throw getInitException(
          "Found invalid bar: ${currBar.x1}-${currBar.x2}. Bar intensity cannot be 0."
        )
      }

      if (currBar.x1 >= currBar.x2) {
        throw getInitException(
          "Found invalid bar: ${currBar.x1}-${currBar.x2}. Bar end must be greater than start."
        )
      }

      if (i > 0) {
        val prevBar = bars[i - 1]
        if (prevBar.x2 > currBar.x1) {
          throw getInitException("Found invalid bars: $prevBar, $currBar. Bars cannot overlap.")
        }
      }
    }
  }

  private fun compareBars(b1: Bar, b2: Bar): Int {
    val firstCoordinateDiff = b1.x1 - b2.x1
    val diff = if (firstCoordinateDiff != 0L) firstCoordinateDiff else b1.x2 - b2.x2
    return diff.toInt()
  }

  private fun verifyPlot(plot: PresetPlot) { // TODO: check if sorted
    val (intensity, sharpness) = plot

    // intensity
    if (intensity.size < 2) {
      throw getInitException("Preset plot is invalid. Intensity must contain at least 2 points.")
    }

    if (intensity.first().relativeTime != 0L) {
      throw getInitException(
        "Preset plot is invalid. Intensity first element relativeTime must be 0."
      )
    }

    if (intensity.first().intensity != 0f || intensity.last().intensity != 0f) {
      throw getInitException(
        "Preset plot is invalid. Intensity first and last element intensity must be 0."
      )
    }

    intensity.forEach { checkIntensity(it.intensity) }

    // sharpness
    if (sharpness.isEmpty()) {
      throw getInitException("Preset plot is invalid. Sharpness cannot be empty.")
    }

    if (sharpness.first().relativeTime != 0L) {
      throw getInitException(
        "Preset plot is invalid. Sharpness first element relativeTime must be 0."
      )
    }

    sharpness.forEach { checkSharpness(it.sharpness) }

    // common
    val intensityMaxRelativeTime = intensity.last().relativeTime
    val sharpnessMaxRelativeTime = sharpness.last().relativeTime
    if (intensityMaxRelativeTime < sharpnessMaxRelativeTime) {
      throw getInitException(
        "Preset plot is invalid. Sharpness max relativeTime cannot be greater than intensity max relativeTime."
      )
    }
  }

  private fun checkIntensity(intensity: Float) {
    if (!(0 <= intensity && intensity <= 1)) {
      throw getInitException(
        "Found invalid intensity: ${intensity}. Intensity must be value from [0,1]."
      )
    }
  }

  private fun checkSharpness(sharpness: Float) {
    if (!(0 < sharpness && sharpness <= 1)) {
      throw getInitException(
        "Found invalid sharpness: $sharpness. Sharpness must be value from (0,1]."
      )
    }
  }

  private fun getInitException(message: String): Exception {
    return Exception("Failed to init ${name.uppercase()}_PRESET. $message")
  }
}
