package com.swmansion.pulsar

internal class MetronomePreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(8f, 0.45f), listOf(80f, 0.0f), listOf(200f, 0.0f), listOf(208f, 0.45f), listOf(280f, 0.0f)),
        listOf(listOf(0f, 0.5f), listOf(280f, 0.5f)),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.5f, 0.5f),
        listOf(200f, 0.5f, 0.5f)
      ),
) {
    override val name: String = "Metronome"
}
