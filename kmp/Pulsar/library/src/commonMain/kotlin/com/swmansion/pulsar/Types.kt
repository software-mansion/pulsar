package com.swmansion.pulsar

data class ControlPoint(
    val intensity: Float,
    val sharpness: Float,
    val duration: Long,
)

data class ValuePoint(
    val time: Long,
    val value: Float,
)

data class ConfigPoint(
    val time: Long,
    val amplitude: Float,
    val frequency: Float,
)

data class ContinuousPattern(
    val amplitude: List<ValuePoint>,
    val frequency: List<ValuePoint>,
)

data class PatternData(
    val continuousPattern: ContinuousPattern,
    val discretePattern: List<ConfigPoint>,
) {
    constructor(
        rawContinuousPattern: List<List<List<Float>>> = listOf(listOf(), listOf()),
        rawDiscretePattern: List<List<Float>> = listOf(),
    ) : this(
        continuousPattern = ContinuousPattern(
            amplitude = rawContinuousPattern.getOrNull(0).orEmpty().map {
                ValuePoint(time = it[0].toLong(), value = it[1])
            },
            frequency = rawContinuousPattern.getOrNull(1).orEmpty().map {
                ValuePoint(time = it[0].toLong(), value = it[1])
            },
        ),
        discretePattern = rawDiscretePattern.map {
            ConfigPoint(time = it[0].toLong(), amplitude = it[1], frequency = it[2])
        },
    )
}
