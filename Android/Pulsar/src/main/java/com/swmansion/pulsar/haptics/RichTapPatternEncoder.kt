package com.swmansion.pulsar.haptics

import com.swmansion.pulsar.types.ConfigPoint
import com.swmansion.pulsar.types.PatternData
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.addJsonObject
import kotlinx.serialization.json.buildJsonArray
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put
import kotlinx.serialization.json.putJsonArray
import kotlinx.serialization.json.putJsonObject
import kotlin.math.roundToInt

/** Encodes a Pulsar pattern as a RichTap HE 2.0 JSON pattern. */
object RichTapPatternEncoder {
    const val MAX_CURVE_POINTS = 16
    const val MIN_CURVE_POINTS = 4
    const val MAX_EVENTS_PER_BLOCK = 16
    const val MAX_BLOCK_SPAN_MS = 4000L

    sealed class Event(val start: Long, val duration: Long) {
        val end get() = start + duration
    }

    class Transient(start: Long, val intensity: Int, val frequency: Int) : Event(start, 0)

    class Continuous(start: Long, duration: Long, val frequency: Int, val curve: List<CurvePoint>) :
        Event(start, duration)

    data class CurvePoint(val time: Long, val intensity: Float, val frequencyOffset: Int)

    data class Block(val absoluteTime: Long, val events: List<Event>)

    fun encode(pattern: PatternData): String? {
        val blocks = toBlocks(pattern)
        if (blocks.isEmpty()) return null
        return toJson(blocks).toString()
    }

    fun toBlocks(pattern: PatternData): List<Block> {
        val events = (continuousEvents(pattern) + transientEvents(pattern.discretePattern))
            .sortedBy { it.start }
        return groupIntoBlocks(events)
    }

    private fun continuousEvents(pattern: PatternData): List<Continuous> {
        val points = ConfigLineBuilder(
            ValueLineBuilder(pattern.continuousPattern.amplitude),
            ValueLineBuilder(pattern.continuousPattern.frequency),
        ).points
        return audibleRuns(points)
            .flatMap { splitIntoEventWindows(densify(it)) }
            .mapNotNull(::toContinuous)
    }

    private fun audibleRuns(points: List<ConfigPoint>): List<List<ConfigPoint>> {
        val runs = mutableListOf<List<ConfigPoint>>()
        var runStart = -1
        for (i in 0 until points.size - 1) {
            val isAudible = points[i].amplitude > 0f || points[i + 1].amplitude > 0f
            if (isAudible && runStart < 0) runStart = i
            if (!isAudible && runStart >= 0) {
                runs.add(points.subList(runStart, i + 1))
                runStart = -1
            }
        }
        if (runStart >= 0) runs.add(points.subList(runStart, points.size))
        return runs
    }

    private fun densify(points: List<ConfigPoint>): List<ConfigPoint> {
        val result = mutableListOf(points.first())
        for (next in points.drop(1)) {
            val previous = result.last()
            val gap = next.time - previous.time
            val pieces = ((gap + MAX_BLOCK_SPAN_MS - 1) / MAX_BLOCK_SPAN_MS).toInt()
            for (piece in 1 until pieces) {
                result.add(interpolate(previous, next, previous.time + gap * piece / pieces))
            }
            result.add(next)
        }
        return result
    }

    private fun splitIntoEventWindows(points: List<ConfigPoint>): List<List<ConfigPoint>> {
        val windows = mutableListOf<List<ConfigPoint>>()
        var start = 0
        while (start < points.size - 1) {
            var end = start + 1
            while (
                end + 1 < points.size &&
                end + 1 - start < MAX_CURVE_POINTS &&
                points[end + 1].time - points[start].time <= MAX_BLOCK_SPAN_MS
            ) end++
            windows.add(padToMinimumPoints(points.subList(start, end + 1)))
            start = end
        }
        return windows
    }

    private fun padToMinimumPoints(points: List<ConfigPoint>): List<ConfigPoint> {
        val result = points.toMutableList()
        while (result.size < MIN_CURVE_POINTS) {
            val widestGap = (0 until result.size - 1).maxBy { result[it + 1].time - result[it].time }
            val left = result[widestGap]
            val right = result[widestGap + 1]
            if (right.time - left.time < 2) break
            result.add(widestGap + 1, interpolate(left, right, (left.time + right.time) / 2))
        }
        return result
    }

    private fun toContinuous(points: List<ConfigPoint>): Continuous? {
        val start = points.first().time
        val duration = points.last().time - start
        if (duration <= 0 || points.size < MIN_CURVE_POINTS) return null
        val baseFrequency = toPercent(points.first().frequency)
        val curve = points.map {
            CurvePoint(
                time = it.time - start,
                intensity = (it.amplitude.coerceIn(0f, 1f) * 100).roundToInt() / 100f,
                frequencyOffset = (toPercent(it.frequency) - baseFrequency).coerceIn(-100, 100),
            )
        }
        return Continuous(start, duration, baseFrequency, curve)
    }

    private fun transientEvents(discrete: List<ConfigPoint>): List<Transient> =
        discrete
            .filter { it.amplitude > 0f }
            .map { Transient(it.time, toPercent(it.amplitude), toPercent(it.frequency)) }

    private fun groupIntoBlocks(events: List<Event>): List<Block> {
        val blocks = mutableListOf<Block>()
        var current = mutableListOf<Event>()
        for (event in events) {
            val blockStart = current.firstOrNull()?.start
            val fits = blockStart != null &&
                current.size < MAX_EVENTS_PER_BLOCK &&
                event.end - blockStart <= MAX_BLOCK_SPAN_MS
            if (!fits && current.isNotEmpty()) {
                blocks.add(Block(current.first().start, current))
                current = mutableListOf()
            }
            current.add(event)
        }
        if (current.isNotEmpty()) blocks.add(Block(current.first().start, current))
        return blocks
    }

    private fun toJson(blocks: List<Block>): JsonObject = buildJsonObject {
        putJsonObject("Metadata") {
            put("Version", 2)
            put("Created", "")
            put("Description", "Pulsar")
        }
        putJsonArray("PatternList") {
            blocks.forEach { block ->
                addJsonObject {
                    put("AbsoluteTime", block.absoluteTime)
                    put("Pattern", buildJsonArray {
                        block.events.forEach { add(eventJson(it, block.absoluteTime)) }
                    })
                }
            }
        }
    }

    private fun eventJson(event: Event, blockStart: Long): JsonObject = buildJsonObject {
        putJsonObject("Event") {
            put("Index", 0)
            put("RelativeTime", event.start - blockStart)
            when (event) {
                is Transient -> {
                    put("Type", "transient")
                    putJsonObject("Parameters") {
                        put("Intensity", event.intensity)
                        put("Frequency", event.frequency)
                    }
                }
                is Continuous -> {
                    put("Type", "continuous")
                    put("Duration", event.duration)
                    putJsonObject("Parameters") {
                        put("Intensity", 100)
                        put("Frequency", event.frequency)
                        put("Curve", curveJson(event.curve))
                    }
                }
            }
        }
    }

    private fun curveJson(curve: List<CurvePoint>): JsonArray = buildJsonArray {
        curve.forEach {
            addJsonObject {
                put("Time", it.time)
                put("Intensity", it.intensity)
                put("Frequency", it.frequencyOffset)
            }
        }
    }

    private fun toPercent(value: Float): Int = (value.coerceIn(0f, 1f) * 100).roundToInt()

    private fun interpolate(left: ConfigPoint, right: ConfigPoint, time: Long): ConfigPoint {
        val progress = (time - left.time).toFloat() / (right.time - left.time)
        return ConfigPoint(
            time = time,
            amplitude = left.amplitude + (right.amplitude - left.amplitude) * progress,
            frequency = left.frequency + (right.frequency - left.frequency) * progress,
        )
    }
}
