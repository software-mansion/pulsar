package com.swmansion.pulsar.kmp

import kotlin.concurrent.Volatile

internal object PulsarRuntime {
    @Volatile
    private var factory: PulsarPlatformFactory? = null

    fun registerFactory(factory: PulsarPlatformFactory) {
        this.factory = factory
    }

    fun createHandle(): PulsarPlatformHandle {
        val platformFactory = factory ?: defaultPulsarPlatformFactory()?.also {
            factory = it
        }
        return requireNotNull(platformFactory) {
            "Pulsar platform factory is unavailable on this target."
        }.createPulsar()
    }
}

internal expect fun defaultPulsarPlatformFactory(): PulsarPlatformFactory?

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
    fun shutDownEngine()
    fun isHapticsEnabled(): Boolean
    fun isHapticsSupported(): Boolean
    fun canPlayHaptics(): Boolean
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
    fun playPattern(pattern: PatternData)
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
