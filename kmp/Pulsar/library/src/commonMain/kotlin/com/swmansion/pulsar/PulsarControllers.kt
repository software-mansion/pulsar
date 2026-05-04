package com.swmansion.pulsar.kmp

class PulsarPresets internal constructor(
    private val handle: PulsarPresetsHandle,
) {
    fun getByName(name: String): PulsarPreset? =
        if (handle.has(name)) PulsarPreset(name, handle) else null

    fun play(name: String): Boolean = handle.play(name)

    fun preloadPresetByName(name: String) {
        handle.preloadPresetByName(name)
    }

    fun preloadPresetByNames(names: List<String>) {
        handle.preloadPresetByNames(names)
    }

    fun enableCache(state: Boolean) {
        handle.enableCache(state)
    }

    fun isCacheEnabled(): Boolean = handle.isCacheEnabled()

    fun resetCache() {
        handle.resetCache()
    }

    fun systemImpactLight() {
        handle.systemImpactLight()
    }

    fun systemImpactMedium() {
        handle.systemImpactMedium()
    }

    fun systemImpactHeavy() {
        handle.systemImpactHeavy()
    }

    fun systemImpactSoft() {
        handle.systemImpactSoft()
    }

    fun systemImpactRigid() {
        handle.systemImpactRigid()
    }

    fun systemNotificationSuccess() {
        handle.systemNotificationSuccess()
    }

    fun systemNotificationWarning() {
        handle.systemNotificationWarning()
    }

    fun systemNotificationError() {
        handle.systemNotificationError()
    }

    fun systemSelection() {
        handle.systemSelection()
    }

    fun systemEffectClick() {
        handle.systemEffectClick()
    }

    fun systemEffectDoubleClick() {
        handle.systemEffectDoubleClick()
    }

    fun systemEffectTick() {
        handle.systemEffectTick()
    }

    fun systemEffectHeavyClick() {
        handle.systemEffectHeavyClick()
    }

    fun systemLongPress() {
        handle.systemLongPress()
    }

    fun systemVirtualKey() {
        handle.systemVirtualKey()
    }

    fun systemKeyboardTap() {
        handle.systemKeyboardTap()
    }

    fun systemClockTick() {
        handle.systemClockTick()
    }

    fun systemCalendarDate() {
        handle.systemCalendarDate()
    }

    fun systemContextClick() {
        handle.systemContextClick()
    }

    fun systemKeyboardPress() {
        handle.systemKeyboardPress()
    }

    fun systemKeyboardRelease() {
        handle.systemKeyboardRelease()
    }

    fun systemVirtualKeyRelease() {
        handle.systemVirtualKeyRelease()
    }

    fun systemTextHandleMove() {
        handle.systemTextHandleMove()
    }

    fun systemDragCrossing() {
        handle.systemDragCrossing()
    }

    fun systemGestureStart() {
        handle.systemGestureStart()
    }

    fun systemGestureEnd() {
        handle.systemGestureEnd()
    }

    fun systemEdgeSqueeze() {
        handle.systemEdgeSqueeze()
    }

    fun systemEdgeRelease() {
        handle.systemEdgeRelease()
    }

    fun systemConfirm() {
        handle.systemConfirm()
    }

    fun systemRelease() {
        handle.systemRelease()
    }

    fun systemScrollTick() {
        handle.systemScrollTick()
    }

    fun systemScrollItemFocus() {
        handle.systemScrollItemFocus()
    }

    fun systemScrollLimit() {
        handle.systemScrollLimit()
    }

    fun systemToggleOn() {
        handle.systemToggleOn()
    }

    fun systemToggleOff() {
        handle.systemToggleOff()
    }

    fun systemDragStart() {
        handle.systemDragStart()
    }

    fun systemSegmentTick() {
        handle.systemSegmentTick()
    }

    fun systemSegmentFrequentTick() {
        handle.systemSegmentFrequentTick()
    }

    fun systemPrimitiveClick() {
        handle.systemPrimitiveClick()
    }

    fun systemPrimitiveThud() {
        handle.systemPrimitiveThud()
    }

    fun systemPrimitiveSpin() {
        handle.systemPrimitiveSpin()
    }

    fun systemPrimitiveQuickRise() {
        handle.systemPrimitiveQuickRise()
    }

    fun systemPrimitiveSlowRise() {
        handle.systemPrimitiveSlowRise()
    }

    fun systemPrimitiveQuickFall() {
        handle.systemPrimitiveQuickFall()
    }

    fun systemPrimitiveTick() {
        handle.systemPrimitiveTick()
    }

    fun systemPrimitiveLowTick() {
        handle.systemPrimitiveLowTick()
    }

    fun afterglow() {
        handle.afterglow()
    }

    fun aftershock() {
        handle.aftershock()
    }

    fun alarm() {
        handle.alarm()
    }

    fun anvil() {
        handle.anvil()
    }

    fun applause() {
        handle.applause()
    }

    fun ascent() {
        handle.ascent()
    }

    fun balloonPop() {
        handle.balloonPop()
    }

    fun barrage() {
        handle.barrage()
    }

    fun bassDrop() {
        handle.bassDrop()
    }

    fun batter() {
        handle.batter()
    }

    fun bellToll() {
        handle.bellToll()
    }

    fun blip() {
        handle.blip()
    }

    fun bloom() {
        handle.bloom()
    }

    fun bongo() {
        handle.bongo()
    }

    fun boulder() {
        handle.boulder()
    }

    fun breakingWave() {
        handle.breakingWave()
    }

    fun breath() {
        handle.breath()
    }

    fun buildup() {
        handle.buildup()
    }

    fun burst() {
        handle.burst()
    }

    fun buzz() {
        handle.buzz()
    }

    fun cadence() {
        handle.cadence()
    }

    fun cameraShutter() {
        handle.cameraShutter()
    }

    fun canter() {
        handle.canter()
    }

    fun cascade() {
        handle.cascade()
    }

    fun castanets() {
        handle.castanets()
    }

    fun catPaw() {
        handle.catPaw()
    }

    fun charge() {
        handle.charge()
    }

    fun chime() {
        handle.chime()
    }

    fun chip() {
        handle.chip()
    }

    fun chirp() {
        handle.chirp()
    }

    fun clamor() {
        handle.clamor()
    }

    fun clasp() {
        handle.clasp()
    }

    fun cleave() {
        handle.cleave()
    }

    fun coil() {
        handle.coil()
    }

    fun coinDrop() {
        handle.coinDrop()
    }

    fun combinationLock() {
        handle.combinationLock()
    }

    fun crescendo() {
        handle.crescendo()
    }

    fun dewdrop() {
        handle.dewdrop()
    }

    fun dirge() {
        handle.dirge()
    }

    fun dissolve() {
        handle.dissolve()
    }

    fun dogBark() {
        handle.dogBark()
    }

    fun drone() {
        handle.drone()
    }

    fun engineRev() {
        handle.engineRev()
    }

    fun exhale() {
        handle.exhale()
    }

    fun explosion() {
        handle.explosion()
    }

    fun fadeOut() {
        handle.fadeOut()
    }

    fun fanfare() {
        handle.fanfare()
    }

    fun feather() {
        handle.feather()
    }

    fun finale() {
        handle.finale()
    }

    fun fingerDrum() {
        handle.fingerDrum()
    }

    fun firecracker() {
        handle.firecracker()
    }

    fun fizz() {
        handle.fizz()
    }

    fun flare() {
        handle.flare()
    }

    fun flick() {
        handle.flick()
    }

    fun flinch() {
        handle.flinch()
    }

    fun flourish() {
        handle.flourish()
    }

    fun flurry() {
        handle.flurry()
    }

    fun flush() {
        handle.flush()
    }

    fun gallop() {
        handle.gallop()
    }

    fun gavel() {
        handle.gavel()
    }

    fun glitch() {
        handle.glitch()
    }

    fun guitarStrum() {
        handle.guitarStrum()
    }

    fun hail() {
        handle.hail()
    }

    fun hammer() {
        handle.hammer()
    }

    fun heartbeat() {
        handle.heartbeat()
    }

    fun herald() {
        handle.herald()
    }

    fun hoofBeat() {
        handle.hoofBeat()
    }

    fun ignition() {
        handle.ignition()
    }

    fun impact() {
        handle.impact()
    }

    fun jolt() {
        handle.jolt()
    }

    fun keyboardMechanical() {
        handle.keyboardMechanical()
    }

    fun keyboardMembrane() {
        handle.keyboardMembrane()
    }

    fun knell() {
        handle.knell()
    }

    fun knock() {
        handle.knock()
    }

    fun lament() {
        handle.lament()
    }

    fun latch() {
        handle.latch()
    }

    fun lighthouse() {
        handle.lighthouse()
    }

    fun lilt() {
        handle.lilt()
    }

    fun lock() {
        handle.lock()
    }

    fun lope() {
        handle.lope()
    }

    fun march() {
        handle.march()
    }

    fun metronome() {
        handle.metronome()
    }

    fun murmur() {
        handle.murmur()
    }

    fun nudge() {
        handle.nudge()
    }

    fun passingCar() {
        handle.passingCar()
    }

    fun patter() {
        handle.patter()
    }

    fun peal() {
        handle.peal()
    }

    fun peck() {
        handle.peck()
    }

    fun pendulum() {
        handle.pendulum()
    }

    fun ping() {
        handle.ping()
    }

    fun pip() {
        handle.pip()
    }

    fun piston() {
        handle.piston()
    }

    fun plink() {
        handle.plink()
    }

    fun plummet() {
        handle.plummet()
    }

    fun plunk() {
        handle.plunk()
    }

    fun poke() {
        handle.poke()
    }

    fun pound() {
        handle.pound()
    }

    fun powerDown() {
        handle.powerDown()
    }

    fun propel() {
        handle.propel()
    }

    fun pulse() {
        handle.pulse()
    }

    fun pummel() {
        handle.pummel()
    }

    fun push() {
        handle.push()
    }

    fun radar() {
        handle.radar()
    }

    fun rain() {
        handle.rain()
    }

    fun ramp() {
        handle.ramp()
    }

    fun rap() {
        handle.rap()
    }

    fun ratchet() {
        handle.ratchet()
    }

    fun rebound() {
        handle.rebound()
    }

    fun ripple() {
        handle.ripple()
    }

    fun rivet() {
        handle.rivet()
    }

    fun rustle() {
        handle.rustle()
    }

    fun shockwave() {
        handle.shockwave()
    }

    fun snap() {
        handle.snap()
    }

    fun sonar() {
        handle.sonar()
    }

    fun spark() {
        handle.spark()
    }

    fun spin() {
        handle.spin()
    }

    fun stagger() {
        handle.stagger()
    }

    fun stamp() {
        handle.stamp()
    }

    fun stampede() {
        handle.stampede()
    }

    fun stomp() {
        handle.stomp()
    }

    fun stoneSkip() {
        handle.stoneSkip()
    }

    fun strike() {
        handle.strike()
    }

    fun summon() {
        handle.summon()
    }

    fun surge() {
        handle.surge()
    }

    fun sway() {
        handle.sway()
    }

    fun sweep() {
        handle.sweep()
    }

    fun swell() {
        handle.swell()
    }

    fun syncopate() {
        handle.syncopate()
    }

    fun throb() {
        handle.throb()
    }

    fun thud() {
        handle.thud()
    }

    fun thump() {
        handle.thump()
    }

    fun thunder() {
        handle.thunder()
    }

    fun thunderRoll() {
        handle.thunderRoll()
    }

    fun tickTock() {
        handle.tickTock()
    }

    fun tidalSurge() {
        handle.tidalSurge()
    }

    fun tideSwell() {
        handle.tideSwell()
    }

    fun tremor() {
        handle.tremor()
    }

    fun trigger() {
        handle.trigger()
    }

    fun triumph() {
        handle.triumph()
    }

    fun trumpet() {
        handle.trumpet()
    }

    fun typewriter() {
        handle.typewriter()
    }

    fun unfurl() {
        handle.unfurl()
    }

    fun vortex() {
        handle.vortex()
    }

    fun wane() {
        handle.wane()
    }

    fun warDrum() {
        handle.warDrum()
    }

    fun waterfall() {
        handle.waterfall()
    }

    fun wave() {
        handle.wave()
    }

    fun wisp() {
        handle.wisp()
    }

    fun wobble() {
        handle.wobble()
    }

    fun woodpecker() {
        handle.woodpecker()
    }

    fun zipper() {
        handle.zipper()
    }
}

class PulsarPreset internal constructor(
    private val name: String,
    private val handle: PulsarPresetsHandle,
) {
    fun play(): Boolean = handle.play(name)
}

class PatternComposer internal constructor(
    private val handle: PatternComposerHandle,
) {
    fun parsePattern(pattern: PatternData) {
        handle.parsePattern(pattern)
    }

    fun playPattern(pattern: PatternData) {
        handle.playPattern(pattern)
    }

    fun play() {
        handle.play()
    }

    fun playAudioOnly() {
        handle.playAudioOnly()
    }

    fun stop() {
        handle.stop()
    }
}

class RealtimeComposer internal constructor(
    private val handle: RealtimeComposerHandle,
) {
    fun set(amplitude: Float, frequency: Float) {
        handle.set(amplitude, frequency)
    }

    fun playDiscrete(amplitude: Float, frequency: Float) {
        handle.playDiscrete(amplitude, frequency)
    }

    fun stop() {
        handle.stop()
    }

    fun isActive(): Boolean = handle.isActive()
}
