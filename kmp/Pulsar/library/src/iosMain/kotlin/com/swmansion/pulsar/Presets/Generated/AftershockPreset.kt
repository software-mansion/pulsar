package com.swmansion.pulsar

internal class AftershockPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(),
        listOf(),
      ),
    rawDiscretePattern = listOf(
        listOf(1f, 0.8f, 0.8f),
        listOf(299f, 0.5f, 0.247f),
        listOf(399f, 0.494f, 0.266f),
        listOf(500f, 0.497f, 0.263f)
      ),
) {
    override val name: String = "Aftershock"
}
