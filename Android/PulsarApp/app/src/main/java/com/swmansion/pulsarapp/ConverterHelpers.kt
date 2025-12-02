package com.swmansion.pulsarapp

import android.util.Log
import com.swmansion.pulsarapp.types.Bar
import com.swmansion.pulsarapp.types.Point
import kotlin.collections.forEach
import kotlin.math.abs
import kotlin.math.round
import kotlin.math.roundToLong

const val STEPS_PER_100_MS = 30
const val DEFAULT_SHARPNESS = 1f

fun convertBarsToPoints(bars: ArrayList<Bar>): ArrayList<Point> {
    val barsWithPauses = getBarsWithPauses(bars)
    val nBarsWithPauses = barsWithPauses.size

    val points = ArrayList<Point>()

    barsWithPauses.forEachIndexed { index, bar ->
        if(index == 0 && bar.intensity != 0f){
            points += Point(0f,bar.sharpness,0)
        }

        points += bar.point1
        points += bar.point2

        if(index == nBarsWithPauses-1 && bar.intensity != 0f){
            points += Point(0f,bar.sharpness,bar.x2)
        }
    }

    return points
}

private fun getBarsWithPauses(bars: ArrayList<Bar>): ArrayList<Bar> {
    val barsWithPauses = ArrayList<Bar>()
    val n = bars.size

    for (i in 0..n - 1) {
        val currBar = bars[i]
        val nextBar = if (i != n-1) bars[i+1] else null

        // create pause at the beginning
        if(i == 0 && currBar.x1 != 0L){
            barsWithPauses.add(Bar(0, currBar.x1, 0f, currBar.sharpness))
        }

        barsWithPauses.add(currBar)

        // create pause between bars
        if(nextBar != null && currBar.x2 != nextBar.x1){
            barsWithPauses.add(Bar(currBar.x2, nextBar.x1, 0f, currBar.sharpness))
        }
    }

    return barsWithPauses
}

fun convertPointsToBars(points: ArrayList<Point>): ArrayList<Bar> {
    val bars = ArrayList<Bar>()

    val n = points.size
    for (i in 1..n - 1) {
        val linePoint1 = points[i - 1]
        val linePoint2 = points[i]

        val isLineVertical = linePoint1.relativeTime == linePoint2.relativeTime
        val isLineHorizontal = linePoint1.intensity == linePoint2.intensity

        if(isLineHorizontal){
            bars +=
                Bar(
                    linePoint1.relativeTime,
                    linePoint2.relativeTime,
                    linePoint2.intensity,
                    DEFAULT_SHARPNESS, // sharpness of this bar will never be used
                )
        } else if (!isLineVertical){
            val intensity1 = linePoint1.intensity
            val intensity2 = linePoint2.intensity

            val intensityDiff = intensity2 - intensity1
            val isLineAscending = intensityDiff > 0
            val lineDuration = linePoint2.relativeTime - linePoint1.relativeTime

            val nSteps = (lineDuration * STEPS_PER_100_MS) / 100
            val stepDuration = lineDuration / nSteps
            val stepValue = abs(intensityDiff) / nSteps

            for (i in 0..nSteps - 1) { // TODO fix last interval length ?
                val x1 = linePoint1.relativeTime + stepDuration * i
                val x2 = if (i < nSteps - 1) x1 + stepDuration else linePoint2.relativeTime
                val intensity =
                    if (isLineAscending) linePoint1.intensity + stepValue * i else linePoint1.intensity - stepValue * i

                bars += Bar(x1, x2, intensity, DEFAULT_SHARPNESS)
            }
        }
    }

    return bars
}
fun mergePointsAndBars(bars: ArrayList<Bar>, points: ArrayList<Point>): ArrayList<Point> {
    val linePoints = ArrayList(points)
    if(points.last().relativeTime < bars.last().x2){
        linePoints.add(Point(0f, 1f, bars.last().x2))
    }

    val barsWithinLineMap = getBarsWithinLineMap(linePoints, bars)
    val mergedPoints = ArrayList<Point>()

    val nLinePoints = linePoints.size
    for (i in 1..nLinePoints - 1) {
        val linePoint1 = linePoints[i - 1]
        val linePoint2 = linePoints[i]

        val barsWithinLine = barsWithinLineMap[linePoint1]

        val pointsWithinLine = getPointsWithinLine(linePoint1, linePoint2, barsWithinLine)
        mergedPoints.addAll(pointsWithinLine)
    }

    //Log.i(TAG, "POINTS: $mergedPoints")

    // leave only unique points
    deleteDuplicatePoints(mergedPoints)
    //Log.i(TAG, "DELETE DUPLICATES: $mergedPoints")

    // remove leftover point between adjacent bars with common relative time
    deleteDeclineBetweenConnectedBars(mergedPoints)
    //Log.i(TAG, "DELETE DECLINES: $mergedPoints")

    // remove points on the same horizontal line with the same pair of amplitude and frequency
    deleteRedundantPointsOnHorizontalLines(mergedPoints)
    //Log.i(TAG, "DELETE REDUNDANT POINTS: $mergedPoints")


    return mergedPoints
}

private fun getBarsWithinLineMap(
    points: ArrayList<Point>,
    bars: ArrayList<Bar>,
): Map<Point, ArrayList<Bar>> {
    val barsWithinLineMap = mutableMapOf<Point, ArrayList<Bar>>()
    val n = points.size
    var currBarIndex = 0

    for (i in 1..n - 1) {
        val prevPoint = points[i - 1]
        val currPoint = points[i]
        val lineBars = ArrayList<Bar>()

        for (j in currBarIndex..bars.size - 1) {
            val bar = bars[j]
            if (prevPoint.relativeTime <= bar.x1 && bar.x2 <= currPoint.relativeTime) {
                lineBars += bar
                currBarIndex += 1
            } else {
                break
            }
        }

        barsWithinLineMap[prevPoint] = lineBars
    }

    return barsWithinLineMap
}

private fun getPointsWithinLine(
    linePoint1: Point,
    linePoint2: Point,
    bars: ArrayList<Bar>?,
): ArrayList<Point> {
    if (bars == null) {
        return arrayListOf(linePoint1, linePoint2)
    }

    val points = arrayListOf(linePoint1)
    val (a, b) = getLineParameters(linePoint1, linePoint2)

    val nBars = bars.size
    for (j in 0..nBars - 1) {
        val bar = bars[j]

        val (verticalIntersection1, horizontalIntersection, verticalIntersection2) = getBarIntersectionPoints(a, b, bar)

        var barPointsToAdd: ArrayList<Point>? = null

        if (verticalIntersection1 != null && verticalIntersection2 != null) {
            barPointsToAdd =
                arrayListOf(verticalIntersection1, bar.point1, bar.point2, verticalIntersection2)
        } else if (
            horizontalIntersection != null &&
            (verticalIntersection1 != null || verticalIntersection2 != null)
        ) {
            if (verticalIntersection1 != null) {
                barPointsToAdd = arrayListOf(verticalIntersection1, bar.point1, horizontalIntersection)
            } else if (verticalIntersection2 != null) {
                barPointsToAdd = arrayListOf(horizontalIntersection, bar.point2, verticalIntersection2)
            }
        } else {
            Log.i(
                TAG,
                "Bar ${bar.x1}-${bar.x2} wasn't added to the line. No intersection points found.",
            )
        }

        barPointsToAdd?.let{barPoints -> points.addAll(barPoints) }
    }

    points += linePoint2

    return points
}
private fun deletePointsOfIndexes(points: ArrayList<Point>, indexes: ArrayList<Int>){
    indexes.reversed().forEach { points.removeAt(it) }
}
private fun deleteDuplicatePoints(points: ArrayList<Point>) {
    val indexesToDelete = ArrayList<Int>()
    val n = points.size

    for (index in 1 .. n-1){
        val prevPoint = points[index-1]
        val currPoint = points[index]

        if(currPoint.intensity == prevPoint.intensity && currPoint.relativeTime == prevPoint.relativeTime){
            indexesToDelete.add(index)
        }
    }

    deletePointsOfIndexes(points, indexesToDelete)
}
private fun deleteDeclineBetweenConnectedBars(points: ArrayList<Point>) {
    val indexesToDelete = ArrayList<Int>()
    val n = points.size

    for (index in 0..n-1) {
        if (index != 0 && index != n - 1) {
            val prevPoint = points[index - 1]
            val currPoint = points[index]
            val nextPoint = points[index + 1]

            if (
                prevPoint.relativeTime == currPoint.relativeTime &&
                currPoint.relativeTime == nextPoint.relativeTime
            ) {
                indexesToDelete.add(index)
            }
        }
    }

    deletePointsOfIndexes(points, indexesToDelete)
}

private fun deleteRedundantPointsOnHorizontalLines(points: ArrayList<Point>) {
    val indexesToDelete = ArrayList<Int>()
    val n = points.size

    for (index in 0..n - 1) {
        if(index != 0 && index != n-1) {
            val prev = points[index - 1]
            val curr = points[index]
            val next = points[index + 1]

            if (prev.intensity == curr.intensity && curr.intensity == next.intensity) {
                indexesToDelete.add(index)
            }
        }
    }

    deletePointsOfIndexes(points, indexesToDelete)
}

private fun getLineParameters(point1: Point, point2: Point): Pair<Float, Float> {
    val x1 = point1.relativeTime.toFloat()
    val x2 = point2.relativeTime.toFloat()

    val y1 = point1.intensity
    val y2 = point2.intensity

    val a = (y2 - y1) / (x2 - x1)
    val b = y1 - a * x1

    return (a to b)
}

private fun getBarIntersectionPoints(
    a: Float,
    b: Float,
    bar: Bar,
): Triple<Point?, Point?, Point?> {
    val verticalIntersection1 = getBarVerticalIntersectionPoint(a, b, bar.point1)
    val verticalIntersection2 = getBarVerticalIntersectionPoint(a, b, bar.point2)
    val horizontalIntersection = getBarHorizontalIntersectionPoint(a, b, bar)

    return Triple(
        verticalIntersection1,
        if (
            horizontalIntersection != verticalIntersection1 &&
            horizontalIntersection != verticalIntersection2
        )
            horizontalIntersection
        else null,
        verticalIntersection2,
    )
}

// intersection between y = ax + b and y = x
private fun getBarVerticalIntersectionPoint(a: Float, b: Float, point: Point): Point? {
    val x = point.relativeTime.toFloat()
    var y = a * x + b
    // TODO avoid points gap on connections
    y = round(y * 100) / 100

    return if (y < 0 || y > point.intensity) null else Point(y, point.sharpness, point.relativeTime)
}

private fun getBarHorizontalIntersectionPoint(a: Float, b: Float, bar: Bar): Point? {
    if (a == 0f) {
        return null
    } else {
        val y = bar.intensity
        val x = (y - b) / a

        return if (x < bar.x1 || x > bar.x2) null
        else Point(bar.intensity, bar.sharpness, x.roundToLong())
    }
}