package com.swmansion.pulsarapp

import android.util.Log
import com.swmansion.pulsarapp.types.Bar
import com.swmansion.pulsarapp.types.IntensityPoint
import com.swmansion.pulsarapp.types.Line
import com.swmansion.pulsarapp.types.PlotPoint
import com.swmansion.pulsarapp.types.PresetPlot
import com.swmansion.pulsarapp.types.SharpnessPoint
import kotlin.collections.forEach
import kotlin.math.abs

const val STEPS_PER_100_MS = 30
const val DEFAULT_SHARPNESS = 1f

fun generateBars(plot: PresetPlot): ArrayList<Bar> {
  val lines = generateLines(plot.intensity)
  val bars = generateBars(lines)
  return bars
}

fun generateLines(intensity: ArrayList<IntensityPoint>): ArrayList<Line> {
  val lines = ArrayList<Line>()

  for (i in 1..intensity.size - 1) {
    val prevPoint = intensity[i - 1]
    val currPoint = intensity[i]

    lines.add(Line(prevPoint, currPoint))
  }
  return lines
}

private fun generateBars(lines: ArrayList<Line>): ArrayList<Bar> {
  val bars = ArrayList<Bar>()

  lines
    .filter { !it.isVertical() }
    .forEach { line ->
      if (line.isHorizontal()) {
        bars +=
          Bar(
            line.point1.relativeTime,
            line.point2.relativeTime,
            line.point1.intensity,
            DEFAULT_SHARPNESS, // sharpness of this bar will never be used
          )
      } else {
        val intensity1 = line.point1.intensity
        val intensity2 = line.point2.intensity

        val intensityDiff = intensity2 - intensity1
        val isLineAscending = intensityDiff > 0
        val lineDuration = line.point2.relativeTime - line.point1.relativeTime

        val nSteps = (lineDuration * STEPS_PER_100_MS) / 100
        val stepDuration = lineDuration / nSteps
        val stepValue = abs(intensityDiff) / nSteps

        for (i in 0..nSteps - 1) { // TODO fix long last interval length ?
          val x1 = line.point1.relativeTime + stepDuration * i
          val x2 = if (i < nSteps - 1) x1 + stepDuration else line.point2.relativeTime
          val intensity =
            if (isLineAscending) line.point1.intensity + stepValue * i // TODO: middle step
            else line.point1.intensity - stepValue * i

          bars += Bar(x1, x2, intensity, DEFAULT_SHARPNESS)
        }
      }
    }

  return bars
}

fun generateComplexPlot(plot: PresetPlot, initBars: ArrayList<Bar>): PresetPlot {
  val (intensity, sharpness) = plot
  val lines = generateLines(intensity)
  val bars = initBars.filter { shouldBarBeMerged(it, lines) }

  if (bars.isEmpty()) {
    return plot
  }

  val startPoint = IntensityPoint(0, 0f)
  val endPoint = IntensityPoint(lines.last().point2.relativeTime, 0f)

  var complexIntensity = arrayListOf(startPoint)
  val complexSharpness = arrayListOf<SharpnessPoint>()

  // add points within bars range
  val nBars = bars.size
  for (i in 0..nBars - 1) {
    val currBar = bars[i]
    val nextBar = if (i + 1 < nBars) bars[i + 1] else null

    // handle interval before first bar
    if (i == 0) {
      getLinePointsFromInterval(startPoint, currBar.point1, lines)?.let {
        complexIntensity.addAll(it)
      }
      getSharpnessFromInterval(startPoint.relativeTime, currBar.x1, sharpness)?.let {
        complexSharpness.addAll(it)
      }
    }

    // add bar intensity
    complexIntensity.add(currBar.point1)
    complexIntensity.add(currBar.point2)

    // add bar sharpness
    complexSharpness.add(SharpnessPoint(currBar.x1, currBar.sharpness))

    // handle interval after last bar
    nextBar?.let { nextBar ->
      if (currBar.x2 != nextBar.x1) {
        getLinePointsFromInterval(currBar.point2, nextBar.point1, lines)?.let {
          complexIntensity.addAll(it)
        }
        getSharpnessFromInterval(currBar.x2, nextBar.x1, sharpness)?.let {
          complexSharpness.addAll(it)
        }
      }
    }

    if (i == nBars - 1) {
      getLinePointsFromInterval(currBar.point2, endPoint, lines)?.let {
        complexIntensity.addAll(it)
      }
      getSharpnessFromInterval(currBar.x2, endPoint.relativeTime, sharpness)?.let {
        complexSharpness.addAll(it)
      }
    }
  }

  // add end point
  complexIntensity.add(endPoint)
  // remove duplicating points
  complexIntensity = ArrayList(complexIntensity.distinct())
  // remove redundant points on the same horizontal line (caused by merging adjacent bars)
  deleteRedundantHorizontalLinePoints(complexIntensity)

  // remove redundant sharpness
  deleteDuplicatedSharpness(complexSharpness)

  return PresetPlot(complexIntensity, complexSharpness)
}

fun shouldBarBeMerged(bar: Bar, lines: ArrayList<Line>): Boolean {
  getLinePointsFromInterval(bar.point1, bar.point2, lines)?.forEach { point ->
    if (point.intensity >= bar.intensity) {
      return false
    }
  } ?: { Log.i(TAG, "This should not happen") }

  return true
}

fun getLinePointsFromInterval(
  x1: IntensityPoint,
  x2: IntensityPoint,
  allLines: ArrayList<Line>,
): ArrayList<IntensityPoint>? {
  if (x1.relativeTime == x2.relativeTime) {
    return null
  }
  if (x1.relativeTime > x2.relativeTime) {
    Log.w(TAG, "This should not happen.")
    return null
  }

  // ignore vertical lines
  val lines =
    ArrayList(allLines.filter { (point1, point2) -> point1.relativeTime != point2.relativeTime })

  var addingStarted = false
  val intervalLines = ArrayList<Line>()

  for (currLine in lines) {
    val x1LinePoint = currLine.getPointOnLine(x1.relativeTime)
    val x2LinePoint = currLine.getPointOnLine(x2.relativeTime)

    // x1 and x2 are placed on the same line
    if (!addingStarted && x1LinePoint != null && x2LinePoint != null) {
      intervalLines += Line(x1LinePoint, x2LinePoint)
      break
    }

    if (!addingStarted) { // add first line
      if (x1LinePoint != null && x1LinePoint != currLine.point2) {
        intervalLines += Line(x1LinePoint, currLine.point2)
        addingStarted = true
      }
    } else {
      if (x2LinePoint != null) { // add last line
        intervalLines += Line(currLine.point1, x2LinePoint)
        break
      } else { // add lines between
        intervalLines += currLine
      }
    }
  }

  val intervalPoints = ArrayList<IntensityPoint>()

  intervalLines.forEach { line ->
    intervalPoints.add(line.point1)
    intervalPoints.add(line.point2)
  }

  return ArrayList(intervalPoints.distinct())
}

private fun deleteRedundantHorizontalLinePoints(points: ArrayList<IntensityPoint>) {
  val indexesToDelete = ArrayList<Int>()
  val nPoints = points.size

  for (index in 1..nPoints - 2) {
    val prevPoint = points[index - 1]
    val currPoint = points[index]
    val nextPoint = points[index + 1]

    if (prevPoint.intensity == currPoint.intensity && currPoint.intensity == nextPoint.intensity) {
      indexesToDelete.add(index)
    }
  }

  indexesToDelete.reversed().forEach { points.removeAt(it) }
}

fun getSharpnessFromInterval(
  x1: Long,
  x2: Long,
  sharpness: ArrayList<SharpnessPoint>,
): ArrayList<SharpnessPoint>? {
  if (x1 == x2) {
    return null
  }

  val startSharpness = sharpness.findLast { it.relativeTime <= x1 }!!.sharpness
  val intervalSharpness = sharpness.filter { x1 < it.relativeTime && it.relativeTime < x2 }

  val result = arrayListOf(SharpnessPoint(x1, startSharpness))
  result.addAll(intervalSharpness)

  return result
}

private fun deleteDuplicatedSharpness(sharpness: ArrayList<SharpnessPoint>) {
  val indexesToDelete = ArrayList<Int>()
  val nPoints = sharpness.size

  for (index in 1..nPoints - 1) {
    val prevPoint = sharpness[index - 1]
    val currPoint = sharpness[index]

    if (prevPoint.sharpness == currPoint.sharpness) {
      indexesToDelete.add(index)
    }
  }

  indexesToDelete.reversed().forEach { sharpness.removeAt(it) }
}

fun generatePlot(bars: ArrayList<Bar>): PresetPlot {
  val intensity = generateIntensity(bars)
  val sharpness = generateSharpness(bars)

  return PresetPlot(intensity, sharpness)
}

fun generateIntensity(bars: ArrayList<Bar>): ArrayList<IntensityPoint> {
  val intensity = arrayListOf(IntensityPoint(0, 0f), IntensityPoint(bars.last().x2, 0f))
  val defaultSharpness = arrayListOf(SharpnessPoint(0, DEFAULT_SHARPNESS))

  val plot = PresetPlot(intensity, defaultSharpness)
  val complexPlot = generateComplexPlot(plot, bars)
  return complexPlot.intensity
}

private fun generateSharpness(bars: ArrayList<Bar>): ArrayList<SharpnessPoint> {
  val sharpness = bars.map { SharpnessPoint(it.x1, it.sharpness) } as ArrayList
  deleteDuplicatedSharpness(sharpness)

  return sharpness
}

fun generatePlotPoints(plot: PresetPlot): ArrayList<PlotPoint> {
  val (plotPoints, plotSharpness) = plot
  val lines = generateLines(plotPoints)

  var prevSharpness = plotSharpness[0].sharpness
  val result = arrayListOf(PlotPoint(0, 0f, prevSharpness))

  lines.forEachIndexed { lineIndex, line ->
    val lineSharpnessChanges =
      plotSharpness.filter {
        if (lineIndex == 0)
          line.point1.relativeTime < it.relativeTime && it.relativeTime < line.point2.relativeTime
        else
          line.point1.relativeTime <= it.relativeTime && it.relativeTime < line.point2.relativeTime
      }

    lineSharpnessChanges.forEachIndexed { i, sharpnessChange ->
      val changeLinePoint = line.getPointOnLine(lineSharpnessChanges[i].relativeTime)!!
      val newSharpness = sharpnessChange.sharpness

      if (i == 0 && line.point1.relativeTime == changeLinePoint.relativeTime) {
        result += PlotPoint(changeLinePoint.relativeTime, changeLinePoint.intensity, newSharpness)
      } else {
        result += PlotPoint(changeLinePoint.relativeTime, changeLinePoint.intensity, prevSharpness)
        result += PlotPoint(changeLinePoint.relativeTime, changeLinePoint.intensity, newSharpness)
      }

      prevSharpness = newSharpness
    }

    result += PlotPoint(line.point2.relativeTime, line.point2.intensity, prevSharpness)
  }

  return result
}
