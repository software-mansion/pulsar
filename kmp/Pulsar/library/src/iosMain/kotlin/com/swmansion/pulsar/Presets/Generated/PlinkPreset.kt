package com.swmansion.pulsar

internal class PlinkPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(8f, 0.55f), listOf(65f, 0.0f), listOf(150f, 0.55f), listOf(215f, 0.0f)),
        listOf(listOf(0f, 0.52f), listOf(215f, 0.52f)),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.55f, 0.52f),
        listOf(150f, 0.55f, 0.52f)
      ),
) {
    override val name: String = "Plink"
}
