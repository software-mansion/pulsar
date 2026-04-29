package com.swmansion.pulsar

internal class RainPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(50f, 0.08f), listOf(200f, 0.05f), listOf(400f, 0.08f), listOf(600f, 0.05f), listOf(850f, 0.08f), listOf(950f, 0.0f)),
        listOf(listOf(0f, 0.6f), listOf(950f, 0.6f)),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.2f, 0.6f),
        listOf(80f, 0.15f, 0.5f),
        listOf(150f, 0.3f, 0.7f),
        listOf(210f, 0.1f, 0.5f),
        listOf(310f, 0.25f, 0.6f),
        listOf(380f, 0.2f, 0.55f),
        listOf(460f, 0.35f, 0.65f),
        listOf(520f, 0.1f, 0.5f),
        listOf(610f, 0.2f, 0.6f),
        listOf(700f, 0.15f, 0.55f),
        listOf(760f, 0.3f, 0.7f),
        listOf(850f, 0.2f, 0.6f)
      ),
) {
    override val name: String = "Rain"
}
