package com.swmansion.pulsar.bundle

import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.composers.PatternComposer
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.types.PatternSeek
import com.swmansion.pulsar.types.SoundData

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

    /** The seek position [composer] is currently parsed at, or null while unparsed. */
    private var parsedFromMs: Long? = null

    /**
     * Parses at [fromMs], reusing the cached parse when the position has not moved. A preset
     * played only from the start therefore still parses exactly once, as it always has.
     */
    private fun ensureParsed(fromMs: Long) {
        if (composer != null && parsedFromMs == fromMs) return
        val c = composer ?: haptics.getPatternComposer()
        val seeked = PatternSeek.patternFrom(pattern, fromMs)
        if (sound != null) {
            c.parsePatternWithSound(seeked, PatternSeek.soundFrom(sound, fromMs))
        } else {
            c.parsePattern(seeked)
        }
        composer = c
        parsedFromMs = fromMs
    }

    /**
     * Plays the preset from [fromMs] into its timeline, audio and haptics together. Defaults to
     * the start of the preset.
     *
     * The pattern is re-anchored and re-parsed on every non-zero seek; `play()` keeps the parse
     * cached, so repeat plays from the start cost nothing extra.
     */
    @JvmOverloads
    fun play(fromMs: Long = 0L) {
        ensureParsed(maxOf(0L, fromMs))
        composer?.play()
    }

    fun stop() {
        composer?.stop()
    }

    internal fun dispose() {
        composer?.release()
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
    @JvmOverloads
    fun play(id: String, fromMs: Long = 0L): Boolean {
        val h = handles[id] ?: return false
        h.play(fromMs)
        return true
    }
    fun dispose() = handles.values.forEach { it.dispose() }
}

/**
 * Backs a generated presets class. `loadBundle` guarantees every descriptor id exists first.
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
