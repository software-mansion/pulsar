package com.swmansion.pulsar

internal class CascadePreset(
    haptics: IOSPulsarHandle,
) : IOSPlayer(
    haptics = haptics,
    rawContinuousPattern = listOf(
        listOf(),
        listOf(),
      ),
    rawDiscretePattern = listOf(
        listOf(1f, 0.994f, 0.994f),
        listOf(99f, 0.997f, 0.997f),
        listOf(199f, 0.997f, 0.997f),
        listOf(551f, 0.8f, 0.8f),
        listOf(649f, 0.803f, 0.803f),
        listOf(751f, 0.797f, 0.797f),
        listOf(1118f, 0.5f, 0.5f),
        listOf(1219f, 0.491f, 0.491f),
        listOf(1318f, 0.494f, 0.494f),
        listOf(1660f, 0.497f, 0.213f),
        listOf(1762f, 0.506f, 0.209f),
        listOf(1863f, 0.488f, 0.213f)
      ),
) {
    override val name: String = "Cascade"
}
