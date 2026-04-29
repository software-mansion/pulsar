package com.swmansion.pulsar

internal class WanePreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(20f, 0.42f), listOf(180f, 0.22f), listOf(450f, 0.0f)),
        listOf(listOf(0f, 0.5f), listOf(180f, 0.4f), listOf(450f, 0.35f)),
      ),
    rawDiscretePattern = listOf(

      ),
) {
    override val name: String = "Wane"
}
