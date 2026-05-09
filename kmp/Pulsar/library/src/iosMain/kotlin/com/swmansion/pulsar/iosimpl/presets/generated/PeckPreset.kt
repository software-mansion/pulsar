package com.swmansion.pulsar.kmp.iosimpl.presets.generated

import com.swmansion.pulsar.kmp.IOSPulsarHandle
import com.swmansion.pulsar.kmp.iosimpl.presets.IOSPlayer
internal class PeckPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(4f, 0.55f), listOf(28f, 0.0f)),
        listOf(listOf(0f, 0.58f), listOf(28f, 0.56f)),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.55f, 0.58f)
      ),
) {
    override val name: String = "Peck"
}
