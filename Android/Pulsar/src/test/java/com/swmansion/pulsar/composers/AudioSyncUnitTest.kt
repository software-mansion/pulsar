package com.swmansion.pulsar.composers

import com.swmansion.pulsar.types.SoundData
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * Pure-JVM coverage of the synchronized-audio decision logic that does not need
 * the Android framework: the `.ogg` vs. non-`.ogg` detection that drives whether
 * the coupled (audio-coupled haptics) path or the audio + generated-haptics
 * fallback is used, plus the [SoundData] defaults the RN/Flutter/KMP wrappers rely on.
 */
class AudioSyncUnitTest {

    @Test
    fun explicitOggUrisAreCoupledEligible() {
        // .ogg is the only format that can carry baked haptic channels.
        assertTrue(PatternComposer.isOggUri("boom.ogg"))
        assertTrue(PatternComposer.isOggUri("sounds/boom.ogg"))
        assertTrue(PatternComposer.isOggUri("/data/local/boom.ogg"))
        assertTrue(PatternComposer.isOggUri("file:///assets/boom.ogg"))
    }

    @Test
    fun oggDetectionIsCaseInsensitive() {
        assertTrue(PatternComposer.isOggUri("boom.OGG"))
        assertTrue(PatternComposer.isOggUri("boom.Ogg"))
    }

    @Test
    fun nonOggFilesAreNotCoupledEligible() {
        assertFalse(PatternComposer.isOggUri("boom.wav"))
        assertFalse(PatternComposer.isOggUri("boom.mp3"))
        assertFalse(PatternComposer.isOggUri("boom.WAV"))
        assertFalse(PatternComposer.isOggUri("boom.m4a"))
        assertFalse(PatternComposer.isOggUri("/sdcard/boom.mp3"))
        assertFalse(PatternComposer.isOggUri("file:///assets/boom.wav"))
    }

    @Test
    fun bareResourceNameDefaultsToWavAndIsNotCoupled() {
        // No extension => default .wav => plain audio + fallback haptics, so a
        // bare name like "beep" can't silently take the coupled path.
        assertFalse(PatternComposer.isOggUri("beep"))
        assertFalse(PatternComposer.isOggUri("sounds/beep"))
        assertFalse(PatternComposer.isOggUri(""))
    }

    @Test
    fun soundDataAppliesTheDocumentedDefaults() {
        val sound = SoundData(uri = "boom.ogg")
        assertEquals(1f, sound.volume)
        assertEquals(0L, sound.offset)
        assertTrue(sound.hapticChannels)
    }

    @Test
    fun soundDataKeepsExplicitValues() {
        val sound = SoundData(uri = "boom.wav", volume = 0.5f, offset = 30L, hapticChannels = false)
        assertEquals("boom.wav", sound.uri)
        assertEquals(0.5f, sound.volume)
        assertEquals(30L, sound.offset)
        assertFalse(sound.hapticChannels)
    }
}
