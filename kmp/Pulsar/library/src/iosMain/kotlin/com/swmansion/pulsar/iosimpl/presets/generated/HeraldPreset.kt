package com.swmansion.pulsar.kmp.iosimpl.presets.generated

import com.swmansion.pulsar.kmp.IOSPulsarHandle
import com.swmansion.pulsar.kmp.iosimpl.presets.IOSPlayer
internal class HeraldPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(),
        listOf(),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.497f, 0.497f),
        listOf(89f, 0.497f, 0.497f),
        listOf(208f, 1.0f, 1.0f)
      ),
) {
    override val name: String = "Herald"
}
