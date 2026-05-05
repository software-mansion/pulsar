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
        val configuredRealtime = pulsar.getRealtimeComposer(RealtimeComposerStrategy.PRIMITIVE_COMPLEX)

        assertTrue(presets.play("Hammer"))
        assertTrue(presets.getByName("Hammer")?.play() == true)
        presets.hammer()
        presets.systemSelection()
        presets.systemEffectClick()
        presets.preloadPresetByName("Thunder")
        presets.preloadPresetByNames(listOf("Wave", "Buzz"))
        presets.enableCache(false)
        pulsar.preloadPresets(listOf("Hammer", "Spark"))
        pulsar.enableHaptics(false)
        pulsar.enableSound(false)
        pulsar.enableCache(false)
        assertFalse(pulsar.isCacheEnabled())
        pulsar.clearCache()
        pulsar.stopHaptics()
        pulsar.realtimeComposerStrategy = RealtimeComposerStrategy.ENVELOPE_WITH_DISCRETE_PRIMITIVES
        assertEquals(RealtimeComposerStrategy.ENVELOPE_WITH_DISCRETE_PRIMITIVES, pulsar.realtimeComposerStrategy)
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
        configuredRealtime.set(0.3f, 0.9f)
        realtime.playDiscrete(1f, 0.5f)
        realtime.stop()
        pulsar.forceHapticsSupportLevel(CompatibilityMode.STANDARD_SUPPORT)
        pulsar.enableImpulseCompositionMode(true)

        assertEquals(listOf("Thunder", "Wave", "Buzz"), factory.handle.presetsHandle.preloaded)
        assertEquals(listOf("Hammer", "Spark"), factory.handle.preloaded)
        assertFalse(factory.handle.hapticsEnabled)
        assertFalse(factory.handle.soundEnabled)
        assertFalse(factory.handle.cacheEnabled)
        assertTrue(factory.handle.cacheCleared)
        assertTrue(factory.handle.hapticsStopped)
        assertTrue(factory.handle.patternParsed)
        assertTrue(factory.handle.patternPlayed)
        assertTrue(factory.handle.audioPlayed)
        assertTrue(factory.handle.patternStopped)
        assertEquals(0.3f to 0.9f, factory.handle.lastRealtimeSet)
        assertEquals(1f to 0.5f, factory.handle.lastRealtimeDiscrete)
        assertTrue(factory.handle.realtimeStopped)
        assertEquals(
            listOf("Hammer", "Hammer", "Hammer", "SystemSelection", "SystemEffectClick"),
            factory.handle.playedPresets,
        )
        assertTrue(pulsar.isHapticsEnabled())
        assertTrue(pulsar.isHapticsSupported())
        assertTrue(pulsar.canPlayHaptics())
        assertEquals(CompatibilityMode.STANDARD_SUPPORT, pulsar.hapticSupport())
        assertEquals(CompatibilityMode.STANDARD_SUPPORT, factory.handle.forcedSupportLevel)
        assertTrue(factory.handle.impulseCompositionModeEnabled)
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
    var hapticsStopped = false
    var engineShutDown = false
    var supportLevel = CompatibilityMode.ADVANCED_SUPPORT
    var forcedSupportLevel: CompatibilityMode? = null
    var realtimeComposerStrategyState = RealtimeComposerStrategy.ENVELOPE
    var impulseCompositionModeEnabled = false

    override fun presets(): PulsarPresetsHandle = presetsHandle

    override fun patternComposer(): PatternComposerHandle = patternHandle

    override fun realtimeComposer(): RealtimeComposerHandle = realtimeHandle

    override fun realtimeComposer(strategy: RealtimeComposerStrategy): RealtimeComposerHandle {
        realtimeComposerStrategyState = strategy
        return realtimeHandle
    }

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

    override fun isCacheEnabled(): Boolean = cacheEnabled

    override fun clearCache() {
        cacheCleared = true
    }

    override fun stopHaptics() {
        hapticsStopped = true
    }

    override fun shutDownEngine() {
        engineShutDown = true
    }

    override fun isHapticsEnabled(): Boolean = true

    override fun isHapticsSupported(): Boolean = true

    override fun canPlayHaptics(): Boolean = true

    override fun hapticSupport(): CompatibilityMode = supportLevel

    override fun forceHapticsSupportLevel(mode: CompatibilityMode) {
        supportLevel = mode
        forcedSupportLevel = mode
    }

    override fun getRealtimeComposerStrategy(): RealtimeComposerStrategy = realtimeComposerStrategyState

    override fun setRealtimeComposerStrategy(strategy: RealtimeComposerStrategy) {
        realtimeComposerStrategyState = strategy
    }

    override fun enableImpulseCompositionMode(state: Boolean) {
        impulseCompositionModeEnabled = state
    }

    val patternParsed get() = patternHandle.parsed
    val patternPlayed get() = patternHandle.played
    val audioPlayed get() = patternHandle.audioOnlyPlayed
    val patternStopped get() = patternHandle.stopped
    val lastRealtimeSet get() = realtimeHandle.lastSet
    val lastRealtimeDiscrete get() = realtimeHandle.lastDiscrete
    val realtimeStopped get() = realtimeHandle.stopped
    val playedPresets get() = presetsHandle.playedPresets
}

private class FakePresetsHandle : PulsarPresetsHandle {
    val playedPresets = mutableListOf<String>()
    var cacheEnabled = true
    val availablePresets = mutableSetOf("Hammer")
    val preloaded = mutableListOf<String>()

    override fun has(name: String): Boolean = name in availablePresets

    override fun preloadPresetByName(name: String) {
        preloaded += name
        availablePresets += name
    }

    override fun enableCache(state: Boolean) {
        cacheEnabled = state
    }

    override fun isCacheEnabled(): Boolean = cacheEnabled

    override fun resetCache() = Unit

    override fun play(name: String): Boolean {
        playedPresets += name
        return has(name)
    }

    override fun systemImpactLight() {
        playedPresets += "SystemImpactLight"
    }

    override fun systemImpactMedium() {
        playedPresets += "SystemImpactMedium"
    }

    override fun systemImpactHeavy() {
        playedPresets += "SystemImpactHeavy"
    }

    override fun systemImpactSoft() {
        playedPresets += "SystemImpactSoft"
    }

    override fun systemImpactRigid() {
        playedPresets += "SystemImpactRigid"
    }

    override fun systemNotificationSuccess() {
        playedPresets += "SystemNotificationSuccess"
    }

    override fun systemNotificationWarning() {
        playedPresets += "SystemNotificationWarning"
    }

    override fun systemNotificationError() {
        playedPresets += "SystemNotificationError"
    }

    override fun systemSelection() {
        playedPresets += "SystemSelection"
    }

    override fun systemEffectClick() {
        playedPresets += "SystemEffectClick"
    }

    override fun afterglow() { playedPresets += "Afterglow" }
    override fun aftershock() { playedPresets += "Aftershock" }
    override fun alarm() { playedPresets += "Alarm" }
    override fun anvil() { playedPresets += "Anvil" }
    override fun applause() { playedPresets += "Applause" }
    override fun ascent() { playedPresets += "Ascent" }
    override fun balloonPop() { playedPresets += "BalloonPop" }
    override fun barrage() { playedPresets += "Barrage" }
    override fun bassDrop() { playedPresets += "BassDrop" }
    override fun batter() { playedPresets += "Batter" }
    override fun bellToll() { playedPresets += "BellToll" }
    override fun blip() { playedPresets += "Blip" }
    override fun bloom() { playedPresets += "Bloom" }
    override fun bongo() { playedPresets += "Bongo" }
    override fun boulder() { playedPresets += "Boulder" }
    override fun breakingWave() { playedPresets += "BreakingWave" }
    override fun breath() { playedPresets += "Breath" }
    override fun buildup() { playedPresets += "Buildup" }
    override fun burst() { playedPresets += "Burst" }
    override fun buzz() { playedPresets += "Buzz" }
    override fun cadence() { playedPresets += "Cadence" }
    override fun cameraShutter() { playedPresets += "CameraShutter" }
    override fun canter() { playedPresets += "Canter" }
    override fun cascade() { playedPresets += "Cascade" }
    override fun castanets() { playedPresets += "Castanets" }
    override fun catPaw() { playedPresets += "CatPaw" }
    override fun charge() { playedPresets += "Charge" }
    override fun chime() { playedPresets += "Chime" }
    override fun chip() { playedPresets += "Chip" }
    override fun chirp() { playedPresets += "Chirp" }
    override fun clamor() { playedPresets += "Clamor" }
    override fun clasp() { playedPresets += "Clasp" }
    override fun cleave() { playedPresets += "Cleave" }
    override fun coil() { playedPresets += "Coil" }
    override fun coinDrop() { playedPresets += "CoinDrop" }
    override fun combinationLock() { playedPresets += "CombinationLock" }
    override fun crescendo() { playedPresets += "Crescendo" }
    override fun dewdrop() { playedPresets += "Dewdrop" }
    override fun dirge() { playedPresets += "Dirge" }
    override fun dissolve() { playedPresets += "Dissolve" }
    override fun dogBark() { playedPresets += "DogBark" }
    override fun drone() { playedPresets += "Drone" }
    override fun engineRev() { playedPresets += "EngineRev" }
    override fun exhale() { playedPresets += "Exhale" }
    override fun explosion() { playedPresets += "Explosion" }
    override fun fadeOut() { playedPresets += "FadeOut" }
    override fun fanfare() { playedPresets += "Fanfare" }
    override fun feather() { playedPresets += "Feather" }
    override fun finale() { playedPresets += "Finale" }
    override fun fingerDrum() { playedPresets += "FingerDrum" }
    override fun firecracker() { playedPresets += "Firecracker" }
    override fun fizz() { playedPresets += "Fizz" }
    override fun flare() { playedPresets += "Flare" }
    override fun flick() { playedPresets += "Flick" }
    override fun flinch() { playedPresets += "Flinch" }
    override fun flourish() { playedPresets += "Flourish" }
    override fun flurry() { playedPresets += "Flurry" }
    override fun flush() { playedPresets += "Flush" }
    override fun gallop() { playedPresets += "Gallop" }
    override fun gavel() { playedPresets += "Gavel" }
    override fun glitch() { playedPresets += "Glitch" }
    override fun guitarStrum() { playedPresets += "GuitarStrum" }
    override fun hail() { playedPresets += "Hail" }
    override fun hammer() { playedPresets += "Hammer" }
    override fun heartbeat() { playedPresets += "Heartbeat" }
    override fun herald() { playedPresets += "Herald" }
    override fun hoofBeat() { playedPresets += "HoofBeat" }
    override fun ignition() { playedPresets += "Ignition" }
    override fun impact() { playedPresets += "Impact" }
    override fun jolt() { playedPresets += "Jolt" }
    override fun keyboardMechanical() { playedPresets += "KeyboardMechanical" }
    override fun keyboardMembrane() { playedPresets += "KeyboardMembrane" }
    override fun knell() { playedPresets += "Knell" }
    override fun knock() { playedPresets += "Knock" }
    override fun lament() { playedPresets += "Lament" }
    override fun latch() { playedPresets += "Latch" }
    override fun lighthouse() { playedPresets += "Lighthouse" }
    override fun lilt() { playedPresets += "Lilt" }
    override fun lock() { playedPresets += "Lock" }
    override fun lope() { playedPresets += "Lope" }
    override fun march() { playedPresets += "March" }
    override fun metronome() { playedPresets += "Metronome" }
    override fun murmur() { playedPresets += "Murmur" }
    override fun nudge() { playedPresets += "Nudge" }
    override fun passingCar() { playedPresets += "PassingCar" }
    override fun patter() { playedPresets += "Patter" }
    override fun peal() { playedPresets += "Peal" }
    override fun peck() { playedPresets += "Peck" }
    override fun pendulum() { playedPresets += "Pendulum" }
    override fun ping() { playedPresets += "Ping" }
    override fun pip() { playedPresets += "Pip" }
    override fun piston() { playedPresets += "Piston" }
    override fun plink() { playedPresets += "Plink" }
    override fun plummet() { playedPresets += "Plummet" }
    override fun plunk() { playedPresets += "Plunk" }
    override fun poke() { playedPresets += "Poke" }
    override fun pound() { playedPresets += "Pound" }
    override fun powerDown() { playedPresets += "PowerDown" }
    override fun propel() { playedPresets += "Propel" }
    override fun pulse() { playedPresets += "Pulse" }
    override fun pummel() { playedPresets += "Pummel" }
    override fun push() { playedPresets += "Push" }
    override fun radar() { playedPresets += "Radar" }
    override fun rain() { playedPresets += "Rain" }
    override fun ramp() { playedPresets += "Ramp" }
    override fun rap() { playedPresets += "Rap" }
    override fun ratchet() { playedPresets += "Ratchet" }
    override fun rebound() { playedPresets += "Rebound" }
    override fun ripple() { playedPresets += "Ripple" }
    override fun rivet() { playedPresets += "Rivet" }
    override fun rustle() { playedPresets += "Rustle" }
    override fun shockwave() { playedPresets += "Shockwave" }
    override fun snap() { playedPresets += "Snap" }
    override fun sonar() { playedPresets += "Sonar" }
    override fun spark() { playedPresets += "Spark" }
    override fun spin() { playedPresets += "Spin" }
    override fun stagger() { playedPresets += "Stagger" }
    override fun stamp() { playedPresets += "Stamp" }
    override fun stampede() { playedPresets += "Stampede" }
    override fun stomp() { playedPresets += "Stomp" }
    override fun stoneSkip() { playedPresets += "StoneSkip" }
    override fun strike() { playedPresets += "Strike" }
    override fun summon() { playedPresets += "Summon" }
    override fun surge() { playedPresets += "Surge" }
    override fun sway() { playedPresets += "Sway" }
    override fun sweep() { playedPresets += "Sweep" }
    override fun swell() { playedPresets += "Swell" }
    override fun syncopate() { playedPresets += "Syncopate" }
    override fun throb() { playedPresets += "Throb" }
    override fun thud() { playedPresets += "Thud" }
    override fun thump() { playedPresets += "Thump" }
    override fun thunder() { playedPresets += "Thunder" }
    override fun thunderRoll() { playedPresets += "ThunderRoll" }
    override fun tickTock() { playedPresets += "TickTock" }
    override fun tidalSurge() { playedPresets += "TidalSurge" }
    override fun tideSwell() { playedPresets += "TideSwell" }
    override fun tremor() { playedPresets += "Tremor" }
    override fun trigger() { playedPresets += "Trigger" }
    override fun triumph() { playedPresets += "Triumph" }
    override fun trumpet() { playedPresets += "Trumpet" }
    override fun typewriter() { playedPresets += "Typewriter" }
    override fun unfurl() { playedPresets += "Unfurl" }
    override fun vortex() { playedPresets += "Vortex" }
    override fun wane() { playedPresets += "Wane" }
    override fun warDrum() { playedPresets += "WarDrum" }
    override fun waterfall() { playedPresets += "Waterfall" }
    override fun wave() { playedPresets += "Wave" }
    override fun wisp() { playedPresets += "Wisp" }
    override fun wobble() { playedPresets += "Wobble" }
    override fun woodpecker() { playedPresets += "Woodpecker" }
    override fun zipper() { playedPresets += "Zipper" }
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
