package com.swmansion.pulsar.audio

data class PatternPoint(
    val time: Float,
    val value: Float
)

data class DiscretePoint(
    val time: Float,
    val amplitude: Float,
    val frequency: Float
)

data class ContinuesPattern(
    val amplitude: List<PatternPoint>,
    val frequency: List<PatternPoint>
)

data class PatternData(
    val continuesPattern: ContinuesPattern,
    val discretePattern: List<DiscretePoint>
) {
    constructor(line: List<List<List<Double>>>, bar: List<List<Double>>) : this(
        continuesPattern = ContinuesPattern(
            amplitude = line[0].map { PatternPoint(time = it[0].toFloat(), value = it[1].toFloat()) },
            frequency = line[1].map { PatternPoint(time = it[0].toFloat(), value = it[1].toFloat()) }
        ),
        discretePattern = bar.map { DiscretePoint(time = it[0].toFloat(), amplitude = it[1].toFloat(), frequency = it[2].toFloat()) }
    )
}

enum class WaveformType(val value: String) {
    SINE("sine"),
    SQUARE("square"),
    TRIANGLE("triangle"),
    SAWTOOTH("sawtooth")
}

data class OscillatorConfig(
    val frequency: FrequencyConfig,
    val envelope: EnvelopeConfig,
    val waveform: WaveformType
)

data class FrequencyConfig(
    val initial: Double,
    val final: Double,
    val decayTime: Double
)

data class EnvelopeConfig(
    val attack: Double,
    val decay: Double,
    val sustainLevel: Double,
    val sustainDuration: Double,
    val release: Double
)

data class DiscreteAudioConfig(
    val oscillator: OscillatorConfig,
    val timestamp: Double,
    val volume: Float
)

data class ContinuousAudioConfig(
    val type: String,
    val data: AudioDataConfig
)

data class AudioDataConfig(
    val amplitude: List<PatternPoint>,
    val frequency: List<PatternPoint>
)

data class AudioPatternConfig(
    val discreteData: List<DiscreteAudioConfig>,
    val continuousData: List<ContinuousAudioConfig>
)
