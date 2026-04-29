package com.swmansion.pulsar

internal class TypewriterPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(6f, 0.85f), listOf(40f, 0.3f), listOf(55f, 0.38f), listOf(90f, 0.12f), listOf(110f, 0.15f), listOf(160f, 0.04f), listOf(200f, 0.0f)),
        listOf(listOf(0f, 0.42f), listOf(55f, 0.38f), listOf(200f, 0.34f)),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.88f, 0.42f),
        listOf(55f, 0.35f, 0.38f),
        listOf(110f, 0.12f, 0.35f)
      ),
) {
    override val name: String = "Typewriter"
}
