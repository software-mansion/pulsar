package com.swmansion.pulsar

import android.os.Vibrator
import com.swmansion.pulsar.types.CompatibilityMode
import com.swmansion.pulsar.types.RealtimeComposerStrategy
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertSame
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.RuntimeEnvironment
import org.robolectric.Shadows.shadowOf
import org.robolectric.annotation.Config

/**
 * Robolectric smoke coverage of the top-level [Pulsar] façade — construction of the whole object
 * graph (engine, audio simulator, composers) and its delegating public API. None of this is
 * reachable from plain-JVM tests because the constructor needs a real [android.content.Context] and
 * [Vibrator].
 */
@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34])
class RobolectricPulsarTest {

    private fun pulsar(): Pulsar {
        val app = RuntimeEnvironment.getApplication()
        shadowOf(app.getSystemService(Vibrator::class.java)).setHasVibrator(true)
        return Pulsar(app)
    }

    @Test
    fun constructsAndReportsACompatibilityMode() {
        assertNotNull(pulsar().hapticSupport())
    }

    @Test
    fun exposesAPatternComposer() {
        assertNotNull(pulsar().getPatternComposer())
    }

    @Test
    fun cachesTheRealtimeComposer() {
        val p = pulsar()
        val a = p.getRealtimeComposer()
        val b = p.getRealtimeComposer()
        assertSame(a, b)
    }

    @Test
    fun rebuildsTheRealtimeComposerWhenAStrategyIsForced() {
        val composer = pulsar().getRealtimeComposer(RealtimeComposerStrategy.PRIMITIVE_TICK)
        assertNotNull(composer)
    }

    @Test
    fun delegatingCallsAreSafe() {
        val p = pulsar()
        // None of these should throw when driven against the Robolectric device.
        p.enableHaptics(false)
        p.enableHaptics(true)
        p.enableSound(false)
        p.forceHapticsSupportLevel(CompatibilityMode.LIMITED_SUPPORT)
        p.enableImpulseCompositionMode(false)
        p.enableImpulseCompositionMode(true)
        p.stopHaptics()
    }
}
