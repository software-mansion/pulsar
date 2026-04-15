package com.swmansion.pulsar

import kotlin.concurrent.Volatile

internal object PulsarRuntime {
    @Volatile
    private var factory: PulsarPlatformFactory? = null

    fun registerFactory(factory: PulsarPlatformFactory) {
        this.factory = factory
    }

    fun createHandle(): PulsarPlatformHandle {
        return requireNotNull(factory) {
            "Pulsar factory is not registered. Register a platform factory before calling Pulsar.create()."
        }.createPulsar()
    }
}

interface PulsarPlatformFactory {
    fun createPulsar(): PulsarPlatformHandle
}

interface PulsarPlatformHandle {
    fun presets(): PulsarPresetsHandle
    fun patternComposer(): PatternComposerHandle
    fun realtimeComposer(): RealtimeComposerHandle
    fun preloadPreset(name: String)
    fun enableHaptics(state: Boolean)
    fun enableSound(state: Boolean)
    fun enableCache(state: Boolean)
    fun clearCache()
    fun stopHaptics()
    fun isHapticsSupported(): Boolean
}

interface PulsarPresetsHandle {
    fun play(name: String): Boolean
    fun systemImpactLight()
    fun systemImpactMedium()
    fun systemImpactHeavy()
    fun systemImpactSoft()
    fun systemImpactRigid()
    fun systemNotificationSuccess()
    fun systemNotificationWarning()
    fun systemNotificationError()
    fun systemSelection()
}

interface PatternComposerHandle {
    fun parsePattern(pattern: PatternData)
    fun play()
    fun playAudioOnly()
    fun stop()
}

interface RealtimeComposerHandle {
    fun set(amplitude: Float, frequency: Float)
    fun playDiscrete(amplitude: Float, frequency: Float)
    fun stop()
    fun isActive(): Boolean
}

fun registerPulsarFactory(factory: PulsarPlatformFactory) {
    Pulsar.registerFactory(factory)
}
