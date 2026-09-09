package com.swmansion.pulsar.kmp

import com.swmansion.pulsar.kmp.bundle.BundleDescriptor
import com.swmansion.pulsar.kmp.bundle.readBundleAsset
import com.swmansion.pulsar.kmp.bundle.readBundleFile
import com.swmansion.pulsar.kmp.bundle.BundleLoaderImpl
import com.swmansion.pulsar.kmp.bundle.BundleResolver
import com.swmansion.pulsar.kmp.bundle.LoadedBundle
import com.swmansion.pulsar.kmp.bundle.PulsarBundleException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

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
     * resource loader); KMP does not resolve platform assets. Plays a preset's haptics and its
     * synced audio, and exposes animation bytes for the host app's own Lottie view.
     */
    fun loadBundle(bytes: ByteArray): LoadedBundle = BundleLoaderImpl.load(this, bytes)

    /** Load a `.pulsar` bundle from a file path. */
    fun loadBundleFromPath(path: String): LoadedBundle = loadBundle(readBundleFile(path))

    /**
     * Load a `.pulsar` bundle shipped with the app — `src/main/assets` on Android, the main
     * bundle on iOS.
     */
    fun loadBundleFromAsset(assetName: String): LoadedBundle = loadBundle(readBundleAsset(assetName))

    /**
     * Typed load using a `pulsar-gen`-generated descriptor:
     *
     *     val bundle = pulsar.loadBundleSync(AcmePack.descriptor, bytes)
     *     bundle.heartbeatV2.play()
     */
    suspend fun <P> loadBundleAsync(
        descriptor: BundleDescriptor<P>,
        bytes: ByteArray,
        strict: Boolean = true,
    ): P = withContext(Dispatchers.Default) { loadBundleSync(descriptor, bytes, strict) }

    /** Resolves `descriptor.assetName` against the app's own assets. */
    fun <P> loadBundleSync(descriptor: BundleDescriptor<P>, strict: Boolean = true): P =
        loadBundleSync(descriptor, readBundleAsset(descriptor.assetName), strict)

    suspend fun <P> loadBundleAsync(descriptor: BundleDescriptor<P>, strict: Boolean = true): P =
        withContext(Dispatchers.Default) { loadBundleSync(descriptor, strict) }

    fun <P> loadBundleSync(descriptor: BundleDescriptor<P>, bytes: ByteArray, strict: Boolean = true): P {
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
        return descriptor.build(BundleResolver(loaded))
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
