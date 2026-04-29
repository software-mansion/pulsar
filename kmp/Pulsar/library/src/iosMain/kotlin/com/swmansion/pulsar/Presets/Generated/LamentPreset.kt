package com.swmansion.pulsar

internal class LamentPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(5f, 0.85f), listOf(190f, 0.3f), listOf(295f, 0.0f), listOf(355f, 0.7f), listOf(535f, 0.25f), listOf(645f, 0.0f), listOf(705f, 0.55f), listOf(880f, 0.18f), listOf(995f, 0.0f), listOf(1055f, 0.75f), listOf(1620f, 0.35f), listOf(2150f, 0.1f), listOf(2450f, 0.0f)),
        listOf(listOf(0f, 0.55f), listOf(350f, 0.42f), listOf(700f, 0.37f), listOf(1050f, 0.3f), listOf(2450f, 0.26f)),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.85f, 0.55f),
        listOf(350f, 0.7f, 0.42f),
        listOf(700f, 0.55f, 0.37f),
        listOf(1050f, 0.75f, 0.3f)
      ),
) {
    override val name: String = "Lament"
}
