package com.swmansion.pulsar

internal class HailPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(10f, 0.3f), listOf(400f, 0.3f), listOf(430f, 0.0f)),
        listOf(listOf(0f, 0.7f), listOf(430f, 0.7f)),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.6f, 0.7f),
        listOf(40f, 0.8f, 0.75f),
        listOf(75f, 0.4f, 0.65f),
        listOf(100f, 0.9f, 0.8f),
        listOf(130f, 0.5f, 0.7f),
        listOf(165f, 0.7f, 0.75f),
        listOf(190f, 1.0f, 0.85f),
        listOf(225f, 0.45f, 0.65f),
        listOf(255f, 0.8f, 0.78f),
        listOf(285f, 0.6f, 0.7f),
        listOf(310f, 0.9f, 0.82f),
        listOf(345f, 0.5f, 0.68f),
        listOf(370f, 0.7f, 0.74f)
      ),
) {
    override val name: String = "Hail"
}
