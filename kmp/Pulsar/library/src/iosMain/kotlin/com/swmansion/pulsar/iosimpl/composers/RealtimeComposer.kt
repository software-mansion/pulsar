package com.swmansion.pulsar.kmp.iosimpl.composers

import com.swmansion.pulsar.kmp.RealtimeComposerHandle
import com.swmansion.pulsar.kmp.iosimpl.haptics.IOSHapticEngineWrapper
import com.swmansion.pulsar.kmp.iosimpl.haptics.log
import kotlinx.cinterop.ExperimentalForeignApi
import platform.CoreHaptics.CHHapticDynamicParameter
import platform.CoreHaptics.CHHapticDynamicParameterIDHapticIntensityControl
import platform.CoreHaptics.CHHapticDynamicParameterIDHapticSharpnessControl
import platform.CoreHaptics.CHHapticEvent
import platform.CoreHaptics.CHHapticEventParameter
import platform.CoreHaptics.CHHapticEventParameterIDHapticIntensity
import platform.CoreHaptics.CHHapticEventParameterIDHapticSharpness
import platform.CoreHaptics.CHHapticEventTypeHapticTransient
import platform.CoreHaptics.CHHapticPattern

@OptIn(ExperimentalForeignApi::class)
internal class IOSRealtimeComposerHandle(
    private val engine: IOSHapticEngineWrapper,
) : RealtimeComposerHandle {
    private var isPlaying = false

    override fun set(amplitude: Float, frequency: Float) {
        if (!engine.isHapticsEnabled) return
        if (!isPlaying) {
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
            .onFailure { log("Failed to update haptic parameters: ${it.message}") }
    }

    override fun playDiscrete(amplitude: Float, frequency: Float) {
        if (!engine.isHapticsEnabled || !engine.isHapticsSupported()) return
        val event = CHHapticEvent(
            eventType = CHHapticEventTypeHapticTransient,
            parameters = listOf(
                CHHapticEventParameter(CHHapticEventParameterIDHapticIntensity, amplitude.coerceIn(0f, 1f)),
                CHHapticEventParameter(CHHapticEventParameterIDHapticSharpness, frequency.coerceIn(0f, 1f)),
            ),
            relativeTime = 0.0,
        )
        val pattern = CHHapticPattern(events = listOf(event), parameters = emptyList<Any>(), error = null)
        engine.createPlayer(pattern)?.let { engine.playPlayer(it, pattern) }
    }

    override fun stop() {
        if (!isPlaying) return
        runCatching { engine.getRealtimePlayer()?.stopAtTime(0.0, null) }
            .onFailure { log("Error stopping realtime player: ${it.message}") }
        isPlaying = false
    }

    override fun isActive(): Boolean = isPlaying

    private fun start(amplitude: Float = 0f, frequency: Float = 0f) {
        if (isPlaying) return
        val player = engine.getRealtimePlayer() ?: return
        isPlaying = true
        set(amplitude, frequency)
        runCatching { player.startAtTime(0.0, error = null) }
            .onFailure {
                isPlaying = false
                log("Error starting realtime player: ${it.message}")
            }
    }
}
