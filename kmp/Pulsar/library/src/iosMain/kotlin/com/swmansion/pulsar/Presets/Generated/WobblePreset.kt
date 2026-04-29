package com.swmansion.pulsar

internal class WobblePreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(5f, 0.65f), listOf(80f, 0.5f), listOf(180f, 0.0f)),
        listOf(listOf(0f, 0.82f), listOf(180f, 0.75f)),
      ),
    rawDiscretePattern = listOf(

      ),
) {
    override val name: String = "Wobble"
}
