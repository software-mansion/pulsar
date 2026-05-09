package com.swmansion.pulsar.kmp.iosimpl.presets.generated

import com.swmansion.pulsar.kmp.IOSPulsarHandle
import com.swmansion.pulsar.kmp.iosimpl.presets.IOSPlayer
internal class AscentPreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(listOf(0f, 0.0f), listOf(5f, 0.55f), listOf(155f, 0.0f), listOf(205f, 0.65f), listOf(335f, 0.0f), listOf(385f, 0.75f), listOf(495f, 0.0f), listOf(545f, 0.85f), listOf(635f, 0.0f), listOf(685f, 0.92f), listOf(755f, 0.0f), listOf(805f, 0.97f), listOf(860f, 0.0f), listOf(905f, 1.0f), listOf(1700f, 0.65f), listOf(2100f, 0.25f), listOf(2400f, 0.0f)),
        listOf(listOf(0f, 0.3f), listOf(200f, 0.37f), listOf(380f, 0.42f), listOf(540f, 0.55f), listOf(680f, 0.65f), listOf(800f, 0.73f), listOf(900f, 0.87f), listOf(2400f, 0.87f)),
      ),
    rawDiscretePattern = listOf(
        listOf(0f, 0.55f, 0.3f),
        listOf(200f, 0.65f, 0.37f),
        listOf(380f, 0.75f, 0.42f),
        listOf(540f, 0.85f, 0.55f),
        listOf(680f, 0.92f, 0.65f),
        listOf(800f, 0.97f, 0.73f),
        listOf(900f, 1.0f, 0.87f)
      ),
) {
    override val name: String = "Ascent"
}
