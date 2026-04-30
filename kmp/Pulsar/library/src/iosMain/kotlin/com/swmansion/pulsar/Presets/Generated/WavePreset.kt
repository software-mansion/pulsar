package com.swmansion.pulsar.kmp

internal class WavePreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(400f, 0.38f), listOf(800f, 0.05f), listOf(1200f, 0.4f), listOf(1600f, 0.05f), listOf(2000f, 0.38f), listOf(2400f, 0.05f), listOf(2800f, 0.0f)),
        listOf(listOf(0f, 0.35f), listOf(2800f, 0.35f)),
      ),
    rawDiscretePattern = listOf(

      ),
) {
    override val name: String = "Wave"
}
