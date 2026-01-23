package com.swmansion.pulsar.haptics

import android.util.Log
import com.swmansion.pulsar.types.Bar
import com.swmansion.pulsar.types.ControlPoint
import com.swmansion.pulsar.types.PlotPoint

// helper functions for plotting only

fun printBarsToPlot(bars: ArrayList<Bar>) {
  Log.i(TAG, "----------- BARS -----------")
  Log.i(TAG, getPlotHeader())

  // start
  Log.i(TAG, "0 0 1")

  getBarsWithPauses(bars).forEachIndexed { index, bar ->
    Log.i(TAG, "${bar.x1} ${bar.intensity} 1")
    Log.i(TAG, "${bar.x2} ${bar.intensity} 1")

    if (index == bars.size - 1) {
      // end
      Log.i(TAG, "${bar.x2} 0 1")
    }
  }
}

fun printPointsToPlot(points: ArrayList<PlotPoint>) {
  Log.i(TAG, "----------- POINTS -----------")
  Log.i(TAG, getPlotHeader())

  points.forEach { Log.i(TAG, "${it.relativeTime} ${it.intensity} ${it.sharpness}") }
}

fun printControlPointsToPlot(controlPoints: ArrayList<ControlPoint>) {
  Log.i(TAG, "----------- CONTROL POINTS -----------")
  Log.i(TAG, getPlotHeader())

  val points = convertControlPointsToPoints(controlPoints)

  points.forEach { Log.i(TAG, "${it.relativeTime} ${it.intensity} ${it.sharpness}") }
}

private fun convertControlPointsToPoints(
  controlPoints: ArrayList<ControlPoint>
): ArrayList<PlotPoint> {
  var relativeTime = 0L
  val points = ArrayList<PlotPoint>()

  points += PlotPoint(0, 0f, controlPoints[0].sharpness)

  controlPoints.forEach {
    relativeTime += it.duration
    points += PlotPoint(relativeTime, it.intensity, it.sharpness)
  }

  return points
}

private fun getPlotHeader(): String {
  return "x x x x relative_time intensity sharpness"
}
