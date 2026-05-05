package com.swmansion.pulsar.kmp.iosimpl.presets.generated

import com.swmansion.pulsar.kmp.IOSPulsarHandle
import com.swmansion.pulsar.kmp.iosimpl.presets.IOSPlayer
internal class PushPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(6f, 0.48f), listOf(50f, 0.15f), listOf(90f, 0.0f)),
        listOf(listOf(0f, 0.52f), listOf(90f, 0.5f)),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.5f, 0.52f)
      ),
) {
    override val name: String = "Push"
}
