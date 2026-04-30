package com.swmansion.pulsar.kmp

internal class BuzzPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(5f, 0.9f), listOf(100f, 0.85f), listOf(150f, 0.65f), listOf(250f, 0.3f), listOf(350f, 0.0f)),
        listOf(listOf(0f, 0.85f), listOf(350f, 0.8f)),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.9f, 0.85f)
      ),
) {
    override val name: String = "Buzz"
}
