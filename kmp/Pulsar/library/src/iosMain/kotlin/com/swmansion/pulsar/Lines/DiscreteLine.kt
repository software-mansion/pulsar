package com.swmansion.pulsar

import kotlinx.cinterop.ExperimentalForeignApi
import platform.CoreHaptics.CHHapticEvent
import platform.CoreHaptics.CHHapticEventParameter
import platform.CoreHaptics.CHHapticEventParameterIDHapticIntensity
import platform.CoreHaptics.CHHapticEventParameterIDHapticSharpness
import platform.CoreHaptics.CHHapticEventTypeHapticTransient

@OptIn(ExperimentalForeignApi::class)
internal class IOSDiscreteLine {
    private val events = mutableListOf<CHHapticEvent>()

    val getEvents: List<CHHapticEvent>
        get() = events

    fun addEvent(timestamp: Long, intensity: Float = 1f, sharpness: Float = 1f) {
        events += CHHapticEvent(
            eventType = CHHapticEventTypeHapticTransient,
            parameters = listOf(
                CHHapticEventParameter(CHHapticEventParameterIDHapticIntensity, intensity),
                CHHapticEventParameter(CHHapticEventParameterIDHapticSharpness, sharpness),
            ),
            relativeTime = timestamp.toDouble() / 1000.0,
        )
    }

    fun reset() {
        events.clear()
    }
}
