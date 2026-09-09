package com.swmansion.pulsar.lottie

import java.io.ByteArrayOutputStream
import java.util.zip.ZipEntry
import java.util.zip.ZipOutputStream

/**
 * Builds `.pulsar` archives in memory so the tests can obtain real
 * `PresetHandle`s through the public `Pulsar.loadBundle` path — the handle's own
 * constructor is internal to the core module.
 */
internal object TestBundle {

    /** A 2s animation (60 frames @ 30fps) with nothing in it, but parseable by Lottie. */
    const val LOTTIE_JSON =
        """{"v":"5.7.4","fr":30,"ip":0,"op":60,"w":100,"h":100,"nm":"empty","ddd":0,""" +
            """"assets":[],"layers":[]}"""

    /** Amplitude ramps 0→1 across 800ms; one flat frequency point; two transients. */
    private const val HAPTICS_JSON =
        """{"continuousPattern":{"amplitude":[{"time":0,"value":0.0},{"time":800,"value":1.0}],""" +
            """"frequency":[{"time":0,"value":0.3}]},""" +
            """"discretePattern":[{"time":250,"amplitude":1.0,"frequency":0.5},""" +
            """{"time":600,"amplitude":0.4,"frequency":0.2}]}"""

    /**
     * A single-preset bundle. [durationMs] is the authored duration, [withAudio] adds a
     * synced audio track and [withAnimation] the Lottie the preset was authored against.
     */
    fun bytes(
        durationMs: Double = 1500.0,
        withAudio: Boolean = false,
        withAnimation: Boolean = true,
    ): ByteArray {
        val audio = if (withAudio) ""","audio":{"src":"audio/boom.ogg","volume":1.0,"offset":0}""" else ""
        val animation =
            if (withAnimation) {
                ""","animation":{"src":"anim/celebration.json","frameRate":30,"totalFrames":60}"""
            } else {
                ""
            }
        val manifest =
            """{"schema":"pulsar.bundle/1","id":"com.acme.haptics","name":"Acme Pack","revision":7,""" +
                """"hash":"sha256-test","presets":[{"id":"celebration","name":"Celebration",""" +
                """"duration":$durationMs,"haptics":"haptics/celebration.json"$audio$animation}]}"""

        val entries = buildMap {
            put("manifest.json", manifest)
            put("haptics/celebration.json", HAPTICS_JSON)
            if (withAudio) put("audio/boom.ogg", "not-really-audio")
            if (withAnimation) put("anim/celebration.json", LOTTIE_JSON)
        }
        return zip(entries)
    }

    private fun zip(entries: Map<String, String>): ByteArray {
        val bos = ByteArrayOutputStream()
        ZipOutputStream(bos).use { zip ->
            entries.forEach { (name, content) ->
                zip.putNextEntry(ZipEntry(name))
                zip.write(content.toByteArray())
                zip.closeEntry()
            }
        }
        return bos.toByteArray()
    }
}
