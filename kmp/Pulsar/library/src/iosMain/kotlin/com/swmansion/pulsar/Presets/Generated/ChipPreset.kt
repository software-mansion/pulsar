package com.swmansion.pulsar

internal class ChipPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(),
        listOf(),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.75f, 1.0f)
      ),
) {
    override val name: String = "Chip"
}
