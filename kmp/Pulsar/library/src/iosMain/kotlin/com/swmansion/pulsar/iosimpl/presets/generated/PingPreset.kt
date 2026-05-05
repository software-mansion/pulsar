package com.swmansion.pulsar.kmp.iosimpl.presets.generated

import com.swmansion.pulsar.kmp.IOSPulsarHandle
import com.swmansion.pulsar.kmp.iosimpl.presets.IOSPlayer
internal class PingPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(4f, 0.65f), listOf(35f, 0.0f)),
        listOf(listOf(0f, 0.72f), listOf(35f, 0.68f)),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.65f, 0.72f)
      ),
) {
    override val name: String = "Ping"
}
