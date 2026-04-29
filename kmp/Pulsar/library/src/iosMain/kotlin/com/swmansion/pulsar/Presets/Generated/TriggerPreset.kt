package com.swmansion.pulsar

internal class TriggerPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(4f, 1.0f), listOf(55f, 0.35f), listOf(80f, 0.5f), listOf(140f, 0.2f), listOf(200f, 0.25f), listOf(280f, 0.0f)),
        listOf(listOf(0f, 0.72f), listOf(80f, 0.55f), listOf(280f, 0.42f)),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.872f, 0.7f),
        listOf(80f, 0.5f, 0.55f),
        listOf(200f, 0.25f, 0.45f)
      ),
) {
    override val name: String = "Trigger"
}
