package com.swmansion.pulsar.haptics

import android.os.Vibrator
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.RuntimeEnvironment
import org.robolectric.Shadows.shadowOf
import org.robolectric.annotation.Config

/**
 * Robolectric coverage of `HapticEngineWrapper.supportsAudioCoupledHaptics()` — the
 * capability gate that decides whether an `.ogg` sound file's baked haptic channels
 * can drive the vibrator (perfect sync) or the audio + generated-haptics fallback is
 * used. It requires API 29+ (where `setHapticChannelsMuted` exists) and a vibrator.
 */
@RunWith(RobolectricTestRunner::class)
class RobolectricAudioCoupledHapticsTest {

    private fun engineWithVibrator(hasVibrator: Boolean): HapticEngineWrapper {
        val app = RuntimeEnvironment.getApplication()
        val vibrator = app.getSystemService(Vibrator::class.java)
        shadowOf(vibrator).setHasVibrator(hasVibrator)
        return HapticEngineWrapper(app)
    }

    @Test
    @Config(sdk = [34])
    fun supportedWhenApi29PlusAndVibratorPresent() {
        assertTrue(engineWithVibrator(hasVibrator = true).supportsAudioCoupledHaptics())
    }

    @Test
    @Config(sdk = [34])
    fun unsupportedWithoutAVibrator() {
        assertFalse(engineWithVibrator(hasVibrator = false).supportsAudioCoupledHaptics())
    }

    @Test
    @Config(sdk = [29])
    fun supportedExactlyAtApi29() {
        assertTrue(engineWithVibrator(hasVibrator = true).supportsAudioCoupledHaptics())
    }

    @Test
    @Config(sdk = [28])
    fun unsupportedBelowApi29EvenWithAVibrator() {
        assertFalse(engineWithVibrator(hasVibrator = true).supportsAudioCoupledHaptics())
    }
}
