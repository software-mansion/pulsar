package com.swmansion.pulsar.kmp.iosimpl.presets.generated

import com.swmansion.pulsar.kmp.IOSPulsarHandle
import com.swmansion.pulsar.kmp.iosimpl.presets.IOSPlayer
internal class TickTockPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(),
        listOf(),
      ),
    rawDiscretePattern = listOf(
        listOf(1f, 0.8f, 0.8f),
        listOf(400f, 0.4f, 0.4f),
        listOf(800f, 0.8f, 0.8f),
        listOf(1200f, 0.4f, 0.4f)
      ),
) {
    override val name: String = "TickTock"
}
