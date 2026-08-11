package com.swmansion.pulsar.kmp

import com.swmansion.pulsar.kmp.bundle.BundleDescriptor
import com.swmansion.pulsar.kmp.bundle.BundleLoaderImpl
import com.swmansion.pulsar.kmp.bundle.BundleResolver
import com.swmansion.pulsar.kmp.bundle.LoadedBundle
import com.swmansion.pulsar.kmp.bundle.PulsarBundle
import com.swmansion.pulsar.kmp.bundle.PulsarBundleException

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

    /**
     * Load a `.pulsar` bundle from raw bytes. The app supplies the bytes (e.g. from its own
     * resource loader); KMP does not resolve platform assets. Plays haptics and exposes animation
     * bytes; synced bundle audio is handled by the native iOS/Android SDKs.
     */
    fun loadBundle(bytes: ByteArray): LoadedBundle = BundleLoaderImpl.load(this, bytes)

    /**
     * Typed load using a `pulsar-gen`-generated descriptor:
     *
     *     val bundle = pulsar.loadBundle(AcmePack.descriptor, bytes)
     *     bundle.presets.heartbeatV2.play()
     */
    fun <P> loadBundle(descriptor: BundleDescriptor<P>, bytes: ByteArray, strict: Boolean = false): PulsarBundle<P> {
        val loaded = loadBundle(bytes)
        if (strict && descriptor.contentHash.isNotEmpty() && loaded.contentHash != descriptor.contentHash) {
            throw PulsarBundleException(
                "Bundle content hash mismatch: generated types expect ${descriptor.contentHash} " +
                    "but the loaded bundle is ${loaded.contentHash}.",
            )
        }
        val missing = descriptor.presetIds.filter { loaded.handle(it) == null }
        if (missing.isNotEmpty()) {
            throw PulsarBundleException("Bundle is missing preset(s) $missing — regenerate types with pulsar-gen")
        }
        return PulsarBundle(loaded, descriptor.build(BundleResolver(loaded)))
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
