package com.swmansion.pulsar.kmp.iosimpl.presets.generated

import com.swmansion.pulsar.kmp.IOSPulsarHandle
import com.swmansion.pulsar.kmp.iosimpl.presets.IOSPlayer
internal class PipPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(5f, 0.32f), listOf(40f, 0.0f), listOf(60f, 0.22f), listOf(100f, 0.0f)),
        listOf(listOf(0f, 0.65f), listOf(100f, 0.7f)),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.35f, 0.65f),
        listOf(60f, 0.25f, 0.7f)
      ),
) {
    override val name: String = "Pip"
}
