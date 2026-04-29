package com.swmansion.pulsar

internal class RadarPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(6f, 0.55f), listOf(50f, 0.2f), listOf(120f, 0.0f), listOf(800f, 0.0f), listOf(806f, 0.55f), listOf(850f, 0.2f), listOf(920f, 0.0f), listOf(1600f, 0.0f), listOf(1606f, 0.55f), listOf(1650f, 0.2f), listOf(1720f, 0.0f), listOf(2400f, 0.0f), listOf(2406f, 0.55f), listOf(2450f, 0.2f), listOf(2520f, 0.0f)),
        listOf(listOf(0f, 0.55f), listOf(2520f, 0.55f)),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.55f, 0.55f),
        listOf(800f, 0.55f, 0.55f),
        listOf(1600f, 0.55f, 0.55f),
        listOf(2400f, 0.55f, 0.55f)
      ),
) {
    override val name: String = "Radar"
}
