package com.swmansion.pulsar

internal class TidalSurgePreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(),
        listOf(),
      ),
    rawDiscretePattern = listOf(
        listOf(1f, 0.594f, 0.594f),
        listOf(73f, 0.588f, 0.588f),
        listOf(151f, 0.588f, 0.588f),
        listOf(299f, 1.0f, 0.3f),
        listOf(380f, 1.0f, 0.303f),
        listOf(455f, 1.0f, 0.3f)
      ),
) {
    override val name: String = "TidalSurge"
}
