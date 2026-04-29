package com.swmansion.pulsar

internal class SweepPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(8f, 0.4f), listOf(120f, 0.05f), listOf(400f, 0.02f), listOf(590f, 0.0f), listOf(600f, 0.4f), listOf(720f, 0.05f), listOf(1000f, 0.02f), listOf(1190f, 0.0f), listOf(1200f, 0.4f), listOf(1320f, 0.05f), listOf(1600f, 0.02f), listOf(1790f, 0.0f), listOf(1800f, 0.4f), listOf(1920f, 0.05f), listOf(2100f, 0.0f)),
        listOf(listOf(0f, 0.72f), listOf(2100f, 0.72f)),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.4f, 0.7f),
        listOf(600f, 0.4f, 0.7f),
        listOf(1200f, 0.4f, 0.7f),
        listOf(1800f, 0.4f, 0.7f)
      ),
) {
    override val name: String = "Sweep"
}
