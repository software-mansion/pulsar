package com.swmansion.pulsar.kmp

internal class BreathPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(800f, 0.5f), listOf(1600f, 0.05f), listOf(2400f, 0.5f), listOf(3200f, 0.0f)),
        listOf(listOf(0f, 0.15f), listOf(800f, 0.25f), listOf(1600f, 0.1f), listOf(2400f, 0.25f), listOf(3200f, 0.15f)),
      ),
    rawDiscretePattern = listOf(

      ),
) {
    override val name: String = "Breath"
}
