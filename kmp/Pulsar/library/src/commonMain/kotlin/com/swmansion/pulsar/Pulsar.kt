package com.swmansion.pulsar

class Pulsar private constructor(
    private val handle: PulsarPlatformHandle,
) {
    private val presetsController by lazy { PulsarPresets(handle.presets()) }
    private val realtimeComposerController by lazy { RealtimeComposer(handle.realtimeComposer()) }

    fun getPresets(): PulsarPresets = presetsController

    fun getPatternComposer(): PatternComposer = PatternComposer(handle.patternComposer())

    fun getRealtimeComposer(): RealtimeComposer = realtimeComposerController

    fun preloadPresets(presetNames: List<String>) {
        presetNames.forEach(handle::preloadPreset)
    }

    fun enableHaptics(state: Boolean) {
        handle.enableHaptics(state)
    }

    fun enableSound(state: Boolean) {
        handle.enableSound(state)
    }

    fun enableCache(state: Boolean) {
        handle.enableCache(state)
    }

    fun clearCache() {
        handle.clearCache()
    }

    fun stopHaptics() {
        handle.stopHaptics()
    }

    fun shutDownEngine() {
        handle.shutDownEngine()
    }

    fun isHapticsEnabled(): Boolean = handle.isHapticsEnabled()

    fun isHapticsSupported(): Boolean = handle.isHapticsSupported()

    fun canPlayHaptics(): Boolean = handle.canPlayHaptics()

    companion object {
        fun registerFactory(factory: PulsarPlatformFactory) {
            PulsarRuntime.registerFactory(factory)
        }

        fun create(): Pulsar = Pulsar(PulsarRuntime.createHandle())
    }
}
