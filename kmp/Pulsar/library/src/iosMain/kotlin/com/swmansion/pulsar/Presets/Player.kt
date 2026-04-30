package com.swmansion.pulsar.kmp

internal open class IOSPlayer(
    private val haptics: IOSPulsarHandle,
    private val audioOnly: Boolean = false,
    rawContinuousPattern: List<List<List<Float>>> = listOf(listOf(), listOf()),
    rawDiscretePattern: List<List<Float>> = listOf(),
) : IOSPreset {
    private val patternData = PatternData(
        rawContinuousPattern = rawContinuousPattern,
        rawDiscretePattern = rawDiscretePattern,
    )
    private val composer by lazy { haptics.getPatternComposer() }

    override val name: String = this::class.simpleName.orEmpty().removeSuffix("Preset")

    open val isEnabled: Boolean
        get() = haptics.isHapticsEnabled()

    init {
        composer.parsePattern(patternData)
    }

    override fun play() {
        if (!isEnabled) return
        if (audioOnly) {
            composer.playAudioOnly()
        } else {
            composer.play()
        }
    }

    fun stop() {
        composer.stop()
    }
}
