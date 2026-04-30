package com.swmansion.pulsar.kmp.iosimpl.presets.generated

import com.swmansion.pulsar.kmp.IOSPulsarHandle
import com.swmansion.pulsar.kmp.iosimpl.presets.IOSPlayer
internal class FeatherPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(10f, 0.45f), listOf(70f, 0.15f), listOf(180f, 0.0f)),
        listOf(listOf(0f, 0.42f), listOf(180f, 0.38f)),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.45f, 0.45f)
      ),
) {
    override val name: String = "Feather"
}
