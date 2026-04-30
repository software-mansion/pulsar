package com.swmansion.pulsar.kmp

internal class DissolvePreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(50f, 0.38f), listOf(300f, 0.28f), listOf(600f, 0.2f), listOf(900f, 0.12f), listOf(1200f, 0.0f)),
        listOf(listOf(0f, 0.38f), listOf(1200f, 0.18f)),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.4f, 0.4f),
        listOf(400f, 0.25f, 0.2f)
      ),
) {
    override val name: String = "Dissolve"
}
