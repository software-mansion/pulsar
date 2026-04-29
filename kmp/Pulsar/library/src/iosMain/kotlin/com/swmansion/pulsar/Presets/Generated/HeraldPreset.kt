package com.swmansion.pulsar

internal class HeraldPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(),
        listOf(),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.497f, 0.497f),
        listOf(89f, 0.497f, 0.497f),
        listOf(208f, 1.0f, 1.0f)
      ),
) {
    override val name: String = "Herald"
}
