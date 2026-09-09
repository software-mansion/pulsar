package com.swmansion.pulsar.kmp.bundle

import com.swmansion.pulsar.kmp.PatternComposer
import com.swmansion.pulsar.kmp.PatternData
import com.swmansion.pulsar.kmp.Pulsar
import com.swmansion.pulsar.kmp.SoundData
import kotlinx.serialization.json.Json

/** Lottie bytes + timing for a preset's animation; the host app's own Lottie view renders it. */
class BundleAnimation internal constructor(
    val data: ByteArray,
    val frameRate: Double,
    val totalFrames: Int,
)

/** A single playable preset from a loaded bundle. Parses its pattern lazily on first play. */
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
    private val sound: SoundData?,
) {
    /** Whether the preset carries a synced audio track, which [play] plays alongside the haptics. */
    val hasAudio: Boolean get() = sound != null

    /** Whether the preset carries a Lottie animation, exposed as [animation]. */
    val hasAnimation: Boolean get() = animation != null

    private var composer: PatternComposer? = null

    private var parsedFromMs: Long? = null

    private fun ensureParsed(fromMs: Long) {
        val alreadyParsedHere = composer != null && parsedFromMs == fromMs
        if (alreadyParsedHere) return
        val c = composer ?: haptics.getPatternComposer()
        if (sound != null) c.parsePatternWithSound(pattern, sound, fromMs) else c.parsePattern(pattern, fromMs)
        composer = c
        parsedFromMs = fromMs
    }

    /** Plays the preset from [fromMs] into its timeline, audio and haptics together. */
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
            val sound = preset.audio?.let { audio ->
                files[audio.src]?.let { data ->
                    SoundData(
                        uri = writeBundleMedia(manifest.id, audio.src.substringAfterLast('/'), data),
                        volume = audio.volume ?: 1f,
                        offset = (audio.offset ?: 0.0).toLong(),
                        // Bundle audio is plain music: always play Pulsar's own haptics alongside it.
                        hapticChannels = false,
                    )
                }
            }

            handles[preset.id] = PresetHandle(
                id = preset.id,
                name = preset.name,
                duration = (preset.duration ?: 0.0).toLong(),
                animation = animation,
                pattern = pattern,
                haptics = haptics,
                sound = sound,
            )
        }
        return LoadedBundle(manifest.id, manifest.hash ?: "", manifest.revision ?: 0, handles)
    }
}
