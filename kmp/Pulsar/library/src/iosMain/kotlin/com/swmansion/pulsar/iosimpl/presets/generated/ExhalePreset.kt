package com.swmansion.pulsar.kmp

internal class ExhalePreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(10f, 0.6f), listOf(100f, 0.4f), listOf(200f, 0.25f), listOf(500f, 0.2f), listOf(800f, 0.15f), listOf(1200f, 0.0f)),
        listOf(listOf(0f, 0.6f), listOf(200f, 0.28f), listOf(1200f, 0.15f)),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.6f, 0.6f),
        listOf(150f, 0.35f, 0.3f),
        listOf(500f, 0.2f, 0.15f)
      ),
) {
    override val name: String = "Exhale"
}
