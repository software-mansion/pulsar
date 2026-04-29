package com.swmansion.pulsar

internal class TickTockPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(),
        listOf(),
      ),
    rawDiscretePattern = listOf(
        listOf(1f, 0.8f, 0.8f),
        listOf(400f, 0.4f, 0.4f),
        listOf(800f, 0.8f, 0.8f),
        listOf(1200f, 0.4f, 0.4f)
      ),
) {
    override val name: String = "TickTock"
}
