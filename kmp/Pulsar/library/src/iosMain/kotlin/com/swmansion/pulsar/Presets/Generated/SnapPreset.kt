package com.swmansion.pulsar

internal class SnapPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(4f, 0.7f), listOf(30f, 0.15f), listOf(40f, 0.3f), listOf(90f, 0.0f)),
        listOf(listOf(0f, 0.55f), listOf(40f, 0.47f), listOf(90f, 0.45f)),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.7f, 0.55f),
        listOf(40f, 0.3f, 0.48f)
      ),
) {
    override val name: String = "Snap"
}
