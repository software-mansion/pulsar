package com.swmansion.pulsar.kmp.iosimpl.presets.generated

import com.swmansion.pulsar.kmp.IOSPulsarHandle
import com.swmansion.pulsar.kmp.iosimpl.presets.IOSPlayer
internal class SwellPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(10f, 0.45f), listOf(75f, 0.0f), listOf(350f, 0.65f), listOf(425f, 0.0f)),
        listOf(listOf(0f, 0.45f), listOf(350f, 0.52f), listOf(425f, 0.52f)),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.45f, 0.48f),
        listOf(350f, 0.65f, 0.52f)
      ),
) {
    override val name: String = "Swell"
}
