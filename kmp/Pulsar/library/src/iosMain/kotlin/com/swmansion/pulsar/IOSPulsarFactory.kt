package com.swmansion.pulsar

import kotlinx.cinterop.ExperimentalForeignApi
import platform.CoreHaptics.CHHapticDynamicParameter
import platform.CoreHaptics.CHHapticDynamicParameterIDHapticIntensityControl
import platform.CoreHaptics.CHHapticDynamicParameterIDHapticSharpnessControl
import platform.CoreHaptics.CHHapticEngine
import platform.CoreHaptics.CHHapticEvent
import platform.CoreHaptics.CHHapticEventParameter
import platform.CoreHaptics.CHHapticEventParameterIDHapticIntensity
import platform.CoreHaptics.CHHapticEventParameterIDHapticSharpness
import platform.CoreHaptics.CHHapticEventTypeHapticContinuous
import platform.CoreHaptics.CHHapticEventTypeHapticTransient
import platform.CoreHaptics.CHHapticParameterCurve
import platform.CoreHaptics.CHHapticParameterCurveControlPoint
import platform.CoreHaptics.CHHapticPattern
import platform.CoreHaptics.CHHapticPatternPlayerProtocol
import platform.CoreHaptics.CHHapticAdvancedPatternPlayerProtocol
import platform.Foundation.NSLog

internal actual fun defaultPulsarPlatformFactory(): PulsarPlatformFactory? = IOSPulsarFactory()

private class IOSPulsarFactory : PulsarPlatformFactory {
    override fun createPulsar(): PulsarPlatformHandle = IOSPulsarHandle()
}

private class IOSPulsarHandle : PulsarPlatformHandle {
    private val engine = IOSHapticEngine()
    private val presetsHandle by lazy { IOSPulsarPresetsHandle(engine) }
    private val patternComposerHandle by lazy { IOSPatternComposerHandle(engine) }
    private val realtimeComposerHandle by lazy { IOSRealtimeComposerHandle(engine) }

    override fun presets(): PulsarPresetsHandle = presetsHandle

    override fun patternComposer(): PatternComposerHandle = patternComposerHandle

    override fun realtimeComposer(): RealtimeComposerHandle = realtimeComposerHandle

    override fun preloadPreset(name: String) {
        presetsHandle.preload(name)
    }

    override fun enableHaptics(state: Boolean) {
        engine.enableHaptics(state)
    }

    override fun enableSound(state: Boolean) = Unit

    override fun enableCache(state: Boolean) {
        presetsHandle.enableCache(state)
    }

    override fun clearCache() {
        presetsHandle.clearCache()
    }

    override fun stopHaptics() {
        patternComposerHandle.stop()
        realtimeComposerHandle.stop()
        engine.stopHaptics()
    }

    override fun isHapticsSupported(): Boolean = engine.isHapticsSupported()
}

@OptIn(ExperimentalForeignApi::class)
internal class IOSHapticEngine {
    private var engine: CHHapticEngine? = null
    private var initialized = false
    private var hapticsEnabled = true
    private val playerRegistry = mutableMapOf<Int, CHHapticPatternPlayerProtocol>()
    private val playerCreationOrder = mutableListOf<Int>()
    private var nextPlayerId = 0
    private var realtimePlayer: CHHapticAdvancedPatternPlayerProtocol? = null

    init {
        if (isHapticsSupported()) {
            startEngine()
        }
    }

    fun enableHaptics(state: Boolean) {
        if (hapticsEnabled == state) return
        hapticsEnabled = state
        if (state) {
            startEngine()
        } else {
            stopHaptics()
        }
    }

    fun stopHaptics() {
        if (!initialized) return
        playerRegistry.values.forEach { runCatching { it.stopAtTime(0.0, null) } }
        runCatching { realtimePlayer?.stopAtTime(0.0, null) }
        playerRegistry.clear()
        playerCreationOrder.clear()
        realtimePlayer = null
        runCatching { engine?.stopWithCompletionHandler(null) }
        initialized = false
    }

    fun createPlayer(pattern: CHHapticPattern): Int? {
        startEngine()
        val player = makePlayer(pattern) ?: return null
        evictOldestPlayerIfNeeded()
        val id = nextPlayerId++
        playerRegistry[id] = player
        playerCreationOrder += id
        return id
    }

    fun playPlayer(id: Int, pattern: CHHapticPattern? = null) {
        var player = playerRegistry[id]
        if (player == null && pattern != null) {
            startEngine()
            player = makePlayer(pattern)
            if (player != null) {
                evictOldestPlayerIfNeeded()
                playerRegistry[id] = player
                playerCreationOrder += id
            }
        }
        runCatching { player?.startAtTime(0.0, null) }
            .onFailure { log("Error starting player: ${it.message}") }
    }

    fun stopPlayer(id: Int) {
        runCatching { playerRegistry[id]?.stopAtTime(0.0, null) }
    }

    fun getRealtimePlayer(): CHHapticAdvancedPatternPlayerProtocol? {
        startEngine()
        realtimePlayer?.let { return it }
        val pattern = runCatching {
            CHHapticPattern(
                events = listOf(
                    CHHapticEvent(
                        eventType = CHHapticEventTypeHapticContinuous,
                        parameters = listOf(
                            CHHapticEventParameter(CHHapticEventParameterIDHapticIntensity, 1.0f),
                            CHHapticEventParameter(CHHapticEventParameterIDHapticSharpness, 0.0f),
                        ),
                        relativeTime = 0.0,
                        duration = 100.0,
                    )
                ),
                parameters = emptyList<Any>(),
                error = null,
            )
        }.getOrElse {
            log("Error creating realtime pattern: ${it.message}")
            return null
        }
        realtimePlayer = makeAdvancedPlayer(pattern)
        return realtimePlayer
    }

    fun isHapticsSupported(): Boolean {
        return CHHapticEngine.capabilitiesForHardware().supportsHaptics()
    }

    private fun startEngine() {
        if (initialized || !hapticsEnabled || !isHapticsSupported()) return
        val newEngine = engine ?: CHHapticEngine(andReturnError = null).also { engine = it }
        runCatching {
            newEngine.startAndReturnError(outError = null)
            initialized = true
        }.onFailure {
            initialized = false
            engine = null
            log("Error starting engine: ${it.message}")
        }
    }

    private fun makePlayer(pattern: CHHapticPattern): CHHapticPatternPlayerProtocol? {
        val player = engine?.createPlayerWithPattern(pattern, error = null)
        if (player == null) {
            log("Error making haptic player")
        }
        return player
    }

    private fun makeAdvancedPlayer(pattern: CHHapticPattern): CHHapticAdvancedPatternPlayerProtocol? {
        val player = engine?.createAdvancedPlayerWithPattern(pattern, error = null)
        if (player == null) {
            log("Error making realtime haptic player")
        }
        return player
    }

    private fun evictOldestPlayerIfNeeded() {
        if (playerRegistry.size < 20) return
        val oldestId = playerCreationOrder.removeAt(0)
        runCatching { playerRegistry[oldestId]?.stopAtTime(0.0, null) }
        playerRegistry.remove(oldestId)
    }
}

@OptIn(ExperimentalForeignApi::class)
internal class IOSPatternComposerHandle(
    private val engine: IOSHapticEngine,
) : PatternComposerHandle {
    private var continuousPlayerId: Int? = null
    private var discretePlayerId: Int? = null
    private var continuousPattern: CHHapticPattern? = null
    private var discretePattern: CHHapticPattern? = null

    override fun parsePattern(pattern: PatternData) {
        val intensityCurveLine = IOSCurveLine(CHHapticDynamicParameterIDHapticIntensityControl)
        val sharpnessCurveLine = IOSCurveLine(CHHapticDynamicParameterIDHapticSharpnessControl)

        pattern.continuousPattern.amplitude.forEach {
            intensityCurveLine.addPoint(it.time.toDouble(), it.value)
        }
        pattern.continuousPattern.frequency.forEach {
            sharpnessCurveLine.addPoint(it.time.toDouble(), it.value)
        }

        continuousPattern = if (!intensityCurveLine.isEmpty && !sharpnessCurveLine.isEmpty) {
            runCatching {
                CHHapticPattern(
                    events = listOf(
                        CHHapticEvent(
                            eventType = CHHapticEventTypeHapticContinuous,
                            parameters = listOf(
                                CHHapticEventParameter(CHHapticEventParameterIDHapticIntensity, 1.0f),
                                CHHapticEventParameter(CHHapticEventParameterIDHapticSharpness, 0.0f),
                            ),
                            relativeTime = 0.0,
                            duration = maxOf(intensityCurveLine.duration, sharpnessCurveLine.duration),
                        )
                    ),
                    parameterCurves = listOf(intensityCurveLine.curve(), sharpnessCurveLine.curve()),
                    error = null,
                )
            }.getOrNull()
        } else {
            null
        }
        continuousPlayerId = continuousPattern?.let(engine::createPlayer)

        val discreteEvents = pattern.discretePattern.map {
            CHHapticEvent(
                eventType = CHHapticEventTypeHapticTransient,
                parameters = listOf(
                    CHHapticEventParameter(CHHapticEventParameterIDHapticIntensity, it.amplitude),
                    CHHapticEventParameter(CHHapticEventParameterIDHapticSharpness, it.frequency),
                ),
                relativeTime = it.time.toDouble() / 1000.0,
            )
        }
        discretePattern = if (discreteEvents.isNotEmpty()) {
            CHHapticPattern(events = discreteEvents, parameters = emptyList<Any>(), error = null)
        } else {
            null
        }
        discretePlayerId = discretePattern?.let(engine::createPlayer)
    }

    override fun play() {
        continuousPlayerId?.let { engine.playPlayer(it, continuousPattern) }
        discretePlayerId?.let { engine.playPlayer(it, discretePattern) }
    }

    override fun playAudioOnly() = Unit

    override fun stop() {
        continuousPlayerId?.let(engine::stopPlayer)
        discretePlayerId?.let(engine::stopPlayer)
    }
}

@OptIn(ExperimentalForeignApi::class)
internal class IOSRealtimeComposerHandle(
    private val engine: IOSHapticEngine,
) : RealtimeComposerHandle {
    private var playing = false

    override fun set(amplitude: Float, frequency: Float) {
        if (!playing) {
            start(amplitude, frequency)
        }
        val player = engine.getRealtimePlayer() ?: return
        val parameters = listOf(
            CHHapticDynamicParameter(
                parameterID = CHHapticDynamicParameterIDHapticIntensityControl,
                value = amplitude.coerceIn(0f, 1f),
                relativeTime = 0.0,
            ),
            CHHapticDynamicParameter(
                parameterID = CHHapticDynamicParameterIDHapticSharpnessControl,
                value = frequency.coerceIn(0f, 1f),
                relativeTime = 0.0,
            ),
        )
        runCatching { player.sendParameters(parameters, atTime = 0.0, error = null) }
            .onFailure { log("Failed to update realtime haptic parameters: ${it.message}") }
    }

    override fun playDiscrete(amplitude: Float, frequency: Float) {
        if (!engine.isHapticsSupported()) return
        val pattern = CHHapticPattern(
            events = listOf(
                CHHapticEvent(
                    eventType = CHHapticEventTypeHapticTransient,
                    parameters = listOf(
                        CHHapticEventParameter(CHHapticEventParameterIDHapticIntensity, amplitude.coerceIn(0f, 1f)),
                        CHHapticEventParameter(CHHapticEventParameterIDHapticSharpness, frequency.coerceIn(0f, 1f)),
                    ),
                    relativeTime = 0.0,
                )
            ),
            parameters = emptyList<Any>(),
            error = null,
        )
        engine.createPlayer(pattern)?.let { engine.playPlayer(it, pattern) }
    }

    override fun stop() {
        if (!playing) return
        runCatching { engine.getRealtimePlayer()?.stopAtTime(0.0, null) }
        playing = false
    }

    override fun isActive(): Boolean = playing

    private fun start(amplitude: Float, frequency: Float) {
        if (playing) return
        val player = engine.getRealtimePlayer() ?: return
        playing = true
        runCatching {
            player.startAtTime(0.0, error = null)
        }.onFailure {
            playing = false
            log("Error starting realtime haptic player: ${it.message}")
        }
        if (playing) {
            set(amplitude, frequency)
        }
    }
}

@OptIn(ExperimentalForeignApi::class)
private class IOSCurveLine(
    private val parameterId: String?,
) {
    private val points = mutableListOf<CHHapticParameterCurveControlPoint>()
    var duration: Double = 0.0
        private set

    val isEmpty: Boolean
        get() = points.isEmpty()

    fun addPoint(timeMillis: Double, value: Float) {
        val timeSeconds = timeMillis / 1000.0
        if (points.isEmpty() && timeSeconds > 0.0) {
            points += CHHapticParameterCurveControlPoint(0.0, value)
        }
        points += CHHapticParameterCurveControlPoint(timeSeconds, value)
        duration = maxOf(duration, timeSeconds)
    }

    fun curve(): CHHapticParameterCurve {
        return CHHapticParameterCurve(parameterID = parameterId, controlPoints = points, relativeTime = 0.0)
    }
}

private fun log(message: String) {
    NSLog("Pulsar: $message")
}
