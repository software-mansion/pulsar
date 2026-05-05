package com.swmansion.pulsar.kmp.iosimpl.presets.generated

import com.swmansion.pulsar.kmp.IOSPulsarHandle
import com.swmansion.pulsar.kmp.iosimpl.presets.IOSPlayer
internal class BongoPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(),
        listOf(),
      ),
    rawDiscretePattern = listOf(
        listOf(1f, 0.594f, 0.594f),
        listOf(73f, 0.588f, 0.588f),
        listOf(151f, 0.588f, 0.588f),
        listOf(299f, 0.4f, 0.4f),
        listOf(380f, 0.394f, 0.394f),
        listOf(451f, 0.394f, 0.394f)
      ),
) {
    override val name: String = "Bongo"
}
