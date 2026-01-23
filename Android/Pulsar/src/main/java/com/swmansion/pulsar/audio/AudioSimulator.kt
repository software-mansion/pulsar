package com.swmansion.pulsar.audio

import android.media.AudioAttributes
import android.media.AudioFormat
import android.media.AudioManager
import android.media.AudioTrack
import android.os.Build
import kotlin.math.*

class AudioSimulator {
    private val sampleRate: Double = 44100.0
    private var audioTrack: AudioTrack? = null
    private var isInitialized = false
    private var playSound: Boolean = true

    init {
        configureAudioContext()
    }

    fun parsePattern(data: PatternData): ByteArray? {
        if (!playSound) return null

        val currentConfig = AudioPatternConfig(
            discreteData = generateDiscreteAudioConfig(data),
            continuousData = generateContinuousAudioConfig(data)
        )

        return renderPattern(config = currentConfig)
    }

    fun enableSound(value: Boolean) {
        this.playSound = value
    }

    fun play(buffer: ByteArray?) {
        if (buffer == null || !playSound) return

        if (audioTrack == null) {
            configureAudioContext()
        }

        audioTrack?.write(buffer, 0, buffer.size)
        audioTrack?.play()
    }

    private fun configureAudioContext() {
        if (isInitialized) return

        val minBufferSize = AudioTrack.getMinBufferSize(
            sampleRate.toInt(),
            AudioFormat.CHANNEL_OUT_MONO,
            AudioFormat.ENCODING_PCM_16BIT
        )

        audioTrack = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            AudioTrack.Builder()
                .setAudioAttributes(
                    AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_MEDIA)
                        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                        .build()
                )
                .setAudioFormat(
                    AudioFormat.Builder()
                        .setEncoding(AudioFormat.ENCODING_PCM_16BIT)
                        .setSampleRate(sampleRate.toInt())
                        .setChannelMask(AudioFormat.CHANNEL_OUT_MONO)
                        .build()
                )
                .setBufferSizeInBytes(minBufferSize * 2)
                .build()
        } else {
            @Suppress("DEPRECATION")
            AudioTrack(
                AudioManager.STREAM_MUSIC,
                sampleRate.toInt(),
                AudioFormat.CHANNEL_OUT_MONO,
                AudioFormat.ENCODING_PCM_16BIT,
                minBufferSize * 2,
                AudioTrack.MODE_STREAM
            )
        }

        isInitialized = true
    }

    private fun generateWaveform(waveform: WaveformType, phase: Double): Double {
        val normalizedPhase = (phase % (2 * PI)) / (2 * PI)

        return when (waveform) {
            WaveformType.SINE -> sin(phase)
            WaveformType.SQUARE -> if (normalizedPhase < 0.5) 1.0 else -1.0
            WaveformType.TRIANGLE -> {
                if (normalizedPhase < 0.25) {
                    normalizedPhase * 4.0
                } else if (normalizedPhase < 0.75) {
                    2.0 - normalizedPhase * 4.0
                } else {
                    normalizedPhase * 4.0 - 4.0
                }
            }

            WaveformType.SAWTOOTH -> (normalizedPhase * 2.0) - 1.0
        }
    }

    private fun generateDiscreteAudioConfig(data: PatternData): List<DiscreteAudioConfig> {
        return data.discretePattern.map { point ->
            DiscreteAudioConfig(
                oscillator = OscillatorConfig(
                    frequency = FrequencyConfig(
                        initial = point.frequency.toDouble() * 5000.0,
                        final = point.frequency.toDouble() * 5000.0,
                        decayTime = 0.1
                    ),
                    envelope = EnvelopeConfig(
                        attack = 0.01,
                        decay = 0.08,
                        sustainLevel = 0.0,
                        sustainDuration = 0.0,
                        release = 0.01
                    ),
                    waveform = WaveformType.SINE
                ),
                timestamp = point.time.toDouble(),
                volume = point.amplitude
            )
        }
    }

    private fun generateContinuousAudioConfig(data: PatternData): List<ContinuousAudioConfig> {
        return listOf(
            ContinuousAudioConfig(
                type = "amplitude_frequency",
                data = AudioDataConfig(
                    amplitude = data.continuesPattern.amplitude,
                    frequency = data.continuesPattern.frequency
                )
            )
        )
    }

    private fun renderPattern(config: AudioPatternConfig): ByteArray? {
        val totalDuration = calculateTotalDuration(config)
        val bufferSize = (totalDuration * sampleRate).toInt()

        if (bufferSize <= 0) return null

        val samples = DoubleArray(bufferSize)
        val amplitudes = DoubleArray(bufferSize)

        // Process continuous data
        for (continuousConfig in config.continuousData) {
            fillContinuousAudio(
                samples,
                amplitudes,
                continuousConfig.data,
                sampleRate.toInt()
            )
        }

        // Process discrete data
        for (discreteConfig in config.discreteData) {
            fillDiscreteAudio(
                samples,
                amplitudes,
                discreteConfig,
                sampleRate.toInt()
            )
        }

        // Convert to 16-bit PCM
        return convertToByteArray(samples, amplitudes)
    }

    private fun calculateTotalDuration(config: AudioPatternConfig): Double {
        var maxDuration = 0.0

        for (continuous in config.continuousData) {
            for (point in continuous.data.amplitude) {
                maxDuration = maxOf(maxDuration, point.time.toDouble())
            }
            for (point in continuous.data.frequency) {
                maxDuration = maxOf(maxDuration, point.time.toDouble())
            }
        }

        for (discrete in config.discreteData) {
            maxDuration = maxOf(maxDuration, discrete.timestamp + 0.1)
        }

        return maxDuration
    }

    private fun fillContinuousAudio(
        samples: DoubleArray,
        amplitudes: DoubleArray,
        data: AudioDataConfig,
        sampleRate: Int
    ) {
        for (i in samples.indices) {
            val time = i.toDouble() / sampleRate
            val frequency = interpolateValue(data.frequency, time)
            val amplitude = interpolateValue(data.amplitude, time)

            if (amplitude > 0 && frequency > 0) {
                val phase = 2 * PI * frequency * time
                val waveform = generateWaveform(WaveformType.SINE, phase)
                samples[i] += waveform * amplitude
                amplitudes[i] = maxOf(amplitudes[i], amplitude.toDouble())
            }
        }
    }

    private fun fillDiscreteAudio(
        samples: DoubleArray,
        amplitudes: DoubleArray,
        config: DiscreteAudioConfig,
        sampleRate: Int
    ) {
        val startSample = (config.timestamp * sampleRate).toInt()
        val envelope = config.oscillator.envelope
        val totalDuration = envelope.attack + envelope.decay + envelope.sustainDuration + envelope.release

        for (i in 0 until (totalDuration * sampleRate).toInt()) {
            val sampleIndex = startSample + i
            if (sampleIndex >= samples.size) break

            val time = i.toDouble() / sampleRate
            val envelope_value = calculateEnvelope(envelope, time)

            if (envelope_value > 0) {
                val frequency = interpolateFrequency(config.oscillator.frequency, time)
                val phase = 2 * PI * frequency * time
                val waveform = generateWaveform(config.oscillator.waveform, phase)
                val sample = waveform * envelope_value * config.volume

                samples[sampleIndex] = sample
                amplitudes[sampleIndex] = config.volume.toDouble()
            }
        }
    }

    private fun interpolateValue(points: List<PatternPoint>, time: Double): Double {
        if (points.isEmpty()) return 0.0
        if (points.size == 1) return points[0].value.toDouble()

        val index = points.indexOfFirst { it.time >= time }
        return when {
            index <= 0 -> points[0].value.toDouble()
            index >= points.size -> points[points.size - 1].value.toDouble()
            else -> {
                val p1 = points[index - 1]
                val p2 = points[index]
                val t = ((time - p1.time) / (p2.time - p1.time)).coerceIn(0.0, 1.0)
                p1.value + (p2.value - p1.value) * t
            }
        }
    }

    private fun interpolateFrequency(config: FrequencyConfig, time: Double): Double {
        return if (time <= config.decayTime) {
            config.initial + (config.final - config.initial) * (time / config.decayTime)
        } else {
            config.final
        }
    }

    private fun calculateEnvelope(envelope: EnvelopeConfig, time: Double): Double {
        return when {
            time < envelope.attack -> time / envelope.attack
            time < envelope.attack + envelope.decay -> {
                1.0 - ((time - envelope.attack) / envelope.decay) * (1.0 - envelope.sustainLevel)
            }

            time < envelope.attack + envelope.decay + envelope.sustainDuration -> envelope.sustainLevel
            time < envelope.attack + envelope.decay + envelope.sustainDuration + envelope.release -> {
                envelope.sustainLevel * (1.0 - (time - envelope.attack - envelope.decay - envelope.sustainDuration) / envelope.release)
            }

            else -> 0.0
        }
    }

    private fun convertToByteArray(samples: DoubleArray, amplitudes: DoubleArray): ByteArray {
        val byteArray = ByteArray(samples.size * 2)
        for (i in samples.indices) {
            val sample = (samples[i] * 32767 * amplitudes[i]).toInt().coerceIn(-32768, 32767)
            byteArray[i * 2] = (sample and 0xFF).toByte()
            byteArray[i * 2 + 1] = ((sample shr 8) and 0xFF).toByte()
        }
        return byteArray
    }
}
