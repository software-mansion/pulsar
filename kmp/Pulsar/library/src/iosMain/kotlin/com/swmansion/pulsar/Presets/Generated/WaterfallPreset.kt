package com.swmansion.pulsar

internal class WaterfallPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(),
        listOf(),
      ),
    rawDiscretePattern = listOf(
        listOf(1f, 0.994f, 0.994f),
        listOf(51f, 0.994f, 0.806f),
        listOf(100f, 0.991f, 0.597f),
        listOf(156f, 1.0f, 0.394f),
        listOf(208f, 0.991f, 0.203f),
        listOf(260f, 1.0f, 0.094f),
        listOf(309f, 1.0f, 0.072f)
      ),
) {
    override val name: String = "Waterfall"
}
