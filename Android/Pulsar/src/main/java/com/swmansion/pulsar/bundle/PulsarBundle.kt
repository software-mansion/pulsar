package com.swmansion.pulsar.bundle

import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.composers.PatternComposer
import com.swmansion.pulsar.types.PatternData
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
    val duration: Long,
    val animation: BundleAnimation?,
    private val haptics: Pulsar,
    private val pattern: PatternData,
    private val sound: SoundData?,
) {
    private var composer: PatternComposer? = null

    private fun ensureParsed() {
        if (composer == null) {
            val c = haptics.getPatternComposer()
            if (sound != null) c.parsePatternWithSound(pattern, sound) else c.parsePattern(pattern)
            composer = c
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
        composer?.release()
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
 * Looks up preset handles by id when a generated descriptor builds its typed presets view.
 * `loadBundle` guarantees every id in the descriptor exists before this is used.
 */
class BundleResolver internal constructor(private val loaded: LoadedBundle) {
    operator fun get(id: String): PresetHandle = loaded.handle(id)!!
}

/** Emitted by pulsar-gen: binds a bundle asset + hash to a typed presets builder. */
class BundleDescriptor<P>(
    val assetName: String,
    val bundleId: String,
    val contentHash: String,
    val presetIds: List<String>,
    val build: (BundleResolver) -> P,
)

/** The typed bundle returned by `pulsar.loadBundle(SomeBundle.descriptor)`. */
class PulsarBundle<P> internal constructor(
    private val loaded: LoadedBundle,
    val presets: P,
) {
    val id: String get() = loaded.id
    val revision: Int get() = loaded.revision
    val contentHash: String get() = loaded.contentHash
    fun get(id: String): PresetHandle? = loaded.handle(id)
    fun dispose() = loaded.dispose()
}

class PulsarBundleException(message: String) : Exception(message)
