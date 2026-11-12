package com.swmansion.pulsar.bundle

import android.os.Vibrator
import com.swmansion.pulsar.Pulsar
import org.junit.Assert.assertArrayEquals
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertThrows
import org.junit.Assert.assertTrue
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.RuntimeEnvironment
import org.robolectric.Shadows.shadowOf
import org.robolectric.annotation.Config
import java.io.ByteArrayOutputStream
import java.io.File
import java.util.zip.ZipEntry
import java.util.zip.ZipOutputStream

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34])
class RobolectricBundleVideoTest {

    private fun pulsar(): Pulsar {
        val app = RuntimeEnvironment.getApplication()
        shadowOf(app.getSystemService(Vibrator::class.java)).setHasVibrator(true)
        return Pulsar(app)
    }

    private fun zip(entries: Map<String, ByteArray>): ByteArray {
        val bos = ByteArrayOutputStream()
        ZipOutputStream(bos).use { z ->
            entries.forEach { (name, content) ->
                z.putNextEntry(ZipEntry(name))
                z.write(content)
                z.closeEntry()
            }
        }
        return bos.toByteArray()
    }

    private val videoBytes = "ftypisom-fixture-video".toByteArray()

    private val haptics = """
        {"continuousPattern":{"amplitude":[{"time":0,"value":1.0}],"frequency":[{"time":0,"value":0.5}]},
         "discretePattern":[]}
    """.trimIndent()

    private val manifest = """
        {"schema":"pulsar.bundle/1","id":"com.acme.video","name":"Video Pack","presets":[
          {"id":"intro","name":"Intro","duration":3000,"haptics":"haptics/intro.json",
           "video":{"src":"video/intro.mp4","width":1280,"height":720}},
          {"id":"trailer","name":"Trailer","duration":3000,"haptics":"haptics/intro.json",
           "audio":{"src":"audio/trailer.m4a"},"video":{"src":"video/trailer.mp4"}}]}
    """.trimIndent()

    private fun videoBundle(includeVideoFile: Boolean = true): ByteArray {
        val entries = linkedMapOf(
            "manifest.json" to manifest.toByteArray(),
            "haptics/intro.json" to haptics.toByteArray(),
            "audio/trailer.m4a" to "ftypM4A-fixture-audio".toByteArray(),
            "video/trailer.mp4" to videoBytes,
        )
        if (includeVideoFile) entries["video/intro.mp4"] = videoBytes
        return zip(entries)
    }

    @Test
    fun videoIsExtractedToAPlayableFile() {
        val intro = pulsar().loadBundle(videoBundle()).handle("intro")!!
        val video = assertNotNullAndGet(intro.video)
        assertTrue(intro.hasVideo)
        assertEquals("intro.mp4", File(video.path).name)
        assertArrayEquals(videoBytes, File(video.path).readBytes())
        assertEquals(1280, video.width)
        assertEquals(720, video.height)
        assertFalse(video.isMuted)
    }

    @Test
    fun bundleAudioMutesTheVideo() {
        val trailer = pulsar().loadBundle(videoBundle()).handle("trailer")!!
        assertTrue(trailer.hasAudio)
        assertEquals(true, trailer.video?.isMuted)
        assertEquals(0, trailer.video?.width)
    }

    @Test
    fun rejectsAVideoMissingFromTheArchive() {
        val error = assertThrows(PulsarBundleException::class.java) {
            pulsar().loadBundle(videoBundle(includeVideoFile = false))
        }
        assertTrue(error.message!!.contains("video/intro.mp4"))
    }

    @Test
    fun bundleWithoutVideoHasNone() {
        val bytes = zip(
            mapOf(
                "manifest.json" to """
                    {"schema":"pulsar.bundle/1","id":"com.acme.plain","name":"Plain","presets":[
                      {"id":"tap","name":"Tap","haptics":"haptics/tap.json"}]}
                """.trimIndent().toByteArray(),
                "haptics/tap.json" to haptics.toByteArray(),
            ),
        )
        val tap = pulsar().loadBundle(bytes).handle("tap")!!
        assertNull(tap.video)
        assertFalse(tap.hasVideo)
    }

    private fun <T> assertNotNullAndGet(value: T?): T {
        assertNotNull(value)
        return value!!
    }
}
