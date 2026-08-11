package com.swmansion.pulsar.kmp.iosimpl.composers

import com.swmansion.pulsar.kmp.PatternComposerHandle
import com.swmansion.pulsar.kmp.PatternData
import com.swmansion.pulsar.kmp.SoundData
import com.swmansion.pulsar.kmp.iosimpl.audio.IOSAudioBuffer
import com.swmansion.pulsar.kmp.iosimpl.audio.IOSAudioSimulator
import com.swmansion.pulsar.kmp.iosimpl.haptics.IOSContinuousLine
import com.swmansion.pulsar.kmp.iosimpl.haptics.IOSDiscreteLine
import com.swmansion.pulsar.kmp.iosimpl.haptics.IOSHapticEngineWrapper
import com.swmansion.pulsar.kmp.iosimpl.haptics.log
import kotlinx.cinterop.ExperimentalForeignApi
import kotlinx.cinterop.ObjCObjectVar
import kotlinx.cinterop.alloc
import kotlinx.cinterop.memScoped
import kotlinx.cinterop.ptr
import kotlinx.cinterop.value
import platform.AVFAudio.AVAudioFile
import platform.AVFAudio.AVAudioPCMBuffer
import platform.Foundation.NSError
import platform.Foundation.NSTemporaryDirectory
import platform.Foundation.NSUUID
import platform.CoreHaptics.CHHapticEvent
import platform.CoreHaptics.CHHapticEventParameter
import platform.CoreHaptics.CHHapticEventParameterIDAudioVolume
import platform.CoreHaptics.CHHapticEventParameterIDHapticIntensity
import platform.CoreHaptics.CHHapticEventParameterIDHapticSharpness
import platform.CoreHaptics.CHHapticEventTypeHapticContinuous
import platform.CoreHaptics.CHHapticPattern
import platform.Foundation.NSBundle
import platform.Foundation.NSFileManager
import platform.Foundation.NSURL

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
    private var hasSound = false
    // A temp file holding the trimmed audio window, when start/duration were given (Core
    // Haptics registers an audio resource by URL only, so a windowed clip is sliced to a
    // file first). Removed on the next parse and on dispose.
    private var tempAudioURL: NSURL? = null

    override fun parsePattern(pattern: PatternData) {
        parse(pattern, audioEvent = null)
    }

    override fun parsePatternWithSound(pattern: PatternData, sound: SoundData) {
        removeTempAudio()
        parse(pattern, audioEvent = makeAudioEvent(sound))
    }

    private fun parse(pattern: PatternData, audioEvent: CHHapticEvent?) {
        discreteLine.reset()
        continuousLine.reset()
        hasSound = audioEvent != null

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

            val discreteEvents = discreteLine.getEvents + listOfNotNull(audioEvent)
            if (discreteEvents.isNotEmpty()) {
                val patternToPlay = CHHapticPattern(
                    events = discreteEvents,
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

    private fun makeAudioEvent(sound: SoundData): CHHapticEvent? {
        val sourceUrl = resolveSoundURL(sound.uri) ?: run {
            log("could not resolve sound uri: ${sound.uri}")
            return null
        }

        val url = if (sound.startMs > 0L || sound.durationMs > 0L) {
            sliceAudioToTempFile(sourceUrl, sound.startMs, sound.durationMs)?.also { tempAudioURL = it }
                ?: sourceUrl
        } else {
            sourceUrl
        }
        val resourceId = engine.registerAudioResource(url) ?: return null
        return CHHapticEvent(
            audioResourceID = resourceId,
            parameters = listOf(
                CHHapticEventParameter(CHHapticEventParameterIDAudioVolume, sound.volume),
            ),
            relativeTime = maxOf(0L, sound.offset).toDouble() / 1000.0,
        )
    }

    private fun sliceAudioToTempFile(sourceUrl: NSURL, startMs: Long, durationMs: Long): NSURL? {
        return runCatching {
            memScoped {
                val readErr = alloc<ObjCObjectVar<NSError?>>()
                val file = AVAudioFile(forReading = sourceUrl, error = readErr.ptr) ?: return@memScoped null
                val format = file.processingFormat
                val sampleRate = format.sampleRate
                val totalFrames = file.length

                val startFrame = maxOf(0L, minOf(totalFrames, (startMs.toDouble() / 1000.0 * sampleRate).toLong()))
                val requested =
                    if (durationMs > 0L) (durationMs.toDouble() / 1000.0 * sampleRate).toLong()
                    else totalFrames - startFrame
                val frameCount = maxOf(0L, minOf(requested, totalFrames - startFrame)).toUInt()
                if (frameCount == 0u) return@memScoped null

                val buffer = AVAudioPCMBuffer(pCMFormat = format, frameCapacity = frameCount)
                    ?: return@memScoped null
                file.framePosition = startFrame
                if (!file.readIntoBuffer(buffer, frameCount, readErr.ptr)) return@memScoped null

                val tempPath = NSTemporaryDirectory() + "pulsar-audio-" + NSUUID().UUIDString + ".caf"
                val tempURL = NSURL.fileURLWithPath(tempPath)
                val writeErr = alloc<ObjCObjectVar<NSError?>>()
                val out = AVAudioFile(forWriting = tempURL, settings = format.settings, error = writeErr.ptr)
                    ?: return@memScoped null
                if (!out.writeFromBuffer(buffer, writeErr.ptr)) return@memScoped null
                tempURL
            }
        }.onFailure { log("could not slice audio window: ${it.message}") }.getOrNull()
    }

    private fun removeTempAudio() {
        tempAudioURL?.path?.let { path ->
            runCatching { NSFileManager.defaultManager.removeItemAtPath(path, null) }
        }
        tempAudioURL = null
    }

    private fun resolveSoundURL(uri: String): NSURL? {
        if (uri.startsWith("file://")) return NSURL(string = uri)
        if (NSFileManager.defaultManager.fileExistsAtPath(uri)) return NSURL.fileURLWithPath(uri)
        val dotIndex = uri.lastIndexOf('.')
        val name = if (dotIndex > 0) uri.substring(0, dotIndex) else uri
        val ext = if (dotIndex > 0) uri.substring(dotIndex + 1) else "wav"
        return NSBundle.mainBundle.URLForResource(name, withExtension = ext)
    }

    override fun playPattern(pattern: PatternData) {
        parsePattern(pattern)
        play()
    }

    override fun play() {
        if (!hasSound) audioSimulator.play(audioBuffer)
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

    override fun dispose() {
        stop()
        continuousPlayerId?.let(engine::removePlayer)
        discretePlayerId?.let(engine::removePlayer)
        continuousPlayerId = null
        discretePlayerId = null
        continuousPattern = null
        discretePattern = null
        audioBuffer = null
        hasSound = false
        removeTempAudio()
    }
}
