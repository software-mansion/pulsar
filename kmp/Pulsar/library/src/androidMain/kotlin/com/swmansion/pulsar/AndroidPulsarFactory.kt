package com.swmansion.pulsar.kmp

import android.content.Context
import com.swmansion.pulsar.kmp.androidimpl.Pulsar as AndroidPulsar
import com.swmansion.pulsar.kmp.androidimpl.composers.PatternComposer as AndroidPatternComposer
import com.swmansion.pulsar.kmp.androidimpl.presets.PresetsWrapper as AndroidPresetsWrapper
import com.swmansion.pulsar.kmp.androidimpl.types.PatternData as AndroidPatternData
import com.swmansion.pulsar.kmp.androidimpl.types.ContinuousPattern as AndroidContinuousPattern
import com.swmansion.pulsar.kmp.androidimpl.types.ConfigPoint as AndroidConfigPoint
import com.swmansion.pulsar.kmp.androidimpl.types.ValuePoint as AndroidValuePoint
import com.swmansion.pulsar.kmp.androidimpl.types.RealtimeComposable as AndroidRealtimeComposer
import com.swmansion.pulsar.kmp.androidimpl.types.RealtimeComposerStrategy as AndroidRealtimeComposerStrategy
import com.swmansion.pulsar.kmp.androidimpl.types.CompatibilityMode as AndroidCompatibilityMode

fun registerAndroidPulsarFactory(context: Context) {
    Pulsar.registerFactory(AndroidPulsarFactory(context))
}

class AndroidPulsarFactory(
    private val context: Context,
) : PulsarPlatformFactory {
    override fun createPulsar(): PulsarPlatformHandle = AndroidPulsarHandle(AndroidPulsar(context))
}

private class AndroidPulsarHandle(
    private val nativePulsar: AndroidPulsar,
) : PulsarPlatformHandle {
    private val presetsHandle by lazy { AndroidPresetsHandle(nativePulsar.getPresets()) }
    private val patternComposerHandle by lazy { AndroidPatternComposerHandle(nativePulsar.getPatternComposer()) }

    override fun presets(): PulsarPresetsHandle = presetsHandle

    override fun patternComposer(): PatternComposerHandle = patternComposerHandle

    override fun realtimeComposer(): RealtimeComposerHandle =
        AndroidRealtimeComposerHandle(nativePulsar.getRealtimeComposer())

    override fun realtimeComposer(strategy: RealtimeComposerStrategy): RealtimeComposerHandle =
        AndroidRealtimeComposerHandle(nativePulsar.getRealtimeComposer(strategy.toAndroidRealtimeComposerStrategy()))

    override fun preloadPreset(name: String) {
        nativePulsar.preloadPresets(listOf(name))
    }

    override fun enableHaptics(state: Boolean) {
        nativePulsar.enableHaptics(state)
    }

    override fun enableSound(state: Boolean) {
        nativePulsar.enableSound(state)
    }

    override fun enableCache(state: Boolean) {
        nativePulsar.enableCache(state)
    }

    override fun isCacheEnabled(): Boolean = nativePulsar.getPresets().isCacheEnabled()

    override fun clearCache() {
        nativePulsar.clearCache()
    }

    override fun stopHaptics() {
        nativePulsar.stopHaptics()
    }

    override fun shutDownEngine() {
        nativePulsar.stopHaptics()
    }

    override fun isHapticsEnabled(): Boolean = true

    override fun isHapticsSupported(): Boolean = nativePulsar.hapticSupport().name != "NO_SUPPORT"

    override fun canPlayHaptics(): Boolean = isHapticsSupported()

    override fun hapticSupport(): CompatibilityMode = nativePulsar.hapticSupport().toCommonCompatibilityMode()

    override fun forceHapticsSupportLevel(mode: CompatibilityMode) {
        nativePulsar.forceHapticsSupportLevel(mode.toAndroidCompatibilityMode())
    }

    override fun getRealtimeComposerStrategy(): RealtimeComposerStrategy =
        nativePulsar.realtimeComposerStrategy.toCommonRealtimeComposerStrategy()

    override fun setRealtimeComposerStrategy(strategy: RealtimeComposerStrategy) {
        nativePulsar.realtimeComposerStrategy = strategy.toAndroidRealtimeComposerStrategy()
    }

    override fun enableImpulseCompositionMode(state: Boolean) {
        nativePulsar.enableImpulseCompositionMode(state)
    }
}

private class AndroidPresetsHandle(
    private val presets: AndroidPresetsWrapper,
) : PulsarPresetsHandle {
    override fun has(name: String): Boolean = presets.getByName(name) != null

    override fun preloadPresetByName(name: String) {
        presets.preloadPresetByName(name)
    }

    override fun preloadPresetByNames(names: List<String>) {
        presets.preloadPresetByNames(names)
    }

    override fun enableCache(state: Boolean) {
        presets.enableCache(state)
    }

    override fun isCacheEnabled(): Boolean = presets.isCacheEnabled()

    override fun resetCache() {
        presets.resetCache()
    }

    override fun play(name: String): Boolean {
        val preset = presets.getByName(name) ?: return false
        preset.play()
        return true
    }

    override fun systemImpactLight() = presets.systemImpactLight()

    override fun systemImpactMedium() = presets.systemImpactMedium()

    override fun systemImpactHeavy() = presets.systemImpactHeavy()

    override fun systemImpactSoft() = presets.systemImpactSoft()

    override fun systemImpactRigid() = presets.systemImpactRigid()

    override fun systemNotificationSuccess() = presets.systemNotificationSuccess()

    override fun systemNotificationWarning() = presets.systemNotificationWarning()

    override fun systemNotificationError() = presets.systemNotificationError()

    override fun systemSelection() = presets.systemSelection()
    override fun systemEffectClick() = presets.systemEffectClick()
    override fun systemEffectDoubleClick() = presets.systemEffectDoubleClick()
    override fun systemEffectTick() = presets.systemEffectTick()
    override fun systemEffectHeavyClick() = presets.systemEffectHeavyClick()
    override fun systemLongPress() = presets.systemLongPress()
    override fun systemVirtualKey() = presets.systemVirtualKey()
    override fun systemKeyboardTap() = presets.systemKeyboardTap()
    override fun systemClockTick() = presets.systemClockTick()
    override fun systemCalendarDate() = presets.systemCalendarDate()
    override fun systemContextClick() = presets.systemContextClick()
    override fun systemKeyboardPress() = presets.systemKeyboardPress()
    override fun systemKeyboardRelease() = presets.systemKeyboardRelease()
    override fun systemVirtualKeyRelease() = presets.systemVirtualKeyRelease()
    override fun systemTextHandleMove() = presets.systemTextHandleMove()
    override fun systemDragCrossing() = presets.systemDragCrossing()
    override fun systemGestureStart() = presets.systemGestureStart()
    override fun systemGestureEnd() = presets.systemGestureEnd()
    override fun systemEdgeSqueeze() = presets.systemEdgeSqueeze()
    override fun systemEdgeRelease() = presets.systemEdgeRelease()
    override fun systemConfirm() = presets.systemConfirm()
    override fun systemRelease() = presets.systemRelease()
    override fun systemScrollTick() = presets.systemScrollTick()
    override fun systemScrollItemFocus() = presets.systemScrollItemFocus()
    override fun systemScrollLimit() = presets.systemScrollLimit()
    override fun systemToggleOn() = presets.systemToggleOn()
    override fun systemToggleOff() = presets.systemToggleOff()
    override fun systemDragStart() = presets.systemDragStart()
    override fun systemSegmentTick() = presets.systemSegmentTick()
    override fun systemSegmentFrequentTick() = presets.systemSegmentFrequentTick()
    override fun systemPrimitiveClick() = presets.systemPrimitiveClick()
    override fun systemPrimitiveThud() = presets.systemPrimitiveThud()
    override fun systemPrimitiveSpin() = presets.systemPrimitiveSpin()
    override fun systemPrimitiveQuickRise() = presets.systemPrimitiveQuickRise()
    override fun systemPrimitiveSlowRise() = presets.systemPrimitiveSlowRise()
    override fun systemPrimitiveQuickFall() = presets.systemPrimitiveQuickFall()
    override fun systemPrimitiveTick() = presets.systemPrimitiveTick()
    override fun systemPrimitiveLowTick() = presets.systemPrimitiveLowTick()

    override fun afterglow() = presets.afterglow()
    override fun aftershock() = presets.aftershock()
    override fun alarm() = presets.alarm()
    override fun anvil() = presets.anvil()
    override fun applause() = presets.applause()
    override fun ascent() = presets.ascent()
    override fun balloonPop() = presets.balloonPop()
    override fun barrage() = presets.barrage()
    override fun bassDrop() = presets.bassDrop()
    override fun batter() = presets.batter()
    override fun bellToll() = presets.bellToll()
    override fun blip() = presets.blip()
    override fun bloom() = presets.bloom()
    override fun bongo() = presets.bongo()
    override fun boulder() = presets.boulder()
    override fun breakingWave() = presets.breakingWave()
    override fun breath() = presets.breath()
    override fun buildup() = presets.buildup()
    override fun burst() = presets.burst()
    override fun buzz() = presets.buzz()
    override fun cadence() = presets.cadence()
    override fun cameraShutter() = presets.cameraShutter()
    override fun canter() = presets.canter()
    override fun cascade() = presets.cascade()
    override fun castanets() = presets.castanets()
    override fun catPaw() = presets.catPaw()
    override fun charge() = presets.charge()
    override fun chime() = presets.chime()
    override fun chip() = presets.chip()
    override fun chirp() = presets.chirp()
    override fun clamor() = presets.clamor()
    override fun clasp() = presets.clasp()
    override fun cleave() = presets.cleave()
    override fun coil() = presets.coil()
    override fun coinDrop() = presets.coinDrop()
    override fun combinationLock() = presets.combinationLock()
    override fun crescendo() = presets.crescendo()
    override fun dewdrop() = presets.dewdrop()
    override fun dirge() = presets.dirge()
    override fun dissolve() = presets.dissolve()
    override fun dogBark() = presets.dogBark()
    override fun drone() = presets.drone()
    override fun engineRev() = presets.engineRev()
    override fun exhale() = presets.exhale()
    override fun explosion() = presets.explosion()
    override fun fadeOut() = presets.fadeOut()
    override fun fanfare() = presets.fanfare()
    override fun feather() = presets.feather()
    override fun finale() = presets.finale()
    override fun fingerDrum() = presets.fingerDrum()
    override fun firecracker() = presets.firecracker()
    override fun fizz() = presets.fizz()
    override fun flare() = presets.flare()
    override fun flick() = presets.flick()
    override fun flinch() = presets.flinch()
    override fun flourish() = presets.flourish()
    override fun flurry() = presets.flurry()
    override fun flush() = presets.flush()
    override fun gallop() = presets.gallop()
    override fun gavel() = presets.gavel()
    override fun glitch() = presets.glitch()
    override fun guitarStrum() = presets.guitarStrum()
    override fun hail() = presets.hail()
    override fun hammer() = presets.hammer()
    override fun heartbeat() = presets.heartbeat()
    override fun herald() = presets.herald()
    override fun hoofBeat() = presets.hoofBeat()
    override fun ignition() = presets.ignition()
    override fun impact() = presets.impact()
    override fun jolt() = presets.jolt()
    override fun keyboardMechanical() = presets.keyboardMechanical()
    override fun keyboardMembrane() = presets.keyboardMembrane()
    override fun knell() = presets.knell()
    override fun knock() = presets.knock()
    override fun lament() = presets.lament()
    override fun latch() = presets.latch()
    override fun lighthouse() = presets.lighthouse()
    override fun lilt() = presets.lilt()
    override fun lock() = presets.lock()
    override fun lope() = presets.lope()
    override fun march() = presets.march()
    override fun metronome() = presets.metronome()
    override fun murmur() = presets.murmur()
    override fun nudge() = presets.nudge()
    override fun passingCar() = presets.passingCar()
    override fun patter() = presets.patter()
    override fun peal() = presets.peal()
    override fun peck() = presets.peck()
    override fun pendulum() = presets.pendulum()
    override fun ping() = presets.ping()
    override fun pip() = presets.pip()
    override fun piston() = presets.piston()
    override fun plink() = presets.plink()
    override fun plummet() = presets.plummet()
    override fun plunk() = presets.plunk()
    override fun poke() = presets.poke()
    override fun pound() = presets.pound()
    override fun powerDown() = presets.powerDown()
    override fun propel() = presets.propel()
    override fun pulse() = presets.pulse()
    override fun pummel() = presets.pummel()
    override fun push() = presets.push()
    override fun radar() = presets.radar()
    override fun rain() = presets.rain()
    override fun ramp() = presets.ramp()
    override fun rap() = presets.rap()
    override fun ratchet() = presets.ratchet()
    override fun rebound() = presets.rebound()
    override fun ripple() = presets.ripple()
    override fun rivet() = presets.rivet()
    override fun rustle() = presets.rustle()
    override fun shockwave() = presets.shockwave()
    override fun snap() = presets.snap()
    override fun sonar() = presets.sonar()
    override fun spark() = presets.spark()
    override fun spin() = presets.spin()
    override fun stagger() = presets.stagger()
    override fun stamp() = presets.stamp()
    override fun stampede() = presets.stampede()
    override fun stomp() = presets.stomp()
    override fun stoneSkip() = presets.stoneSkip()
    override fun strike() = presets.strike()
    override fun summon() = presets.summon()
    override fun surge() = presets.surge()
    override fun sway() = presets.sway()
    override fun sweep() = presets.sweep()
    override fun swell() = presets.swell()
    override fun syncopate() = presets.syncopate()
    override fun throb() = presets.throb()
    override fun thud() = presets.thud()
    override fun thump() = presets.thump()
    override fun thunder() = presets.thunder()
    override fun thunderRoll() = presets.thunderRoll()
    override fun tickTock() = presets.tickTock()
    override fun tidalSurge() = presets.tidalSurge()
    override fun tideSwell() = presets.tideSwell()
    override fun tremor() = presets.tremor()
    override fun trigger() = presets.trigger()
    override fun triumph() = presets.triumph()
    override fun trumpet() = presets.trumpet()
    override fun typewriter() = presets.typewriter()
    override fun unfurl() = presets.unfurl()
    override fun vortex() = presets.vortex()
    override fun wane() = presets.wane()
    override fun warDrum() = presets.warDrum()
    override fun waterfall() = presets.waterfall()
    override fun wave() = presets.wave()
    override fun wisp() = presets.wisp()
    override fun wobble() = presets.wobble()
    override fun woodpecker() = presets.woodpecker()
    override fun zipper() = presets.zipper()
}

private class AndroidPatternComposerHandle(
    private val composer: AndroidPatternComposer,
) : PatternComposerHandle {
    override fun parsePattern(pattern: PatternData) {
        composer.parsePattern(pattern.toAndroidPatternData())
    }

    override fun playPattern(pattern: PatternData) {
        composer.parsePattern(pattern.toAndroidPatternData())
        composer.play()
    }

    override fun play() = composer.play()

    override fun playAudioOnly() = composer.playAudioOnly()

    override fun stop() = composer.stop()
}

private class AndroidRealtimeComposerHandle(
    private val composer: AndroidRealtimeComposer,
) : RealtimeComposerHandle {
    override fun set(amplitude: Float, frequency: Float) {
        composer.set(amplitude, frequency)
    }

    override fun playDiscrete(amplitude: Float, frequency: Float) {
        composer.playDiscrete(amplitude, frequency)
    }

    override fun stop() {
        composer.stop()
    }

    override fun isActive(): Boolean = composer.isActive()
}

private fun PatternData.toAndroidPatternData(): AndroidPatternData {
    return AndroidPatternData(
        continuousPattern = AndroidContinuousPattern(
            amplitude = continuousPattern.amplitude.map { AndroidValuePoint(time = it.time, value = it.value) },
            frequency = continuousPattern.frequency.map { AndroidValuePoint(time = it.time, value = it.value) },
        ),
        discretePattern = discretePattern.map {
            AndroidConfigPoint(time = it.time, amplitude = it.amplitude, frequency = it.frequency)
        },
    )
}

private fun RealtimeComposerStrategy.toAndroidRealtimeComposerStrategy(): AndroidRealtimeComposerStrategy =
    when (this) {
        RealtimeComposerStrategy.ENVELOPE -> AndroidRealtimeComposerStrategy.ENVELOPE
        RealtimeComposerStrategy.PRIMITIVE_TICK -> AndroidRealtimeComposerStrategy.PRIMITIVE_TICK
        RealtimeComposerStrategy.PRIMITIVE_COMPLEX -> AndroidRealtimeComposerStrategy.PRIMITIVE_COMPLEX
        RealtimeComposerStrategy.ENVELOPE_WITH_DISCRETE_PRIMITIVES -> AndroidRealtimeComposerStrategy.ENVELOPE_WITH_DISCRETE_PRIMITIVES
    }

private fun AndroidRealtimeComposerStrategy.toCommonRealtimeComposerStrategy(): RealtimeComposerStrategy =
    when (this) {
        AndroidRealtimeComposerStrategy.ENVELOPE -> RealtimeComposerStrategy.ENVELOPE
        AndroidRealtimeComposerStrategy.PRIMITIVE_TICK -> RealtimeComposerStrategy.PRIMITIVE_TICK
        AndroidRealtimeComposerStrategy.PRIMITIVE_COMPLEX -> RealtimeComposerStrategy.PRIMITIVE_COMPLEX
        AndroidRealtimeComposerStrategy.ENVELOPE_WITH_DISCRETE_PRIMITIVES -> RealtimeComposerStrategy.ENVELOPE_WITH_DISCRETE_PRIMITIVES
    }

private fun CompatibilityMode.toAndroidCompatibilityMode(): AndroidCompatibilityMode =
    when (this) {
        CompatibilityMode.NO_SUPPORT -> AndroidCompatibilityMode.NO_SUPPORT
        CompatibilityMode.LIMITED_SUPPORT -> AndroidCompatibilityMode.LIMITED_SUPPORT
        CompatibilityMode.STANDARD_SUPPORT -> AndroidCompatibilityMode.STANDARD_SUPPORT
        CompatibilityMode.ADVANCED_SUPPORT -> AndroidCompatibilityMode.ADVANCED_SUPPORT
    }

private fun AndroidCompatibilityMode.toCommonCompatibilityMode(): CompatibilityMode =
    when (this) {
        AndroidCompatibilityMode.NO_SUPPORT -> CompatibilityMode.NO_SUPPORT
        AndroidCompatibilityMode.LIMITED_SUPPORT -> CompatibilityMode.LIMITED_SUPPORT
        AndroidCompatibilityMode.STANDARD_SUPPORT -> CompatibilityMode.STANDARD_SUPPORT
        AndroidCompatibilityMode.ADVANCED_SUPPORT -> CompatibilityMode.ADVANCED_SUPPORT
    }
