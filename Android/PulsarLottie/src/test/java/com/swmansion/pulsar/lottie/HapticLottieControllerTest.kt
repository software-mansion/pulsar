package com.swmansion.pulsar.lottie

import android.Manifest
import android.os.Vibrator
import com.airbnb.lottie.LottieAnimationView
import com.airbnb.lottie.LottieComposition
import com.airbnb.lottie.LottieCompositionFactory
import com.airbnb.lottie.LottieDrawable
import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.bundle.PresetHandle
import com.swmansion.pulsar.types.ConfigPoint
import com.swmansion.pulsar.types.ContinuousPattern
import com.swmansion.pulsar.types.PatternData
import com.swmansion.pulsar.types.RealtimeComposable
import com.swmansion.pulsar.types.ValuePoint
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Assert.assertNotEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertSame
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.RuntimeEnvironment
import org.robolectric.Shadows.shadowOf
import org.robolectric.annotation.Config
import org.robolectric.shadows.ShadowVibrator

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34])
class HapticLottieControllerTest {

    private lateinit var pulsar: Pulsar

    private val pattern = PatternData(
        continuousPattern = ContinuousPattern(
            amplitude = listOf(ValuePoint(0L, 0f), ValuePoint(800L, 1f)),
            frequency = listOf(ValuePoint(0L, 0.3f)),
        ),
        discretePattern = listOf(
            ConfigPoint(250L, 1f, 0.5f),
            ConfigPoint(600L, 0.4f, 0.2f),
        ),
    )

    private lateinit var realtime: RecordingComposable

    @Before
    fun setUp() {
        val app = RuntimeEnvironment.getApplication()
        shadowOf(app).grantPermissions(Manifest.permission.VIBRATE)
        shadowOf(app.getSystemService(Vibrator::class.java)).apply {
            setHasVibrator(true)
            setHasAmplitudeControl(true)
        }
        ShadowVibrator.reset()
        pulsar = Pulsar(app)
        realtime = RecordingComposable()
        pulsar.getRealtimeComposer().delegate = realtime
    }

    private fun vibratorTouched(): Boolean {
        val shadow = shadowOf(
            RuntimeEnvironment.getApplication().getSystemService(Vibrator::class.java),
        )
        return shadow.isVibrating ||
            shadow.milliseconds > 0L ||
            shadow.pattern != null ||
            shadow.effectId != 0 ||
            shadow.primitiveEffects.orEmpty().isNotEmpty()
    }

    private fun twoSecondComposition(): LottieComposition =
        LottieCompositionFactory.fromJsonStringSync(TestBundle.LOTTIE_JSON, null).value!!

    private fun view(withComposition: Boolean = true): LottieAnimationView =
        LottieAnimationView(RuntimeEnvironment.getApplication()).apply {
            if (withComposition) setComposition(twoSecondComposition())
        }

    private fun LottieAnimationView.tickAt(ms: Long, clockMs: Long = PATTERN_CLOCK_MS) {
        progress = ms.toFloat() / clockMs
    }

    private fun preset(
        durationMs: Double = 1500.0,
        withAudio: Boolean = false,
        withAnimation: Boolean = true,
    ): PresetHandle = pulsar
        .loadBundle(TestBundle.bytes(durationMs, withAudio, withAnimation))
        .handle("celebration")!!

    @Test
    fun bindHapticsReturnsAControllerForTheView() {
        assertNotNull(view().bindHaptics(pulsar, haptics = pattern))
    }

    @Test
    fun aViewCanBeBoundWithNoHapticsAtAll() {
        val lottie = view()
        val controller = lottie.bindHaptics(pulsar)

        controller.setTimestamp(400)
        controller.play()
        controller.stop()

        assertEquals(0f, lottie.progress, 1e-6f)
    }

    @Test
    fun aPresetSuppliesThePatternAndTheAuthoredDuration() {
        val lottie = view()
        val controller = lottie.bindHaptics(pulsar, preset = preset(durationMs = 1500.0))

        controller.setTimestamp(750)

        assertEquals(0.5f, lottie.progress, 1e-6f)
    }

    @Test
    fun anExplicitDurationWinsOverEverything() {
        val lottie = view()
        val controller =
            lottie.bindHaptics(pulsar, preset = preset(), haptics = pattern, durationMs = 1000L)

        controller.setTimestamp(500)

        assertEquals(0.5f, lottie.progress, 1e-6f)
    }

    @Test
    fun aZeroDurationFallsThroughToThePresetsOwn() {
        val lottie = view()
        val controller = lottie.bindHaptics(pulsar, preset = preset(durationMs = 1500.0), durationMs = 0L)

        controller.setTimestamp(750)

        assertEquals(0.5f, lottie.progress, 1e-6f)
    }

    @Test
    fun theCompositionLengthIsAdoptedWhenItLoadsAfterBinding() {
        val lottie = view(withComposition = false)
        val controller = lottie.bindHaptics(pulsar, haptics = pattern)

        lottie.setComposition(twoSecondComposition())
        controller.setTimestamp(1000)

        assertEquals(0.5f, lottie.progress, 1e-3f)
    }

    @Test
    fun aCompositionTheViewAlreadyHadCountsToo() {
        val lottie = view()
        val controller = lottie.bindHaptics(pulsar, haptics = pattern)

        controller.setTimestamp(1000)

        assertEquals(0.5f, lottie.progress, 1e-3f)
    }

    @Test
    fun playRewindsToTheStart() {
        val lottie = view()
        val controller = lottie.bindHaptics(pulsar, haptics = pattern, durationMs = PATTERN_CLOCK_MS)
        controller.setTimestamp(400)

        controller.play()

        assertEquals(0f, lottie.progress, 1e-6f)
    }

    @Test
    fun stopAndResetBothRewind() {
        val lottie = view()
        val controller = lottie.bindHaptics(pulsar, haptics = pattern, durationMs = PATTERN_CLOCK_MS)

        controller.setTimestamp(600)
        controller.stop()
        assertEquals(0f, lottie.progress, 1e-6f)

        controller.setTimestamp(600)
        controller.reset()
        assertEquals(0f, lottie.progress, 1e-6f)
    }

    @Test
    fun pauseAndResumeLeaveThePlayheadWhereItWas() {
        val lottie = view()
        val controller = lottie.bindHaptics(pulsar, haptics = pattern, durationMs = PATTERN_CLOCK_MS)
        controller.setTimestamp(600)

        controller.pause()
        controller.resume()

        assertEquals(0.75f, lottie.progress, 1e-6f)
    }

    @Test
    fun setTimestampClampsToBothEndsOfTheClock() {
        val lottie = view()
        val controller = lottie.bindHaptics(pulsar, haptics = pattern, durationMs = PATTERN_CLOCK_MS)

        controller.setTimestamp(5000)
        assertEquals(1f, lottie.progress, 1e-6f)

        controller.setTimestamp(-100)
        assertEquals(0f, lottie.progress, 1e-6f)
    }

    @Test
    fun setLoopMapsOntoTheViewsRepeatConfiguration() {
        val lottie = view()
        val controller = lottie.bindHaptics(pulsar, haptics = pattern)

        controller.setLoop(true)
        assertNotEquals(NO_REPEATS, lottie.repeatCount)
        assertEquals(LottieDrawable.RESTART, lottie.repeatMode)

        controller.setLoop(true, count = 3, reverse = true)
        assertEquals(3, lottie.repeatCount)
        assertEquals(LottieDrawable.REVERSE, lottie.repeatMode)

        controller.setLoop(false)
        assertEquals(NO_REPEATS, lottie.repeatCount)
    }

    @Test
    fun aTickSamplesTheEnvelopesAndFiresThePassedTransients() {
        val lottie = view()
        lottie.bindHaptics(pulsar, haptics = pattern, durationMs = PATTERN_CLOCK_MS)

        lottie.tickAt(400)

        assertEquals(0.5f, realtime.sets.last().first, 1e-3f)
        assertEquals(0.3f, realtime.sets.last().second, 1e-6f)
        assertEquals(1, realtime.discretes.size)
        assertEquals(1f, realtime.discretes.last().first, 1e-6f)

        lottie.tickAt(720)

        assertEquals(2, realtime.discretes.size)
        assertEquals(0.4f, realtime.discretes.last().first, 1e-6f)
        assertEquals(0.2f, realtime.discretes.last().second, 1e-6f)
    }

    @Test
    fun aTransientNeverFiresTwiceInOnePass() {
        val lottie = view()
        lottie.bindHaptics(pulsar, haptics = pattern, durationMs = PATTERN_CLOCK_MS)

        lottie.tickAt(320)
        lottie.tickAt(360)
        lottie.tickAt(400)

        assertEquals(1, realtime.discretes.size)
    }

    @Test
    fun wrappingBackToTheStartReArmsTheTransients() {
        val lottie = view()
        lottie.bindHaptics(pulsar, haptics = pattern, durationMs = PATTERN_CLOCK_MS)

        lottie.tickAt(400)
        lottie.tickAt(80)
        lottie.tickAt(400)

        assertEquals(2, realtime.discretes.size)
    }

    @Test
    fun hapticOffsetShiftsWhereThePatternIsSampled() {
        val lottie = view()
        lottie.bindHaptics(pulsar, haptics = pattern, durationMs = PATTERN_CLOCK_MS, hapticOffset = 400L)

        lottie.tickAt(200)

        assertEquals(0.75f, realtime.sets.last().first, 1e-3f)
    }

    @Test
    fun aDiscreteOnlyPatternDrivesNoContinuousChannel() {
        val lottie = view()
        val discreteOnly = PatternData(
            continuousPattern = ContinuousPattern(amplitude = emptyList(), frequency = emptyList()),
            discretePattern = listOf(ConfigPoint(100L, 1f, 0.5f)),
        )
        val controller = lottie.bindHaptics(pulsar, haptics = discreteOnly, durationMs = PATTERN_CLOCK_MS)

        lottie.tickAt(400)
        controller.pause()

        assertTrue(realtime.sets.isEmpty())
        assertEquals(1, realtime.discretes.size)
        assertEquals(0, realtime.stops)
    }

    @Test
    fun pauseStopAndResetSilenceTheContinuousChannel() {
        val lottie = view()
        val controller = lottie.bindHaptics(pulsar, haptics = pattern, durationMs = PATTERN_CLOCK_MS)

        controller.pause()
        controller.stop()
        controller.reset()

        assertEquals(3, realtime.stops)
    }

    @Test
    fun playRearmsTheTransientWindow() {
        val lottie = view()
        val controller = lottie.bindHaptics(pulsar, haptics = pattern, durationMs = PATTERN_CLOCK_MS)

        lottie.tickAt(400)
        controller.play()
        lottie.tickAt(400)

        assertEquals(2, realtime.discretes.size)
    }

    @Test
    fun hapticsDisabledLeavesTheEngineUntouched() {
        val lottie = view()
        val controller =
            lottie.bindHaptics(pulsar, haptics = pattern, durationMs = PATTERN_CLOCK_MS, hapticsEnabled = false)

        lottie.tickAt(400)
        lottie.tickAt(720)
        controller.play()
        controller.stop()

        assertTrue(realtime.sets.isEmpty())
        assertTrue(realtime.discretes.isEmpty())
        assertFalse(vibratorTouched())
    }

    @Test
    fun releaseDetachesTheListenerSoLaterFramesAreSilent() {
        val lottie = view()
        val controller = lottie.bindHaptics(pulsar, haptics = pattern, durationMs = PATTERN_CLOCK_MS)

        controller.release()
        realtime.clear()

        lottie.tickAt(400)
        lottie.tickAt(720)

        assertTrue(realtime.sets.isEmpty())
        assertTrue(realtime.discretes.isEmpty())
    }

    @Test
    fun releaseIsSafeToCallTwice() {
        val controller = view().bindHaptics(pulsar, haptics = pattern)

        controller.release()
        controller.release()
    }

    @Test
    fun aPresetWithAudioPlaysThroughThePresetItself() {
        val controller = view().bindHaptics(pulsar, preset = preset(withAudio = true))

        controller.play()
        controller.pause()
        controller.stop()
        controller.release()
    }

    @Test
    fun patternModeBuffersAndFiresTheWholePattern() {
        val lottie = view()
        val controller = lottie.bindHaptics(
            pulsar,
            haptics = pattern,
            hapticMode = HapticMode.PATTERN,
            durationMs = PATTERN_CLOCK_MS,
        )
        lottie.tickAt(400)
        assertTrue(realtime.sets.isEmpty())
        assertTrue(realtime.discretes.isEmpty())
        assertFalse(vibratorTouched())

        controller.play()
        assertTrue(vibratorTouched())

        controller.stop()
    }

    @Test
    fun theViewExposesTheControllerItLastBound() {
        val lottie = HapticLottieView(RuntimeEnvironment.getApplication())
        assertNull(lottie.hapticController())

        val first = lottie.bindHaptics(pulsar, haptics = pattern)
        assertSame(first, lottie.hapticController())

        val second = lottie.bindHaptics(pulsar, haptics = pattern)
        assertSame(second, lottie.hapticController())
    }

    @Test
    fun theViewKeepsAnAnimationItAlreadyHas() {
        val lottie = HapticLottieView(RuntimeEnvironment.getApplication())
        val existing = twoSecondComposition()
        lottie.setComposition(existing)

        lottie.bindHaptics(pulsar, preset = preset())

        assertSame(existing, lottie.composition)
    }

    @Test
    fun aPresetWithoutAnAnimationLeavesTheViewEmpty() {
        val lottie = HapticLottieView(RuntimeEnvironment.getApplication())

        val controller = lottie.bindHaptics(pulsar, preset = preset(withAnimation = false))

        assertNull(lottie.composition)
        assertNotNull(controller)
    }

    private class RecordingComposable : RealtimeComposable {
        val sets = mutableListOf<Pair<Float, Float>>()
        val discretes = mutableListOf<Pair<Float, Float>>()
        var stops = 0

        override fun set(amplitude: Float, frequency: Float) {
            sets += amplitude to frequency
        }

        override fun playDiscrete(amplitude: Float, frequency: Float) {
            discretes += amplitude to frequency
        }

        override fun stop() {
            stops++
        }

        override fun isActive(): Boolean = false

        fun clear() {
            sets.clear()
            discretes.clear()
            stops = 0
        }
    }

    private companion object {
        const val NO_REPEATS = 0
        const val PATTERN_CLOCK_MS = 800L
    }
}
