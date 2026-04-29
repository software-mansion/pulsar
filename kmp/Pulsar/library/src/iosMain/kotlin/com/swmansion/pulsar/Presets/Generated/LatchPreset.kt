package com.swmansion.pulsar

internal class LatchPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(5f, 0.72f), listOf(60f, 0.15f), listOf(100f, 0.38f), listOf(170f, 0.08f), listOf(230f, 0.0f)),
        listOf(listOf(0f, 0.68f), listOf(100f, 0.45f), listOf(230f, 0.42f)),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.75f, 0.68f),
        listOf(100f, 0.4f, 0.45f)
      ),
) {
    override val name: String = "Latch"
}
