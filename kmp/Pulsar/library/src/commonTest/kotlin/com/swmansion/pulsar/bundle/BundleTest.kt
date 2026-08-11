package com.swmansion.pulsar.kmp.bundle

import kotlinx.serialization.json.Json
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import kotlin.test.assertTrue

class BundleTest {
    private val json = Json { ignoreUnknownKeys = true }

    @Test
    fun inflateDecodesRealDeflateStream() {
        // raw-deflate of "Pulsar bundles: haptics, audio, animation. " x6 (dynamic Huffman + back-refs).
        val deflated = byteArrayOf(
            11, 40, -51, 41, 78, 44, 82, 72, 42, -51, 75, -55, 73, 45, -74, 82, -56, 72, 44, 40, -55,
            76, 46, -42, 81, 72, 44, 77, -55, -52, 7, 82, 121, -103, -71, -119, 37, -103, -7, 121, 122,
            10, 1, -61, 83, 41, 0,
        )
        val expected = "Pulsar bundles: haptics, audio, animation. ".repeat(6)
        val out = Inflate.raw(deflated, expected.length)
        assertEquals(expected, out.decodeToString())
    }

    @Test
    fun unzipReadsStoredEntries() {
        val files = Unzip.read(storedZip(mapOf("manifest.json" to MANIFEST, "haptics/x.json" to HAPTICS)))
        assertNotNull(files["manifest.json"])
        assertEquals(HAPTICS, files["haptics/x.json"]!!.decodeToString())
    }

    @Test
    fun manifestAndDevicePatternDecode() {
        val manifest = json.decodeFromString(BundleManifest.serializer(), MANIFEST)
        assertEquals("com.acme.haptics", manifest.id)
        assertEquals(listOf("heartbeatV2", "explosion"), manifest.presets.map { it.id })

        val pattern = json.decodeFromString(DevicePatternDto.serializer(), HAPTICS).toPatternData()
        assertEquals(listOf(0L, 10L), pattern.continuousPattern.amplitude.map { it.time })
        assertEquals(0.8f, pattern.continuousPattern.amplitude[1].value)
        assertTrue(pattern.discretePattern.isNotEmpty())
        assertEquals(0.9f, pattern.discretePattern[0].amplitude)
    }

    private companion object {
        const val MANIFEST = """{"schema":"pulsar.bundle/1","id":"com.acme.haptics","name":"Acme Pack",""" +
            """"revision":7,"hash":"sha256-test","presets":[""" +
            """{"id":"heartbeatV2","name":"Heartbeat V2","duration":1200,"haptics":"haptics/heartbeatV2.json"},""" +
            """{"id":"explosion","name":"Explosion","duration":800,"haptics":"haptics/explosion.json"}]}"""
        const val HAPTICS = """{"continuousPattern":{"amplitude":[{"time":0,"value":0.0},{"time":10,"value":0.8}],""" +
            """"frequency":[{"time":0,"value":0.2}]},"discretePattern":[{"time":0,"amplitude":0.9,"frequency":0.2}]}"""

        /** Minimal STORE-only zip writer for the test. */
        fun storedZip(entries: Map<String, String>): ByteArray {
            fun crc32(bytes: ByteArray): Int {
                val table = IntArray(256) { n ->
                    var c = n
                    repeat(8) { c = if (c and 1 != 0) (0xEDB88320.toInt() xor (c ushr 1)) else (c ushr 1) }
                    c
                }
                var c = -1
                for (b in bytes) c = table[(c xor b.toInt()) and 0xFF] xor (c ushr 8)
                return c.inv()
            }
            fun le16(v: Int) = byteArrayOf((v and 0xFF).toByte(), ((v ushr 8) and 0xFF).toByte())
            fun le32(v: Int) = byteArrayOf(
                (v and 0xFF).toByte(), ((v ushr 8) and 0xFF).toByte(),
                ((v ushr 16) and 0xFF).toByte(), ((v ushr 24) and 0xFF).toByte(),
            )
            val local = ArrayList<Byte>()
            val central = ArrayList<Byte>()
            var offset = 0
            for ((name, content) in entries) {
                val nameB = name.encodeToByteArray()
                val data = content.encodeToByteArray()
                val crc = crc32(data)
                val lh = le32(0x04034b50) + le16(20) + le16(0) + le16(0) + le16(0) + le16(0) +
                    le32(crc) + le32(data.size) + le32(data.size) + le16(nameB.size) + le16(0)
                local += lh.toList(); local += nameB.toList(); local += data.toList()
                val ch = le32(0x02014b50) + le16(20) + le16(20) + le16(0) + le16(0) + le16(0) + le16(0) +
                    le32(crc) + le32(data.size) + le32(data.size) +
                    le16(nameB.size) + le16(0) + le16(0) + le16(0) + le16(0) + le32(0) + le32(offset)
                central += ch.toList(); central += nameB.toList()
                offset += lh.size + nameB.size + data.size
            }
            val eocd = le32(0x06054b50) + le16(0) + le16(0) + le16(entries.size) + le16(entries.size) +
                le32(central.size) + le32(local.size) + le16(0)
            return (local + central.toList() + eocd.toList()).toByteArray()
        }
    }
}
