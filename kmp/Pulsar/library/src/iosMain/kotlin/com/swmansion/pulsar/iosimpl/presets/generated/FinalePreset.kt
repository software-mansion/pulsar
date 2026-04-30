package com.swmansion.pulsar.kmp.iosimpl.presets.generated

import com.swmansion.pulsar.kmp.IOSPulsarHandle
import com.swmansion.pulsar.kmp.iosimpl.presets.IOSPlayer
internal class FinalePreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(8f, 0.7f), listOf(75f, 0.0f), listOf(200f, 0.7f), listOf(275f, 0.0f), listOf(400f, 0.9f), listOf(520f, 0.3f), listOf(680f, 0.0f)),
        listOf(listOf(0f, 0.55f), listOf(400f, 0.65f), listOf(680f, 0.6f)),
      ),
    rawDiscretePattern = listOf(
        listOf(400f, 0.9f, 0.65f)
      ),
) {
    override val name: String = "Finale"
}
