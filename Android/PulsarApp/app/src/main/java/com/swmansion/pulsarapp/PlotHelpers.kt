package com.swmansion.pulsarapp

import android.util.Log
import com.swmansion.pulsarapp.types.Bar
import com.swmansion.pulsarapp.types.ControlPoint
import com.swmansion.pulsarapp.types.Point
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

fun printPointsToPlot(points: ArrayList<Point>) {
  Log.i(TAG, "----------- POINTS -----------")

  Log.i(TAG, getPlotHeader())
  points.forEach { Log.i(TAG, "${it.relativeTime} ${it.intensity}") }
}

fun printControlPointsToPlot(controlPoints: ArrayList<ControlPoint>) {
  Log.i(TAG, "----------- CONTROL POINTS -----------")

  val points = convertControlPointsToPoints(controlPoints)

  Log.i(TAG, getPlotHeader())
  points.forEach { Log.i(TAG, "${it.relativeTime} ${it.intensity}") }
}

private fun convertControlPointsToPoints(controlPoints: ArrayList<ControlPoint>): ArrayList<Point> {
  var relativeTime = 0L
  val points = ArrayList<Point>()
  points += Point(1, 0f)

  controlPoints.forEach {
    relativeTime += it.duration
    points += Point(relativeTime, it.intensity)
  }

  return points
}

private fun getPlotHeader(): String {
  return "x x x x relative_time intensity"
}
