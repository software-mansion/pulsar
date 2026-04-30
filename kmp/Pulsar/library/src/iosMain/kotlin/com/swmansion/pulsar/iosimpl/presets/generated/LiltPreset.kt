package com.swmansion.pulsar.kmp.iosimpl.presets.generated

import com.swmansion.pulsar.kmp.IOSPulsarHandle
import com.swmansion.pulsar.kmp.iosimpl.presets.IOSPlayer
internal class LiltPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(8f, 0.45f), listOf(72f, 0.0f), listOf(160f, 0.65f), listOf(240f, 0.12f), listOf(360f, 0.0f)),
        listOf(listOf(0f, 0.5f), listOf(160f, 0.65f), listOf(360f, 0.6f)),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.45f, 0.52f),
        listOf(160f, 0.65f, 0.65f)
      ),
) {
    override val name: String = "Lilt"
}
