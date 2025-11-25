package com.swmansion.pulsarapp

import android.util.Log
import com.swmansion.pulsarapp.types.Bar
import com.swmansion.pulsarapp.types.ControlPoint
import com.swmansion.pulsarapp.types.Point
import kotlin.collections.forEach

// helper functions for plotting only

fun printPointsToPlot(points: ArrayList<Point>) {
  Log.i(TAG, getPlotHeader())
  points.forEach { Log.i(TAG, "${it.relativeTime} ${it.intensity}") }
}

fun getPlotHeader(): String {
  return "x x x x relative_time intensity"
}

fun convertControlPointToPoints(controlPoints: ArrayList<ControlPoint>): ArrayList<Point> {
  val points = ArrayList<Point>()
  points += Point(0f, 1f, 0)
  var relativeTime = 0L

  for (x in controlPoints) {
    relativeTime += x.duration
    points += Point(x.intensity, x.sharpness, relativeTime)
  }

  return points
}

fun printBarsToPlot(bars: ArrayList<Bar>) {
  Log.i(TAG, getPlotHeader())
  bars.forEach { bar ->
    Log.i(TAG, "${bar.x1} ${bar.intensity}")
    Log.i(TAG, "${bar.x2} ${bar.intensity}")
  }
}
