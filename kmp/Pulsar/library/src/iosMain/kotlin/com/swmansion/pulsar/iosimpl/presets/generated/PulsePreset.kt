package com.swmansion.pulsar.kmp.iosimpl.presets.generated

import com.swmansion.pulsar.kmp.IOSPulsarHandle
import com.swmansion.pulsar.kmp.iosimpl.presets.IOSPlayer
internal class PulsePreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(300f, 0.3f), listOf(700f, 0.3f), listOf(1000f, 0.0f), listOf(1300f, 0.3f), listOf(1700f, 0.3f), listOf(2000f, 0.0f)),
        listOf(listOf(0f, 0.4f), listOf(2000f, 0.4f)),
      ),
    rawDiscretePattern = listOf(

      ),
) {
    override val name: String = "Pulse"
}
