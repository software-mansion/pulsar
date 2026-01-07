package com.swmansion.pulsarapp

import android.util.Log
import com.swmansion.pulsarapp.types.Bar
import com.swmansion.pulsarapp.types.ControlPoint
import com.swmansion.pulsarapp.types.PlotPoint
import kotlin.collections.forEach

// helper functions for plotting only

fun printBarsToPlot(bars: ArrayList<Bar>) {
  Log.i(TAG, "----------- BARS -----------")

  Log.i(TAG, getPlotHeader())
  getBarsWithPauses(bars).forEach { bar ->
    Log.i(TAG, "${bar.x1} ${bar.intensity}")
    Log.i(TAG, "${bar.x2} ${bar.intensity}")
  }
}

fun getBarsWithPauses(bars: ArrayList<Bar>): ArrayList<Bar> {
  val barsWithPauses = ArrayList<Bar>()
  val n = bars.size

  for (i in 0..n - 1) {
    val currBar = bars[i]
    val nextBar = if (i != n - 1) bars[i + 1] else null

    // create pause at the beginning
    if (i == 0 && currBar.x1 != 0L) {
      barsWithPauses.add(Bar(0, currBar.x1, 0f, currBar.sharpness))
    }

    barsWithPauses.add(currBar)

    // create pause between bars
    if (nextBar != null && currBar.x2 != nextBar.x1) {
      barsWithPauses.add(Bar(currBar.x2, nextBar.x1, 0f, currBar.sharpness))
    }
  }

  return barsWithPauses
}

fun printPointsToPlot(points: ArrayList<PlotPoint>) {
  Log.i(TAG, "----------- POINTS -----------")

  Log.i(TAG, getPlotHeader())
  points.forEach { Log.i(TAG, "${it.relativeTime} ${it.intensity} ${it.sharpness}") }
}

fun printControlPointsToPlot(controlPoints: ArrayList<ControlPoint>) {
  Log.i(TAG, "----------- CONTROL POINTS -----------")

  val points = convertControlPointsToPoints(controlPoints)

  Log.i(TAG, getPlotHeader())
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
