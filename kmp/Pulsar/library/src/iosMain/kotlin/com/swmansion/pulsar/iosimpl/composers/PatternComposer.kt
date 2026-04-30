package com.swmansion.pulsar.kmp.iosimpl.composers

import com.swmansion.pulsar.kmp.PatternComposerHandle
import com.swmansion.pulsar.kmp.PatternData
import com.swmansion.pulsar.kmp.iosimpl.audio.IOSAudioBuffer
import com.swmansion.pulsar.kmp.iosimpl.audio.IOSAudioSimulator
import com.swmansion.pulsar.kmp.iosimpl.haptics.IOSContinuousLine
import com.swmansion.pulsar.kmp.iosimpl.haptics.IOSDiscreteLine
import com.swmansion.pulsar.kmp.iosimpl.haptics.IOSHapticEngineWrapper
import com.swmansion.pulsar.kmp.iosimpl.haptics.log
import kotlinx.cinterop.ExperimentalForeignApi
import platform.CoreHaptics.CHHapticEvent
import platform.CoreHaptics.CHHapticEventParameter
import platform.CoreHaptics.CHHapticEventParameterIDHapticIntensity
import platform.CoreHaptics.CHHapticEventParameterIDHapticSharpness
import platform.CoreHaptics.CHHapticEventTypeHapticContinuous
import platform.CoreHaptics.CHHapticPattern

@OptIn(ExperimentalForeignApi::class)
internal class IOSPatternComposerHandle(
    private val engine: IOSHapticEngineWrapper,
    private val audioSimulator: IOSAudioSimulator = IOSAudioSimulator(),
) : PatternComposerHandle {
    private val discreteLine = IOSDiscreteLine()
    private val continuousLine = IOSContinuousLine()
    private var continuousPlayerId: Int? = null
    private var discretePlayerId: Int? = null
    private var continuousPattern: CHHapticPattern? = null
    private var discretePattern: CHHapticPattern? = null
    private var audioBuffer: IOSAudioBuffer? = null

    override fun parsePattern(pattern: PatternData) {
        discreteLine.reset()
        continuousLine.reset()

        val intensityCurveLine = continuousLine.intensityCurveLine
        val sharpnessCurveLine = continuousLine.sharpnessCurveLine

        pattern.discretePattern.forEach {
            discreteLine.addEvent(timestamp = it.time, intensity = it.amplitude, sharpness = it.frequency)
        }
        pattern.continuousPattern.amplitude.forEach {
            intensityCurveLine.addPoint(time = it.time, value = it.value)
        }
        pattern.continuousPattern.frequency.forEach {
            sharpnessCurveLine.addPoint(time = it.time, value = it.value)
        }

        runCatching {
            if (!intensityCurveLine.isEmpty && !sharpnessCurveLine.isEmpty) {
                val patternToPlay = CHHapticPattern(
                    events = listOf(
                        CHHapticEvent(
                            eventType = CHHapticEventTypeHapticContinuous,
                            parameters = listOf(
                                CHHapticEventParameter(CHHapticEventParameterIDHapticIntensity, 1.0f),
                                CHHapticEventParameter(CHHapticEventParameterIDHapticSharpness, 0.0f),
                            ),
                            relativeTime = 0.0,
                            duration = maxOf(intensityCurveLine.getDuration(), sharpnessCurveLine.getDuration()),
                        )
                    ),
                    parameterCurves = listOf(intensityCurveLine.curve, sharpnessCurveLine.curve),
                    error = null,
                )
                continuousPattern = patternToPlay
                continuousPlayerId = engine.createPlayer(patternToPlay)
            } else {
                continuousPattern = null
                continuousPlayerId = null
            }

            if (discreteLine.getEvents.isNotEmpty()) {
                val patternToPlay = CHHapticPattern(
                    events = discreteLine.getEvents,
                    parameters = emptyList<Any>(),
                    error = null,
                )
                discretePattern = patternToPlay
                discretePlayerId = engine.createPlayer(patternToPlay)
            } else {
                discretePattern = null
                discretePlayerId = null
            }
        }.onFailure {
            log("Error parsing pattern: ${it.message}")
        }

        audioBuffer = audioSimulator.parsePattern(pattern)
    }

    override fun playPattern(pattern: PatternData) {
        parsePattern(pattern)
        play()
    }

    override fun play() {
        audioSimulator.play(audioBuffer)
        continuousPlayerId?.let { engine.playPlayer(it, continuousPattern) }
        discretePlayerId?.let { engine.playPlayer(it, discretePattern) }
    }

    override fun playAudioOnly() {
        audioSimulator.play(audioBuffer)
    }

    override fun stop() {
        audioSimulator.stop()
        continuousPlayerId?.let(engine::stopPlayer)
        discretePlayerId?.let(engine::stopPlayer)
    }
}
