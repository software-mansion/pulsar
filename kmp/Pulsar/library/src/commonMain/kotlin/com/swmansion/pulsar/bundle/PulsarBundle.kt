package com.swmansion.pulsar.kmp.bundle

import com.swmansion.pulsar.kmp.PatternComposer
import com.swmansion.pulsar.kmp.PatternData
import com.swmansion.pulsar.kmp.Pulsar
import kotlinx.serialization.json.Json

/** Lottie bytes + timing for a preset's animation; the host app's own Lottie view renders it. */
class BundleAnimation internal constructor(
    val data: ByteArray,
    val frameRate: Double,
    val totalFrames: Int,
)

/**
 * A single playable preset from a loaded bundle. Parses its pattern lazily on first play.
 *
 * NOTE: KMP v1 plays haptics and exposes animation bytes; synced bundle audio is not yet wired
 * (it needs platform temp-file extraction) — use the native iOS/Android SDKs for audio-synced packs.
 */
class PresetHandle internal constructor(
    val id: String,
    val duration: Long,
    val animation: BundleAnimation?,
    private val haptics: Pulsar,
    private val pattern: PatternData,
) {
    private var composer: PatternComposer? = null

    private fun ensureParsed() {
        if (composer == null) {
            composer = haptics.getPatternComposer().also { it.parsePattern(pattern) }
        }
    }

    fun play() {
        ensureParsed()
        composer?.play()
    }

    fun stop() {
        composer?.stop()
    }

    internal fun dispose() {
        composer?.dispose()
        composer = null
    }
}

/** Untyped loaded bundle — the surface the React Native / Flutter bridges use (string ids). */
class LoadedBundle internal constructor(
    val id: String,
    val contentHash: String,
    val revision: Int,
    private val handles: Map<String, PresetHandle>,
) {
    fun handle(id: String): PresetHandle? = handles[id]
    val presetIds: List<String> get() = handles.keys.toList()
    fun play(id: String): Boolean {
        val h = handles[id] ?: return false
        h.play()
        return true
    }
    fun dispose() = handles.values.forEach { it.dispose() }
}

/**
 * Backs a generated presets class: resolves each preset by id, and carries the bundle-level members
 * the generated class re-exposes so that presets can sit at the top level (`bundle.heartbeatV2`).
 */
class BundleResolver internal constructor(private val loaded: LoadedBundle) {
    operator fun get(id: String): PresetHandle = loaded.handle(id)!!

    val bundleId: String get() = loaded.id
    val revision: Int get() = loaded.revision
    val contentHash: String get() = loaded.contentHash

    /** Dynamic escape hatch for ids not known at compile time; null when absent. */
    fun handle(id: String): PresetHandle? = loaded.handle(id)
    fun dispose() = loaded.dispose()
}

/** Emitted by pulsar-gen: binds a bundle asset + hash to a typed presets builder. */
class BundleDescriptor<P>(
    val assetName: String,
    val bundleId: String,
    val contentHash: String,
    val presetIds: List<String>,
    val build: (BundleResolver) -> P,
)

// `pulsar.loadBundle(SomeBundle.descriptor, bytes)` returns the generated presets class itself,
// which carries both the presets and the bundle-level members (`id`, `contentHash`, `get`,
// `dispose`). Kotlin cannot forward arbitrary typed members through a wrapper, so the generator
// emits them.

class PulsarBundleException(message: String) : Exception(message)

internal object BundleLoaderImpl {
    private val json = Json { ignoreUnknownKeys = true }
    private const val SCHEMA = "pulsar.bundle/1"

    fun load(haptics: Pulsar, bytes: ByteArray): LoadedBundle {
        val files = Unzip.read(bytes)
        val manifestBytes = files["manifest.json"]
            ?: throw PulsarBundleException("Bundle is missing manifest.json")
        val manifest = json.decodeFromString(BundleManifest.serializer(), manifestBytes.decodeToString())
        if (manifest.schema != SCHEMA) {
            throw PulsarBundleException("Unsupported bundle schema \"${manifest.schema}\" (expected $SCHEMA)")
        }

        val handles = LinkedHashMap<String, PresetHandle>()
        for (preset in manifest.presets) {
            val hapticsBytes = files[preset.haptics]
                ?: throw PulsarBundleException("Bundle is missing referenced entry \"${preset.haptics}\"")
            val pattern = json.decodeFromString(DevicePatternDto.serializer(), hapticsBytes.decodeToString())
                .toPatternData()
            val animation = preset.animation?.let { anim ->
                files[anim.src]?.let { BundleAnimation(it, anim.frameRate ?: 0.0, anim.totalFrames ?: 0) }
            }
            handles[preset.id] = PresetHandle(
                id = preset.id,
                duration = (preset.duration ?: 0.0).toLong(),
                animation = animation,
                haptics = haptics,
                pattern = pattern,
            )
        }
        return LoadedBundle(manifest.id, manifest.hash ?: "", manifest.revision ?: 0, handles)
    }
}
