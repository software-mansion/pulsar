package com.swmansion.pulsar

internal class FlickPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(6f, 0.4f), listOf(45f, 0.05f), listOf(80f, 0.0f)),
        listOf(listOf(0f, 0.5f), listOf(80f, 0.5f)),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.42f, 0.5f)
      ),
) {
    override val name: String = "Flick"
}
