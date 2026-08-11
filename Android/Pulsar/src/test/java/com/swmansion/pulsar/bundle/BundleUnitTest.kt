package com.swmansion.pulsar.bundle

import kotlinx.serialization.json.Json
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test
import java.io.ByteArrayOutputStream
import java.util.zip.ZipEntry
import java.util.zip.ZipOutputStream

/** JVM-level checks for the bundle decode path (no Android Context needed). */
class BundleUnitTest {
    private val json = Json { ignoreUnknownKeys = true }

    private fun zip(entries: Map<String, String>): ByteArray {
        val bos = ByteArrayOutputStream()
        ZipOutputStream(bos).use { z ->
            entries.forEach { (name, content) ->
                z.putNextEntry(ZipEntry(name))
                z.write(content.toByteArray())
                z.closeEntry()
            }
        }
        return bos.toByteArray()
    }

    private val manifestJson = """
        {"schema":"pulsar.bundle/1","id":"com.acme.haptics","name":"Acme Pack","revision":7,
         "hash":"sha256-test","presets":[
           {"id":"heartbeatV2","name":"Heartbeat V2","duration":1200,"haptics":"haptics/heartbeatV2.json",
            "audio":{"src":"audio/boom.ogg","volume":1.0,"offset":0}},
           {"id":"explosion","name":"Explosion","duration":800,"haptics":"haptics/explosion.json"}]}
    """.trimIndent()

    private val hapticsJson = """
        {"continuousPattern":{"amplitude":[{"time":0,"value":0.0},{"time":10,"value":0.8}],
         "frequency":[{"time":0,"value":0.2}]},"discretePattern":[{"time":0,"amplitude":0.9,"frequency":0.2}]}
    """.trimIndent()

    @Test
    fun unzipReadsAllEntries() {
        val files = Unzip.read(zip(mapOf("manifest.json" to manifestJson, "haptics/heartbeatV2.json" to hapticsJson)))
        assertNotNull(files["manifest.json"])
        assertNotNull(files["haptics/heartbeatV2.json"])
    }

    @Test
    fun manifestDecodesWithOptionalFields() {
        val manifest = json.decodeFromString(BundleManifest.serializer(), manifestJson)
        assertEquals("com.acme.haptics", manifest.id)
        assertEquals("sha256-test", manifest.hash)
        assertEquals(listOf("heartbeatV2", "explosion"), manifest.presets.map { it.id })
        assertEquals("audio/boom.ogg", manifest.presets[0].audio?.src)
        assertTrue(manifest.presets[1].audio == null)
    }

    @Test
    fun devicePatternMapsIntoPatternData() {
        val pattern = json.decodeFromString(DevicePatternDto.serializer(), hapticsJson).toPatternData()
        assertEquals(listOf(0L, 10L), pattern.continuousPattern.amplitude.map { it.time })
        assertEquals(0.8f, pattern.continuousPattern.amplitude[1].value)
        assertEquals(1, pattern.discretePattern.size)
        assertEquals(0.9f, pattern.discretePattern[0].amplitude)
        assertEquals(0.2f, pattern.discretePattern[0].frequency)
    }
}
