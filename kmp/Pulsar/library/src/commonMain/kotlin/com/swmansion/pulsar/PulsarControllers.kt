package com.swmansion.pulsar

class PulsarPresets internal constructor(
    private val handle: PulsarPresetsHandle,
) {
    fun play(name: String): Boolean = handle.play(name)

    fun systemImpactLight() {
        handle.systemImpactLight()
    }

    fun systemImpactMedium() {
        handle.systemImpactMedium()
    }

    fun systemImpactHeavy() {
        handle.systemImpactHeavy()
    }

    fun systemImpactSoft() {
        handle.systemImpactSoft()
    }

    fun systemImpactRigid() {
        handle.systemImpactRigid()
    }

    fun systemNotificationSuccess() {
        handle.systemNotificationSuccess()
    }

    fun systemNotificationWarning() {
        handle.systemNotificationWarning()
    }

    fun systemNotificationError() {
        handle.systemNotificationError()
    }

    fun systemSelection() {
        handle.systemSelection()
    }
}

class PatternComposer internal constructor(
    private val handle: PatternComposerHandle,
) {
    fun parsePattern(pattern: PatternData) {
        handle.parsePattern(pattern)
    }

    fun playPattern(pattern: PatternData) {
        handle.playPattern(pattern)
    }

    fun play() {
        handle.play()
    }

    fun playAudioOnly() {
        handle.playAudioOnly()
    }

    fun stop() {
        handle.stop()
    }
}

class RealtimeComposer internal constructor(
    private val handle: RealtimeComposerHandle,
) {
    fun set(amplitude: Float, frequency: Float) {
        handle.set(amplitude, frequency)
    }

    fun playDiscrete(amplitude: Float, frequency: Float) {
        handle.playDiscrete(amplitude, frequency)
    }

    fun stop() {
        handle.stop()
    }

    fun isActive(): Boolean = handle.isActive()
}
