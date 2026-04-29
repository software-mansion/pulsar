package com.swmansion.pulsar

internal class ClamorPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(8f, 0.78f), listOf(70f, 0.0f), listOf(120f, 0.78f), listOf(190f, 0.0f), listOf(240f, 0.78f), listOf(310f, 0.0f), listOf(360f, 0.78f), listOf(430f, 0.0f)),
        listOf(listOf(0f, 0.68f), listOf(430f, 0.68f)),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.8f, 0.68f),
        listOf(120f, 0.8f, 0.68f),
        listOf(240f, 0.8f, 0.68f),
        listOf(360f, 0.8f, 0.68f)
      ),
) {
    override val name: String = "Clamor"
}
