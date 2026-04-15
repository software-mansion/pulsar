package com.swmansion.pulsar.androidimpl.presets

import android.app.Activity
import android.content.Context
import com.swmansion.pulsar.androidimpl.Pulsar
import com.swmansion.pulsar.androidimpl.haptics.HapticEngineWrapper
import com.swmansion.pulsar.androidimpl.types.Preset
import com.swmansion.pulsar.androidimpl.presets.generated.*

class PresetsWrapper(
    private val haptics: Pulsar,
    activity: Activity?,
    engine: HapticEngineWrapper,
) {
    private var useCache: Boolean = true
    private val cache = mutableMapOf<String, Preset>()
    private val systemEffectPresets = SystemEffectPresets(engine)
    private val systemPrimitivePresets = SystemPrimitivePresets(engine)
    private val systemViewBasedPresets = SystemViewBasedPresets(activity)

    private val mapper: Map<String, (Pulsar) -> Preset> = mapOf(
        SystemImpactLightPreset.name to { haptics -> SystemImpactLightPreset(haptics) },
        SystemImpactMediumPreset.name to { haptics -> SystemImpactMediumPreset(haptics) },
        SystemImpactHeavyPreset.name to { haptics -> SystemImpactHeavyPreset(haptics) },
        SystemImpactSoftPreset.name to { haptics -> SystemImpactSoftPreset(haptics) },
        SystemImpactRigidPreset.name to { haptics -> SystemImpactRigidPreset(haptics) },
        SystemNotificationSuccessPreset.name to { haptics -> SystemNotificationSuccessPreset(haptics) },
        SystemNotificationWarningPreset.name to { haptics -> SystemNotificationWarningPreset(haptics) },
        SystemNotificationErrorPreset.name to { haptics -> SystemNotificationErrorPreset(haptics) },
        SystemSelectionPreset.name to { haptics -> SystemSelectionPreset(haptics) },

        SystemEffectClickPreset.name to { haptics -> SystemEffectClickPreset(haptics, systemEffectPresets) },
        SystemEffectDoubleClickPreset.name to { haptics -> SystemEffectDoubleClickPreset(haptics, systemEffectPresets) },
        SystemEffectTickPreset.name to { haptics -> SystemEffectTickPreset(haptics, systemEffectPresets) },
        SystemEffectHeavyClickPreset.name to { haptics -> SystemEffectHeavyClickPreset(haptics, systemEffectPresets) },

        SystemPrimitiveClickPreset.name to { haptics -> SystemPrimitiveClickPreset(haptics, systemPrimitivePresets) },
        SystemPrimitiveThudPreset.name to { haptics -> SystemPrimitiveThudPreset(haptics, systemPrimitivePresets) },
        SystemPrimitiveSpinPreset.name to { haptics -> SystemPrimitiveSpinPreset(haptics, systemPrimitivePresets) },
        SystemPrimitiveQuickRisePreset.name to { haptics -> SystemPrimitiveQuickRisePreset(haptics, systemPrimitivePresets) },
        SystemPrimitiveSlowRisePreset.name to { haptics -> SystemPrimitiveSlowRisePreset(haptics, systemPrimitivePresets) },
        SystemPrimitiveQuickFallPreset.name to { haptics -> SystemPrimitiveQuickFallPreset(haptics, systemPrimitivePresets) },
        SystemPrimitiveTickPreset.name to { haptics -> SystemPrimitiveTickPreset(haptics, systemPrimitivePresets) },
        SystemPrimitiveLowTickPreset.name to { haptics -> SystemPrimitiveLowTickPreset(haptics, systemPrimitivePresets) },

        SystemLongPressPreset.name to { haptics -> SystemLongPressPreset(haptics, systemViewBasedPresets) },
        SystemVirtualKeyPreset.name to { haptics -> SystemVirtualKeyPreset(haptics, systemViewBasedPresets) },
        SystemKeyboardTapPreset.name to { haptics -> SystemKeyboardTapPreset(haptics, systemViewBasedPresets) },
        SystemClockTickPreset.name to { haptics -> SystemClockTickPreset(haptics, systemViewBasedPresets) },
        SystemCalendarDatePreset.name to { haptics -> SystemCalendarDatePreset(haptics, systemViewBasedPresets) },
        SystemContextClickPreset.name to { haptics -> SystemContextClickPreset(haptics, systemViewBasedPresets) },
        SystemKeyboardPressPreset.name to { haptics -> SystemKeyboardPressPreset(haptics, systemViewBasedPresets) },
        SystemKeyboardReleasePreset.name to { haptics -> SystemKeyboardReleasePreset(haptics, systemViewBasedPresets) },
        SystemVirtualKeyReleasePreset.name to { haptics -> SystemVirtualKeyReleasePreset(haptics, systemViewBasedPresets) },
        SystemTextHandleMovePreset.name to { haptics -> SystemTextHandleMovePreset(haptics, systemViewBasedPresets) },
        SystemDragCrossingPreset.name to { haptics -> SystemDragCrossingPreset(haptics, systemViewBasedPresets) },
        SystemGestureStartPreset.name to { haptics -> SystemGestureStartPreset(haptics, systemViewBasedPresets) },
        SystemGestureEndPreset.name to { haptics -> SystemGestureEndPreset(haptics, systemViewBasedPresets) },
        SystemEdgeSqueezePreset.name to { haptics -> SystemEdgeSqueezePreset(haptics, systemViewBasedPresets) },
        SystemEdgeReleasePreset.name to { haptics -> SystemEdgeReleasePreset(haptics, systemViewBasedPresets) },
        SystemConfirmPreset.name to { haptics -> SystemConfirmPreset(haptics, systemViewBasedPresets) },
        SystemReleasePreset.name to { haptics -> SystemReleasePreset(haptics, systemViewBasedPresets) },
        SystemScrollTickPreset.name to { haptics -> SystemScrollTickPreset(haptics, systemViewBasedPresets) },
        SystemScrollItemFocusPreset.name to { haptics -> SystemScrollItemFocusPreset(haptics, systemViewBasedPresets) },
        SystemScrollLimitPreset.name to { haptics -> SystemScrollLimitPreset(haptics, systemViewBasedPresets) },
        SystemToggleOnPreset.name to { haptics -> SystemToggleOnPreset(haptics, systemViewBasedPresets) },
        SystemToggleOffPreset.name to { haptics -> SystemToggleOffPreset(haptics, systemViewBasedPresets) },
        SystemDragStartPreset.name to { haptics -> SystemDragStartPreset(haptics, systemViewBasedPresets) },
        SystemSegmentTickPreset.name to { haptics -> SystemSegmentTickPreset(haptics, systemViewBasedPresets) },
        SystemSegmentFrequentTickPreset.name to { haptics -> SystemSegmentFrequentTickPreset(haptics, systemViewBasedPresets) },
// CODEGEN_BEGIN_{mappers}
        AfterglowPreset.name to { haptics -> AfterglowPreset(haptics) },
        AftershockPreset.name to { haptics -> AftershockPreset(haptics) },
        AlarmPreset.name to { haptics -> AlarmPreset(haptics) },
        AnvilPreset.name to { haptics -> AnvilPreset(haptics) },
        ApplausePreset.name to { haptics -> ApplausePreset(haptics) },
        AscentPreset.name to { haptics -> AscentPreset(haptics) },
        BalloonPopPreset.name to { haptics -> BalloonPopPreset(haptics) },
        BarragePreset.name to { haptics -> BarragePreset(haptics) },
        BassDropPreset.name to { haptics -> BassDropPreset(haptics) },
        BatterPreset.name to { haptics -> BatterPreset(haptics) },
        BellTollPreset.name to { haptics -> BellTollPreset(haptics) },
        BlipPreset.name to { haptics -> BlipPreset(haptics) },
        BloomPreset.name to { haptics -> BloomPreset(haptics) },
        BongoPreset.name to { haptics -> BongoPreset(haptics) },
        BoulderPreset.name to { haptics -> BoulderPreset(haptics) },
        BreakingWavePreset.name to { haptics -> BreakingWavePreset(haptics) },
        BreathPreset.name to { haptics -> BreathPreset(haptics) },
        BuildupPreset.name to { haptics -> BuildupPreset(haptics) },
        BurstPreset.name to { haptics -> BurstPreset(haptics) },
        BuzzPreset.name to { haptics -> BuzzPreset(haptics) },
        CadencePreset.name to { haptics -> CadencePreset(haptics) },
        CameraShutterPreset.name to { haptics -> CameraShutterPreset(haptics) },
        CanterPreset.name to { haptics -> CanterPreset(haptics) },
        CascadePreset.name to { haptics -> CascadePreset(haptics) },
        CastanetsPreset.name to { haptics -> CastanetsPreset(haptics) },
        CatPawPreset.name to { haptics -> CatPawPreset(haptics) },
        ChargePreset.name to { haptics -> ChargePreset(haptics) },
        ChimePreset.name to { haptics -> ChimePreset(haptics) },
        ChipPreset.name to { haptics -> ChipPreset(haptics) },
        ChirpPreset.name to { haptics -> ChirpPreset(haptics) },
        ClamorPreset.name to { haptics -> ClamorPreset(haptics) },
        ClaspPreset.name to { haptics -> ClaspPreset(haptics) },
        CleavePreset.name to { haptics -> CleavePreset(haptics) },
        CoilPreset.name to { haptics -> CoilPreset(haptics) },
        CoinDropPreset.name to { haptics -> CoinDropPreset(haptics) },
        CombinationLockPreset.name to { haptics -> CombinationLockPreset(haptics) },
        CrescendoPreset.name to { haptics -> CrescendoPreset(haptics) },
        DewdropPreset.name to { haptics -> DewdropPreset(haptics) },
        DirgePreset.name to { haptics -> DirgePreset(haptics) },
        DissolvePreset.name to { haptics -> DissolvePreset(haptics) },
        DogBarkPreset.name to { haptics -> DogBarkPreset(haptics) },
        DronePreset.name to { haptics -> DronePreset(haptics) },
        EngineRevPreset.name to { haptics -> EngineRevPreset(haptics) },
        ExhalePreset.name to { haptics -> ExhalePreset(haptics) },
        ExplosionPreset.name to { haptics -> ExplosionPreset(haptics) },
        FadeOutPreset.name to { haptics -> FadeOutPreset(haptics) },
        FanfarePreset.name to { haptics -> FanfarePreset(haptics) },
        FeatherPreset.name to { haptics -> FeatherPreset(haptics) },
        FinalePreset.name to { haptics -> FinalePreset(haptics) },
        FingerDrumPreset.name to { haptics -> FingerDrumPreset(haptics) },
        FirecrackerPreset.name to { haptics -> FirecrackerPreset(haptics) },
        FizzPreset.name to { haptics -> FizzPreset(haptics) },
        FlarePreset.name to { haptics -> FlarePreset(haptics) },
        FlickPreset.name to { haptics -> FlickPreset(haptics) },
        FlinchPreset.name to { haptics -> FlinchPreset(haptics) },
        FlourishPreset.name to { haptics -> FlourishPreset(haptics) },
        FlurryPreset.name to { haptics -> FlurryPreset(haptics) },
        FlushPreset.name to { haptics -> FlushPreset(haptics) },
        GallopPreset.name to { haptics -> GallopPreset(haptics) },
        GavelPreset.name to { haptics -> GavelPreset(haptics) },
        GlitchPreset.name to { haptics -> GlitchPreset(haptics) },
        GuitarStrumPreset.name to { haptics -> GuitarStrumPreset(haptics) },
        HailPreset.name to { haptics -> HailPreset(haptics) },
        HammerPreset.name to { haptics -> HammerPreset(haptics) },
        HeartbeatPreset.name to { haptics -> HeartbeatPreset(haptics) },
        HeraldPreset.name to { haptics -> HeraldPreset(haptics) },
        HoofBeatPreset.name to { haptics -> HoofBeatPreset(haptics) },
        IgnitionPreset.name to { haptics -> IgnitionPreset(haptics) },
        ImpactPreset.name to { haptics -> ImpactPreset(haptics) },
        JoltPreset.name to { haptics -> JoltPreset(haptics) },
        KeyboardMechanicalPreset.name to { haptics -> KeyboardMechanicalPreset(haptics) },
        KeyboardMembranePreset.name to { haptics -> KeyboardMembranePreset(haptics) },
        KnellPreset.name to { haptics -> KnellPreset(haptics) },
        KnockPreset.name to { haptics -> KnockPreset(haptics) },
        LamentPreset.name to { haptics -> LamentPreset(haptics) },
        LatchPreset.name to { haptics -> LatchPreset(haptics) },
        LighthousePreset.name to { haptics -> LighthousePreset(haptics) },
        LiltPreset.name to { haptics -> LiltPreset(haptics) },
        LockPreset.name to { haptics -> LockPreset(haptics) },
        LopePreset.name to { haptics -> LopePreset(haptics) },
        MarchPreset.name to { haptics -> MarchPreset(haptics) },
        MetronomePreset.name to { haptics -> MetronomePreset(haptics) },
        MurmurPreset.name to { haptics -> MurmurPreset(haptics) },
        NudgePreset.name to { haptics -> NudgePreset(haptics) },
        PassingCarPreset.name to { haptics -> PassingCarPreset(haptics) },
        PatterPreset.name to { haptics -> PatterPreset(haptics) },
        PealPreset.name to { haptics -> PealPreset(haptics) },
        PeckPreset.name to { haptics -> PeckPreset(haptics) },
        PendulumPreset.name to { haptics -> PendulumPreset(haptics) },
        PingPreset.name to { haptics -> PingPreset(haptics) },
        PipPreset.name to { haptics -> PipPreset(haptics) },
        PistonPreset.name to { haptics -> PistonPreset(haptics) },
        PlinkPreset.name to { haptics -> PlinkPreset(haptics) },
        PlummetPreset.name to { haptics -> PlummetPreset(haptics) },
        PlunkPreset.name to { haptics -> PlunkPreset(haptics) },
        PokePreset.name to { haptics -> PokePreset(haptics) },
        PoundPreset.name to { haptics -> PoundPreset(haptics) },
        PowerDownPreset.name to { haptics -> PowerDownPreset(haptics) },
        PropelPreset.name to { haptics -> PropelPreset(haptics) },
        PulsePreset.name to { haptics -> PulsePreset(haptics) },
        PummelPreset.name to { haptics -> PummelPreset(haptics) },
        PushPreset.name to { haptics -> PushPreset(haptics) },
        RadarPreset.name to { haptics -> RadarPreset(haptics) },
        RainPreset.name to { haptics -> RainPreset(haptics) },
        RampPreset.name to { haptics -> RampPreset(haptics) },
        RapPreset.name to { haptics -> RapPreset(haptics) },
        RatchetPreset.name to { haptics -> RatchetPreset(haptics) },
        ReboundPreset.name to { haptics -> ReboundPreset(haptics) },
        RipplePreset.name to { haptics -> RipplePreset(haptics) },
        RivetPreset.name to { haptics -> RivetPreset(haptics) },
        RustlePreset.name to { haptics -> RustlePreset(haptics) },
        ShockwavePreset.name to { haptics -> ShockwavePreset(haptics) },
        SnapPreset.name to { haptics -> SnapPreset(haptics) },
        SonarPreset.name to { haptics -> SonarPreset(haptics) },
        SparkPreset.name to { haptics -> SparkPreset(haptics) },
        SpinPreset.name to { haptics -> SpinPreset(haptics) },
        StaggerPreset.name to { haptics -> StaggerPreset(haptics) },
        StampPreset.name to { haptics -> StampPreset(haptics) },
        StampedePreset.name to { haptics -> StampedePreset(haptics) },
        StompPreset.name to { haptics -> StompPreset(haptics) },
        StoneSkipPreset.name to { haptics -> StoneSkipPreset(haptics) },
        StrikePreset.name to { haptics -> StrikePreset(haptics) },
        SummonPreset.name to { haptics -> SummonPreset(haptics) },
        SurgePreset.name to { haptics -> SurgePreset(haptics) },
        SwayPreset.name to { haptics -> SwayPreset(haptics) },
        SweepPreset.name to { haptics -> SweepPreset(haptics) },
        SwellPreset.name to { haptics -> SwellPreset(haptics) },
        SyncopatePreset.name to { haptics -> SyncopatePreset(haptics) },
        ThrobPreset.name to { haptics -> ThrobPreset(haptics) },
        ThudPreset.name to { haptics -> ThudPreset(haptics) },
        ThumpPreset.name to { haptics -> ThumpPreset(haptics) },
        ThunderPreset.name to { haptics -> ThunderPreset(haptics) },
        ThunderRollPreset.name to { haptics -> ThunderRollPreset(haptics) },
        TickTockPreset.name to { haptics -> TickTockPreset(haptics) },
        TidalSurgePreset.name to { haptics -> TidalSurgePreset(haptics) },
        TideSwellPreset.name to { haptics -> TideSwellPreset(haptics) },
        TremorPreset.name to { haptics -> TremorPreset(haptics) },
        TriggerPreset.name to { haptics -> TriggerPreset(haptics) },
        TriumphPreset.name to { haptics -> TriumphPreset(haptics) },
        TrumpetPreset.name to { haptics -> TrumpetPreset(haptics) },
        TypewriterPreset.name to { haptics -> TypewriterPreset(haptics) },
        UnfurlPreset.name to { haptics -> UnfurlPreset(haptics) },
        VortexPreset.name to { haptics -> VortexPreset(haptics) },
        WanePreset.name to { haptics -> WanePreset(haptics) },
        WarDrumPreset.name to { haptics -> WarDrumPreset(haptics) },
        WaterfallPreset.name to { haptics -> WaterfallPreset(haptics) },
        WavePreset.name to { haptics -> WavePreset(haptics) },
        WispPreset.name to { haptics -> WispPreset(haptics) },
        WobblePreset.name to { haptics -> WobblePreset(haptics) },
        WoodpeckerPreset.name to { haptics -> WoodpeckerPreset(haptics) },
        ZipperPreset.name to { haptics -> ZipperPreset(haptics) },
// CODEGEN_END_{mappers}
    )

    fun enableCache(state: Boolean) {
        this.useCache = state
        if (!state) {
            resetCache()
        }
    }

    fun isCacheEnabled(): Boolean = this.useCache

    fun resetCache() {
        cache.clear()
    }

    fun preloadPresetByNames(names: List<String>) {
        for (name in names) {
            preloadPresetByName(name)
        }
    }

    fun preloadPresetByName(name: String) {
        this.useCache = true
        getCacheablePreset(name)
    }

    fun getByName(name: String): Preset? {
        return getCacheablePreset(name)
    }

    private fun getCacheablePreset(name: String): Preset? {
        return if (useCache) {
            cache.getOrPut(name) {
                mapper[name]?.invoke(haptics) ?: return null
            }
        } else {
            mapper[name]?.invoke(haptics) ?: return null
        }
    }

    fun systemImpactLight() {
        getCacheablePreset(SystemImpactLightPreset.name)!!.play()
    }

    fun systemImpactMedium() {
        getCacheablePreset(SystemImpactMediumPreset.name)!!.play()
    }

    fun systemImpactHeavy() {
        getCacheablePreset(SystemImpactHeavyPreset.name)!!.play()
    }

    fun systemImpactSoft() {
        getCacheablePreset(SystemImpactSoftPreset.name)!!.play()
    }

    fun systemImpactRigid() {
        getCacheablePreset(SystemImpactRigidPreset.name)!!.play()
    }

    fun systemNotificationSuccess() {
        getCacheablePreset(SystemNotificationSuccessPreset.name)!!.play()
    }

    fun systemNotificationWarning() {
        getCacheablePreset(SystemNotificationWarningPreset.name)!!.play()
    }

    fun systemNotificationError() {
        getCacheablePreset(SystemNotificationErrorPreset.name)!!.play()
    }

    fun systemSelection() {
        getCacheablePreset(SystemSelectionPreset.name)!!.play()
    }

    fun systemEffectClick() {
        getCacheablePreset(SystemEffectClickPreset.name)!!.play()
    }

    fun systemEffectDoubleClick() {
        getCacheablePreset(SystemEffectDoubleClickPreset.name)!!.play()
    }

    fun systemEffectTick() {
        getCacheablePreset(SystemEffectTickPreset.name)!!.play()
    }

    fun systemEffectHeavyClick() {
        getCacheablePreset(SystemEffectHeavyClickPreset.name)!!.play()
    }

    fun systemLongPress() {
        getCacheablePreset(SystemLongPressPreset.name)!!.play()
    }

    fun systemVirtualKey() {
        getCacheablePreset(SystemVirtualKeyPreset.name)!!.play()
    }

    fun systemKeyboardTap() {
        getCacheablePreset(SystemKeyboardTapPreset.name)!!.play()
    }

    fun systemClockTick() {
        getCacheablePreset(SystemClockTickPreset.name)!!.play()
    }

    fun systemCalendarDate() {
        getCacheablePreset(SystemCalendarDatePreset.name)!!.play()
    }

    fun systemContextClick() {
        getCacheablePreset(SystemContextClickPreset.name)!!.play()
    }

    fun systemKeyboardPress() {
        getCacheablePreset(SystemKeyboardPressPreset.name)!!.play()
    }

    fun systemKeyboardRelease() {
        getCacheablePreset(SystemKeyboardReleasePreset.name)!!.play()
    }

    fun systemVirtualKeyRelease() {
        getCacheablePreset(SystemVirtualKeyReleasePreset.name)!!.play()
    }

    fun systemTextHandleMove() {
        getCacheablePreset(SystemTextHandleMovePreset.name)!!.play()
    }

    fun systemDragCrossing() {
        getCacheablePreset(SystemDragCrossingPreset.name)!!.play()
    }

    fun systemGestureStart() {
        getCacheablePreset(SystemGestureStartPreset.name)!!.play()
    }

    fun systemGestureEnd() {
        getCacheablePreset(SystemGestureEndPreset.name)!!.play()
    }

    fun systemEdgeSqueeze() {
        getCacheablePreset(SystemEdgeSqueezePreset.name)!!.play()
    }

    fun systemEdgeRelease() {
        getCacheablePreset(SystemEdgeReleasePreset.name)!!.play()
    }

    fun systemConfirm() {
        getCacheablePreset(SystemConfirmPreset.name)!!.play()
    }

    fun systemRelease() {
        getCacheablePreset(SystemReleasePreset.name)!!.play()
    }

    fun systemScrollTick() {
        getCacheablePreset(SystemScrollTickPreset.name)!!.play()
    }

    fun systemScrollItemFocus() {
        getCacheablePreset(SystemScrollItemFocusPreset.name)!!.play()
    }

    fun systemScrollLimit() {
        getCacheablePreset(SystemScrollLimitPreset.name)!!.play()
    }

    fun systemToggleOn() {
        getCacheablePreset(SystemToggleOnPreset.name)!!.play()
    }

    fun systemToggleOff() {
        getCacheablePreset(SystemToggleOffPreset.name)!!.play()
    }

    fun systemDragStart() {
        getCacheablePreset(SystemDragStartPreset.name)!!.play()
    }

    fun systemSegmentTick() {
        getCacheablePreset(SystemSegmentTickPreset.name)!!.play()
    }

    fun systemSegmentFrequentTick() {
        getCacheablePreset(SystemSegmentFrequentTickPreset.name)!!.play()
    }

    fun systemPrimitiveClick() {
        getCacheablePreset(SystemPrimitiveClickPreset.name)!!.play()
    }

    fun systemPrimitiveThud() {
        getCacheablePreset(SystemPrimitiveThudPreset.name)!!.play()
    }

    fun systemPrimitiveSpin() {
        getCacheablePreset(SystemPrimitiveSpinPreset.name)!!.play()
    }

    fun systemPrimitiveQuickRise() {
        getCacheablePreset(SystemPrimitiveQuickRisePreset.name)!!.play()
    }

    fun systemPrimitiveSlowRise() {
        getCacheablePreset(SystemPrimitiveSlowRisePreset.name)!!.play()
    }

    fun systemPrimitiveQuickFall() {
        getCacheablePreset(SystemPrimitiveQuickFallPreset.name)!!.play()
    }

    fun systemPrimitiveTick() {
        getCacheablePreset(SystemPrimitiveTickPreset.name)!!.play()
    }

    fun systemPrimitiveLowTick() {
        getCacheablePreset(SystemPrimitiveLowTickPreset.name)!!.play()
    }

// CODEGEN_BEGIN_{getters}
    fun afterglow() {
        getCacheablePreset(AfterglowPreset.name)!!.play()
    }

    fun aftershock() {
        getCacheablePreset(AftershockPreset.name)!!.play()
    }

    fun alarm() {
        getCacheablePreset(AlarmPreset.name)!!.play()
    }

    fun anvil() {
        getCacheablePreset(AnvilPreset.name)!!.play()
    }

    fun applause() {
        getCacheablePreset(ApplausePreset.name)!!.play()
    }

    fun ascent() {
        getCacheablePreset(AscentPreset.name)!!.play()
    }

    fun balloonPop() {
        getCacheablePreset(BalloonPopPreset.name)!!.play()
    }

    fun barrage() {
        getCacheablePreset(BarragePreset.name)!!.play()
    }

    fun bassDrop() {
        getCacheablePreset(BassDropPreset.name)!!.play()
    }

    fun batter() {
        getCacheablePreset(BatterPreset.name)!!.play()
    }

    fun bellToll() {
        getCacheablePreset(BellTollPreset.name)!!.play()
    }

    fun blip() {
        getCacheablePreset(BlipPreset.name)!!.play()
    }

    fun bloom() {
        getCacheablePreset(BloomPreset.name)!!.play()
    }

    fun bongo() {
        getCacheablePreset(BongoPreset.name)!!.play()
    }

    fun boulder() {
        getCacheablePreset(BoulderPreset.name)!!.play()
    }

    fun breakingWave() {
        getCacheablePreset(BreakingWavePreset.name)!!.play()
    }

    fun breath() {
        getCacheablePreset(BreathPreset.name)!!.play()
    }

    fun buildup() {
        getCacheablePreset(BuildupPreset.name)!!.play()
    }

    fun burst() {
        getCacheablePreset(BurstPreset.name)!!.play()
    }

    fun buzz() {
        getCacheablePreset(BuzzPreset.name)!!.play()
    }

    fun cadence() {
        getCacheablePreset(CadencePreset.name)!!.play()
    }

    fun cameraShutter() {
        getCacheablePreset(CameraShutterPreset.name)!!.play()
    }

    fun canter() {
        getCacheablePreset(CanterPreset.name)!!.play()
    }

    fun cascade() {
        getCacheablePreset(CascadePreset.name)!!.play()
    }

    fun castanets() {
        getCacheablePreset(CastanetsPreset.name)!!.play()
    }

    fun catPaw() {
        getCacheablePreset(CatPawPreset.name)!!.play()
    }

    fun charge() {
        getCacheablePreset(ChargePreset.name)!!.play()
    }

    fun chime() {
        getCacheablePreset(ChimePreset.name)!!.play()
    }

    fun chip() {
        getCacheablePreset(ChipPreset.name)!!.play()
    }

    fun chirp() {
        getCacheablePreset(ChirpPreset.name)!!.play()
    }

    fun clamor() {
        getCacheablePreset(ClamorPreset.name)!!.play()
    }

    fun clasp() {
        getCacheablePreset(ClaspPreset.name)!!.play()
    }

    fun cleave() {
        getCacheablePreset(CleavePreset.name)!!.play()
    }

    fun coil() {
        getCacheablePreset(CoilPreset.name)!!.play()
    }

    fun coinDrop() {
        getCacheablePreset(CoinDropPreset.name)!!.play()
    }

    fun combinationLock() {
        getCacheablePreset(CombinationLockPreset.name)!!.play()
    }

    fun crescendo() {
        getCacheablePreset(CrescendoPreset.name)!!.play()
    }

    fun dewdrop() {
        getCacheablePreset(DewdropPreset.name)!!.play()
    }

    fun dirge() {
        getCacheablePreset(DirgePreset.name)!!.play()
    }

    fun dissolve() {
        getCacheablePreset(DissolvePreset.name)!!.play()
    }

    fun dogBark() {
        getCacheablePreset(DogBarkPreset.name)!!.play()
    }

    fun drone() {
        getCacheablePreset(DronePreset.name)!!.play()
    }

    fun engineRev() {
        getCacheablePreset(EngineRevPreset.name)!!.play()
    }

    fun exhale() {
        getCacheablePreset(ExhalePreset.name)!!.play()
    }

    fun explosion() {
        getCacheablePreset(ExplosionPreset.name)!!.play()
    }

    fun fadeOut() {
        getCacheablePreset(FadeOutPreset.name)!!.play()
    }

    fun fanfare() {
        getCacheablePreset(FanfarePreset.name)!!.play()
    }

    fun feather() {
        getCacheablePreset(FeatherPreset.name)!!.play()
    }

    fun finale() {
        getCacheablePreset(FinalePreset.name)!!.play()
    }

    fun fingerDrum() {
        getCacheablePreset(FingerDrumPreset.name)!!.play()
    }

    fun firecracker() {
        getCacheablePreset(FirecrackerPreset.name)!!.play()
    }

    fun fizz() {
        getCacheablePreset(FizzPreset.name)!!.play()
    }

    fun flare() {
        getCacheablePreset(FlarePreset.name)!!.play()
    }

    fun flick() {
        getCacheablePreset(FlickPreset.name)!!.play()
    }

    fun flinch() {
        getCacheablePreset(FlinchPreset.name)!!.play()
    }

    fun flourish() {
        getCacheablePreset(FlourishPreset.name)!!.play()
    }

    fun flurry() {
        getCacheablePreset(FlurryPreset.name)!!.play()
    }

    fun flush() {
        getCacheablePreset(FlushPreset.name)!!.play()
    }

    fun gallop() {
        getCacheablePreset(GallopPreset.name)!!.play()
    }

    fun gavel() {
        getCacheablePreset(GavelPreset.name)!!.play()
    }

    fun glitch() {
        getCacheablePreset(GlitchPreset.name)!!.play()
    }

    fun guitarStrum() {
        getCacheablePreset(GuitarStrumPreset.name)!!.play()
    }

    fun hail() {
        getCacheablePreset(HailPreset.name)!!.play()
    }

    fun hammer() {
        getCacheablePreset(HammerPreset.name)!!.play()
    }

    fun heartbeat() {
        getCacheablePreset(HeartbeatPreset.name)!!.play()
    }

    fun herald() {
        getCacheablePreset(HeraldPreset.name)!!.play()
    }

    fun hoofBeat() {
        getCacheablePreset(HoofBeatPreset.name)!!.play()
    }

    fun ignition() {
        getCacheablePreset(IgnitionPreset.name)!!.play()
    }

    fun impact() {
        getCacheablePreset(ImpactPreset.name)!!.play()
    }

    fun jolt() {
        getCacheablePreset(JoltPreset.name)!!.play()
    }

    fun keyboardMechanical() {
        getCacheablePreset(KeyboardMechanicalPreset.name)!!.play()
    }

    fun keyboardMembrane() {
        getCacheablePreset(KeyboardMembranePreset.name)!!.play()
    }

    fun knell() {
        getCacheablePreset(KnellPreset.name)!!.play()
    }

    fun knock() {
        getCacheablePreset(KnockPreset.name)!!.play()
    }

    fun lament() {
        getCacheablePreset(LamentPreset.name)!!.play()
    }

    fun latch() {
        getCacheablePreset(LatchPreset.name)!!.play()
    }

    fun lighthouse() {
        getCacheablePreset(LighthousePreset.name)!!.play()
    }

    fun lilt() {
        getCacheablePreset(LiltPreset.name)!!.play()
    }

    fun lock() {
        getCacheablePreset(LockPreset.name)!!.play()
    }

    fun lope() {
        getCacheablePreset(LopePreset.name)!!.play()
    }

    fun march() {
        getCacheablePreset(MarchPreset.name)!!.play()
    }

    fun metronome() {
        getCacheablePreset(MetronomePreset.name)!!.play()
    }

    fun murmur() {
        getCacheablePreset(MurmurPreset.name)!!.play()
    }

    fun nudge() {
        getCacheablePreset(NudgePreset.name)!!.play()
    }

    fun passingCar() {
        getCacheablePreset(PassingCarPreset.name)!!.play()
    }

    fun patter() {
        getCacheablePreset(PatterPreset.name)!!.play()
    }

    fun peal() {
        getCacheablePreset(PealPreset.name)!!.play()
    }

    fun peck() {
        getCacheablePreset(PeckPreset.name)!!.play()
    }

    fun pendulum() {
        getCacheablePreset(PendulumPreset.name)!!.play()
    }

    fun ping() {
        getCacheablePreset(PingPreset.name)!!.play()
    }

    fun pip() {
        getCacheablePreset(PipPreset.name)!!.play()
    }

    fun piston() {
        getCacheablePreset(PistonPreset.name)!!.play()
    }

    fun plink() {
        getCacheablePreset(PlinkPreset.name)!!.play()
    }

    fun plummet() {
        getCacheablePreset(PlummetPreset.name)!!.play()
    }

    fun plunk() {
        getCacheablePreset(PlunkPreset.name)!!.play()
    }

    fun poke() {
        getCacheablePreset(PokePreset.name)!!.play()
    }

    fun pound() {
        getCacheablePreset(PoundPreset.name)!!.play()
    }

    fun powerDown() {
        getCacheablePreset(PowerDownPreset.name)!!.play()
    }

    fun propel() {
        getCacheablePreset(PropelPreset.name)!!.play()
    }

    fun pulse() {
        getCacheablePreset(PulsePreset.name)!!.play()
    }

    fun pummel() {
        getCacheablePreset(PummelPreset.name)!!.play()
    }

    fun push() {
        getCacheablePreset(PushPreset.name)!!.play()
    }

    fun radar() {
        getCacheablePreset(RadarPreset.name)!!.play()
    }

    fun rain() {
        getCacheablePreset(RainPreset.name)!!.play()
    }

    fun ramp() {
        getCacheablePreset(RampPreset.name)!!.play()
    }

    fun rap() {
        getCacheablePreset(RapPreset.name)!!.play()
    }

    fun ratchet() {
        getCacheablePreset(RatchetPreset.name)!!.play()
    }

    fun rebound() {
        getCacheablePreset(ReboundPreset.name)!!.play()
    }

    fun ripple() {
        getCacheablePreset(RipplePreset.name)!!.play()
    }

    fun rivet() {
        getCacheablePreset(RivetPreset.name)!!.play()
    }

    fun rustle() {
        getCacheablePreset(RustlePreset.name)!!.play()
    }

    fun shockwave() {
        getCacheablePreset(ShockwavePreset.name)!!.play()
    }

    fun snap() {
        getCacheablePreset(SnapPreset.name)!!.play()
    }

    fun sonar() {
        getCacheablePreset(SonarPreset.name)!!.play()
    }

    fun spark() {
        getCacheablePreset(SparkPreset.name)!!.play()
    }

    fun spin() {
        getCacheablePreset(SpinPreset.name)!!.play()
    }

    fun stagger() {
        getCacheablePreset(StaggerPreset.name)!!.play()
    }

    fun stamp() {
        getCacheablePreset(StampPreset.name)!!.play()
    }

    fun stampede() {
        getCacheablePreset(StampedePreset.name)!!.play()
    }

    fun stomp() {
        getCacheablePreset(StompPreset.name)!!.play()
    }

    fun stoneSkip() {
        getCacheablePreset(StoneSkipPreset.name)!!.play()
    }

    fun strike() {
        getCacheablePreset(StrikePreset.name)!!.play()
    }

    fun summon() {
        getCacheablePreset(SummonPreset.name)!!.play()
    }

    fun surge() {
        getCacheablePreset(SurgePreset.name)!!.play()
    }

    fun sway() {
        getCacheablePreset(SwayPreset.name)!!.play()
    }

    fun sweep() {
        getCacheablePreset(SweepPreset.name)!!.play()
    }

    fun swell() {
        getCacheablePreset(SwellPreset.name)!!.play()
    }

    fun syncopate() {
        getCacheablePreset(SyncopatePreset.name)!!.play()
    }

    fun throb() {
        getCacheablePreset(ThrobPreset.name)!!.play()
    }

    fun thud() {
        getCacheablePreset(ThudPreset.name)!!.play()
    }

    fun thump() {
        getCacheablePreset(ThumpPreset.name)!!.play()
    }

    fun thunder() {
        getCacheablePreset(ThunderPreset.name)!!.play()
    }

    fun thunderRoll() {
        getCacheablePreset(ThunderRollPreset.name)!!.play()
    }

    fun tickTock() {
        getCacheablePreset(TickTockPreset.name)!!.play()
    }

    fun tidalSurge() {
        getCacheablePreset(TidalSurgePreset.name)!!.play()
    }

    fun tideSwell() {
        getCacheablePreset(TideSwellPreset.name)!!.play()
    }

    fun tremor() {
        getCacheablePreset(TremorPreset.name)!!.play()
    }

    fun trigger() {
        getCacheablePreset(TriggerPreset.name)!!.play()
    }

    fun triumph() {
        getCacheablePreset(TriumphPreset.name)!!.play()
    }

    fun trumpet() {
        getCacheablePreset(TrumpetPreset.name)!!.play()
    }

    fun typewriter() {
        getCacheablePreset(TypewriterPreset.name)!!.play()
    }

    fun unfurl() {
        getCacheablePreset(UnfurlPreset.name)!!.play()
    }

    fun vortex() {
        getCacheablePreset(VortexPreset.name)!!.play()
    }

    fun wane() {
        getCacheablePreset(WanePreset.name)!!.play()
    }

    fun warDrum() {
        getCacheablePreset(WarDrumPreset.name)!!.play()
    }

    fun waterfall() {
        getCacheablePreset(WaterfallPreset.name)!!.play()
    }

    fun wave() {
        getCacheablePreset(WavePreset.name)!!.play()
    }

    fun wisp() {
        getCacheablePreset(WispPreset.name)!!.play()
    }

    fun wobble() {
        getCacheablePreset(WobblePreset.name)!!.play()
    }

    fun woodpecker() {
        getCacheablePreset(WoodpeckerPreset.name)!!.play()
    }

    fun zipper() {
        getCacheablePreset(ZipperPreset.name)!!.play()
    }
// CODEGEN_END_{getters}
}
