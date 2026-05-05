package com.swmansion.pulsar.kmp.iosimpl.presets.generated

import com.swmansion.pulsar.kmp.IOSPulsarHandle
import com.swmansion.pulsar.kmp.iosimpl.presets.IOSPlayer
internal class BellTollPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(),
        listOf(),
      ),
    rawDiscretePattern = listOf(
        listOf(10f, 1.0f, 0.903f),
        listOf(201f, 1.0f, 0.513f),
        listOf(399f, 0.997f, 0.147f)
      ),
) {
    override val name: String = "BellToll"
}
