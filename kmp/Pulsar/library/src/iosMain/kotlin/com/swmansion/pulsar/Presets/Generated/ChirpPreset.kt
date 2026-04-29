package com.swmansion.pulsar

internal class ChirpPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(10f, 0.35f), listOf(80f, 0.0f), listOf(150f, 0.45f), listOf(230f, 0.0f), listOf(280f, 0.55f), listOf(360f, 0.0f)),
        listOf(listOf(0f, 0.6f), listOf(360f, 0.72f)),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.4f, 0.65f),
        listOf(150f, 0.5f, 0.68f),
        listOf(280f, 0.6f, 0.72f)
      ),
) {
    override val name: String = "Chirp"
}
