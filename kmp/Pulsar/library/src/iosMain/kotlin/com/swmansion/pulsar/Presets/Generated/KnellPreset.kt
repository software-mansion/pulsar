package com.swmansion.pulsar

internal class KnellPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(8f, 0.9f), listOf(200f, 0.5f), listOf(300f, 0.1f), listOf(350f, 0.5f), listOf(430f, 0.1f), listOf(550f, 0.0f)),
        listOf(listOf(0f, 0.58f), listOf(300f, 0.52f), listOf(550f, 0.48f)),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.9f, 0.58f),
        listOf(350f, 0.5f, 0.5f)
      ),
) {
    override val name: String = "Knell"
}
