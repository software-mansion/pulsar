package com.swmansion.pulsar.androidimpl.haptics

import com.swmansion.pulsar.androidimpl.types.ConfigPoint

class ConfigLineBuilder(amplitudeLine: ValueLineBuilder, frequencyLine: ValueLineBuilder) {
    val points = ArrayList<ConfigPoint>()

    init {
        points.clear()

        val timestamps = (amplitudeLine.points.map { it.time } + frequencyLine.points.map { it.time })
            .toSet()
            .toList()
            .sorted()

        timestamps.forEach { time ->
            val amplitude = amplitudeLine.valueForX(time)
            val frequency = frequencyLine.valueForX(time)
            points.add(ConfigPoint(time = time, amplitude = amplitude, frequency = frequency))
        }
    }
}