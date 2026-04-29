package com.swmansion.pulsar

internal class DogBarkPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(5f, 0.9f), listOf(50f, 0.65f), listOf(120f, 0.15f), listOf(200f, 0.0f), listOf(280f, 0.85f), listOf(325f, 0.6f), listOf(400f, 0.12f), listOf(500f, 0.0f)),
        listOf(listOf(0f, 0.2f), listOf(500f, 0.2f)),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.9f, 0.22f),
        listOf(280f, 0.85f, 0.22f)
      ),
) {
    override val name: String = "DogBark"
}
