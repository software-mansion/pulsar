package com.swmansion.pulsar.kmp.iosimpl.presets.generated

import com.swmansion.pulsar.kmp.IOSPulsarHandle
import com.swmansion.pulsar.kmp.iosimpl.presets.IOSPlayer
internal class StampPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(8f, 0.55f), listOf(55f, 0.0f), listOf(150f, 0.55f), listOf(205f, 0.0f)),
        listOf(listOf(0f, 0.5f), listOf(205f, 0.5f)),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.55f, 0.5f),
        listOf(150f, 0.55f, 0.5f)
      ),
) {
    override val name: String = "Stamp"
}
