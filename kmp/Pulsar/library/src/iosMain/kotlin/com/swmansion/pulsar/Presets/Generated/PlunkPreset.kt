package com.swmansion.pulsar

internal class PlunkPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(),
        listOf(),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.5f, 0.2f)
      ),
) {
    override val name: String = "Plunk"
}
