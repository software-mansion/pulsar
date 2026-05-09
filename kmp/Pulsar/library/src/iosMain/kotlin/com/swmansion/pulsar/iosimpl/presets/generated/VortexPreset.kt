package com.swmansion.pulsar.kmp.iosimpl.presets.generated

import com.swmansion.pulsar.kmp.IOSPulsarHandle
import com.swmansion.pulsar.kmp.iosimpl.presets.IOSPlayer
internal class VortexPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.05f), listOf(200f, 0.08f), listOf(400f, 0.13f), listOf(600f, 0.22f), listOf(800f, 0.35f), listOf(950f, 0.52f), listOf(1050f, 0.72f), listOf(1150f, 0.9f), listOf(1195f, 0.0f), listOf(1200f, 1.0f), listOf(1250f, 0.3f), listOf(1400f, 0.0f)),
        listOf(listOf(0f, 0.25f), listOf(600f, 0.4f), listOf(1000f, 0.62f), listOf(1150f, 0.82f), listOf(1200f, 0.9f), listOf(1400f, 0.5f)),
      ),
    rawDiscretePattern = listOf(
        listOf(1200f, 1.0f, 0.8f)
      ),
) {
    override val name: String = "Vortex"
}
