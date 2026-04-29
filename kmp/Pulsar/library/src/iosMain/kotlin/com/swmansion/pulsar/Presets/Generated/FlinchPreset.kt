package com.swmansion.pulsar

internal class FlinchPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(4f, 0.95f), listOf(60f, 0.3f), listOf(120f, 0.8f), listOf(170f, 0.4f), listOf(280f, 0.0f)),
        listOf(listOf(0f, 0.73f), listOf(120f, 0.68f), listOf(280f, 0.55f)),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.9f, 0.75f),
        listOf(120f, 0.75f, 0.7f),
        listOf(200f, 0.4f, 0.58f)
      ),
) {
    override val name: String = "Flinch"
}
