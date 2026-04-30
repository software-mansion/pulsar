package com.swmansion.pulsar.kmp.iosimpl.presets.generated

import com.swmansion.pulsar.kmp.IOSPulsarHandle
import com.swmansion.pulsar.kmp.iosimpl.presets.IOSPlayer
internal class StampedePreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(),
        listOf(),
      ),
    rawDiscretePattern = listOf(
        listOf(10f, 1.0f, 0.306f),
        listOf(155f, 1.0f, 0.163f),
        listOf(601f, 0.997f, 0.303f),
        listOf(750f, 1.0f, 0.153f)
      ),
) {
    override val name: String = "Stampede"
}
