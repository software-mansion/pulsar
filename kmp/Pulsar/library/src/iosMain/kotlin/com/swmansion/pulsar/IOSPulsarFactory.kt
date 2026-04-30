package com.swmansion.pulsar

// Swift's Pulsar.swift facade lives in commonMain for KMP; iosMain only wires the
// shared API to iOS-specific CoreHaptics, UIKit, and AVAudio implementations.
internal actual fun defaultPulsarPlatformFactory(): PulsarPlatformFactory? = IOSPulsarFactory()

private class IOSPulsarFactory : PulsarPlatformFactory {
    override fun createPulsar(): PulsarPlatformHandle = IOSPulsarHandle()
}

internal class IOSPulsarHandle : PulsarPlatformHandle {
    private var engine = IOSHapticEngineWrapper()
    private val audioSimulator = IOSAudioSimulator()
    private var presetsHandle: IOSPulsarPresetsHandle? = null
    private val realtimeComposerHandle by lazy { IOSRealtimeComposerHandle(engine) }

    override fun presets(): PulsarPresetsHandle {
        return presetsHandle ?: IOSPulsarPresetsHandle(this).also {
            presetsHandle = it
        }
    }

    override fun patternComposer(): PatternComposerHandle {
        return IOSPatternComposerHandle(engine, audioSimulator)
    }

    override fun realtimeComposer(): RealtimeComposerHandle = realtimeComposerHandle

    override fun preloadPreset(name: String) {
        presets().let { it as IOSPulsarPresetsHandle }.preloadPresetByName(name)
    }

    override fun enableHaptics(state: Boolean) {
        engine.enableHaptics(state)
    }

    override fun enableSound(state: Boolean) {
        audioSimulator.enableSound(state)
    }

    override fun enableCache(state: Boolean) {
        presets().let { it as IOSPulsarPresetsHandle }.enableCache(state)
    }

    override fun clearCache() {
        presets().let { it as IOSPulsarPresetsHandle }.resetCache()
    }

    override fun stopHaptics() {
        engine.stopHaptics()
    }

    override fun shutDownEngine() {
        engine.shutDownEngine()
    }

    override fun isHapticsEnabled(): Boolean = engine.isHapticsEnabled

    override fun isHapticsSupported(): Boolean = engine.isHapticsSupported()

    override fun canPlayHaptics(): Boolean = engine.canPlayHaptics()

    fun getPatternComposer(): IOSPatternComposerHandle {
        return IOSPatternComposerHandle(engine, audioSimulator)
    }
}
