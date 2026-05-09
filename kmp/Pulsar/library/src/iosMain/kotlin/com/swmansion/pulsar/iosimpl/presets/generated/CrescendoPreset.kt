package com.swmansion.pulsar.kmp.iosimpl.presets.generated

import com.swmansion.pulsar.kmp.IOSPulsarHandle
import com.swmansion.pulsar.kmp.iosimpl.presets.IOSPlayer
internal class CrescendoPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(),
        listOf(),
      ),
    rawDiscretePattern = listOf(
        listOf(1f, 0.303f, 0.303f),
        listOf(99f, 0.397f, 0.397f),
        listOf(202f, 0.506f, 0.506f),
        listOf(300f, 0.609f, 0.609f),
        listOf(399f, 0.703f, 0.703f),
        listOf(502f, 0.809f, 0.809f),
        listOf(601f, 0.981f, 0.981f)
      ),
) {
    override val name: String = "Crescendo"
}
