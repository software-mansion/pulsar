package com.swmansion.pulsar.kmp.bundle

import com.swmansion.pulsar.kmp.PatternComposer
import com.swmansion.pulsar.kmp.PatternData
import com.swmansion.pulsar.kmp.PatternSeek
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
    /** Human label the preset was authored under. */
    val name: String,
    val duration: Long,
    val animation: BundleAnimation?,
    /**
     * The authored pattern. Read it to drive a timeline yourself — the Lottie SDK samples it per
     * frame in realtime mode. [play] stays the pre-parsed, engine-native route.
     */
    val pattern: PatternData,
    private val haptics: Pulsar,
) {
    /** Always `false` on KMP: synced bundle audio is not wired yet (see the class note). */
    val hasAudio: Boolean get() = false

    /** Whether the preset carries a Lottie animation, exposed as [animation]. */
    val hasAnimation: Boolean get() = animation != null

    private var composer: PatternComposer? = null

    /** The seek position [composer] is currently parsed at, or null while unparsed. */
    private var parsedFromMs: Long? = null

    /**
     * Parses at [fromMs], reusing the cached parse when the position has not moved. A preset
     * played only from the start therefore still parses exactly once, as it always has.
     */
    private fun ensureParsed(fromMs: Long) {
        if (composer != null && parsedFromMs == fromMs) return
        val c = composer ?: haptics.getPatternComposer()
        c.parsePattern(PatternSeek.patternFrom(pattern, fromMs))
        composer = c
        parsedFromMs = fromMs
    }

    /**
     * Plays the preset from [fromMs] into its timeline. Defaults to the start of the preset.
     *
     * The pattern is re-anchored and re-parsed on every non-zero seek; `play()` keeps the parse
     * cached, so repeat plays from the start cost nothing extra.
     */
    fun play(fromMs: Long = 0L) {
        ensureParsed(maxOf(0L, fromMs))
        composer?.play()
    }

    fun stop() {
        composer?.stop()
    }

    internal fun dispose() {
        composer?.dispose()
        composer = null
        parsedFromMs = null
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
    fun play(id: String, fromMs: Long = 0L): Boolean {
        val h = handles[id] ?: return false
        h.play(fromMs)
        return true
    }
    fun dispose() = handles.values.forEach { it.dispose() }
}

/**
 * Backs a generated presets class.
 */
class BundleResolver internal constructor(private val loaded: LoadedBundle) {
    operator fun get(id: String): PresetHandle = loaded.handle(id)!!

    val bundleId: String get() = loaded.id
    val revision: Int get() = loaded.revision
    val contentHash: String get() = loaded.contentHash

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

// `loadBundle` returns the generated presets class itself: Kotlin cannot forward typed members
// through a wrapper, so the generator emits the bundle-level members onto it.

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
                name = preset.name,
                duration = (preset.duration ?: 0.0).toLong(),
                animation = animation,
                pattern = pattern,
                haptics = haptics,
            )
        }
        return LoadedBundle(manifest.id, manifest.hash ?: "", manifest.revision ?: 0, handles)
    }
}
