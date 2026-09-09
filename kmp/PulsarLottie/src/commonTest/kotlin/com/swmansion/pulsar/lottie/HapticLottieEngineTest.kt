package com.swmansion.pulsar.lottie

import com.swmansion.pulsar.kmp.ConfigPoint
import com.swmansion.pulsar.kmp.ContinuousPattern
import com.swmansion.pulsar.kmp.PatternData
import com.swmansion.pulsar.kmp.Pulsar
import com.swmansion.pulsar.kmp.ValuePoint
import com.swmansion.pulsar.kmp.bundle.PresetHandle
import kotlin.test.BeforeTest
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNull
import kotlin.test.assertTrue

/**
 * Public-API coverage for [HapticLottieEngine] and [animationJson] — the whole
 * non-Compose surface of the KMP Lottie SDK. The `@Composable` wrappers
 * ([HapticLottie], [HapticLottieSync]) are thin adapters that feed this engine
 * a Compose progress value.
 */
class HapticLottieEngineTest {

    private lateinit var pulsar: Pulsar
    private lateinit var device: RecordingHandle

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

    @BeforeTest
    fun setUp() {
        val (p, handle) = installTestPulsar()
        pulsar = p
        device = handle
    }

    private fun preset(durationMs: Double = 1500.0, withAnimation: Boolean = true): PresetHandle =
        pulsar.loadBundle(TestBundle.bytes(durationMs, withAnimation)).handle("celebration")!!

    private fun engine(
        preset: PresetHandle? = null,
        haptics: PatternData? = null,
        hapticMode: HapticMode? = null,
        hapticOffset: Long = 0,
        hapticsEnabled: Boolean = true,
        durationMs: Long? = null,
    ) = HapticLottieEngine(
        pulsar = pulsar,
        preset = preset,
        haptics = haptics,
        hapticMode = hapticMode,
        hapticOffset = hapticOffset,
        hapticsEnabled = hapticsEnabled,
        durationMs = durationMs,
    )

    // region duration resolution

    @Test
    fun anExplicitDurationWinsOverEverything() {
        assertEquals(700L, engine(preset = preset(), haptics = pattern, durationMs = 700L).resolvedDurationMs)
    }

    @Test
    fun thePresetsAuthoredDurationComesNext() {
        assertEquals(1500L, engine(preset = preset(durationMs = 1500.0)).resolvedDurationMs)
    }

    @Test
    fun withoutAHintTheClockIsThePatternsOwnLength() {
        assertEquals(800L, engine(haptics = pattern).resolvedDurationMs)
    }

    @Test
    fun aZeroDurationFallsThroughInsteadOfStoppingTheClock() {
        assertEquals(1500L, engine(preset = preset(durationMs = 1500.0), durationMs = 0L).resolvedDurationMs)
        assertEquals(800L, engine(haptics = pattern, durationMs = 0L).resolvedDurationMs)
    }

    @Test
    fun withNothingToDeriveFromTheClockIsZero() {
        assertEquals(0L, engine().resolvedDurationMs)
    }

    // endregion

    // region the progress-driven clock

    @Test
    fun progressSamplesTheEnvelopesAndFiresThePassedTransients() {
        val e = engine(haptics = pattern, durationMs = 800L)
        e.setPlaying(true)

        e.onProgress(0.5f) // t = 400ms

        assertEquals(0.5f, device.realtime.sets.last().first, 1e-3f)
        assertEquals(0.3f, device.realtime.sets.last().second, 1e-6f)
        assertEquals(1, device.realtime.discretes.size)
        assertEquals(1f, device.realtime.discretes.last().first, 1e-6f)

        e.onProgress(0.9f) // t = 720ms

        assertEquals(2, device.realtime.discretes.size)
        assertEquals(0.4f, device.realtime.discretes.last().first, 1e-6f)
        assertEquals(0.2f, device.realtime.discretes.last().second, 1e-6f)
    }

    @Test
    fun nothingIsEmittedBeforePlayingStarts() {
        val e = engine(haptics = pattern, durationMs = 800L)

        e.onProgress(0.5f)

        assertTrue(device.realtime.sets.isEmpty())
        assertTrue(device.realtime.discretes.isEmpty())
    }

    @Test
    fun aTransientNeverFiresTwiceInOnePass() {
        val e = engine(haptics = pattern, durationMs = 800L)
        e.setPlaying(true)

        e.onProgress(0.4f)
        e.onProgress(0.45f)
        e.onProgress(0.5f)

        assertEquals(1, device.realtime.discretes.size)
    }

    @Test
    fun wrappingBackToTheStartReArmsTheTransients() {
        val e = engine(haptics = pattern, durationMs = 800L)
        e.setPlaying(true)

        e.onProgress(0.5f)
        e.onProgress(0.1f) // looped
        e.onProgress(0.5f)

        assertEquals(2, device.realtime.discretes.size)
    }

    @Test
    fun aCallerCanSupplyItsOwnAnimationLength() {
        val e = engine(haptics = pattern) // no fixed duration
        e.setPlaying(true)

        e.onProgress(0.25f, durationMs = 1600L) // t = 400ms

        assertEquals(0.5f, device.realtime.sets.last().first, 1e-3f)
        assertEquals(1, device.realtime.discretes.size)
    }

    @Test
    fun anExplicitDurationOutranksTheOneFedPerFrame() {
        val e = engine(haptics = pattern, durationMs = 800L)
        e.setPlaying(true)

        e.onProgress(0.5f, durationMs = 4000L) // still t = 400ms

        assertEquals(0.5f, device.realtime.sets.last().first, 1e-3f)
    }

    @Test
    fun hapticOffsetShiftsWhereThePatternIsSampled() {
        val e = engine(haptics = pattern, durationMs = 800L, hapticOffset = 400L)
        e.setPlaying(true)

        e.onProgress(0.25f) // t = 200ms, sampled at 600ms

        assertEquals(0.75f, device.realtime.sets.last().first, 1e-3f)
    }

    @Test
    fun aDiscreteOnlyPatternDrivesNoContinuousChannel() {
        val discreteOnly = PatternData(
            continuousPattern = ContinuousPattern(amplitude = emptyList(), frequency = emptyList()),
            discretePattern = listOf(ConfigPoint(100L, 1f, 0.5f)),
        )
        val e = engine(haptics = discreteOnly, durationMs = 800L)
        e.setPlaying(true)

        e.onProgress(0.5f)
        e.stop()

        assertTrue(device.realtime.sets.isEmpty())
        assertEquals(1, device.realtime.discretes.size)
        assertEquals(0, device.realtime.stops, "nothing continuous is running, so nothing is stopped")
    }

    @Test
    fun hapticsDisabledLeavesTheEngineUntouched() {
        val e = engine(haptics = pattern, durationMs = 800L, hapticsEnabled = false)

        e.setPlaying(true)
        e.onProgress(0.5f)
        e.setPlaying(false)

        assertTrue(device.realtime.sets.isEmpty())
        assertTrue(device.realtime.discretes.isEmpty())
        assertEquals(0, device.pattern.plays)
    }

    // endregion

    // region play/pause and stop

    @Test
    fun pausingStopsTheContinuousChannelAndRewindsTheWindow() {
        val e = engine(haptics = pattern, durationMs = 800L)
        e.setPlaying(true)
        e.onProgress(0.5f)

        e.setPlaying(false)
        assertEquals(1, device.realtime.stops)

        e.setPlaying(true)
        e.onProgress(0.5f)
        assertEquals(2, device.realtime.discretes.size, "the window restarts, so the transient replays")
    }

    @Test
    fun repeatingTheSamePlayStateChangesNothing() {
        val e = engine(haptics = pattern, durationMs = 800L)

        e.setPlaying(true)
        e.setPlaying(true)
        e.setPlaying(false)
        e.setPlaying(false)

        assertEquals(1, device.realtime.stops)
    }

    @Test
    fun stopIsSafeBeforeAnythingPlayed() {
        engine(haptics = pattern, durationMs = 800L).stop()

        assertEquals(1, device.realtime.stops)
    }

    // endregion

    // region pattern mode

    @Test
    fun patternModeBuffersUpFrontAndFiresOnPlay() {
        val e = engine(haptics = pattern, hapticMode = HapticMode.PATTERN, durationMs = 800L)

        assertEquals(1, device.pattern.parsed.size, "the pattern is pre-parsed so play() is instant")
        assertEquals(0, device.pattern.plays)

        e.setPlaying(true)
        assertEquals(1, device.pattern.plays)

        e.onProgress(0.5f)
        assertTrue(device.realtime.sets.isEmpty(), "the timeline is not the haptic clock here")

        e.setPlaying(false)
        assertEquals(1, device.pattern.stops)
    }

    @Test
    fun aPresetCanBePlayedInPatternModeToo() {
        val e = engine(preset = preset(), hapticMode = HapticMode.PATTERN)

        e.setPlaying(true)

        assertEquals(1, device.pattern.plays)
    }

    @Test
    fun realtimeIsTheDefaultAndNeedsNoPatternComposer() {
        engine(haptics = pattern, durationMs = 800L).setPlaying(true)

        assertTrue(device.pattern.parsed.isEmpty())
        assertEquals(0, device.pattern.plays)
    }

    @Test
    fun withNoPatternAtAllNothingIsWiredUp() {
        val e = engine()

        e.setPlaying(true)
        e.onProgress(0.5f)
        e.stop()

        assertTrue(device.pattern.parsed.isEmpty())
        assertEquals(0, device.pattern.plays)
        assertTrue(device.realtime.sets.isEmpty())
    }

    @Test
    fun explicitHapticsOverrideThePresetsOwnPattern() {
        val ownPattern = PatternData(
            continuousPattern = ContinuousPattern(
                amplitude = listOf(ValuePoint(0L, 1f), ValuePoint(400L, 1f)),
                frequency = listOf(ValuePoint(0L, 0.9f)),
            ),
            discretePattern = emptyList(),
        )
        val e = engine(preset = preset(), haptics = ownPattern, durationMs = 400L)
        e.setPlaying(true)

        e.onProgress(0.5f)

        assertEquals(1f, device.realtime.sets.last().first, 1e-6f)
        assertEquals(0.9f, device.realtime.sets.last().second, 1e-6f)
        assertTrue(device.realtime.discretes.isEmpty(), "the preset's transients are not used")
    }

    // endregion

    // region the preset's animation

    @Test
    fun animationJsonDecodesTheLottieThePresetWasAuthoredAgainst() {
        assertEquals(TestBundle.LOTTIE_JSON, preset().animationJson())
    }

    @Test
    fun animationJsonIsNullForAPresetWithoutOne() {
        assertNull(preset(withAnimation = false).animationJson())
    }

    // endregion
}
