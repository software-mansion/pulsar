package com.swmansion.pulsar.bundle

import android.content.Context
import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.types.SoundData
import kotlinx.serialization.json.Json
import java.io.File

/** Decodes a `.pulsar` archive into a [LoadedBundle]. Invoked by the `Pulsar.loadBundle*` members. */
internal object BundleLoaderImpl {
    private val json = Json { ignoreUnknownKeys = true }
    private const val SCHEMA = "pulsar.bundle/1"

    fun load(haptics: Pulsar, context: Context, bytes: ByteArray): LoadedBundle {
        val files = Unzip.read(bytes)
        val manifestBytes = files["manifest.json"]
            ?: throw PulsarBundleException("Bundle is missing manifest.json")
        val manifest = json.decodeFromString(BundleManifest.serializer(), manifestBytes.decodeToString())
        if (manifest.schema != SCHEMA) {
            throw PulsarBundleException("Unsupported bundle schema \"${manifest.schema}\" (expected $SCHEMA)")
        }

        val mediaDir = File(context.cacheDir, "PulsarBundles/${manifest.id}").apply { mkdirs() }
        val handles = LinkedHashMap<String, PresetHandle>()

        for (preset in manifest.presets) {
            val hapticsBytes = files[preset.haptics]
                ?: throw PulsarBundleException("Bundle is missing referenced entry \"${preset.haptics}\"")
            // Device wire shape decodes directly, then maps into the SDK's PatternData.
            val pattern = json.decodeFromString(DevicePatternDto.serializer(), hapticsBytes.decodeToString())
                .toPatternData()

            val sound = preset.audio?.let { audio ->
                files[audio.src]?.let { data ->
                    val dest = File(mediaDir, audio.src.substringAfterLast('/'))
                    dest.writeBytes(data)
                    SoundData(
                        uri = dest.absolutePath,
                        volume = audio.volume ?: 1f,
                        offset = (audio.offset ?: 0.0).toLong(),
                        // Bundle audio is plain music: always play Pulsar's own haptics alongside it.
                        hapticChannels = false,
                    )
                }
            }

            val animation = preset.animation?.let { anim ->
                files[anim.src]?.let { BundleAnimation(it, anim.frameRate ?: 0.0, anim.totalFrames ?: 0) }
            }

            handles[preset.id] = PresetHandle(
                id = preset.id,
                duration = (preset.duration ?: 0.0).toLong(),
                animation = animation,
                haptics = haptics,
                pattern = pattern,
                sound = sound,
            )
        }

        return LoadedBundle(
            id = manifest.id,
            contentHash = manifest.hash ?: "",
            revision = manifest.revision ?: 0,
            handles = handles,
        )
    }
}
