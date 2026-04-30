package com.swmansion.pulsar.kmp

internal class BreakingWavePreset(
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
        listOf(202f, 1.0f, 0.1f)
      ),
) {
    override val name: String = "BreakingWave"
}
