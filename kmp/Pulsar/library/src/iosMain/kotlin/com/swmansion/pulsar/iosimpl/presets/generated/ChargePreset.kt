package com.swmansion.pulsar.kmp.iosimpl.presets.generated

import com.swmansion.pulsar.kmp.IOSPulsarHandle
import com.swmansion.pulsar.kmp.iosimpl.presets.IOSPlayer
internal class ChargePreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(8f, 0.62f), listOf(100f, 0.35f), listOf(200f, 0.0f), listOf(900f, 0.0f), listOf(905f, 0.85f), listOf(980f, 0.5f), listOf(1100f, 0.35f), listOf(1250f, 0.0f), listOf(1600f, 0.0f), listOf(1603f, 1.0f), listOf(1770f, 1.0f), listOf(1873f, 0.334f), listOf(2046f, 0.0f)),
        listOf(listOf(0f, 0.62f), listOf(200f, 0.6f), listOf(900f, 0.68f), listOf(1250f, 0.65f), listOf(1600f, 0.82f), listOf(1680f, 0.7f), listOf(1860f, 0.6f)),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.65f, 0.62f),
        listOf(900f, 0.85f, 0.68f),
        listOf(1600f, 1.0f, 0.82f)
      ),
) {
    override val name: String = "Charge"
}
