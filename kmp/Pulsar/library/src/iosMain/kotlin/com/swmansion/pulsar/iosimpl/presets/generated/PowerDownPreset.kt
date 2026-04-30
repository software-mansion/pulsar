package com.swmansion.pulsar.kmp.iosimpl.presets.generated

import com.swmansion.pulsar.kmp.IOSPulsarHandle
import com.swmansion.pulsar.kmp.iosimpl.presets.IOSPlayer
internal class PowerDownPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.8f), listOf(200f, 0.7f), listOf(450f, 0.55f), listOf(750f, 0.4f), listOf(1050f, 0.25f), listOf(1350f, 0.12f), listOf(1600f, 0.03f), listOf(1800f, 0.0f)),
        listOf(listOf(0f, 0.6f), listOf(1800f, 0.03f)),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.8f, 0.6f)
      ),
) {
    override val name: String = "PowerDown"
}
