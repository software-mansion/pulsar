package com.swmansion.pulsar

internal class StompPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(),
        listOf(),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 1.0f, 0.3f),
        listOf(75f, 1.0f, 0.3f),
        listOf(150f, 1.0f, 0.3f)
      ),
) {
    override val name: String = "Stomp"
}
