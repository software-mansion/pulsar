package com.swmansion.pulsar

internal class FizzPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(8f, 0.5f), listOf(60f, 0.15f), listOf(120f, 0.6f), listOf(178f, 0.1f), listOf(230f, 0.7f), listOf(290f, 0.15f), listOf(330f, 0.75f), listOf(390f, 0.2f), listOf(420f, 0.65f), listOf(500f, 0.0f)),
        listOf(listOf(0f, 0.62f), listOf(420f, 0.72f), listOf(500f, 0.68f)),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.5f, 0.65f),
        listOf(120f, 0.6f, 0.7f),
        listOf(230f, 0.7f, 0.73f),
        listOf(330f, 0.75f, 0.75f),
        listOf(420f, 0.65f, 0.7f)
      ),
) {
    override val name: String = "Fizz"
}
