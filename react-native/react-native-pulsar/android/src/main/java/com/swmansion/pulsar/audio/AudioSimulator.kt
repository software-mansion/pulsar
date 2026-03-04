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

    private val sampleRate: Int = 22050
    private val sampleRateF: Float = sampleRate.toFloat()
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
            sampleRate,
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
                    .setSampleRate(sampleRate)
                    .setChannelMask(AudioFormat.CHANNEL_OUT_MONO)
                    .build()
            )
            .setBufferSizeInBytes(minBufferSize * 4)
            .setTransferMode(AudioTrack.MODE_STREAM)
            .build()

        isInitialized = true
    }

    private fun generateWaveform(waveform: WaveformType, phase: Float): Float {
        val normalizedPhase = (phase % (2f * PI.toFloat())) / (2f * PI.toFloat())

        return when (waveform) {
            WaveformType.SINE -> sin(phase)
            WaveformType.SQUARE -> if (normalizedPhase < 0.5f) 1.0f else -1.0f
            WaveformType.TRIANGLE -> when {
                normalizedPhase < 0.25f -> normalizedPhase * 4.0f
                normalizedPhase < 0.75f -> 2.0f - (normalizedPhase * 4.0f)
                else -> (normalizedPhase - 1.0f) * 4.0f
            }
            WaveformType.SAWTOOTH -> (normalizedPhase * 2.0f) - 1.0f
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
        val amplitudePoints = data.continuousPattern.amplitude.ifEmpty { emptyList() }
        val frequencyPoints = data.continuousPattern.frequency.ifEmpty { emptyList() }

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
        configs.add(ContinuousAudioConfig(type = "sine", data = AudioDataConfig(amplitude = amp1, frequency = freq1)))

        val (amp2, freq2) = applyModifiers(amplitudePoints, frequencyPoints, 0.2f, 0.4f)
        configs.add(ContinuousAudioConfig(type = "triangle", data = AudioDataConfig(amplitude = amp2, frequency = freq2)))

        val (amp3, freq3) = applyModifiers(amplitudePoints, frequencyPoints, 0.5f, 1.0f)
        configs.add(ContinuousAudioConfig(type = "sine", data = AudioDataConfig(amplitude = amp3, frequency = freq3)))

        return configs
    }

    private fun renderPattern(config: AudioPatternConfig): ByteArray? {
        val totalDuration = calculateTotalDuration(config)
        val bufferSize = (totalDuration * sampleRate).toInt() + 1
        if (bufferSize <= 0) return null

        val samples = FloatArray(bufferSize)
        val phasesContinuous = FloatArray(config.continuousData.size)
        val phasesDiscrete = FloatArray(config.discreteData.size)
        val twoPi = 2f * PI.toFloat()

        val continuousWaveforms: Array<WaveformType> = config.continuousData.map { wave ->
            WaveformType.entries.find { it.name.equals(wave.type, ignoreCase = true) } ?: WaveformType.SINE
        }.toTypedArray()

        data class DiscreteOscillatorCache(
            val startSample: Int,
            val endSample: Int,
            val freqInitial: Float,
            val freqFinal: Float,
            val freqDecaySamples: Int,
            val logFreqRatio: Float,
            val envAttackSamples: Int,
            val envDecayEndSamples: Int,
            val envSustainEndSamples: Int,
            val envTotalSamples: Int,
            val sustainLevel: Float,
            val volume: Float,
            val waveform: WaveformType
        )

        val discreteCache: List<DiscreteOscillatorCache> = config.discreteData.map { osc ->
            val env = osc.oscillator.envelope
            val totalEnvDur = env.attack + env.decay + env.sustainDuration + env.release
            val startSample = (osc.timestamp / 1000.0 * sampleRate).toInt()
            val endSample = startSample + ceil(totalEnvDur * sampleRate).toInt()
            val freqCfg = osc.oscillator.frequency
            val sweepDur = if (freqCfg.decayTime > 0) minOf(freqCfg.decayTime, totalEnvDur) else 0.0
            val logRatio = if (freqCfg.decayTime > 0 && freqCfg.initial > 0)
                ln(freqCfg.final / freqCfg.initial).toFloat() else 0f
            DiscreteOscillatorCache(
                startSample = startSample,
                endSample = endSample,
                freqInitial = freqCfg.initial.toFloat(),
                freqFinal = freqCfg.final.toFloat(),
                freqDecaySamples = (sweepDur * sampleRate).toInt(),
                logFreqRatio = logRatio,
                envAttackSamples = (env.attack * sampleRate).toInt(),
                envDecayEndSamples = ((env.attack + env.decay) * sampleRate).toInt(),
                envSustainEndSamples = ((env.attack + env.decay + env.sustainDuration) * sampleRate).toInt(),
                envTotalSamples = (totalEnvDur * sampleRate).toInt(),
                sustainLevel = env.sustainLevel.toFloat(),
                volume = osc.volume,
                waveform = osc.oscillator.waveform
            )
        }

        val continuousAmpCursors = IntArray(config.continuousData.size) { 1 }
        val continuousFreqCursors = IntArray(config.continuousData.size) { 1 }

        fun valueForTime(points: List<ValuePoint>, tMs: Float, cursors: IntArray, idx: Int): Float {
            if (points.isEmpty()) return 0f
            if (tMs <= points[0].time) return points[0].value
            if (tMs >= points.last().time) return points.last().value
            while (cursors[idx] < points.size && points[cursors[idx]].time < tMs) cursors[idx]++
            val p1 = points[cursors[idx] - 1]
            val p2 = points[cursors[idx]]
            val denom = p2.time - p1.time
            if (denom <= 0f) return p1.value
            val ratio = (tMs - p1.time) / denom
            return p1.value + (p2.value - p1.value) * ratio
        }

        for (i in 0 until bufferSize) {
            val tMs = i.toFloat() / sampleRateF * 1000f
            var sampleValue = 0f

            // Continuous waves
            config.continuousData.forEachIndexed { waveIdx, waveConfig ->
                if (waveConfig.data.amplitude.isNotEmpty() && waveConfig.data.frequency.isNotEmpty()) {
                    val amp = valueForTime(waveConfig.data.amplitude, tMs, continuousAmpCursors, waveIdx)
                    val freq = valueForTime(waveConfig.data.frequency, tMs, continuousFreqCursors, waveIdx)
                        .coerceIn(20f, sampleRateF / 2f)

                    phasesContinuous[waveIdx] += twoPi * freq / sampleRateF
                    if (phasesContinuous[waveIdx] > twoPi) phasesContinuous[waveIdx] -= twoPi

                    sampleValue += amp * generateWaveform(continuousWaveforms[waveIdx], phasesContinuous[waveIdx])
                }
            }

            discreteCache.forEachIndexed { oscIdx, pre ->
                if (i < pre.startSample || i >= pre.endSample) return@forEachIndexed

                val relSample = i - pre.startSample

                val envValue: Float = when {
                    relSample < pre.envAttackSamples ->
                        if (pre.envAttackSamples > 0) relSample.toFloat() / pre.envAttackSamples else 1f
                    relSample < pre.envDecayEndSamples -> 1f
                    relSample < pre.envSustainEndSamples -> pre.sustainLevel
                    else -> {
                        val relRelease = relSample - pre.envSustainEndSamples
                        val releaseSamples = pre.envTotalSamples - pre.envSustainEndSamples
                        if (releaseSamples > 0) 1f - relRelease.toFloat() / releaseSamples else 0f
                    }
                }

                val freq = if (pre.freqDecaySamples > 0 && relSample < pre.freqDecaySamples) {
                    val ratio = relSample.toFloat() / pre.freqDecaySamples
                    pre.freqInitial * exp(pre.logFreqRatio * ratio)
                } else {
                    pre.freqFinal
                }

                phasesDiscrete[oscIdx] += twoPi * freq / sampleRateF
                if (phasesDiscrete[oscIdx] > twoPi) phasesDiscrete[oscIdx] -= twoPi

                sampleValue += pre.volume * envValue * generateWaveform(pre.waveform, phasesDiscrete[oscIdx])
            }

            samples[i] = sampleValue
        }

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

    private fun convertToByteArray(samples: FloatArray): ByteArray {
        val byteArray = ByteArray(samples.size * 2)
        for (i in samples.indices) {
            val sample = (samples[i] * 32767f).toInt().coerceIn(-32768, 32767)
            byteArray[i * 2] = (sample and 0xFF).toByte()
            byteArray[i * 2 + 1] = ((sample shr 8) and 0xFF).toByte()
        }
        return byteArray
    }

    fun setCompatibilityMode(mode: CompatibilityMode) {
        compatibilityMode = mode
    }
}
