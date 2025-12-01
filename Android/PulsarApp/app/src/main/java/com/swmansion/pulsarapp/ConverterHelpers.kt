package com.swmansion.pulsarapp

import android.util.Log
import com.swmansion.pulsarapp.types.Bar
import com.swmansion.pulsarapp.types.Point
import kotlin.collections.forEach
import kotlin.math.abs
import kotlin.math.roundToLong

fun convertBarsToPoints(bars: ArrayList<Bar>): ArrayList<Point> {
    val points = ArrayList<Point>()
    val n = bars.size

    // TODO: better validation
    val validBars = bars.filter { it.intensity != 0f }

    // create empty interval at the beginning
    if (validBars.isNotEmpty() && validBars[0].x1 != 0L) {
        points += Point(0f, 0f, 0)
    }

    for (i in 0..n - 1) {
        val currBar = validBars[i]

        if (i == 0 || validBars[i - 1].x2 != currBar.x1) {
            points += Point(0f, currBar.sharpness, currBar.x1)
        }

        points += Point(currBar.intensity, currBar.sharpness, currBar.x1)
        points += Point(currBar.intensity, currBar.sharpness, currBar.x2)

        if (i == n - 1 || currBar.x2 != validBars[i + 1].x1) {
            points += Point(0f, currBar.sharpness, currBar.x2)
        }
    }

    return points
}

fun convertPointsToBars(points: ArrayList<Point>): ArrayList<Bar> {
    val bars = ArrayList<Bar>()

    val n = points.size
    for (i in 1..n - 1) {
        val currPoint = points[i]
        val prevPoint = points[i - 1]

        // when prevPoint.relativeTime == currPoint.relativeTime skip (vertical lines)

        if (prevPoint.intensity == currPoint.intensity) {
            bars +=
                Bar(
                    prevPoint.relativeTime,
                    currPoint.relativeTime,
                    currPoint.intensity,
                    DEFAULT_SHARPNESS, // sharpness of this bar will never be used
                )
        } else if (prevPoint.relativeTime != currPoint.relativeTime) {
            val intervalDuration = currPoint.relativeTime - prevPoint.relativeTime

            val startIntensity = prevPoint.intensity
            val endIntensity = currPoint.intensity

            val steps = (intervalDuration * STEPS_PER_100_MS) / 100
            val stepDuration = intervalDuration / steps
            val stepValue = abs(startIntensity - endIntensity) / steps

            val isAscending = startIntensity < endIntensity

            // TODO fix last interval length
            for (i in 0..steps - 1) {
                val startTime = prevPoint.relativeTime + stepDuration * i
                val endTime = if (i < steps - 1) startTime + stepDuration else currPoint.relativeTime
                val intensity =
                    if (isAscending) startIntensity + stepValue * i else startIntensity - stepValue * i

                bars += Bar(startTime, endTime, intensity, DEFAULT_SHARPNESS)
            }
        }
    }

    return bars
}
fun mergePointsAndBars(bars: ArrayList<Bar>, points: ArrayList<Point>): ArrayList<Point> {
    val barsWithinLineMap = getBarsWithinLineMap(points, bars)
    val mergedPoints = ArrayList<Point>()

    val nLinePoints = points.size
    for (i in 1..nLinePoints - 1) {
        val linePoint1 = points[i - 1]
        val linePoint2 = points[i]

        val barsWithinLine = barsWithinLineMap[linePoint1]

        val linePoints =
            getPointsOnTheLine(linePoint1, linePoint2, barsWithinLine).let {
                // do not add linePoint1 multiple times
                if (i == 1) {
                    it
                } else ArrayList(it.subList(1, it.size))
            }

        mergedPoints.addAll(linePoints)
    }

    // handle decline on two bars with common relative time connection (on lines connection)
    handleDeclineOnBarsConnection(mergedPoints)

    // will appear after connecting bars on lines connection with the same intensity
    handleRedundantPointsOnHorizontalLine(mergedPoints)

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

private fun getPointsOnTheLine(
    linePoint1: Point,
    linePoint2: Point,
    bars: ArrayList<Bar>?,
): ArrayList<Point> {
    if (bars == null) {
        return arrayListOf(linePoint1, linePoint2)
    }

    var points = arrayListOf(linePoint1)
    val (a, b) = getLineParameters(linePoint1, linePoint2)

    val nBars = bars.size
    for (j in 0..nBars - 1) {
        val bar = bars[j]

        getBarIntersectionPoints(a, b, bar)?.let {
            val (verticalIntersection1, horizontalIntersection, verticalIntersection2) = it

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
                    "Bar ${bar.x1}-${bar.x2} wasn't added to the line. This shouldn't happen. Intersections are not empty.",
                )
            }

            barPointsToAdd?.forEach { point -> points.add(point) }
        }
    }

    points += linePoint2

    // remove duplicates which might occur during adding bar points
    points = ArrayList(points.distinct())

    // handle decline on two bars with common relative time connection
    handleDeclineOnBarsConnection(points)

    return points
}

private fun handleDeclineOnBarsConnection(points: ArrayList<Point>) {
    val pointsToDelete = ArrayList<Point>()
    val nPoints = points.size

    points.forEachIndexed { index, point ->
        if (index != 0 && index != nPoints - 1) {
            val prevPoint = points[index - 1]
            val currPoint = points[index]
            val nextPoint = points[index + 1]

            if (
                prevPoint.relativeTime == currPoint.relativeTime &&
                currPoint.relativeTime == nextPoint.relativeTime
            ) {
                pointsToDelete.add(currPoint)
            }
        }
    }

    points.removeAll(pointsToDelete)
}

private fun handleRedundantPointsOnHorizontalLine(points: ArrayList<Point>) {
    val pointsToDelete = ArrayList<Point>()
    val n = points.size
    for (i in 0..n - 1) {
        if (i != 0 && i != n - 1) {
            val prev = points[i - 1]
            val curr = points[i]
            val next = points[i + 1]

            if (prev.intensity == curr.intensity && curr.intensity == next.intensity) {
                pointsToDelete.add(curr)
            }
        }
    }

    points.removeAll(pointsToDelete)
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
): Triple<Point?, Point?, Point?>? {
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
    val y = a * x + b

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