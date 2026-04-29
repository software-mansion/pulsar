package com.swmansion.pulsar

internal class CastanetsPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(),
        listOf(),
      ),
    rawDiscretePattern = listOf(
        listOf(1f, 1.0f, 0.897f),
        listOf(199f, 1.0f, 0.9f)
      ),
) {
    override val name: String = "Castanets"
}
