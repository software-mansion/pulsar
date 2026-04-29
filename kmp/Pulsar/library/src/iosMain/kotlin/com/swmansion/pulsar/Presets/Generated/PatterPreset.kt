package com.swmansion.pulsar

internal class PatterPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(),
        listOf(),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.603f, 0.2f),
        listOf(82f, 0.606f, 0.197f),
        listOf(179f, 0.609f, 0.594f)
      ),
) {
    override val name: String = "Patter"
}
