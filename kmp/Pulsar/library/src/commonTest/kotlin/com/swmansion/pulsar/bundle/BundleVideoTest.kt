package com.swmansion.pulsar.kmp.bundle

import com.swmansion.pulsar.kmp.FakeFactory
import com.swmansion.pulsar.kmp.Pulsar
import kotlin.test.Test
import kotlin.test.assertContentEquals
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith
import kotlin.test.assertFalse
import kotlin.test.assertNotNull
import kotlin.test.assertNull
import kotlin.test.assertTrue

class BundleVideoTest {
    private val written = mutableMapOf<String, ByteArray>()

    private fun load(bytes: ByteArray): LoadedBundle {
        Pulsar.registerFactory(FakeFactory())
        return BundleLoaderImpl.load(Pulsar.create(), bytes) { bundleId, name, data ->
            "/cache/$bundleId/$name".also { written[it] = data }
        }
    }

    private fun videoBundle(includeVideoFile: Boolean = true): ByteArray = storedZip(
        buildMap {
            put("manifest.json", VIDEO_MANIFEST.encodeToByteArray())
            put("haptics/intro.json", HAPTICS.encodeToByteArray())
            put("audio/trailer.m4a", "ftypM4A-fixture-audio".encodeToByteArray())
            put("video/trailer.mp4", VIDEO_BYTES)
            if (includeVideoFile) put("video/intro.mp4", VIDEO_BYTES)
        },
    )

    @Test
    fun videoIsExtractedToAPlayableFile() {
        val intro = load(videoBundle()).handle("intro")!!
        val video = assertNotNull(intro.video)
        assertTrue(intro.hasVideo)
        assertEquals("/cache/com.acme.video/video/intro.mp4", video.path)
        assertContentEquals(VIDEO_BYTES, written[video.path])
        assertEquals(1280, video.width)
        assertEquals(720, video.height)
        assertFalse(video.isMuted)
    }

    @Test
    fun bundleAudioMutesTheVideo() {
        val trailer = load(videoBundle()).handle("trailer")!!
        assertTrue(trailer.hasAudio)
        assertEquals(true, trailer.video?.isMuted)
        assertEquals(0, trailer.video?.width)
    }

    @Test
    fun rejectsAVideoMissingFromTheArchive() {
        val error = assertFailsWith<PulsarBundleException> { load(videoBundle(includeVideoFile = false)) }
        assertTrue(error.message!!.contains("video/intro.mp4"))
    }

    @Test
    fun bundleWithoutVideoHasNone() {
        val plain = storedZip(
            mapOf(
                "manifest.json" to PLAIN_MANIFEST.encodeToByteArray(),
                "haptics/intro.json" to HAPTICS.encodeToByteArray(),
            ),
        )
        val tap = load(plain).handle("tap")!!
        assertNull(tap.video)
        assertFalse(tap.hasVideo)
        assertTrue(written.isEmpty())
    }

    private companion object {
        val VIDEO_BYTES = "ftypisom-fixture-video".encodeToByteArray()

        const val HAPTICS = """{"continuousPattern":{"amplitude":[{"time":0,"value":1.0}],""" +
            """"frequency":[{"time":0,"value":0.5}]},"discretePattern":[]}"""

        const val VIDEO_MANIFEST = """{"schema":"pulsar.bundle/1","id":"com.acme.video","name":"Video Pack",""" +
            """"presets":[{"id":"intro","name":"Intro","duration":3000,"haptics":"haptics/intro.json",""" +
            """"video":{"src":"video/intro.mp4","width":1280,"height":720}},""" +
            """{"id":"trailer","name":"Trailer","duration":3000,"haptics":"haptics/intro.json",""" +
            """"audio":{"src":"audio/trailer.m4a"},"video":{"src":"video/trailer.mp4"}}]}"""

        const val PLAIN_MANIFEST = """{"schema":"pulsar.bundle/1","id":"com.acme.plain","name":"Plain",""" +
            """"presets":[{"id":"tap","name":"Tap","haptics":"haptics/intro.json"}]}"""
    }
}
