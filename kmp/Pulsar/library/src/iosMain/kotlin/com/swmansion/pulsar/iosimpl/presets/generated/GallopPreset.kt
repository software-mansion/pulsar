package com.swmansion.pulsar.kmp

internal class GallopPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(),
        listOf(),
      ),
    rawDiscretePattern = listOf(
        listOf(10f, 1.0f, 0.603f),
        listOf(155f, 1.0f, 0.163f),
        listOf(601f, 0.997f, 0.609f),
        listOf(750f, 1.0f, 0.153f)
      ),
) {
    override val name: String = "Gallop"
}
