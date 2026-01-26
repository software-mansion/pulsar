package com.swmansion.pulsar.types

data class ValuePoint(
    val time: Float,
    val value: Float
)

/**
 * Represents single vibration impulse.
 *
 * @param time relative time.
 * @param amplitude value from range [0-1].
 * @param frequency value from range [0-1]. Ignored for devices that do not support envelopes.
 */
data class ConfigPoint(
    val time: Float,
    val amplitude: Float,
    val frequency: Float
) {
    init {
        verifyRelativeTime(time.toLong())
        verifyIntensity(amplitude)
        verifySharpness(frequency)
    }
}

data class ContinuesPattern(
    val amplitude: List<ValuePoint>,
    val frequency: List<ValuePoint>
) {
    fun isEmpty(): Boolean {
        return amplitude.isEmpty() && frequency.isEmpty()
    }
    fun isNotEmpty(): Boolean {
        return !isEmpty()
    }

    init {
        verifyIntensity()
        verifySharpness()

        if (amplitude.isNotEmpty() && frequency.isNotEmpty()) {
            if (amplitude.last().time < frequency.last().time) {
                throwInitException(
                    "Intensity max relative time must be greater o equal than sharpness max relative time."
                )
            }
        }
    }

    private fun verifyIntensity() {
        if (amplitude.isEmpty()) {
            return
        }

        val intensityTime = amplitude.map { it.time }
        if (intensityTime != intensityTime.sorted()) {
            throwInitException("Intensity relative time must be in ascending order.")
        }

        val firstIntensityPoint = amplitude.first()
        val lastIntensityPoint = amplitude.last()

        if (firstIntensityPoint.time != 0f) {
//      throwInitException("Intensity first element relativeTime must be 0.")
        }

        if (firstIntensityPoint.value != 0f || lastIntensityPoint.value != 0f) {
//      throwInitException("Intensity first and last element intensity must be 0.")
        }
    }

    private fun verifySharpness() {
        if (frequency.isEmpty()) {
            return
        }

        val sharpnessTime = frequency.map { it.time }
        if (sharpnessTime != sharpnessTime.sorted()) {
            throwInitException("Sharpness relative time must be in ascending order.")
        }

        if (sharpnessTime != sharpnessTime.distinct()) {
            throwInitException("Sharpness relative time cannot be duplicated.")
        }

        if (frequency.first().time != 0f) {
//      throwInitException("Sharpness first element relativeTime must be 0.")
        }
    }

    private fun throwInitException(message: String) {
        throw Exception("Failed to init Plot. $message")
    }
}

data class PatternData(
    val continuesPattern: ContinuesPattern,
    val discretePattern: List<ConfigPoint>
) {
    constructor(rawContinuesPattern: List<List<List<Double>>>, rawDiscretePattern: List<List<Double>>) : this(
        continuesPattern = ContinuesPattern(
            amplitude = rawContinuesPattern[0].map { ValuePoint(time = it[0].toFloat(), value = it[1].toFloat()) },
            frequency = rawContinuesPattern[1].map { ValuePoint(time = it[0].toFloat(), value = it[1].toFloat()) }
        ),
        discretePattern = rawDiscretePattern.map { ConfigPoint(time = it[0].toFloat(), amplitude = it[1].toFloat(), frequency = it[2].toFloat()) }
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
    val amplitude: List<ValuePoint>,
    val frequency: List<ValuePoint>
)

data class AudioPatternConfig(
    val discreteData: List<DiscreteAudioConfig>,
    val continuousData: List<ContinuousAudioConfig>
)
