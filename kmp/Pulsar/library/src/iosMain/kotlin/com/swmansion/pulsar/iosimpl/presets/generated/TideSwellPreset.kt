package com.swmansion.pulsar.kmp.iosimpl.presets.generated

import com.swmansion.pulsar.kmp.IOSPulsarHandle
import com.swmansion.pulsar.kmp.iosimpl.presets.IOSPlayer
internal class TideSwellPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(),
        listOf(),
      ),
    rawDiscretePattern = listOf(
        listOf(1f, 0.775f, 0.053f),
        listOf(51f, 0.722f, 0.122f),
        listOf(100f, 0.7f, 0.228f),
        listOf(156f, 0.653f, 0.394f),
        listOf(208f, 0.638f, 0.613f),
        listOf(260f, 0.622f, 0.803f),
        listOf(309f, 0.606f, 1.0f),
        listOf(368f, 0.6f, 1.0f),
        listOf(420f, 0.606f, 0.8f),
        listOf(482f, 0.609f, 0.606f),
        listOf(549f, 0.647f, 0.394f),
        listOf(605f, 0.684f, 0.181f),
        listOf(670f, 0.728f, 0.075f),
        listOf(727f, 0.775f, 0.034f)
      ),
) {
    override val name: String = "TideSwell"
}
