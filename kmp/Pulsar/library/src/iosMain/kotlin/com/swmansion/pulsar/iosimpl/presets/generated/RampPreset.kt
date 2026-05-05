package com.swmansion.pulsar.kmp.iosimpl.presets.generated

import com.swmansion.pulsar.kmp.IOSPulsarHandle
import com.swmansion.pulsar.kmp.iosimpl.presets.IOSPlayer
internal class RampPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(15f, 0.38f), listOf(80f, 0.0f), listOf(120f, 0.55f), listOf(190f, 0.0f), listOf(240f, 0.72f), listOf(310f, 0.0f), listOf(380f, 1.0f), listOf(520f, 0.2f), listOf(650f, 0.0f)),
        listOf(listOf(0f, 0.48f), listOf(380f, 0.78f), listOf(650f, 0.75f)),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.4f, 0.5f),
        listOf(120f, 0.6f, 0.6f),
        listOf(240f, 0.8f, 0.7f),
        listOf(380f, 1.0f, 0.8f)
      ),
) {
    override val name: String = "Ramp"
}
