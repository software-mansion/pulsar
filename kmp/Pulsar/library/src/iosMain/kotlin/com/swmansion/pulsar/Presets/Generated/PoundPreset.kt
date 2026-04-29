package com.swmansion.pulsar

internal class PoundPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(8f, 0.95f), listOf(65f, 0.0f), listOf(100f, 0.95f), listOf(165f, 0.0f), listOf(200f, 0.95f), listOf(265f, 0.0f)),
        listOf(listOf(0f, 0.72f), listOf(265f, 0.72f)),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.95f, 0.7f),
        listOf(100f, 0.95f, 0.7f),
        listOf(200f, 0.95f, 0.7f)
      ),
) {
    override val name: String = "Pound"
}
