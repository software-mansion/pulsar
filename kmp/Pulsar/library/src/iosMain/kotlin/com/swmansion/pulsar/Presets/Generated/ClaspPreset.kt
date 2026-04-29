package com.swmansion.pulsar

internal class ClaspPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(5f, 0.65f), listOf(45f, 0.0f), listOf(80f, 0.9f), listOf(130f, 0.3f), listOf(220f, 0.0f)),
        listOf(listOf(0f, 0.72f), listOf(80f, 0.78f), listOf(220f, 0.75f)),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.65f, 0.72f),
        listOf(80f, 0.9f, 0.78f)
      ),
) {
    override val name: String = "Clasp"
}
