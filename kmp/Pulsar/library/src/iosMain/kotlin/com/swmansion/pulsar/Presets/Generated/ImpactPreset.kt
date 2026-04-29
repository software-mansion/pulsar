package com.swmansion.pulsar

internal class ImpactPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(5f, 0.85f), listOf(60f, 0.35f), listOf(120f, 0.15f), listOf(200f, 0.0f)),
        listOf(listOf(0f, 0.6f), listOf(200f, 0.35f)),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.9f, 0.6f),
        listOf(80f, 0.5f, 0.5f),
        listOf(150f, 0.25f, 0.4f)
      ),
) {
    override val name: String = "Impact"
}
