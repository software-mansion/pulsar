package com.swmansion.pulsar.kmp.iosimpl.presets.generated

import com.swmansion.pulsar.kmp.IOSPulsarHandle
import com.swmansion.pulsar.kmp.iosimpl.presets.IOSPlayer
internal class RustlePreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(8f, 0.65f), listOf(75f, 0.05f), listOf(200f, 0.3f), listOf(290f, 0.0f)),
        listOf(listOf(0f, 0.6f), listOf(200f, 0.48f), listOf(290f, 0.45f)),
      ),
    rawDiscretePattern = listOf(

      ),
) {
    override val name: String = "Rustle"
}
