package com.swmansion.pulsar

internal class BloomPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(15f, 0.28f), listOf(80f, 0.15f), listOf(120f, 0.5f), listOf(200f, 0.15f), listOf(300f, 0.0f)),
        listOf(listOf(0f, 0.48f), listOf(200f, 0.62f), listOf(300f, 0.58f)),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.3f, 0.5f),
        listOf(120f, 0.55f, 0.62f)
      ),
) {
    override val name: String = "Bloom"
}
