package com.swmansion.pulsar.kmp.iosimpl.presets.generated

import com.swmansion.pulsar.kmp.IOSPulsarHandle
import com.swmansion.pulsar.kmp.iosimpl.presets.IOSPlayer
internal class PassingCarPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(80f, 0.1f), listOf(200f, 0.35f), listOf(350f, 0.75f), listOf(450f, 1.0f), listOf(550f, 0.7f), listOf(700f, 0.3f), listOf(900f, 0.08f), listOf(1100f, 0.0f)),
        listOf(listOf(0f, 0.35f), listOf(200f, 0.42f), listOf(450f, 0.38f), listOf(700f, 0.3f), listOf(1100f, 0.22f)),
      ),
    rawDiscretePattern = listOf(

      ),
) {
    override val name: String = "PassingCar"
}
