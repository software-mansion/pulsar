package com.swmansion.pulsarapp.types

data class PresetPlot(
  val intensity: ArrayList<IntensityPoint>,
  val sharpness: ArrayList<SharpnessPoint>,
)

/**
 * Represents single vibration impulse.
 *
 * @param x Impulse relative time.
 * @param intensity Impulse intensity. Value range [0-1].
 * @param sharpness Impulse sharpness. Value range (0-1]. Ignored for devices that do not support
 *   envelopes.
 */
data class Impulse(val x: Long, val intensity: Float, val sharpness: Float)

data class Preset(
  val name: String,
  val impulses: ArrayList<Impulse>? = null,
  val plot: PresetPlot? = null,
) {
  init {
    if (impulses == null && plot == null) {
      throw getInitException("At least one of impulses or plot must be declared.")
    }

    impulses?.let { verifyImpulses(it) }
    plot?.let { verifyPlot(it) }

    //    TODO: There is no way to verify it now, but it needs to be done
    //    if (bars != null && plot != null) {
    //      val maxPlotIntensity = plot.intensity.last().relativeTime
    //      val maxBarsIntensity = bars.last().x2
    //
    //      if (maxBarsIntensity > maxPlotIntensity) {
    //        throw getInitException(
    //          "Bars max relativeTime (${bars.last().x2}) cannot be greater than plot max
    // relativeTime (${plot.intensity.last().relativeTime})."
    //        )
    //      }
    //    }
  }

  private fun verifyImpulses(impulses: ArrayList<Impulse>) {

    if (impulses.isEmpty())
      throw getInitException(
        "Property impulses is invalid. When impulses is passed it must contain at least one impulse."
      )

    val impulseComparator = Comparator { impulse1: Impulse, impulse2: Impulse -> compareImpulses(impulse1, impulse2) }
    if (impulses != impulses.sortedWith(impulseComparator))
      throw getInitException(
        "Property impulses is invalid. Impulses relative time should be in ascending order."
      )

    val nImpulses = impulses.size
    for (i in 0..nImpulses - 1) {
      val currImpulse = impulses[i]

      checkIntensity(currImpulse.intensity)
      checkSharpness(currImpulse.sharpness)

      if (currImpulse.intensity == 0f) {
        throw getInitException("Found invalid impulse: $currImpulse. Impulse intensity cannot be 0.")
      }

      if (i > 0) {
        val prevImpulse = impulses[i - 1]
        if (prevImpulse.x == currImpulse.x) {
          throw getInitException("Found invalid impulse: $prevImpulse, $currImpulse. Impulses cannot have same relative time.")
        }
      }
    }
  }

  private fun compareImpulses(impulse1: Impulse, impulse2: Impulse): Int {
    val diff = impulse1.x - impulse2.x
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
