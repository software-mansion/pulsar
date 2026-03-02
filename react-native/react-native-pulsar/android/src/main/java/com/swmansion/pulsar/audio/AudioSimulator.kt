package com.swmansion.pulsar.audio

import android.media.AudioAttributes
import android.media.AudioFormat
import android.media.AudioTrack
import com.swmansion.pulsar.BuildConfig
import com.swmansion.pulsar.types.AudioDataConfig
import com.swmansion.pulsar.types.AudioPatternConfig
import com.swmansion.pulsar.types.CompatibilityMode
import com.swmansion.pulsar.types.ContinuousAudioConfig
import com.swmansion.pulsar.types.DiscreteAudioConfig
import com.swmansion.pulsar.types.EnvelopeConfig
import com.swmansion.pulsar.types.FrequencyConfig
import com.swmansion.pulsar.types.OscillatorConfig
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.types.ValuePoint
import com.swmansion.pulsar.types.WaveformType
import kotlin.math.*
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock

class AudioSimulator(
    private var compatibilityMode: CompatibilityMode
) {
    companion object {
        private const val MAX_FREQUENCY = 440.0
        private const val MIN_FREQUENCY = 60.0
        private const val CONTINUOUS_FREQUENCY_MIN = 80.0
        private const val CONTINUOUS_FREQUENCY_MAX = 230.0
        private const val NUM_SOURCES = 3
    }

    private val sampleRate: Double = 44100.0
    private var audioTrack: AudioTrack? = null
    private var isInitialized = false
    private var playSound: Boolean = BuildConfig.DEBUG
    private val audioScope = CoroutineScope(Dispatchers.IO)
    private val audioMutex = Mutex()

    fun parsePattern(data: PatternData): ByteArray? {
        if (!playSound) return null

        val currentConfig = AudioPatternConfig(
            discreteData = generateDiscreteAudioConfig(data),
            continuousData = generateContinuousAudioConfig(data)
        )

        return renderPattern(currentConfig)
    }

    fun enableSound(value: Boolean) {
        this.playSound = value
    }

    fun play(buffer: ByteArray?) {
        if (buffer == null || !playSound || buffer.isEmpty()) return

        audioScope.launch {
            audioMutex.withLock {
                try {
                    if (audioTrack == null) {
                        configureAudioContext()
                    }

                    audioTrack?.apply {
                        if (playState == AudioTrack.PLAYSTATE_PLAYING) {
                            stop()
                            flush()
                        }

                        play()
                        
                        var totalBytesWritten = 0
                        var lastWriteTime = System.currentTimeMillis()
                        
                        while (totalBytesWritten < buffer.size) {
                            val bytesToWrite = buffer.size - totalBytesWritten
                            val bytesWritten = write(buffer, totalBytesWritten, bytesToWrite)
                            
                            if (bytesWritten < 0) {
                                break
                            } else if (bytesWritten == 0) {
                                val currentTime = System.currentTimeMillis()
                                if (currentTime - lastWriteTime > 5000) {
                                    break
                                }
                                delay(10)
                            } else {
                                totalBytesWritten += bytesWritten
                                lastWriteTime = System.currentTimeMillis()
                            }
                        }
                    }
                } catch (e: Exception) {
                    e.printStackTrace()
                }
            }
        }
    }

    fun stop() {
        if (!playSound) {
            return
        }
        audioScope.launch {
            audioMutex.withLock {
                try {
                    audioTrack?.apply {
                        if (playState == AudioTrack.PLAYSTATE_PLAYING) {
                            stop()
                            flush()
                        }
                    }
                } catch (e: Exception) {
                    e.printStackTrace()
                }
            }
        }
    }

    private fun configureAudioContext() {
        if (isInitialized && audioTrack != null) return

        val minBufferSize = AudioTrack.getMinBufferSize(
            sampleRate.toInt(),
            AudioFormat.CHANNEL_OUT_MONO,
            AudioFormat.ENCODING_PCM_16BIT
        )

        audioTrack = AudioTrack.Builder()
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
            .setBufferSizeInBytes(minBufferSize * 4)
            .setTransferMode(AudioTrack.MODE_STREAM)
            .build()

        isInitialized = true
    }

    private fun generateWaveform(waveform: WaveformType, phase: Double): Double {
        val normalizedPhase = (phase % (2 * PI)) / (2 * PI)

        return when (waveform) {
            WaveformType.SINE -> sin(phase)
            WaveformType.SQUARE -> if (normalizedPhase < 0.5) 1.0 else -1.0
            WaveformType.TRIANGLE -> {
                when {
                    normalizedPhase < 0.25 -> normalizedPhase * 4.0
                    normalizedPhase < 0.75 -> 2.0 - (normalizedPhase * 4.0)
                    else -> (normalizedPhase - 1.0) * 4.0
                }
            }
            WaveformType.SAWTOOTH -> (normalizedPhase * 2.0) - 1.0
        }
    }

    private fun normalizeFrequency(value: Float): Double {
        return MIN_FREQUENCY + (MAX_FREQUENCY - MIN_FREQUENCY) * value
    }

    private fun alignVolume(x: Float, sources: Int): Float {
        return (0.1 / sources + 0.9 / sources * x).toFloat()
    }

    private fun generateDiscreteAudioConfig(data: PatternData): List<DiscreteAudioConfig> {
        val configs = mutableListOf<DiscreteAudioConfig>()

        data.discretePattern.forEach { discretePoint ->
            val baseFrequency = normalizeFrequency(discretePoint.frequency)
            val targetFrequency = baseFrequency * 0.2
            val volume = alignVolume(discretePoint.amplitude, NUM_SOURCES)

            // Base oscillator
            configs.add(
                DiscreteAudioConfig(
                    oscillator = OscillatorConfig(
                        frequency = FrequencyConfig(
                            initial = baseFrequency,
                            final = targetFrequency,
                            decayTime = 0.028
                        ),
                        envelope = EnvelopeConfig(
                            attack = 0.002,
                            decay = 0.0,
                            sustainLevel = 1.0,
                            sustainDuration = 0.0,
                            release = 0.014
                        ),
                        waveform = WaveformType.SINE
                    ),
                    timestamp = discretePoint.time.toDouble(),
                    volume = volume
                )
            )

            // Harmonic 1 (1.5x)
            val harmonic1 = baseFrequency * 1.5
            val targetHarmonic1 = harmonic1 * 0.4
            configs.add(
                DiscreteAudioConfig(
                    oscillator = OscillatorConfig(
                        frequency = FrequencyConfig(
                            initial = harmonic1,
                            final = targetHarmonic1,
                            decayTime = 0.031
                        ),
                        envelope = EnvelopeConfig(
                            attack = 0.0,
                            decay = 0.0,
                            sustainLevel = 1.0,
                            sustainDuration = 0.0,
                            release = 0.015
                        ),
                        waveform = WaveformType.SINE
                    ),
                    timestamp = discretePoint.time.toDouble(),
                    volume = volume
                )
            )

            // Harmonic 2 (0.3x)
            val harmonic2 = baseFrequency * 0.3
            val targetHarmonic2 = harmonic2 * 0.5
            configs.add(
                DiscreteAudioConfig(
                    oscillator = OscillatorConfig(
                        frequency = FrequencyConfig(
                            initial = harmonic2,
                            final = targetHarmonic2,
                            decayTime = 0.039
                        ),
                        envelope = EnvelopeConfig(
                            attack = 0.005,
                            decay = 0.0,
                            sustainLevel = 1.0,
                            sustainDuration = 0.0,
                            release = 0.018
                        ),
                        waveform = WaveformType.SINE
                    ),
                    timestamp = discretePoint.time.toDouble(),
                    volume = volume
                )
            )
        }

        return configs
    }

    private fun generateContinuousAudioConfig(data: PatternData): List<ContinuousAudioConfig> {
        val amplitudePoints = data.continuousPattern.amplitude.ifEmpty {
            emptyList()
        }
        val frequencyPoints = data.continuousPattern.frequency.ifEmpty {
            emptyList()
        }

        fun normalizeFrequencyForContinuous(x: Float): Float {
            return (CONTINUOUS_FREQUENCY_MIN + (CONTINUOUS_FREQUENCY_MAX - CONTINUOUS_FREQUENCY_MIN) * x).toFloat()
        }

        fun applyModifiers(
            amplitude: List<ValuePoint>,
            frequency: List<ValuePoint>,
            ampMod: Float,
            freqMod: Float
        ): Pair<List<ValuePoint>, List<ValuePoint>> {
            val modifiedAmplitude = amplitude.map { point ->
                ValuePoint(point.time, point.value * ampMod)
            }
            val modifiedFrequency = frequency.map { point ->
                ValuePoint(point.time, (normalizeFrequencyForContinuous(point.value) * freqMod))
            }
            return Pair(modifiedAmplitude, modifiedFrequency)
        }

        val configs = mutableListOf<ContinuousAudioConfig>()

        val (amp1, freq1) = applyModifiers(amplitudePoints, frequencyPoints, 0.6f, 0.8f)
        configs.add(
            ContinuousAudioConfig(
                type = "sine",
                data = AudioDataConfig(amplitude = amp1, frequency = freq1)
            )
        )

        val (amp2, freq2) = applyModifiers(amplitudePoints, frequencyPoints, 0.2f, 0.4f)
        configs.add(
            ContinuousAudioConfig(
                type = "triangle",
                data = AudioDataConfig(amplitude = amp2, frequency = freq2)
            )
        )

        // Sine wave with 0.5 amplitude mod and 1.0 frequency mod
        val (amp3, freq3) = applyModifiers(amplitudePoints, frequencyPoints, 0.5f, 1.0f)
        configs.add(
            ContinuousAudioConfig(
                type = "sine",
                data = AudioDataConfig(amplitude = amp3, frequency = freq3)
            )
        )

        return configs
    }

    private fun renderPattern(config: AudioPatternConfig): ByteArray? {
        val totalDuration = calculateTotalDuration(config)
        val bufferSize = (totalDuration * sampleRate).toInt() + 1

        if (bufferSize <= 0) return null

        val samples = DoubleArray(bufferSize)
        val phasesContinuous = DoubleArray(config.continuousData.size)
        val phasesDiscrete = DoubleArray(config.discreteData.size)
        val twoPi = 2 * PI

        // Process each sample
        for (i in 0 until bufferSize) {
            val t = i.toDouble() / sampleRate
            var sampleValue = 0.0

            // Continuous waves
            config.continuousData.forEachIndexed { waveIdx, waveConfig ->
                if (waveConfig.data.amplitude.isNotEmpty() && waveConfig.data.frequency.isNotEmpty()) {
                    val amp = valueForTime(waveConfig.data.amplitude, t)
                    var freq = valueForTime(waveConfig.data.frequency, t)
                    
                    // Clamp frequency to reasonable bounds to avoid aliasing and strange sounds
                    freq = freq.coerceIn(20.0, sampleRate / 2.0)

                    phasesContinuous[waveIdx] += twoPi * freq / sampleRate
                    if (phasesContinuous[waveIdx] > twoPi) phasesContinuous[waveIdx] -= twoPi

                    val waveformType = WaveformType.entries.find { it.name.equals(waveConfig.type, ignoreCase = true) } ?: WaveformType.SINE
                    sampleValue += amp * generateWaveform(waveformType, phasesContinuous[waveIdx])
                }
            }

            // Discrete waves (transients)
            config.discreteData.forEachIndexed { oscIdx, oscConfig ->
                val eventStartTime = oscConfig.timestamp / 1000.0
                val relativeTime = t - eventStartTime

                if (relativeTime >= 0) {
                    val envelope = oscConfig.oscillator.envelope
                    val totalDuration = envelope.attack + envelope.decay + envelope.sustainDuration + envelope.release

                    if (relativeTime < totalDuration) {
                        // Apply ADSR envelope
                        val envValue = when {
                            relativeTime < envelope.attack -> {
                                relativeTime / envelope.attack
                            }
                            relativeTime < envelope.attack + envelope.decay -> 1.0
                            relativeTime < envelope.attack + envelope.decay + envelope.sustainDuration -> envelope.sustainLevel
                            else -> {
                                val releaseTime = relativeTime - (envelope.attack + envelope.decay + envelope.sustainDuration)
                                if (envelope.release > 0) 1.0 - (releaseTime / envelope.release) else 0.0
                            }
                        }

                        // Frequency sweep
                        val freqConfig = oscConfig.oscillator.frequency
                        var freq = freqConfig.initial
                        if (freqConfig.decayTime > 0) {
                            val sweepDuration = minOf(freqConfig.decayTime, totalDuration)
                            if (relativeTime < sweepDuration) {
                                val ratio = relativeTime / freqConfig.decayTime
                                freq = freqConfig.initial * (freqConfig.final / freqConfig.initial).pow(ratio)
                            } else {
                                freq = freqConfig.final
                            }
                        }

                        phasesDiscrete[oscIdx] += twoPi * freq / sampleRate
                        if (phasesDiscrete[oscIdx] > twoPi) phasesDiscrete[oscIdx] -= twoPi

                        sampleValue += oscConfig.volume * envValue * generateWaveform(oscConfig.oscillator.waveform, phasesDiscrete[oscIdx])
                    }
                }
            }

            samples[i] = sampleValue
        }

        // Convert to 16-bit PCM
        return convertToByteArray(samples)
    }

    private fun calculateTotalDuration(config: AudioPatternConfig): Double {
        var continuousDuration = 0.0
        for (wave in config.continuousData) {
            if (wave.data.amplitude.isNotEmpty()) {
                continuousDuration = maxOf(continuousDuration, wave.data.amplitude.last().time.toDouble() / 1000.0)
            }
        }
        continuousDuration += 0.01

        var discreteDuration = 0.0
        for (cfg in config.discreteData) {
            val eventStartTime = cfg.timestamp / 1000.0
            val envelope = cfg.oscillator.envelope
            val oscillatorDuration = envelope.attack + envelope.decay + envelope.sustainDuration + envelope.release
            val eventEndTime = eventStartTime + oscillatorDuration
            discreteDuration = maxOf(discreteDuration, eventEndTime)
        }
        discreteDuration += 0.1

        return maxOf(continuousDuration, discreteDuration)
    }

    private fun valueForTime(points: List<ValuePoint>, t: Double): Double {
        if (points.isEmpty()) return 0.0
        val tMs = t * 1000.0
        if (tMs <= points[0].time) return points[0].value.toDouble()
        if (tMs >= points.last().time) return points.last().value.toDouble()

        for (i in 1 until points.size) {
            val p1 = points[i - 1]
            val p2 = points[i]
            if (tMs <= p2.time) {
                val t0 = p1.time.toDouble()
                val t1 = p2.time.toDouble()
                val v0 = p1.value.toDouble()
                val v1 = p2.value.toDouble()
                
                // Prevent division by zero
                if (t1 <= t0) return v0
                
                val ratio = (tMs - t0) / (t1 - t0)
                return v0 + (v1 - v0) * ratio
            }
        }
        return points.last().value.toDouble()
    }

    private fun convertToByteArray(samples: DoubleArray): ByteArray {
        val byteArray = ByteArray(samples.size * 2)
        for (i in samples.indices) {
            val sample = (samples[i] * 32767).toInt().coerceIn(-32768, 32767)
            byteArray[i * 2] = (sample and 0xFF).toByte()
            byteArray[i * 2 + 1] = ((sample shr 8) and 0xFF).toByte()
        }
        return byteArray
    }

    fun setCompatibilityMode(mode: CompatibilityMode) {
        compatibilityMode = mode
    }
}
