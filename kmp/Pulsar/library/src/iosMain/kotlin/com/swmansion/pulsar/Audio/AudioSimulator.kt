package com.swmansion.pulsar

import kotlinx.cinterop.ExperimentalForeignApi
import kotlinx.cinterop.addressOf
import kotlinx.cinterop.usePinned
import platform.AVFAudio.AVAudioEngine
import platform.AVFAudio.AVAudioFormat
import platform.AVFAudio.AVAudioPCMBuffer
import platform.AVFAudio.AVAudioPlayerNode
import platform.AVFAudio.AVAudioSession
import platform.AVFAudio.AVAudioSessionCategoryOptionMixWithOthers
import platform.AVFAudio.AVAudioSessionCategoryPlayback
import platform.AVFAudio.AVAudioSessionModeDefault
import platform.AVFAudio.AVAudioUnitEQ
import platform.AVFAudio.AVAudioUnitEQFilterTypeLowPass
import platform.posix.memcpy
import kotlin.math.PI
import kotlin.math.ceil
import kotlin.math.exp
import kotlin.math.ln
import kotlin.math.max
import kotlin.math.min
import kotlin.math.sin

@OptIn(ExperimentalForeignApi::class)
internal class IOSAudioSimulator {
    private val sampleRate = 22_050.0
    private val audioContext = AVAudioEngine()
    private val playerNode = AVAudioPlayerNode()
    private val filterNode = AVAudioUnitEQ(numberOfBands = 1u)
    private var isEngineConfigured = false
    private var playSound = false

    fun parsePattern(data: PatternData): IOSAudioBuffer? {
        if (!playSound) return null
        val config = IOSAudioPatternConfig(
            discreteData = generateDiscreteAudioConfig(data),
            continuousData = generateContinuousAudioConfig(data),
        )
        return renderPattern(config)
    }

    fun enableSound(value: Boolean) {
        playSound = value
        if (value) {
            configureAudioContext()
        }
    }

    fun play(buffer: IOSAudioBuffer?) {
        if (buffer == null || !playSound || buffer.samples.isEmpty()) return
        configureAudioContext()

        if (playerNode.playing) {
            playerNode.stop()
        }
        if (!audioContext.running) {
            runCatching {
                AVAudioSession.sharedInstance().setActive(true, error = null)
                audioContext.startAndReturnError(null)
            }.onFailure {
                log("Failed to start audio engine: ${it.message}")
                return
            }
        }

        val pcmBuffer = buffer.toPcmBuffer(sampleRate) ?: return
        playerNode.scheduleBuffer(pcmBuffer, completionHandler = null)
        playerNode.play()
    }

    fun stop() {
        playerNode.stop()
    }

    val isPlaying: Boolean
        get() = playerNode.playing

    private fun configureAudioContext() {
        if (isEngineConfigured) return
        runCatching {
            val session = AVAudioSession.sharedInstance()
            session.setCategory(
                category = AVAudioSessionCategoryPlayback,
                mode = AVAudioSessionModeDefault,
                options = AVAudioSessionCategoryOptionMixWithOthers,
                error = null,
            )
            session.setActive(true, error = null)
        }.onFailure {
            log("AudioSession error: ${it.message}")
        }

        audioContext.attachNode(playerNode)
        filterNode.bands.firstOrNull()?.let { band ->
            band.filterType = AVAudioUnitEQFilterTypeLowPass
            band.frequency = 700f
            band.bandwidth = 1.0f
            band.gain = 1f
            band.bypass = false
        }
        audioContext.attachNode(filterNode)

        val format = AVAudioFormat(standardFormatWithSampleRate = sampleRate, channels = 1u) ?: return
        audioContext.connect(playerNode, to = filterNode, format = format)
        audioContext.connect(filterNode, to = audioContext.mainMixerNode, format = format)

        runCatching {
            audioContext.startAndReturnError(null)
            isEngineConfigured = true
        }.onFailure {
            log("Failed to start AVAudioEngine: ${it.message}")
        }
    }

    private fun generateWaveform(waveform: IOSWaveformType, phase: Double): Double {
        val normalizedPhase = phase.mod(PI * 2) / (PI * 2)
        return when (waveform) {
            IOSWaveformType.Sine -> sin(phase)
            IOSWaveformType.Square -> if (normalizedPhase < 0.5) 1.0 else -1.0
            IOSWaveformType.Triangle -> when {
                normalizedPhase < 0.25 -> normalizedPhase * 4.0
                normalizedPhase < 0.75 -> 2.0 - normalizedPhase * 4.0
                else -> (normalizedPhase - 1.0) * 4.0
            }
            IOSWaveformType.Sawtooth -> normalizedPhase * 2.0 - 1.0
        }
    }

    private fun generateDiscreteAudioConfig(data: PatternData): List<IOSDiscreteAudioConfig> {
        val discreteData = mutableListOf<IOSDiscreteAudioConfig>()
        val sources = 3

        fun normalizeFrequency(value: Float): Double = 60.0 + (440.0 - 60.0) * value
        fun alignVolume(value: Float): Float = (0.1 / sources + 0.9 / sources * value).toFloat()

        data.discretePattern.forEach { discretePoint ->
            val baseFrequency = normalizeFrequency(discretePoint.frequency)
            val targetFrequency = baseFrequency * 0.2
            val volume = alignVolume(discretePoint.amplitude)

            discreteData += IOSDiscreteAudioConfig(
                oscillator = IOSOscillatorConfig(
                    frequency = IOSFrequencyConfig(baseFrequency, targetFrequency, 0.028),
                    envelope = IOSEnvelopeConfig(0.002, 0.0, 1.0, 0.0, 0.014),
                    waveform = IOSWaveformType.Sine,
                ),
                timestamp = discretePoint.time.toDouble(),
                volume = volume,
            )

            val harmonic1 = baseFrequency * 1.5
            discreteData += IOSDiscreteAudioConfig(
                oscillator = IOSOscillatorConfig(
                    frequency = IOSFrequencyConfig(harmonic1, harmonic1 * 0.4, 0.031),
                    envelope = IOSEnvelopeConfig(0.0, 0.0, 1.0, 0.0, 0.015),
                    waveform = IOSWaveformType.Sine,
                ),
                timestamp = discretePoint.time.toDouble(),
                volume = volume,
            )

            val harmonic2 = baseFrequency * 0.3
            discreteData += IOSDiscreteAudioConfig(
                oscillator = IOSOscillatorConfig(
                    frequency = IOSFrequencyConfig(harmonic2, harmonic2 * 0.5, 0.039),
                    envelope = IOSEnvelopeConfig(0.005, 0.0, 1.0, 0.0, 0.018),
                    waveform = IOSWaveformType.Sine,
                ),
                timestamp = discretePoint.time.toDouble(),
                volume = volume,
            )
        }

        return discreteData
    }

    private fun generateContinuousAudioConfig(data: PatternData): List<IOSContinuousAudioConfig> {
        val amplitudePoints = data.continuousPattern.amplitude
        val frequencyPoints = if (data.continuousPattern.frequency.size > 1) {
            data.continuousPattern.frequency
        } else {
            emptyList()
        }

        fun normalizeFrequency(value: Float): Double = 80.0 + (230.0 - 80.0) * value

        fun applyModifiers(
            amplitude: List<ValuePoint>,
            frequency: List<ValuePoint>,
            ampMod: Double,
            freqMod: Double,
        ): IOSContinuousAudioData {
            return IOSContinuousAudioData(
                amplitude = amplitude.map { ValuePoint(time = it.time, value = (it.value * ampMod).toFloat()) },
                frequency = frequency.map { ValuePoint(time = it.time, value = (normalizeFrequency(it.value) * freqMod).toFloat()) },
            )
        }

        return listOf(
            IOSContinuousAudioConfig(
                waveform = IOSWaveformType.Sine,
                data = applyModifiers(amplitudePoints, frequencyPoints, ampMod = 0.6, freqMod = 0.8),
            ),
            IOSContinuousAudioConfig(
                waveform = IOSWaveformType.Triangle,
                data = applyModifiers(amplitudePoints, frequencyPoints, ampMod = 0.2, freqMod = 0.4),
            ),
            IOSContinuousAudioConfig(
                waveform = IOSWaveformType.Sine,
                data = applyModifiers(amplitudePoints, frequencyPoints, ampMod = 0.5, freqMod = 1.0),
            ),
        )
    }

    private fun renderPattern(config: IOSAudioPatternConfig): IOSAudioBuffer? {
        val totalDuration = calculateTotalDuration(config)
        val frameCount = (totalDuration * sampleRate).toInt() + 1
        if (frameCount <= 0) return null

        val samples = FloatArray(frameCount)
        val sampleRateF = sampleRate.toFloat()
        val twoPi = (PI * 2).toFloat()
        val phasesContinuous = FloatArray(config.continuousData.size)
        val phasesDiscrete = FloatArray(config.discreteData.size)
        val discretePrecomp = config.discreteData.map { it.precompute(sampleRate) }
        val continuousAmpCursors = IntArray(config.continuousData.size) { 1 }
        val continuousFreqCursors = IntArray(config.continuousData.size) { 1 }

        for (i in 0 until frameCount) {
            val tMs = i / sampleRateF * 1000.0f
            var sampleValue = 0f

            config.continuousData.forEachIndexed { waveIdx, waveConfig ->
                if (waveConfig.data.amplitude.isNotEmpty() && waveConfig.data.frequency.isNotEmpty()) {
                    if (tMs >= waveConfig.data.amplitude.first().time.toFloat()) {
                        val amp = valueForTime(waveConfig.data.amplitude, tMs, continuousAmpCursors, waveIdx)
                        val freq = valueForTime(waveConfig.data.frequency, tMs, continuousFreqCursors, waveIdx)
                        phasesContinuous[waveIdx] += twoPi * freq / sampleRateF
                        if (phasesContinuous[waveIdx] > twoPi) phasesContinuous[waveIdx] -= twoPi
                        sampleValue += amp * generateWaveform(
                            waveConfig.waveform,
                            phasesContinuous[waveIdx].toDouble(),
                        ).toFloat()
                    }
                }
            }

            discretePrecomp.forEachIndexed { oscIdx, pre ->
                if (i >= pre.startSample && i < pre.endSample) {
                    val relSample = i - pre.startSample
                    val envValue = pre.envelopeValue(relSample)
                    val freq = pre.frequencyValue(relSample)
                    phasesDiscrete[oscIdx] += twoPi * freq / sampleRateF
                    if (phasesDiscrete[oscIdx] > twoPi) phasesDiscrete[oscIdx] -= twoPi
                    sampleValue += pre.volume * envValue * generateWaveform(
                        pre.waveform,
                        phasesDiscrete[oscIdx].toDouble(),
                    ).toFloat()
                }
            }

            samples[i] = sampleValue
        }

        return IOSAudioBuffer(samples)
    }

    private fun calculateTotalDuration(config: IOSAudioPatternConfig): Double {
        var continuousDuration = 0.0
        config.continuousData.forEach { wave ->
            if (wave.data.amplitude.isNotEmpty()) {
                continuousDuration = max(continuousDuration, wave.data.amplitude.last().time / 1000.0)
            }
        }
        continuousDuration += 0.01

        var discreteDuration = 0.0
        config.discreteData.forEach { discrete ->
            val eventStartTime = discrete.timestamp / 1000.0
            val envelope = discrete.oscillator.envelope
            val oscillatorDuration = envelope.attack + envelope.decay + envelope.sustainDuration + envelope.release
            discreteDuration = max(discreteDuration, eventStartTime + oscillatorDuration)
        }
        discreteDuration += 0.1

        return max(continuousDuration, discreteDuration)
    }

    private fun valueForTime(
        points: List<ValuePoint>,
        tMs: Float,
        cursors: IntArray,
        index: Int,
    ): Float {
        if (points.isEmpty()) return 0f
        if (tMs <= points.first().time.toFloat()) return points.first().value
        if (tMs >= points.last().time.toFloat()) return points.last().value

        while (cursors[index] < points.size && points[cursors[index]].time.toFloat() < tMs) {
            cursors[index] += 1
        }
        val p1 = points[cursors[index] - 1]
        val p2 = points[cursors[index]]
        val ratio = (tMs - p1.time.toFloat()) / (p2.time - p1.time).toFloat()
        return p1.value + (p2.value - p1.value) * ratio
    }

    private fun IOSDiscreteAudioConfig.precompute(sampleRate: Double): IOSDiscreteOscillatorCache {
        val env = oscillator.envelope
        val totalEnvDuration = env.attack + env.decay + env.sustainDuration + env.release
        val startSample = (timestamp / 1000.0 * sampleRate).toInt()
        val endSample = startSample + ceil(totalEnvDuration * sampleRate).toInt()
        val freq = oscillator.frequency
        val sweepDuration = if (freq.decayTime > 0) min(freq.decayTime, totalEnvDuration) else 0.0
        val logRatio = if (freq.decayTime > 0 && freq.initial > 0) {
            ln(freq.final / freq.initial).toFloat()
        } else {
            0f
        }
        return IOSDiscreteOscillatorCache(
            startSample = startSample,
            endSample = endSample,
            freqInitial = freq.initial.toFloat(),
            freqFinal = freq.final.toFloat(),
            freqDecaySamples = (sweepDuration * sampleRate).toInt(),
            logFreqRatio = logRatio,
            envAttackSamples = (env.attack * sampleRate).toInt(),
            envDecayEndSamples = ((env.attack + env.decay) * sampleRate).toInt(),
            envSustainEndSamples = ((env.attack + env.decay + env.sustainDuration) * sampleRate).toInt(),
            envTotalSamples = (totalEnvDuration * sampleRate).toInt(),
            sustainLevel = env.sustainLevel.toFloat(),
            volume = volume,
            waveform = oscillator.waveform,
        )
    }

    private fun IOSAudioBuffer.toPcmBuffer(sampleRate: Double): AVAudioPCMBuffer? {
        val format = AVAudioFormat(standardFormatWithSampleRate = sampleRate, channels = 1u) ?: return null
        val frameCount = samples.size.toUInt()
        val buffer = AVAudioPCMBuffer(PCMFormat = format, frameCapacity = frameCount) ?: return null
        buffer.frameLength = frameCount
        val out = buffer.floatChannelData?.get(0) ?: return null
        samples.usePinned {
            memcpy(out, it.addressOf(0), samples.size.toULong() * Float.SIZE_BYTES.toULong())
        }
        return buffer
    }
}

internal data class IOSAudioBuffer(
    val samples: FloatArray,
)

private enum class IOSWaveformType {
    Sine,
    Square,
    Triangle,
    Sawtooth,
}

private data class IOSFrequencyConfig(
    val initial: Double,
    val final: Double,
    val decayTime: Double,
)

private data class IOSEnvelopeConfig(
    val attack: Double,
    val decay: Double,
    val sustainLevel: Double,
    val sustainDuration: Double,
    val release: Double,
)

private data class IOSOscillatorConfig(
    val frequency: IOSFrequencyConfig,
    val envelope: IOSEnvelopeConfig,
    val waveform: IOSWaveformType,
)

private data class IOSDiscreteAudioConfig(
    val oscillator: IOSOscillatorConfig,
    val timestamp: Double,
    val volume: Float,
)

private data class IOSContinuousAudioData(
    val amplitude: List<ValuePoint>,
    val frequency: List<ValuePoint>,
)

private data class IOSContinuousAudioConfig(
    val waveform: IOSWaveformType,
    val data: IOSContinuousAudioData,
)

private data class IOSAudioPatternConfig(
    val discreteData: List<IOSDiscreteAudioConfig>,
    val continuousData: List<IOSContinuousAudioConfig>,
)

private data class IOSDiscreteOscillatorCache(
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
    val waveform: IOSWaveformType,
) {
    fun envelopeValue(relSample: Int): Float {
        return when {
            relSample < envAttackSamples -> {
                if (envAttackSamples > 0) relSample.toFloat() / envAttackSamples else 1.0f
            }
            relSample < envDecayEndSamples -> 1.0f
            relSample < envSustainEndSamples -> sustainLevel
            else -> {
                val relRelease = relSample - envSustainEndSamples
                val releaseSamples = envTotalSamples - envSustainEndSamples
                if (releaseSamples > 0) 1.0f - relRelease.toFloat() / releaseSamples else 0f
            }
        }
    }

    fun frequencyValue(relSample: Int): Float {
        return if (freqDecaySamples > 0 && relSample < freqDecaySamples) {
            val ratio = relSample.toFloat() / freqDecaySamples
            freqInitial * exp(logFreqRatio * ratio)
        } else {
            freqFinal
        }
    }
}
