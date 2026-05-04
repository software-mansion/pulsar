package com.swmansion.pulsar.kmp.iosimpl.presets

import com.swmansion.pulsar.kmp.IOSPulsarHandle
import com.swmansion.pulsar.kmp.PulsarPresetsHandle
import com.swmansion.pulsar.kmp.iosimpl.presets.generated.iosGeneratedPresetFactories
internal class IOSPulsarPresetsHandle(
    private val haptics: IOSPulsarHandle,
) : PulsarPresetsHandle {
    private var useCache = true
    private val cache = mutableMapOf<String, IOSPreset>()

    private val mapper: Map<String, IOSPresetFactory> = buildMap {
        put("SystemImpactLight".normalizedName(), IOSPresetFactory { IOSSystemImpactLightPreset(it) })
        put("SystemImpactMedium".normalizedName(), IOSPresetFactory { IOSSystemImpactMediumPreset(it) })
        put("SystemImpactHeavy".normalizedName(), IOSPresetFactory { IOSSystemImpactHeavyPreset(it) })
        put("SystemImpactSoft".normalizedName(), IOSPresetFactory { IOSSystemImpactSoftPreset(it) })
        put("SystemImpactRigid".normalizedName(), IOSPresetFactory { IOSSystemImpactRigidPreset(it) })
        put("SystemNotificationSuccess".normalizedName(), IOSPresetFactory { IOSSystemNotificationSuccessPreset(it) })
        put("SystemNotificationWarning".normalizedName(), IOSPresetFactory { IOSSystemNotificationWarningPreset(it) })
        put("SystemNotificationError".normalizedName(), IOSPresetFactory { IOSSystemNotificationErrorPreset(it) })
        put("SystemSelection".normalizedName(), IOSPresetFactory { IOSSystemSelectionPreset(it) })
        iosGeneratedPresetFactories.forEach { (name, factory) ->
            put(name.normalizedName(), factory)
        }
    }

    override fun enableCache(state: Boolean) {
        useCache = state
        if (!state) resetCache()
    }

    override fun isCacheEnabled(): Boolean = useCache

    override fun resetCache() {
        cache.clear()
    }

    override fun preloadPresetByName(name: String) {
        useCache = true
        getByName(name)
    }

    override fun has(name: String): Boolean = mapper.containsKey(name.normalizedName())

    fun getByName(name: String): IOSPreset? {
        val type = mapper[name.normalizedName()] ?: return null
        return getCacheablePreset(name, type)
    }

    override fun play(name: String): Boolean {
        val preset = getByName(name) ?: return false
        preset.play()
        return true
    }

    override fun systemImpactLight() { playPreset("SystemImpactLight") }
    override fun systemImpactMedium() { playPreset("SystemImpactMedium") }
    override fun systemImpactHeavy() { playPreset("SystemImpactHeavy") }
    override fun systemImpactSoft() { playPreset("SystemImpactSoft") }
    override fun systemImpactRigid() { playPreset("SystemImpactRigid") }
    override fun systemNotificationSuccess() { playPreset("SystemNotificationSuccess") }
    override fun systemNotificationWarning() { playPreset("SystemNotificationWarning") }
    override fun systemNotificationError() { playPreset("SystemNotificationError") }
    override fun systemSelection() { playPreset("SystemSelection") }
    override fun afterglow() { playPreset("Afterglow") }
    override fun aftershock() { playPreset("Aftershock") }
    override fun alarm() { playPreset("Alarm") }
    override fun anvil() { playPreset("Anvil") }
    override fun applause() { playPreset("Applause") }
    override fun ascent() { playPreset("Ascent") }
    override fun balloonPop() { playPreset("BalloonPop") }
    override fun barrage() { playPreset("Barrage") }
    override fun bassDrop() { playPreset("BassDrop") }
    override fun batter() { playPreset("Batter") }
    override fun bellToll() { playPreset("BellToll") }
    override fun blip() { playPreset("Blip") }
    override fun bloom() { playPreset("Bloom") }
    override fun bongo() { playPreset("Bongo") }
    override fun boulder() { playPreset("Boulder") }
    override fun breakingWave() { playPreset("BreakingWave") }
    override fun breath() { playPreset("Breath") }
    override fun buildup() { playPreset("Buildup") }
    override fun burst() { playPreset("Burst") }
    override fun buzz() { playPreset("Buzz") }
    override fun cadence() { playPreset("Cadence") }
    override fun cameraShutter() { playPreset("CameraShutter") }
    override fun canter() { playPreset("Canter") }
    override fun cascade() { playPreset("Cascade") }
    override fun castanets() { playPreset("Castanets") }
    override fun catPaw() { playPreset("CatPaw") }
    override fun charge() { playPreset("Charge") }
    override fun chime() { playPreset("Chime") }
    override fun chip() { playPreset("Chip") }
    override fun chirp() { playPreset("Chirp") }
    override fun clamor() { playPreset("Clamor") }
    override fun clasp() { playPreset("Clasp") }
    override fun cleave() { playPreset("Cleave") }
    override fun coil() { playPreset("Coil") }
    override fun coinDrop() { playPreset("CoinDrop") }
    override fun combinationLock() { playPreset("CombinationLock") }
    override fun crescendo() { playPreset("Crescendo") }
    override fun dewdrop() { playPreset("Dewdrop") }
    override fun dirge() { playPreset("Dirge") }
    override fun dissolve() { playPreset("Dissolve") }
    override fun dogBark() { playPreset("DogBark") }
    override fun drone() { playPreset("Drone") }
    override fun engineRev() { playPreset("EngineRev") }
    override fun exhale() { playPreset("Exhale") }
    override fun explosion() { playPreset("Explosion") }
    override fun fadeOut() { playPreset("FadeOut") }
    override fun fanfare() { playPreset("Fanfare") }
    override fun feather() { playPreset("Feather") }
    override fun finale() { playPreset("Finale") }
    override fun fingerDrum() { playPreset("FingerDrum") }
    override fun firecracker() { playPreset("Firecracker") }
    override fun fizz() { playPreset("Fizz") }
    override fun flare() { playPreset("Flare") }
    override fun flick() { playPreset("Flick") }
    override fun flinch() { playPreset("Flinch") }
    override fun flourish() { playPreset("Flourish") }
    override fun flurry() { playPreset("Flurry") }
    override fun flush() { playPreset("Flush") }
    override fun gallop() { playPreset("Gallop") }
    override fun gavel() { playPreset("Gavel") }
    override fun glitch() { playPreset("Glitch") }
    override fun guitarStrum() { playPreset("GuitarStrum") }
    override fun hail() { playPreset("Hail") }
    override fun hammer() { playPreset("Hammer") }
    override fun heartbeat() { playPreset("Heartbeat") }
    override fun herald() { playPreset("Herald") }
    override fun hoofBeat() { playPreset("HoofBeat") }
    override fun ignition() { playPreset("Ignition") }
    override fun impact() { playPreset("Impact") }
    override fun jolt() { playPreset("Jolt") }
    override fun keyboardMechanical() { playPreset("KeyboardMechanical") }
    override fun keyboardMembrane() { playPreset("KeyboardMembrane") }
    override fun knell() { playPreset("Knell") }
    override fun knock() { playPreset("Knock") }
    override fun lament() { playPreset("Lament") }
    override fun latch() { playPreset("Latch") }
    override fun lighthouse() { playPreset("Lighthouse") }
    override fun lilt() { playPreset("Lilt") }
    override fun lock() { playPreset("Lock") }
    override fun lope() { playPreset("Lope") }
    override fun march() { playPreset("March") }
    override fun metronome() { playPreset("Metronome") }
    override fun murmur() { playPreset("Murmur") }
    override fun nudge() { playPreset("Nudge") }
    override fun passingCar() { playPreset("PassingCar") }
    override fun patter() { playPreset("Patter") }
    override fun peal() { playPreset("Peal") }
    override fun peck() { playPreset("Peck") }
    override fun pendulum() { playPreset("Pendulum") }
    override fun ping() { playPreset("Ping") }
    override fun pip() { playPreset("Pip") }
    override fun piston() { playPreset("Piston") }
    override fun plink() { playPreset("Plink") }
    override fun plummet() { playPreset("Plummet") }
    override fun plunk() { playPreset("Plunk") }
    override fun poke() { playPreset("Poke") }
    override fun pound() { playPreset("Pound") }
    override fun powerDown() { playPreset("PowerDown") }
    override fun propel() { playPreset("Propel") }
    override fun pulse() { playPreset("Pulse") }
    override fun pummel() { playPreset("Pummel") }
    override fun push() { playPreset("Push") }
    override fun radar() { playPreset("Radar") }
    override fun rain() { playPreset("Rain") }
    override fun ramp() { playPreset("Ramp") }
    override fun rap() { playPreset("Rap") }
    override fun ratchet() { playPreset("Ratchet") }
    override fun rebound() { playPreset("Rebound") }
    override fun ripple() { playPreset("Ripple") }
    override fun rivet() { playPreset("Rivet") }
    override fun rustle() { playPreset("Rustle") }
    override fun shockwave() { playPreset("Shockwave") }
    override fun snap() { playPreset("Snap") }
    override fun sonar() { playPreset("Sonar") }
    override fun spark() { playPreset("Spark") }
    override fun spin() { playPreset("Spin") }
    override fun stagger() { playPreset("Stagger") }
    override fun stamp() { playPreset("Stamp") }
    override fun stampede() { playPreset("Stampede") }
    override fun stomp() { playPreset("Stomp") }
    override fun stoneSkip() { playPreset("StoneSkip") }
    override fun strike() { playPreset("Strike") }
    override fun summon() { playPreset("Summon") }
    override fun surge() { playPreset("Surge") }
    override fun sway() { playPreset("Sway") }
    override fun sweep() { playPreset("Sweep") }
    override fun swell() { playPreset("Swell") }
    override fun syncopate() { playPreset("Syncopate") }
    override fun throb() { playPreset("Throb") }
    override fun thud() { playPreset("Thud") }
    override fun thump() { playPreset("Thump") }
    override fun thunder() { playPreset("Thunder") }
    override fun thunderRoll() { playPreset("ThunderRoll") }
    override fun tickTock() { playPreset("TickTock") }
    override fun tidalSurge() { playPreset("TidalSurge") }
    override fun tideSwell() { playPreset("TideSwell") }
    override fun tremor() { playPreset("Tremor") }
    override fun trigger() { playPreset("Trigger") }
    override fun triumph() { playPreset("Triumph") }
    override fun trumpet() { playPreset("Trumpet") }
    override fun typewriter() { playPreset("Typewriter") }
    override fun unfurl() { playPreset("Unfurl") }
    override fun vortex() { playPreset("Vortex") }
    override fun wane() { playPreset("Wane") }
    override fun warDrum() { playPreset("WarDrum") }
    override fun waterfall() { playPreset("Waterfall") }
    override fun wave() { playPreset("Wave") }
    override fun wisp() { playPreset("Wisp") }
    override fun wobble() { playPreset("Wobble") }
    override fun woodpecker() { playPreset("Woodpecker") }
    override fun zipper() { playPreset("Zipper") }

    private fun playPreset(name: String) {
        getCacheablePreset(name, mapper.getValue(name.normalizedName())).play()
    }

    private fun getCacheablePreset(name: String, factory: IOSPresetFactory): IOSPreset {
        val cacheKey = name.normalizedName()
        if (!useCache) return factory.getInstance(haptics)
        return cache.getOrPut(cacheKey) { factory.getInstance(haptics) }
    }

    private fun String.normalizedName(): String = lowercase()
}
