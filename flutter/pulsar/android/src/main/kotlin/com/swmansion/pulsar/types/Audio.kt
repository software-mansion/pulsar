package com.swmansion.pulsar.types

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
    val amplitude: List<ValuePoint>,
    val frequency: List<ValuePoint>
)

data class AudioPatternConfig(
    val discreteData: List<DiscreteAudioConfig>,
    val continuousData: List<ContinuousAudioConfig>
)
