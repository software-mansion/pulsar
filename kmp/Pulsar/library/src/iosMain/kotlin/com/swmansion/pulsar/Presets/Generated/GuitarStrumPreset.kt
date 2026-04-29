package com.swmansion.pulsar

internal class GuitarStrumPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(5f, 0.9f), listOf(60f, 0.65f), listOf(200f, 0.45f), listOf(450f, 0.28f), listOf(750f, 0.14f), listOf(1100f, 0.05f), listOf(1400f, 0.0f)),
        listOf(listOf(0f, 0.58f), listOf(5f, 0.55f), listOf(1400f, 0.52f)),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.9f, 0.55f)
      ),
) {
    override val name: String = "GuitarStrum"
}
