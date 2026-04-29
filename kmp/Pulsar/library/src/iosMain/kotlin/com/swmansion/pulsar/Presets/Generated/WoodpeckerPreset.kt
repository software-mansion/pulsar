package com.swmansion.pulsar

internal class WoodpeckerPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(5f, 0.65f), listOf(430f, 0.65f), listOf(460f, 0.0f)),
        listOf(listOf(0f, 0.82f), listOf(460f, 0.82f)),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.75f, 0.82f),
        listOf(45f, 0.75f, 0.82f),
        listOf(90f, 0.75f, 0.82f),
        listOf(135f, 0.75f, 0.82f),
        listOf(180f, 0.75f, 0.82f),
        listOf(225f, 0.75f, 0.82f),
        listOf(270f, 0.75f, 0.82f),
        listOf(315f, 0.75f, 0.82f),
        listOf(360f, 0.75f, 0.82f),
        listOf(405f, 0.75f, 0.82f)
      ),
) {
    override val name: String = "Woodpecker"
}
