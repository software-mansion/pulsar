package com.swmansion.pulsar

internal class SyncopatePreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(),
        listOf(),
      ),
    rawDiscretePattern = listOf(
        listOf(10f, 1.0f, 0.903f),
        listOf(201f, 1.0f, 0.513f),
        listOf(399f, 0.997f, 0.906f)
      ),
) {
    override val name: String = "Syncopate"
}
