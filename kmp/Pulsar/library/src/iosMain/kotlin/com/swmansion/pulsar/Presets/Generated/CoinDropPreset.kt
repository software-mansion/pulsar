package com.swmansion.pulsar

internal class CoinDropPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(5f, 0.5f), listOf(35f, 0.0f), listOf(120f, 0.7f), listOf(145f, 0.0f), listOf(210f, 0.4f), listOf(230f, 0.0f), listOf(300f, 0.8f), listOf(325f, 0.0f), listOf(380f, 0.35f), listOf(397f, 0.0f), listOf(460f, 0.6f), listOf(480f, 0.0f), listOf(520f, 0.9f), listOf(550f, 0.0f), listOf(590f, 0.45f), listOf(608f, 0.0f), listOf(650f, 0.7f), listOf(675f, 0.0f)),
        listOf(listOf(0f, 0.8f), listOf(675f, 0.9f)),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.5f, 0.8f),
        listOf(120f, 0.7f, 0.85f),
        listOf(210f, 0.4f, 0.75f),
        listOf(300f, 0.8f, 0.9f),
        listOf(380f, 0.35f, 0.7f),
        listOf(460f, 0.6f, 0.8f),
        listOf(520f, 0.9f, 0.9f),
        listOf(590f, 0.45f, 0.75f),
        listOf(650f, 0.7f, 0.85f)
      ),
) {
    override val name: String = "CoinDrop"
}
