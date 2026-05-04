package com.swmansion.pulsar.kmp

import kotlin.concurrent.Volatile

internal object PulsarRuntime {
    @Volatile
    private var factory: PulsarPlatformFactory? = null

    fun registerFactory(factory: PulsarPlatformFactory) {
        this.factory = factory
    }

    fun createHandle(): PulsarPlatformHandle {
        val platformFactory = factory ?: defaultPulsarPlatformFactory()?.also {
            factory = it
        }
        return requireNotNull(platformFactory) {
            "Pulsar platform factory is unavailable on this target."
        }.createPulsar()
    }
}

internal expect fun defaultPulsarPlatformFactory(): PulsarPlatformFactory?

interface PulsarPlatformFactory {
    fun createPulsar(): PulsarPlatformHandle
}

interface PulsarPlatformHandle {
    fun presets(): PulsarPresetsHandle
    fun patternComposer(): PatternComposerHandle
    fun realtimeComposer(): RealtimeComposerHandle
    fun realtimeComposer(strategy: RealtimeComposerStrategy): RealtimeComposerHandle = realtimeComposer()
    fun preloadPreset(name: String)
    fun enableHaptics(state: Boolean)
    fun enableSound(state: Boolean)
    fun enableCache(state: Boolean)
    fun isCacheEnabled(): Boolean
    fun clearCache()
    fun stopHaptics()
    fun shutDownEngine()
    fun isHapticsEnabled(): Boolean
    fun isHapticsSupported(): Boolean
    fun canPlayHaptics(): Boolean
    fun hapticSupport(): CompatibilityMode =
        if (isHapticsSupported()) CompatibilityMode.ADVANCED_SUPPORT else CompatibilityMode.NO_SUPPORT
    fun forceHapticsSupportLevel(mode: CompatibilityMode) {}
    fun getRealtimeComposerStrategy(): RealtimeComposerStrategy = RealtimeComposerStrategy.ENVELOPE
    fun setRealtimeComposerStrategy(strategy: RealtimeComposerStrategy) {}
    fun enableImpulseCompositionMode(state: Boolean) {}
}

interface PulsarPresetsHandle {
    fun play(name: String): Boolean
    fun has(name: String): Boolean
    fun preloadPresetByName(name: String)
    fun preloadPresetByNames(names: List<String>) {
        names.forEach(::preloadPresetByName)
    }
    fun enableCache(state: Boolean)
    fun isCacheEnabled(): Boolean
    fun resetCache()
    fun systemImpactLight()
    fun systemImpactMedium()
    fun systemImpactHeavy()
    fun systemImpactSoft()
    fun systemImpactRigid()
    fun systemNotificationSuccess()
    fun systemNotificationWarning()
    fun systemNotificationError()
    fun systemSelection()
    fun systemEffectClick() {}
    fun systemEffectDoubleClick() {}
    fun systemEffectTick() {}
    fun systemEffectHeavyClick() {}
    fun systemLongPress() {}
    fun systemVirtualKey() {}
    fun systemKeyboardTap() {}
    fun systemClockTick() {}
    fun systemCalendarDate() {}
    fun systemContextClick() {}
    fun systemKeyboardPress() {}
    fun systemKeyboardRelease() {}
    fun systemVirtualKeyRelease() {}
    fun systemTextHandleMove() {}
    fun systemDragCrossing() {}
    fun systemGestureStart() {}
    fun systemGestureEnd() {}
    fun systemEdgeSqueeze() {}
    fun systemEdgeRelease() {}
    fun systemConfirm() {}
    fun systemRelease() {}
    fun systemScrollTick() {}
    fun systemScrollItemFocus() {}
    fun systemScrollLimit() {}
    fun systemToggleOn() {}
    fun systemToggleOff() {}
    fun systemDragStart() {}
    fun systemSegmentTick() {}
    fun systemSegmentFrequentTick() {}
    fun systemPrimitiveClick() {}
    fun systemPrimitiveThud() {}
    fun systemPrimitiveSpin() {}
    fun systemPrimitiveQuickRise() {}
    fun systemPrimitiveSlowRise() {}
    fun systemPrimitiveQuickFall() {}
    fun systemPrimitiveTick() {}
    fun systemPrimitiveLowTick() {}
    fun afterglow()
    fun aftershock()
    fun alarm()
    fun anvil()
    fun applause()
    fun ascent()
    fun balloonPop()
    fun barrage()
    fun bassDrop()
    fun batter()
    fun bellToll()
    fun blip()
    fun bloom()
    fun bongo()
    fun boulder()
    fun breakingWave()
    fun breath()
    fun buildup()
    fun burst()
    fun buzz()
    fun cadence()
    fun cameraShutter()
    fun canter()
    fun cascade()
    fun castanets()
    fun catPaw()
    fun charge()
    fun chime()
    fun chip()
    fun chirp()
    fun clamor()
    fun clasp()
    fun cleave()
    fun coil()
    fun coinDrop()
    fun combinationLock()
    fun crescendo()
    fun dewdrop()
    fun dirge()
    fun dissolve()
    fun dogBark()
    fun drone()
    fun engineRev()
    fun exhale()
    fun explosion()
    fun fadeOut()
    fun fanfare()
    fun feather()
    fun finale()
    fun fingerDrum()
    fun firecracker()
    fun fizz()
    fun flare()
    fun flick()
    fun flinch()
    fun flourish()
    fun flurry()
    fun flush()
    fun gallop()
    fun gavel()
    fun glitch()
    fun guitarStrum()
    fun hail()
    fun hammer()
    fun heartbeat()
    fun herald()
    fun hoofBeat()
    fun ignition()
    fun impact()
    fun jolt()
    fun keyboardMechanical()
    fun keyboardMembrane()
    fun knell()
    fun knock()
    fun lament()
    fun latch()
    fun lighthouse()
    fun lilt()
    fun lock()
    fun lope()
    fun march()
    fun metronome()
    fun murmur()
    fun nudge()
    fun passingCar()
    fun patter()
    fun peal()
    fun peck()
    fun pendulum()
    fun ping()
    fun pip()
    fun piston()
    fun plink()
    fun plummet()
    fun plunk()
    fun poke()
    fun pound()
    fun powerDown()
    fun propel()
    fun pulse()
    fun pummel()
    fun push()
    fun radar()
    fun rain()
    fun ramp()
    fun rap()
    fun ratchet()
    fun rebound()
    fun ripple()
    fun rivet()
    fun rustle()
    fun shockwave()
    fun snap()
    fun sonar()
    fun spark()
    fun spin()
    fun stagger()
    fun stamp()
    fun stampede()
    fun stomp()
    fun stoneSkip()
    fun strike()
    fun summon()
    fun surge()
    fun sway()
    fun sweep()
    fun swell()
    fun syncopate()
    fun throb()
    fun thud()
    fun thump()
    fun thunder()
    fun thunderRoll()
    fun tickTock()
    fun tidalSurge()
    fun tideSwell()
    fun tremor()
    fun trigger()
    fun triumph()
    fun trumpet()
    fun typewriter()
    fun unfurl()
    fun vortex()
    fun wane()
    fun warDrum()
    fun waterfall()
    fun wave()
    fun wisp()
    fun wobble()
    fun woodpecker()
    fun zipper()
}

interface PatternComposerHandle {
    fun parsePattern(pattern: PatternData)
    fun playPattern(pattern: PatternData)
    fun play()
    fun playAudioOnly()
    fun stop()
}

interface RealtimeComposerHandle {
    fun set(amplitude: Float, frequency: Float)
    fun playDiscrete(amplitude: Float, frequency: Float)
    fun stop()
    fun isActive(): Boolean
}

fun registerPulsarFactory(factory: PulsarPlatformFactory) {
    Pulsar.registerFactory(factory)
}
