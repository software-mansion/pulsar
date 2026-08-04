package com.swmansion.pulsar.haptics

import android.os.Vibrator
import com.swmansion.pulsar.types.CompatibilityMode
import org.junit.Assert.assertEquals
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.RuntimeEnvironment
import org.robolectric.Shadows.shadowOf
import org.robolectric.annotation.Config

/**
 * Robolectric coverage of `HapticEngineWrapper.getRealCompatibilityMode()` — the real device
 * capability probe (Vibrator amplitude control + SDK level) that plain JVM tests can't reach.
 * These pin the "system-specific" tiering the whole SDK branches on.
 */
@RunWith(RobolectricTestRunner::class)
class RobolectricCompatibilityModeTest {

    private fun engineWithAmplitudeControl(hasAmplitude: Boolean): HapticEngineWrapper {
        val app = RuntimeEnvironment.getApplication()
        val vibrator = app.getSystemService(Vibrator::class.java)
        shadowOf(vibrator).setHasVibrator(true)
        shadowOf(vibrator).setHasAmplitudeControl(hasAmplitude)
        return HapticEngineWrapper(app)
    }

    @Test
    @Config(sdk = [34])
    fun amplitudeControlMapsToStandardSupport() {
        val engine = engineWithAmplitudeControl(hasAmplitude = true)
        assertEquals(CompatibilityMode.STANDARD_SUPPORT, engine.getRealCompatibilityMode())
    }

    @Test
    @Config(sdk = [34])
    fun noAmplitudeControlMapsToLimitedSupport() {
        val engine = engineWithAmplitudeControl(hasAmplitude = false)
        assertEquals(CompatibilityMode.LIMITED_SUPPORT, engine.getRealCompatibilityMode())
    }

    @Test
    @Config(sdk = [26])
    fun preRDeviceWithAmplitudeControlIsStandardSupport() {
        val engine = engineWithAmplitudeControl(hasAmplitude = true)
        assertEquals(CompatibilityMode.STANDARD_SUPPORT, engine.getRealCompatibilityMode())
    }

    @Test
    @Config(sdk = [26])
    fun preRDeviceWithoutAmplitudeControlIsLimitedSupport() {
        val engine = engineWithAmplitudeControl(hasAmplitude = false)
        assertEquals(CompatibilityMode.LIMITED_SUPPORT, engine.getRealCompatibilityMode())
    }

    @Test
    @Config(sdk = [34])
    fun amplitudeSupportReflectsTheVibrator() {
        assertEquals(true, engineWithAmplitudeControl(hasAmplitude = true).isAmplitudeSupported())
        assertEquals(false, engineWithAmplitudeControl(hasAmplitude = false).isAmplitudeSupported())
    }
}
