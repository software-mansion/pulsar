package com.swmansion.pulsar.kmp.iosimpl.presets.generated

import com.swmansion.pulsar.kmp.IOSPulsarHandle
import com.swmansion.pulsar.kmp.iosimpl.presets.IOSPlayer
internal class FanfarePreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(8f, 0.6f), listOf(80f, 0.0f), listOf(130f, 0.7f), listOf(200f, 0.0f), listOf(250f, 0.8f), listOf(315f, 0.0f), listOf(360f, 1.0f), listOf(460f, 0.5f), listOf(580f, 0.0f)),
        listOf(listOf(0f, 0.38f), listOf(130f, 0.52f), listOf(250f, 0.62f), listOf(360f, 0.78f), listOf(580f, 0.82f)),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.6f, 0.4f),
        listOf(130f, 0.7f, 0.55f),
        listOf(250f, 0.8f, 0.65f),
        listOf(360f, 1.0f, 0.8f)
      ),
) {
    override val name: String = "Fanfare"
}
