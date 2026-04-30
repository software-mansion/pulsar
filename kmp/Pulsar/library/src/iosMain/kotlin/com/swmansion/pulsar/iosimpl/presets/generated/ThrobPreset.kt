package com.swmansion.pulsar.kmp

internal class ThrobPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(8f, 0.8f), listOf(80f, 0.0f), listOf(150f, 0.45f), listOf(230f, 0.0f)),
        listOf(listOf(0f, 0.65f), listOf(230f, 0.6f)),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.8f, 0.65f),
        listOf(150f, 0.45f, 0.6f)
      ),
) {
    override val name: String = "Throb"
}
