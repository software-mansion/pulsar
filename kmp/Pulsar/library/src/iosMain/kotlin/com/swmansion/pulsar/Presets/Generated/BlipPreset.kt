package com.swmansion.pulsar

internal class BlipPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(10f, 0.5f), listOf(100f, 0.35f), listOf(200f, 0.0f)),
        listOf(listOf(0f, 0.6f), listOf(200f, 0.58f)),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.55f, 0.6f)
      ),
) {
    override val name: String = "Blip"
}
