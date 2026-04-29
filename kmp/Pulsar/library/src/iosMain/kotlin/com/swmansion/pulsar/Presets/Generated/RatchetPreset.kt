package com.swmansion.pulsar

internal class RatchetPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(),
        listOf(),
      ),
    rawDiscretePattern = listOf(
        listOf(10f, 1.0f, 0.9f),
        listOf(201f, 1.0f, 0.906f),
        listOf(398f, 0.997f, 0.906f)
      ),
) {
    override val name: String = "Ratchet"
}
