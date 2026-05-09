package com.swmansion.pulsar.kmp

import com.swmansion.pulsar.kmp.iosimpl.audio.IOSAudioSimulator
import com.swmansion.pulsar.kmp.iosimpl.composers.IOSPatternComposerHandle
import com.swmansion.pulsar.kmp.iosimpl.composers.IOSRealtimeComposerHandle
import com.swmansion.pulsar.kmp.iosimpl.haptics.IOSHapticEngineWrapper
import com.swmansion.pulsar.kmp.iosimpl.presets.IOSPulsarPresetsHandle
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
    private var realtimeComposerStrategy = RealtimeComposerStrategy.ENVELOPE

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

    override fun isCacheEnabled(): Boolean = presets().let { it as IOSPulsarPresetsHandle }.isCacheEnabled()

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

    override fun hapticSupport(): CompatibilityMode =
        if (engine.isHapticsSupported()) CompatibilityMode.ADVANCED_SUPPORT else CompatibilityMode.NO_SUPPORT

    override fun getRealtimeComposerStrategy(): RealtimeComposerStrategy = realtimeComposerStrategy

    override fun setRealtimeComposerStrategy(strategy: RealtimeComposerStrategy) {
        realtimeComposerStrategy = strategy
    }

    fun getPatternComposer(): IOSPatternComposerHandle {
        return IOSPatternComposerHandle(engine, audioSimulator)
    }
}
