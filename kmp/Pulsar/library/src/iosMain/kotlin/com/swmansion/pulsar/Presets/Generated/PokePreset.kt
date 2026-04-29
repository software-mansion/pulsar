package com.swmansion.pulsar

internal class PokePreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(8f, 0.6f), listOf(62f, 0.0f), listOf(100f, 0.6f), listOf(162f, 0.0f), listOf(200f, 0.7f), listOf(280f, 0.0f)),
        listOf(listOf(0f, 0.6f), listOf(200f, 0.65f), listOf(280f, 0.63f)),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.6f, 0.6f),
        listOf(100f, 0.6f, 0.6f),
        listOf(200f, 0.7f, 0.65f)
      ),
) {
    override val name: String = "Poke"
}
