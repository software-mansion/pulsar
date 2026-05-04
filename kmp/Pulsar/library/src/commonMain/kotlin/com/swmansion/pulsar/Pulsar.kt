package com.swmansion.pulsar.kmp

class Pulsar private constructor(
    private val handle: PulsarPlatformHandle,
) {
    private val presetsController by lazy { PulsarPresets(handle.presets()) }

    fun getPresets(): PulsarPresets = presetsController

    fun getPatternComposer(): PatternComposer = PatternComposer(handle.patternComposer())

    fun getRealtimeComposer(): RealtimeComposer = RealtimeComposer(handle.realtimeComposer())

    fun getRealtimeComposer(strategy: RealtimeComposerStrategy): RealtimeComposer =
        RealtimeComposer(handle.realtimeComposer(strategy))

    var realtimeComposerStrategy: RealtimeComposerStrategy
        get() = handle.getRealtimeComposerStrategy()
        set(value) {
            handle.setRealtimeComposerStrategy(value)
        }

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

    fun isCacheEnabled(): Boolean = handle.isCacheEnabled()

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

    fun hapticSupport(): CompatibilityMode = handle.hapticSupport()

    fun forceHapticsSupportLevel(mode: CompatibilityMode) {
        handle.forceHapticsSupportLevel(mode)
    }

    fun enableImpulseCompositionMode(state: Boolean) {
        handle.enableImpulseCompositionMode(state)
    }

    fun createAdaptiveHaptics(preset: AdaptivePreset): AdaptiveHaptics {
        val config = when (currentPulsarPlatform()) {
            PulsarPlatform.IOS -> preset.ios
            PulsarPlatform.ANDROID -> preset.android
        }
        return AdaptiveHaptics(getPresets(), getPatternComposer(), config)
    }

    companion object {
        fun registerFactory(factory: PulsarPlatformFactory) {
            PulsarRuntime.registerFactory(factory)
        }

        fun create(): Pulsar = Pulsar(PulsarRuntime.createHandle())
    }
}
