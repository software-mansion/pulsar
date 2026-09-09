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

/**
 * Public-API coverage for [HapticLottieController], [LottieAnimationView.bindHaptics]
 * and [HapticLottieView].
 *
 * Everything here needs a real `Context`, `Vibrator` and `LottieAnimationView`, so it
 * runs under Robolectric. Writing `progress` on a view that has a composition notifies
 * the animator's update listeners synchronously, which is the controller's own per-frame
 * clock — that is how the ticks below are driven deterministically.
 */
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

    /** Records what the controller's per-frame clock pushes into the realtime engine. */
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
        // `Pulsar` caches one realtime composer, and its delegate is swappable — so the
        // controller ends up driving this recorder instead of the device.
        realtime = RecordingComposable()
        pulsar.getRealtimeComposer().delegate = realtime
    }

    /** True once the pattern engine has pushed an effect at the device. */
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

    private fun composition(): LottieComposition =
        LottieCompositionFactory.fromJsonStringSync(TestBundle.LOTTIE_JSON, null).value!!

    /** A view that already renders a 2s composition, so `progress` writes take effect. */
    private fun view(withComposition: Boolean = true): LottieAnimationView =
        LottieAnimationView(RuntimeEnvironment.getApplication()).apply {
            if (withComposition) setComposition(composition())
        }

    private fun preset(
        durationMs: Double = 1500.0,
        withAudio: Boolean = false,
        withAnimation: Boolean = true,
    ): PresetHandle = pulsar
        .loadBundle(TestBundle.bytes(durationMs, withAudio, withAnimation))
        .handle("celebration")!!

    // region construction

    @Test
    fun bindHapticsReturnsAControllerForTheView() {
        assertNotNull(view().bindHaptics(pulsar, haptics = pattern))
    }

    @Test
    fun aViewCanBeBoundWithNoHapticsAtAll() {
        val lottie = view()
        val controller = lottie.bindHaptics(pulsar)

        // Transport still steers the animation; nothing reaches the engine.
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

    // endregion

    // region duration resolution, observed through setTimestamp

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

        lottie.setComposition(composition()) // 60 frames @ 30fps ≈ 2000ms
        controller.setTimestamp(1000)

        assertEquals(0.5f, lottie.progress, 1e-3f)
    }

    @Test
    fun aCompositionTheViewAlreadyHadCountsToo() {
        val lottie = view() // composition set before binding
        val controller = lottie.bindHaptics(pulsar, haptics = pattern)

        controller.setTimestamp(1000)

        assertEquals(0.5f, lottie.progress, 1e-3f)
    }

    // endregion

    // region transport

    @Test
    fun playRewindsToTheStart() {
        val lottie = view()
        val controller = lottie.bindHaptics(pulsar, haptics = pattern, durationMs = 800L)
        controller.setTimestamp(400)

        controller.play()

        assertEquals(0f, lottie.progress, 1e-6f)
    }

    @Test
    fun stopAndResetBothRewind() {
        val lottie = view()
        val controller = lottie.bindHaptics(pulsar, haptics = pattern, durationMs = 800L)

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
        val controller = lottie.bindHaptics(pulsar, haptics = pattern, durationMs = 800L)
        controller.setTimestamp(600)

        controller.pause()
        controller.resume()

        assertEquals(0.75f, lottie.progress, 1e-6f)
    }

    @Test
    fun setTimestampClampsToBothEndsOfTheClock() {
        val lottie = view()
        val controller = lottie.bindHaptics(pulsar, haptics = pattern, durationMs = 800L)

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
        // Robolectric's ValueAnimator shadow rewrites INFINITE to 1 so a test can never
        // hang on an endless animation — all that is observable here is "looping, forward".
        assertNotEquals(0, lottie.repeatCount)
        assertEquals(LottieDrawable.RESTART, lottie.repeatMode)

        controller.setLoop(true, count = 3, reverse = true)
        assertEquals(3, lottie.repeatCount)
        assertEquals(LottieDrawable.REVERSE, lottie.repeatMode)

        controller.setLoop(false)
        assertEquals(0, lottie.repeatCount)
    }

    // endregion

    // region the per-frame haptic clock

    @Test
    fun aTickSamplesTheEnvelopesAndFiresThePassedTransients() {
        val lottie = view()
        lottie.bindHaptics(pulsar, haptics = pattern, durationMs = 800L)

        lottie.progress = 0.5f // t = 400ms

        assertEquals(0.5f, realtime.sets.last().first, 1e-3f)
        assertEquals(0.3f, realtime.sets.last().second, 1e-6f)
        assertEquals(1, realtime.discretes.size)
        assertEquals(1f, realtime.discretes.last().first, 1e-6f)

        lottie.progress = 0.9f // t = 720ms — the 600ms transient is now behind us

        assertEquals(2, realtime.discretes.size)
        assertEquals(0.4f, realtime.discretes.last().first, 1e-6f)
        assertEquals(0.2f, realtime.discretes.last().second, 1e-6f)
    }

    @Test
    fun aTransientNeverFiresTwiceInOnePass() {
        val lottie = view()
        lottie.bindHaptics(pulsar, haptics = pattern, durationMs = 800L)

        lottie.progress = 0.4f
        lottie.progress = 0.45f
        lottie.progress = 0.5f

        assertEquals(1, realtime.discretes.size)
    }

    @Test
    fun wrappingBackToTheStartReArmsTheTransients() {
        val lottie = view()
        lottie.bindHaptics(pulsar, haptics = pattern, durationMs = 800L)

        lottie.progress = 0.5f
        lottie.progress = 0.1f // looped
        lottie.progress = 0.5f

        assertEquals(2, realtime.discretes.size)
    }

    @Test
    fun hapticOffsetShiftsWhereThePatternIsSampled() {
        val lottie = view()
        lottie.bindHaptics(pulsar, haptics = pattern, durationMs = 800L, hapticOffset = 400L)

        lottie.progress = 0.25f // t = 200ms, sampled at 600ms

        assertEquals(0.75f, realtime.sets.last().first, 1e-3f)
    }

    @Test
    fun aDiscreteOnlyPatternDrivesNoContinuousChannel() {
        val lottie = view()
        val discreteOnly = PatternData(
            continuousPattern = ContinuousPattern(amplitude = emptyList(), frequency = emptyList()),
            discretePattern = listOf(ConfigPoint(100L, 1f, 0.5f)),
        )
        val controller = lottie.bindHaptics(pulsar, haptics = discreteOnly, durationMs = 800L)

        lottie.progress = 0.5f
        controller.pause()

        assertTrue(realtime.sets.isEmpty())
        assertEquals(1, realtime.discretes.size)
        assertEquals(0, realtime.stops)
    }

    @Test
    fun pauseStopAndResetSilenceTheContinuousChannel() {
        val lottie = view()
        val controller = lottie.bindHaptics(pulsar, haptics = pattern, durationMs = 800L)

        controller.pause()
        controller.stop()
        controller.reset()

        assertEquals(3, realtime.stops)
    }

    @Test
    fun playRearmsTheTransientWindow() {
        val lottie = view()
        val controller = lottie.bindHaptics(pulsar, haptics = pattern, durationMs = 800L)

        lottie.progress = 0.5f
        controller.play()
        lottie.progress = 0.5f

        assertEquals(2, realtime.discretes.size)
    }

    @Test
    fun hapticsDisabledLeavesTheEngineUntouched() {
        val lottie = view()
        val controller =
            lottie.bindHaptics(pulsar, haptics = pattern, durationMs = 800L, hapticsEnabled = false)

        lottie.progress = 0.5f
        lottie.progress = 0.9f
        controller.play()
        controller.stop()

        assertTrue(realtime.sets.isEmpty())
        assertTrue(realtime.discretes.isEmpty())
        assertFalse(vibratorTouched())
    }

    @Test
    fun releaseDetachesTheListenerSoLaterFramesAreSilent() {
        val lottie = view()
        val controller = lottie.bindHaptics(pulsar, haptics = pattern, durationMs = 800L)

        controller.release()
        realtime.clear()

        lottie.progress = 0.5f
        lottie.progress = 0.9f

        assertTrue(realtime.sets.isEmpty())
        assertTrue(realtime.discretes.isEmpty())
    }

    @Test
    fun releaseIsSafeToCallTwice() {
        val controller = view().bindHaptics(pulsar, haptics = pattern)

        controller.release()
        controller.release()
    }

    // endregion

    // region modes

    @Test
    fun aPresetWithAudioPlaysThroughThePresetItself() {
        // `pattern` mode is chosen for it, so the preset's own audio plays with the haptics.
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
            durationMs = 800L,
        )
        // In pattern mode the timeline is not the haptic clock: ticking emits nothing.
        lottie.progress = 0.5f
        assertTrue(realtime.sets.isEmpty())
        assertTrue(realtime.discretes.isEmpty())
        assertFalse(vibratorTouched())

        // The whole buffered pattern goes to the device in one shot instead.
        controller.play()
        assertTrue(vibratorTouched())

        controller.stop()
    }

    // endregion

    // region HapticLottieView

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
        val existing = composition()
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

    // endregion

    /** Stands in for the device end of `RealtimeComposer`. */
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
}
