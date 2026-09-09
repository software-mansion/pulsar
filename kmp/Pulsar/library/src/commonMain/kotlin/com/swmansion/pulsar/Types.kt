package com.swmansion.pulsar.kmp

data class ControlPoint(
    val intensity: Float,
    val sharpness: Float,
    val duration: Long,
)

enum class CompatibilityMode {
    NO_SUPPORT,
    LIMITED_SUPPORT,
    STANDARD_SUPPORT,
    ADVANCED_SUPPORT,
}

data class HapticCapabilities(
    val hasAmplitudeControl: Boolean,
    val hasPrimitiveSupport: Boolean,
    val isEnvelopeSupported: Boolean,
    val isFrequencyProfileSupported: Boolean,
    val minControlPointDurationMillis: Long,
)

enum class RealtimeComposerStrategy {
    ENVELOPE,
    PRIMITIVE_TICK,
    PRIMITIVE_COMPLEX,
    ENVELOPE_WITH_DISCRETE_PRIMITIVES,
}

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

data class SoundData(
    val uri: String,
    val volume: Float = 1f,
    val offset: Long = 0L,
    val startMs: Long = 0L,
    val durationMs: Long = 0L,
    /**
     * Whether the file carries baked haptic channels. Android only, and only for an explicit
     * `.ogg`: when false the file is plain audio and Pulsar's own haptics play alongside it.
     */
    val hapticChannels: Boolean = true,
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
