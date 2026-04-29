package com.swmansion.pulsar

internal class LopePreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(6f, 0.68f), listOf(60f, 0.15f), listOf(80f, 0.43f), listOf(140f, 0.12f), listOf(160f, 0.68f), listOf(220f, 0.15f), listOf(240f, 0.43f), listOf(300f, 0.12f), listOf(320f, 0.73f), listOf(450f, 0.0f)),
        listOf(listOf(0f, 0.72f), listOf(450f, 0.7f)),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.7f, 0.72f),
        listOf(80f, 0.45f, 0.65f),
        listOf(160f, 0.7f, 0.72f),
        listOf(240f, 0.45f, 0.65f),
        listOf(320f, 0.75f, 0.75f)
      ),
) {
    override val name: String = "Lope"
}
