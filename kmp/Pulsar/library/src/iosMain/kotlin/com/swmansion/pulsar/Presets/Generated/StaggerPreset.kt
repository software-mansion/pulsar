package com.swmansion.pulsar

internal class StaggerPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(5f, 0.68f), listOf(45f, 0.15f), listOf(60f, 0.38f), listOf(100f, 0.15f), listOf(120f, 0.52f), listOf(162f, 0.12f), listOf(180f, 0.33f), listOf(320f, 0.0f)),
        listOf(listOf(0f, 0.55f), listOf(60f, 0.65f), listOf(120f, 0.5f), listOf(180f, 0.6f), listOf(320f, 0.55f)),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.7f, 0.55f),
        listOf(60f, 0.4f, 0.65f),
        listOf(120f, 0.55f, 0.5f),
        listOf(180f, 0.35f, 0.6f)
      ),
) {
    override val name: String = "Stagger"
}
