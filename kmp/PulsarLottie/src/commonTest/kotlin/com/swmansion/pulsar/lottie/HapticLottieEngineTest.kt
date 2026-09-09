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
        val (p, handle) = installRecordingPulsar()
        pulsar = p
        device = handle
    }

    private fun preset(durationMs: Double = 1500.0, withAnimation: Boolean = true): PresetHandle =
        pulsar.loadBundle(TestBundle.bytes(durationMs, withAnimation)).handle("celebration")!!

    private fun HapticLottieEngine.tickAt(ms: Long, animationMs: Long = 0L) {
        val clock = if (animationMs > 0L) animationMs else PATTERN_CLOCK_MS
        onProgress(ms.toFloat() / clock, animationMs)
    }

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

    @Test
    fun progressSamplesTheEnvelopesAndFiresThePassedTransients() {
        val e = engine(haptics = pattern, durationMs = PATTERN_CLOCK_MS)
        e.setPlaying(true)

        e.tickAt(400)

        assertEquals(0.5f, device.realtime.sets.last().first, 1e-3f)
        assertEquals(0.3f, device.realtime.sets.last().second, 1e-6f)
        assertEquals(1, device.realtime.discretes.size)
        assertEquals(1f, device.realtime.discretes.last().first, 1e-6f)

        e.tickAt(720)

        assertEquals(2, device.realtime.discretes.size)
        assertEquals(0.4f, device.realtime.discretes.last().first, 1e-6f)
        assertEquals(0.2f, device.realtime.discretes.last().second, 1e-6f)
    }

    @Test
    fun nothingIsEmittedBeforePlayingStarts() {
        val e = engine(haptics = pattern, durationMs = PATTERN_CLOCK_MS)

        e.tickAt(400)

        assertTrue(device.realtime.sets.isEmpty())
        assertTrue(device.realtime.discretes.isEmpty())
    }

    @Test
    fun aTransientNeverFiresTwiceInOnePass() {
        val e = engine(haptics = pattern, durationMs = PATTERN_CLOCK_MS)
        e.setPlaying(true)

        e.tickAt(320)
        e.tickAt(360)
        e.tickAt(400)

        assertEquals(1, device.realtime.discretes.size)
    }

    @Test
    fun wrappingBackToTheStartReArmsTheTransients() {
        val e = engine(haptics = pattern, durationMs = PATTERN_CLOCK_MS)
        e.setPlaying(true)

        e.tickAt(400)
        e.tickAt(80)
        e.tickAt(400)

        assertEquals(2, device.realtime.discretes.size)
    }

    @Test
    fun aCallerCanSupplyItsOwnAnimationLength() {
        val e = engine(haptics = pattern)
        e.setPlaying(true)

        e.tickAt(400, animationMs = 1600L)

        assertEquals(0.5f, device.realtime.sets.last().first, 1e-3f)
        assertEquals(1, device.realtime.discretes.size)
    }

    @Test
    fun anExplicitDurationOutranksTheOneFedPerFrame() {
        val e = engine(haptics = pattern, durationMs = PATTERN_CLOCK_MS)
        e.setPlaying(true)

        e.onProgress(progress = 0.5f, durationMs = 4000L)

        assertEquals(0.5f, device.realtime.sets.last().first, 1e-3f)
    }

    @Test
    fun hapticOffsetShiftsWhereThePatternIsSampled() {
        val e = engine(haptics = pattern, durationMs = PATTERN_CLOCK_MS, hapticOffset = 400L)
        e.setPlaying(true)

        e.tickAt(200)

        assertEquals(0.75f, device.realtime.sets.last().first, 1e-3f)
    }

    @Test
    fun aDiscreteOnlyPatternDrivesNoContinuousChannel() {
        val discreteOnly = PatternData(
            continuousPattern = ContinuousPattern(amplitude = emptyList(), frequency = emptyList()),
            discretePattern = listOf(ConfigPoint(100L, 1f, 0.5f)),
        )
        val e = engine(haptics = discreteOnly, durationMs = PATTERN_CLOCK_MS)
        e.setPlaying(true)

        e.tickAt(400)
        e.stop()

        assertTrue(device.realtime.sets.isEmpty())
        assertEquals(1, device.realtime.discretes.size)
        assertEquals(0, device.realtime.stops, "nothing continuous is running, so nothing is stopped")
    }

    @Test
    fun hapticsDisabledLeavesTheEngineUntouched() {
        val e = engine(haptics = pattern, durationMs = PATTERN_CLOCK_MS, hapticsEnabled = false)

        e.setPlaying(true)
        e.tickAt(400)
        e.setPlaying(false)

        assertTrue(device.realtime.sets.isEmpty())
        assertTrue(device.realtime.discretes.isEmpty())
        assertEquals(0, device.pattern.plays)
    }

    @Test
    fun pausingStopsTheContinuousChannelAndRewindsTheWindow() {
        val e = engine(haptics = pattern, durationMs = PATTERN_CLOCK_MS)
        e.setPlaying(true)
        e.tickAt(400)

        e.setPlaying(false)
        assertEquals(1, device.realtime.stops)

        e.setPlaying(true)
        e.tickAt(400)
        assertEquals(2, device.realtime.discretes.size, "the window restarts, so the transient replays")
    }

    @Test
    fun repeatingTheSamePlayStateChangesNothing() {
        val e = engine(haptics = pattern, durationMs = PATTERN_CLOCK_MS)

        e.setPlaying(true)
        e.setPlaying(true)
        e.setPlaying(false)
        e.setPlaying(false)

        assertEquals(1, device.realtime.stops)
    }

    @Test
    fun stopIsSafeBeforeAnythingPlayed() {
        engine(haptics = pattern, durationMs = PATTERN_CLOCK_MS).stop()

        assertEquals(1, device.realtime.stops)
    }

    @Test
    fun patternModeBuffersUpFrontAndFiresOnPlay() {
        val e = engine(haptics = pattern, hapticMode = HapticMode.PATTERN, durationMs = PATTERN_CLOCK_MS)

        assertEquals(1, device.pattern.parsed.size, "the pattern is pre-parsed so play() is instant")
        assertEquals(0, device.pattern.plays)

        e.setPlaying(true)
        assertEquals(1, device.pattern.plays)

        e.tickAt(400)
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
        engine(haptics = pattern, durationMs = PATTERN_CLOCK_MS).setPlaying(true)

        assertTrue(device.pattern.parsed.isEmpty())
        assertEquals(0, device.pattern.plays)
    }

    @Test
    fun withNoPatternAtAllNothingIsWiredUp() {
        val e = engine()

        e.setPlaying(true)
        e.tickAt(400)
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

        e.tickAt(400)

        assertEquals(1f, device.realtime.sets.last().first, 1e-6f)
        assertEquals(0.9f, device.realtime.sets.last().second, 1e-6f)
        assertTrue(device.realtime.discretes.isEmpty(), "the preset's transients are not used")
    }

    @Test
    fun animationJsonDecodesTheLottieThePresetWasAuthoredAgainst() {
        assertEquals(TestBundle.LOTTIE_JSON, preset().animationJson())
    }

    @Test
    fun animationJsonIsNullForAPresetWithoutOne() {
        assertNull(preset(withAnimation = false).animationJson())
    }

    private companion object {
        const val PATTERN_CLOCK_MS = 800L
    }
}
