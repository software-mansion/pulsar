package com.swmansion.pulsar

internal class PealPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(8f, 0.75f), listOf(80f, 0.0f), listOf(180f, 0.75f), listOf(258f, 0.0f), listOf(360f, 0.75f), listOf(438f, 0.0f)),
        listOf(listOf(0f, 0.62f), listOf(438f, 0.62f)),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.75f, 0.62f),
        listOf(180f, 0.75f, 0.62f),
        listOf(360f, 0.75f, 0.62f)
      ),
) {
    override val name: String = "Peal"
}
