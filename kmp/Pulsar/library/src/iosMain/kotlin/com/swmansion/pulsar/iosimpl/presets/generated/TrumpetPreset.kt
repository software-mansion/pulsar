package com.swmansion.pulsar.kmp

internal class TrumpetPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(10f, 0.3f), listOf(40f, 0.0f), listOf(80f, 0.4f), listOf(110f, 0.0f), listOf(150f, 0.5f), listOf(175f, 0.0f), listOf(210f, 0.6f), listOf(232f, 0.0f), listOf(260f, 0.7f), listOf(278f, 0.0f), listOf(310f, 1.0f), listOf(380f, 0.6f), listOf(460f, 0.0f)),
        listOf(listOf(0f, 0.4f), listOf(310f, 0.7f), listOf(460f, 0.9f)),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.3f, 0.5f),
        listOf(80f, 0.4f, 0.55f),
        listOf(150f, 0.5f, 0.6f),
        listOf(210f, 0.6f, 0.65f),
        listOf(260f, 0.7f, 0.7f),
        listOf(310f, 1.0f, 0.85f)
      ),
) {
    override val name: String = "Trumpet"
}
