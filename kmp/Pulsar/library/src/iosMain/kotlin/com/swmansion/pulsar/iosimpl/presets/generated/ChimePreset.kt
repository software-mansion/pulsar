package com.swmansion.pulsar.kmp.iosimpl.presets.generated

import com.swmansion.pulsar.kmp.IOSPulsarHandle
import com.swmansion.pulsar.kmp.iosimpl.presets.IOSPlayer
internal class ChimePreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(8f, 0.5f), listOf(70f, 0.08f), listOf(150f, 0.0f), listOf(180f, 0.7f), listOf(260f, 0.12f), listOf(380f, 0.0f)),
        listOf(listOf(0f, 0.48f), listOf(150f, 0.48f), listOf(180f, 0.65f), listOf(380f, 0.6f)),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.5f, 0.5f),
        listOf(180f, 0.7f, 0.65f)
      ),
) {
    override val name: String = "Chime"
}
