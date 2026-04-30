package com.swmansion.pulsar.kmp

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class PulsarFacadeTest {
    @Test
    fun delegatesToRegisteredFactory() {
        val factory = FakeFactory()
        Pulsar.registerFactory(factory)

        val pulsar = Pulsar.create()
        val presets = pulsar.getPresets()
        val composer = pulsar.getPatternComposer()
        val realtime = pulsar.getRealtimeComposer()

        assertTrue(presets.play("Hammer"))
        pulsar.preloadPresets(listOf("Hammer", "Spark"))
        pulsar.enableHaptics(false)
        pulsar.enableSound(false)
        pulsar.enableCache(false)
        pulsar.clearCache()
        composer.parsePattern(
            PatternData(
                continuousPattern = ContinuousPattern(
                    amplitude = listOf(ValuePoint(0, 0f), ValuePoint(80, 1f)),
                    frequency = listOf(ValuePoint(0, 0.2f), ValuePoint(80, 0.8f)),
                ),
                discretePattern = listOf(ConfigPoint(0, 1f, 0.4f)),
            ),
        )
        composer.play()
        composer.playPattern(PatternData())
        composer.playAudioOnly()
        composer.stop()
        realtime.set(0.6f, 0.4f)
        realtime.playDiscrete(1f, 0.5f)
        realtime.stop()

        assertEquals(listOf("Hammer", "Spark"), factory.handle.preloaded)
        assertFalse(factory.handle.hapticsEnabled)
        assertFalse(factory.handle.soundEnabled)
        assertFalse(factory.handle.cacheEnabled)
        assertTrue(factory.handle.cacheCleared)
        assertTrue(factory.handle.patternParsed)
        assertTrue(factory.handle.patternPlayed)
        assertTrue(factory.handle.audioPlayed)
        assertTrue(factory.handle.patternStopped)
        assertEquals(0.6f to 0.4f, factory.handle.lastRealtimeSet)
        assertEquals(1f to 0.5f, factory.handle.lastRealtimeDiscrete)
        assertTrue(factory.handle.realtimeStopped)
        assertTrue(pulsar.isHapticsEnabled())
        assertTrue(pulsar.isHapticsSupported())
        assertTrue(pulsar.canPlayHaptics())
        pulsar.shutDownEngine()
        assertTrue(factory.handle.engineShutDown)
    }
}

private class FakeFactory : PulsarPlatformFactory {
    val handle = FakeHandle()

    override fun createPulsar(): PulsarPlatformHandle = handle
}

private class FakeHandle : PulsarPlatformHandle {
    val presetsHandle = FakePresetsHandle()
    val patternHandle = FakePatternHandle()
    val realtimeHandle = FakeRealtimeHandle()

    val preloaded = mutableListOf<String>()
    var hapticsEnabled = true
    var soundEnabled = true
    var cacheEnabled = true
    var cacheCleared = false
    var engineShutDown = false

    override fun presets(): PulsarPresetsHandle = presetsHandle

    override fun patternComposer(): PatternComposerHandle = patternHandle

    override fun realtimeComposer(): RealtimeComposerHandle = realtimeHandle

    override fun preloadPreset(name: String) {
        preloaded += name
    }

    override fun enableHaptics(state: Boolean) {
        hapticsEnabled = state
    }

    override fun enableSound(state: Boolean) {
        soundEnabled = state
    }

    override fun enableCache(state: Boolean) {
        cacheEnabled = state
    }

    override fun clearCache() {
        cacheCleared = true
    }

    override fun stopHaptics() = Unit

    override fun shutDownEngine() {
        engineShutDown = true
    }

    override fun isHapticsEnabled(): Boolean = true

    override fun isHapticsSupported(): Boolean = true

    override fun canPlayHaptics(): Boolean = true

    val patternParsed get() = patternHandle.parsed
    val patternPlayed get() = patternHandle.played
    val audioPlayed get() = patternHandle.audioOnlyPlayed
    val patternStopped get() = patternHandle.stopped
    val lastRealtimeSet get() = realtimeHandle.lastSet
    val lastRealtimeDiscrete get() = realtimeHandle.lastDiscrete
    val realtimeStopped get() = realtimeHandle.stopped
}

private class FakePresetsHandle : PulsarPresetsHandle {
    override fun play(name: String): Boolean = name == "Hammer"
    override fun systemImpactLight() = Unit
    override fun systemImpactMedium() = Unit
    override fun systemImpactHeavy() = Unit
    override fun systemImpactSoft() = Unit
    override fun systemImpactRigid() = Unit
    override fun systemNotificationSuccess() = Unit
    override fun systemNotificationWarning() = Unit
    override fun systemNotificationError() = Unit
    override fun systemSelection() = Unit
}

private class FakePatternHandle : PatternComposerHandle {
    var parsed = false
    var played = false
    var audioOnlyPlayed = false
    var stopped = false

    override fun parsePattern(pattern: PatternData) {
        parsed = true
    }

    override fun playPattern(pattern: PatternData) {
        parsed = true
        played = true
    }

    override fun play() {
        played = true
    }

    override fun playAudioOnly() {
        audioOnlyPlayed = true
    }

    override fun stop() {
        stopped = true
    }
}

private class FakeRealtimeHandle : RealtimeComposerHandle {
    var lastSet: Pair<Float, Float>? = null
    var lastDiscrete: Pair<Float, Float>? = null
    var stopped = false

    override fun set(amplitude: Float, frequency: Float) {
        lastSet = amplitude to frequency
    }

    override fun playDiscrete(amplitude: Float, frequency: Float) {
        lastDiscrete = amplitude to frequency
    }

    override fun stop() {
        stopped = true
    }

    override fun isActive(): Boolean = false
}
