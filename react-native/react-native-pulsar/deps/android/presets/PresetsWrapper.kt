package com.swmansion.pulsar.presets

import android.content.Context
import com.swmansion.pulsar.Pulsar
import com.swmansion.pulsar.haptics.HapticEngineWrapper
import com.swmansion.pulsar.types.Preset
import com.swmansion.pulsar.presets.generated.*

class PresetsWrapper(
    private val haptics: Pulsar,
    context: Context,
    engine: HapticEngineWrapper,
) {
    private var useCache: Boolean = true
    private val cache = mutableMapOf<String, Preset>()
    private val systemPrimitivePresets = SystemPrimitivePresets(engine)
    private val systemViewBasedPresets = SystemViewBasedPresets(context)

    private val mapper: Map<String, (Pulsar) -> Preset> = mapOf(
        SystemImpactLightPreset.name to { haptics -> SystemImpactLightPreset(haptics) },
        SystemImpactMediumPreset.name to { haptics -> SystemImpactMediumPreset(haptics) },
        SystemImpactHeavyPreset.name to { haptics -> SystemImpactHeavyPreset(haptics) },
        SystemImpactSoftPreset.name to { haptics -> SystemImpactSoftPreset(haptics) },
        SystemImpactRigidPreset.name to { haptics -> SystemImpactRigidPreset(haptics) },
        SystemNotificationSuccessPreset.name to { haptics -> SystemNotificationSuccessPreset(haptics) },
        SystemNotificationWarningPreset.name to { haptics -> SystemNotificationWarningPreset(haptics) },
        SystemNotificationErrorPreset.name to { haptics -> SystemNotificationErrorPreset(haptics) },

        SystemEffectClickPreset.name to { haptics -> SystemEffectClickPreset(haptics, systemPrimitivePresets) },
        SystemDoubleClickPreset.name to { haptics -> SystemDoubleClickPreset(haptics, systemPrimitivePresets) },
        SystemTickPreset.name to { haptics -> SystemTickPreset(haptics, systemPrimitivePresets) },
        SystemHeavyClickPreset.name to { haptics -> SystemHeavyClickPreset(haptics, systemPrimitivePresets) },

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
        AimingFirePreset.name to { haptics -> AimingFirePreset(haptics) },
        AimingLockPreset.name to { haptics -> AimingLockPreset(haptics) },
        AlarmPreset.name to { haptics -> AlarmPreset(haptics) },
        AngerFrustrationPreset.name to { haptics -> AngerFrustrationPreset(haptics) },
        ApplausePreset.name to { haptics -> ApplausePreset(haptics) },
        AttentionPreset.name to { haptics -> AttentionPreset(haptics) },
        BalloonPopPreset.name to { haptics -> BalloonPopPreset(haptics) },
        BangDoorPreset.name to { haptics -> BangDoorPreset(haptics) },
        BarragePreset.name to { haptics -> BarragePreset(haptics) },
        BoredomFlatPreset.name to { haptics -> BoredomFlatPreset(haptics) },
        BreathPreset.name to { haptics -> BreathPreset(haptics) },
        BtnChipPreset.name to { haptics -> BtnChipPreset(haptics) },
        BtnDestructivePreset.name to { haptics -> BtnDestructivePreset(haptics) },
        BtnGhostPreset.name to { haptics -> BtnGhostPreset(haptics) },
        BtnIconPreset.name to { haptics -> BtnIconPreset(haptics) },
        BtnMenuPreset.name to { haptics -> BtnMenuPreset(haptics) },
        BtnPrimaryPreset.name to { haptics -> BtnPrimaryPreset(haptics) },
        BtnSecondaryPreset.name to { haptics -> BtnSecondaryPreset(haptics) },
        BtnSubmitPreset.name to { haptics -> BtnSubmitPreset(haptics) },
        BtnToggleOffPreset.name to { haptics -> BtnToggleOffPreset(haptics) },
        BuildupPreset.name to { haptics -> BuildupPreset(haptics) },
        CameraShutterPreset.name to { haptics -> CameraShutterPreset(haptics) },
        CascadePreset.name to { haptics -> CascadePreset(haptics) },
        CleanStrikePreset.name to { haptics -> CleanStrikePreset(haptics) },
        CoinDropPreset.name to { haptics -> CoinDropPreset(haptics) },
        CombinationLockPreset.name to { haptics -> CombinationLockPreset(haptics) },
        ConfirmPreset.name to { haptics -> ConfirmPreset(haptics) },
        CowboyPreset.name to { haptics -> CowboyPreset(haptics) },
        CrescendoPreset.name to { haptics -> CrescendoPreset(haptics) },
        CrossedEyesPreset.name to { haptics -> CrossedEyesPreset(haptics) },
        CursingPreset.name to { haptics -> CursingPreset(haptics) },
        DeepRumblePreset.name to { haptics -> DeepRumblePreset(haptics) },
        DeepThudPreset.name to { haptics -> DeepThudPreset(haptics) },
        DogBarkPreset.name to { haptics -> DogBarkPreset(haptics) },
        DoubleBeatPreset.name to { haptics -> DoubleBeatPreset(haptics) },
        DoubleBlastPreset.name to { haptics -> DoubleBlastPreset(haptics) },
        DoubleBurstPreset.name to { haptics -> DoubleBurstPreset(haptics) },
        DoubleClickPreset.name to { haptics -> DoubleClickPreset(haptics) },
        DoubleGentleTapPreset.name to { haptics -> DoubleGentleTapPreset(haptics) },
        DoublePatPreset.name to { haptics -> DoublePatPreset(haptics) },
        DoublePulsePreset.name to { haptics -> DoublePulsePreset(haptics) },
        DoublePunchPreset.name to { haptics -> DoublePunchPreset(haptics) },
        DoubleStrikePreset.name to { haptics -> DoubleStrikePreset(haptics) },
        DoubleTapPreset.name to { haptics -> DoubleTapPreset(haptics) },
        DoubleThudPreset.name to { haptics -> DoubleThudPreset(haptics) },
        DoubleTripletPreset.name to { haptics -> DoubleTripletPreset(haptics) },
        EngineRevPreset.name to { haptics -> EngineRevPreset(haptics) },
        ErrorBuzzPreset.name to { haptics -> ErrorBuzzPreset(haptics) },
        ErrorSoftPreset.name to { haptics -> ErrorSoftPreset(haptics) },
        ExplodingHeadPreset.name to { haptics -> ExplodingHeadPreset(haptics) },
        ExplosionPreset.name to { haptics -> ExplosionPreset(haptics) },
        EyeRollingPreset.name to { haptics -> EyeRollingPreset(haptics) },
        FadeOutPreset.name to { haptics -> FadeOutPreset(haptics) },
        FanfareShortPreset.name to { haptics -> FanfareShortPreset(haptics) },
        FirmImpactPreset.name to { haptics -> FirmImpactPreset(haptics) },
        GameComboPreset.name to { haptics -> GameComboPreset(haptics) },
        GameHitPreset.name to { haptics -> GameHitPreset(haptics) },
        GameLevelUpPreset.name to { haptics -> GameLevelUpPreset(haptics) },
        GamePickupPreset.name to { haptics -> GamePickupPreset(haptics) },
        GlitchPreset.name to { haptics -> GlitchPreset(haptics) },
        GravityFreefallPreset.name to { haptics -> GravityFreefallPreset(haptics) },
        GrinningSquintingPreset.name to { haptics -> GrinningSquintingPreset(haptics) },
        GuitarStrumPreset.name to { haptics -> GuitarStrumPreset(haptics) },
        HailPreset.name to { haptics -> HailPreset(haptics) },
        HappinessJoyfulPreset.name to { haptics -> HappinessJoyfulPreset(haptics) },
        HappinessLightPreset.name to { haptics -> HappinessLightPreset(haptics) },
        HeartbeatPreset.name to { haptics -> HeartbeatPreset(haptics) },
        HeavyImpactPreset.name to { haptics -> HeavyImpactPreset(haptics) },
        KeyboardMechanicalPreset.name to { haptics -> KeyboardMechanicalPreset(haptics) },
        KeyboardMembranePreset.name to { haptics -> KeyboardMembranePreset(haptics) },
        KeyboardTypewriterOldPreset.name to { haptics -> KeyboardTypewriterOldPreset(haptics) },
        KnockDoorPreset.name to { haptics -> KnockDoorPreset(haptics) },
        LevelUpPreset.name to { haptics -> LevelUpPreset(haptics) },
        LoaderBreathingPreset.name to { haptics -> LoaderBreathingPreset(haptics) },
        LoaderPulsePreset.name to { haptics -> LoaderPulsePreset(haptics) },
        LoaderRadarPreset.name to { haptics -> LoaderRadarPreset(haptics) },
        LoaderSpinPreset.name to { haptics -> LoaderSpinPreset(haptics) },
        LoaderWavePreset.name to { haptics -> LoaderWavePreset(haptics) },
        LockPreset.name to { haptics -> LockPreset(haptics) },
        LongPressPreset.name to { haptics -> LongPressPreset(haptics) },
        MarioGameOverPreset.name to { haptics -> MarioGameOverPreset(haptics) },
        MaxImpactPreset.name to { haptics -> MaxImpactPreset(haptics) },
        MutedImpactPreset.name to { haptics -> MutedImpactPreset(haptics) },
        NeutralClearPreset.name to { haptics -> NeutralClearPreset(haptics) },
        NeutralSteadyPreset.name to { haptics -> NeutralSteadyPreset(haptics) },
        NewMessagePreset.name to { haptics -> NewMessagePreset(haptics) },
        NotificationPreset.name to { haptics -> NotificationPreset(haptics) },
        NotificationKnockPreset.name to { haptics -> NotificationKnockPreset(haptics) },
        NotificationUrgentPreset.name to { haptics -> NotificationUrgentPreset(haptics) },
        NotifyInfoStandardPreset.name to { haptics -> NotifyInfoStandardPreset(haptics) },
        NotifyReminderFinalPreset.name to { haptics -> NotifyReminderFinalPreset(haptics) },
        NotifyReminderNudgePreset.name to { haptics -> NotifyReminderNudgePreset(haptics) },
        NotifyReminderSoftPreset.name to { haptics -> NotifyReminderSoftPreset(haptics) },
        NotifySocialMentionPreset.name to { haptics -> NotifySocialMentionPreset(haptics) },
        NotifySocialMessagePreset.name to { haptics -> NotifySocialMessagePreset(haptics) },
        NotifySuccessSubtlePreset.name to { haptics -> NotifySuccessSubtlePreset(haptics) },
        NotifyTimerDonePreset.name to { haptics -> NotifyTimerDonePreset(haptics) },
        NotifyWarnMildPreset.name to { haptics -> NotifyWarnMildPreset(haptics) },
        NotifyWarnModeratePreset.name to { haptics -> NotifyWarnModeratePreset(haptics) },
        PassingCarPreset.name to { haptics -> PassingCarPreset(haptics) },
        PendulumPreset.name to { haptics -> PendulumPreset(haptics) },
        PowerDownPreset.name to { haptics -> PowerDownPreset(haptics) },
        QuadBeatPreset.name to { haptics -> QuadBeatPreset(haptics) },
        QuadRampPreset.name to { haptics -> QuadRampPreset(haptics) },
        QuadThudPreset.name to { haptics -> QuadThudPreset(haptics) },
        RainPreset.name to { haptics -> RainPreset(haptics) },
        ReadySteadyGoPreset.name to { haptics -> ReadySteadyGoPreset(haptics) },
        ReliefSighPreset.name to { haptics -> ReliefSighPreset(haptics) },
        ReliefSoftPreset.name to { haptics -> ReliefSoftPreset(haptics) },
        RipplePreset.name to { haptics -> RipplePreset(haptics) },
        SadnessMelancholicPreset.name to { haptics -> SadnessMelancholicPreset(haptics) },
        SearchingPreset.name to { haptics -> SearchingPreset(haptics) },
        SearchSuccessPreset.name to { haptics -> SearchSuccessPreset(haptics) },
        SelectionCrispPreset.name to { haptics -> SelectionCrispPreset(haptics) },
        SelectionSnapPreset.name to { haptics -> SelectionSnapPreset(haptics) },
        ShockwavePreset.name to { haptics -> ShockwavePreset(haptics) },
        SneezingPreset.name to { haptics -> SneezingPreset(haptics) },
        SparkPreset.name to { haptics -> SparkPreset(haptics) },
        SuccessFlourishPreset.name to { haptics -> SuccessFlourishPreset(haptics) },
        SuccessGentlePreset.name to { haptics -> SuccessGentlePreset(haptics) },
        SupportSteadyPreset.name to { haptics -> SupportSteadyPreset(haptics) },
        SupportStrongPreset.name to { haptics -> SupportStrongPreset(haptics) },
        SurpriseGaspPreset.name to { haptics -> SurpriseGaspPreset(haptics) },
        TadaPreset.name to { haptics -> TadaPreset(haptics) },
        ThunderPreset.name to { haptics -> ThunderPreset(haptics) },
        ThunderRollPreset.name to { haptics -> ThunderRollPreset(haptics) },
        TickTockPreset.name to { haptics -> TickTockPreset(haptics) },
        TideSwellPreset.name to { haptics -> TideSwellPreset(haptics) },
        TripleBeatPreset.name to { haptics -> TripleBeatPreset(haptics) },
        TripleClickPreset.name to { haptics -> TripleClickPreset(haptics) },
        TripleDecayPreset.name to { haptics -> TripleDecayPreset(haptics) },
        TripleDrumPreset.name to { haptics -> TripleDrumPreset(haptics) },
        TripleEscalationPreset.name to { haptics -> TripleEscalationPreset(haptics) },
        TripleFadePreset.name to { haptics -> TripleFadePreset(haptics) },
        TripleGentleTapPreset.name to { haptics -> TripleGentleTapPreset(haptics) },
        TripleKnockPreset.name to { haptics -> TripleKnockPreset(haptics) },
        TriplePatPreset.name to { haptics -> TriplePatPreset(haptics) },
        TriplePulsePreset.name to { haptics -> TriplePulsePreset(haptics) },
        TripleStrikePreset.name to { haptics -> TripleStrikePreset(haptics) },
        TripleSurgePreset.name to { haptics -> TripleSurgePreset(haptics) },
        TripleTapPreset.name to { haptics -> TripleTapPreset(haptics) },
        TripleThudPreset.name to { haptics -> TripleThudPreset(haptics) },
        VictoryPreset.name to { haptics -> VictoryPreset(haptics) },
        VomitingPreset.name to { haptics -> VomitingPreset(haptics) },
        VortexPreset.name to { haptics -> VortexPreset(haptics) },
        WarningPulsePreset.name to { haptics -> WarningPulsePreset(haptics) },
        WarningSoftPreset.name to { haptics -> WarningSoftPreset(haptics) },
        WarningUrgentPreset.name to { haptics -> WarningUrgentPreset(haptics) },
        WaterfallPreset.name to { haptics -> WaterfallPreset(haptics) },
        WoodpeckerPreset.name to { haptics -> WoodpeckerPreset(haptics) },
        ZeldaChestPreset.name to { haptics -> ZeldaChestPreset(haptics) },
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

// CODEGEN_BEGIN_{getters}
    fun aimingFire() {
        getCacheablePreset(AimingFirePreset.name)!!.play()
    }

    fun aimingLock() {
        getCacheablePreset(AimingLockPreset.name)!!.play()
    }

    fun alarm() {
        getCacheablePreset(AlarmPreset.name)!!.play()
    }

    fun angerFrustration() {
        getCacheablePreset(AngerFrustrationPreset.name)!!.play()
    }

    fun applause() {
        getCacheablePreset(ApplausePreset.name)!!.play()
    }

    fun attention() {
        getCacheablePreset(AttentionPreset.name)!!.play()
    }

    fun balloonPop() {
        getCacheablePreset(BalloonPopPreset.name)!!.play()
    }

    fun bangDoor() {
        getCacheablePreset(BangDoorPreset.name)!!.play()
    }

    fun barrage() {
        getCacheablePreset(BarragePreset.name)!!.play()
    }

    fun boredomFlat() {
        getCacheablePreset(BoredomFlatPreset.name)!!.play()
    }

    fun breath() {
        getCacheablePreset(BreathPreset.name)!!.play()
    }

    fun btnChip() {
        getCacheablePreset(BtnChipPreset.name)!!.play()
    }

    fun btnDestructive() {
        getCacheablePreset(BtnDestructivePreset.name)!!.play()
    }

    fun btnGhost() {
        getCacheablePreset(BtnGhostPreset.name)!!.play()
    }

    fun btnIcon() {
        getCacheablePreset(BtnIconPreset.name)!!.play()
    }

    fun btnMenu() {
        getCacheablePreset(BtnMenuPreset.name)!!.play()
    }

    fun btnPrimary() {
        getCacheablePreset(BtnPrimaryPreset.name)!!.play()
    }

    fun btnSecondary() {
        getCacheablePreset(BtnSecondaryPreset.name)!!.play()
    }

    fun btnSubmit() {
        getCacheablePreset(BtnSubmitPreset.name)!!.play()
    }

    fun btnToggleOff() {
        getCacheablePreset(BtnToggleOffPreset.name)!!.play()
    }

    fun buildup() {
        getCacheablePreset(BuildupPreset.name)!!.play()
    }

    fun cameraShutter() {
        getCacheablePreset(CameraShutterPreset.name)!!.play()
    }

    fun cascade() {
        getCacheablePreset(CascadePreset.name)!!.play()
    }

    fun cleanStrike() {
        getCacheablePreset(CleanStrikePreset.name)!!.play()
    }

    fun coinDrop() {
        getCacheablePreset(CoinDropPreset.name)!!.play()
    }

    fun combinationLock() {
        getCacheablePreset(CombinationLockPreset.name)!!.play()
    }

    fun confirm() {
        getCacheablePreset(ConfirmPreset.name)!!.play()
    }

    fun cowboy() {
        getCacheablePreset(CowboyPreset.name)!!.play()
    }

    fun crescendo() {
        getCacheablePreset(CrescendoPreset.name)!!.play()
    }

    fun crossedEyes() {
        getCacheablePreset(CrossedEyesPreset.name)!!.play()
    }

    fun cursing() {
        getCacheablePreset(CursingPreset.name)!!.play()
    }

    fun deepRumble() {
        getCacheablePreset(DeepRumblePreset.name)!!.play()
    }

    fun deepThud() {
        getCacheablePreset(DeepThudPreset.name)!!.play()
    }

    fun dogBark() {
        getCacheablePreset(DogBarkPreset.name)!!.play()
    }

    fun doubleBeat() {
        getCacheablePreset(DoubleBeatPreset.name)!!.play()
    }

    fun doubleBlast() {
        getCacheablePreset(DoubleBlastPreset.name)!!.play()
    }

    fun doubleBurst() {
        getCacheablePreset(DoubleBurstPreset.name)!!.play()
    }

    fun doubleClick() {
        getCacheablePreset(DoubleClickPreset.name)!!.play()
    }

    fun doubleGentleTap() {
        getCacheablePreset(DoubleGentleTapPreset.name)!!.play()
    }

    fun doublePat() {
        getCacheablePreset(DoublePatPreset.name)!!.play()
    }

    fun doublePulse() {
        getCacheablePreset(DoublePulsePreset.name)!!.play()
    }

    fun doublePunch() {
        getCacheablePreset(DoublePunchPreset.name)!!.play()
    }

    fun doubleStrike() {
        getCacheablePreset(DoubleStrikePreset.name)!!.play()
    }

    fun doubleTap() {
        getCacheablePreset(DoubleTapPreset.name)!!.play()
    }

    fun doubleThud() {
        getCacheablePreset(DoubleThudPreset.name)!!.play()
    }

    fun doubleTriplet() {
        getCacheablePreset(DoubleTripletPreset.name)!!.play()
    }

    fun engineRev() {
        getCacheablePreset(EngineRevPreset.name)!!.play()
    }

    fun errorBuzz() {
        getCacheablePreset(ErrorBuzzPreset.name)!!.play()
    }

    fun errorSoft() {
        getCacheablePreset(ErrorSoftPreset.name)!!.play()
    }

    fun explodingHead() {
        getCacheablePreset(ExplodingHeadPreset.name)!!.play()
    }

    fun explosion() {
        getCacheablePreset(ExplosionPreset.name)!!.play()
    }

    fun eyeRolling() {
        getCacheablePreset(EyeRollingPreset.name)!!.play()
    }

    fun fadeOut() {
        getCacheablePreset(FadeOutPreset.name)!!.play()
    }

    fun fanfareShort() {
        getCacheablePreset(FanfareShortPreset.name)!!.play()
    }

    fun firmImpact() {
        getCacheablePreset(FirmImpactPreset.name)!!.play()
    }

    fun gameCombo() {
        getCacheablePreset(GameComboPreset.name)!!.play()
    }

    fun gameHit() {
        getCacheablePreset(GameHitPreset.name)!!.play()
    }

    fun gameLevelUp() {
        getCacheablePreset(GameLevelUpPreset.name)!!.play()
    }

    fun gamePickup() {
        getCacheablePreset(GamePickupPreset.name)!!.play()
    }

    fun glitch() {
        getCacheablePreset(GlitchPreset.name)!!.play()
    }

    fun gravityFreefall() {
        getCacheablePreset(GravityFreefallPreset.name)!!.play()
    }

    fun grinningSquinting() {
        getCacheablePreset(GrinningSquintingPreset.name)!!.play()
    }

    fun guitarStrum() {
        getCacheablePreset(GuitarStrumPreset.name)!!.play()
    }

    fun hail() {
        getCacheablePreset(HailPreset.name)!!.play()
    }

    fun happinessJoyful() {
        getCacheablePreset(HappinessJoyfulPreset.name)!!.play()
    }

    fun happinessLight() {
        getCacheablePreset(HappinessLightPreset.name)!!.play()
    }

    fun heartbeat() {
        getCacheablePreset(HeartbeatPreset.name)!!.play()
    }

    fun heavyImpact() {
        getCacheablePreset(HeavyImpactPreset.name)!!.play()
    }

    fun keyboardMechanical() {
        getCacheablePreset(KeyboardMechanicalPreset.name)!!.play()
    }

    fun keyboardMembrane() {
        getCacheablePreset(KeyboardMembranePreset.name)!!.play()
    }

    fun keyboardTypewriterOld() {
        getCacheablePreset(KeyboardTypewriterOldPreset.name)!!.play()
    }

    fun knockDoor() {
        getCacheablePreset(KnockDoorPreset.name)!!.play()
    }

    fun levelUp() {
        getCacheablePreset(LevelUpPreset.name)!!.play()
    }

    fun loaderBreathing() {
        getCacheablePreset(LoaderBreathingPreset.name)!!.play()
    }

    fun loaderPulse() {
        getCacheablePreset(LoaderPulsePreset.name)!!.play()
    }

    fun loaderRadar() {
        getCacheablePreset(LoaderRadarPreset.name)!!.play()
    }

    fun loaderSpin() {
        getCacheablePreset(LoaderSpinPreset.name)!!.play()
    }

    fun loaderWave() {
        getCacheablePreset(LoaderWavePreset.name)!!.play()
    }

    fun lock() {
        getCacheablePreset(LockPreset.name)!!.play()
    }

    fun longPress() {
        getCacheablePreset(LongPressPreset.name)!!.play()
    }

    fun marioGameOver() {
        getCacheablePreset(MarioGameOverPreset.name)!!.play()
    }

    fun maxImpact() {
        getCacheablePreset(MaxImpactPreset.name)!!.play()
    }

    fun mutedImpact() {
        getCacheablePreset(MutedImpactPreset.name)!!.play()
    }

    fun neutralClear() {
        getCacheablePreset(NeutralClearPreset.name)!!.play()
    }

    fun neutralSteady() {
        getCacheablePreset(NeutralSteadyPreset.name)!!.play()
    }

    fun newMessage() {
        getCacheablePreset(NewMessagePreset.name)!!.play()
    }

    fun notification() {
        getCacheablePreset(NotificationPreset.name)!!.play()
    }

    fun notificationKnock() {
        getCacheablePreset(NotificationKnockPreset.name)!!.play()
    }

    fun notificationUrgent() {
        getCacheablePreset(NotificationUrgentPreset.name)!!.play()
    }

    fun notifyInfoStandard() {
        getCacheablePreset(NotifyInfoStandardPreset.name)!!.play()
    }

    fun notifyReminderFinal() {
        getCacheablePreset(NotifyReminderFinalPreset.name)!!.play()
    }

    fun notifyReminderNudge() {
        getCacheablePreset(NotifyReminderNudgePreset.name)!!.play()
    }

    fun notifyReminderSoft() {
        getCacheablePreset(NotifyReminderSoftPreset.name)!!.play()
    }

    fun notifySocialMention() {
        getCacheablePreset(NotifySocialMentionPreset.name)!!.play()
    }

    fun notifySocialMessage() {
        getCacheablePreset(NotifySocialMessagePreset.name)!!.play()
    }

    fun notifySuccessSubtle() {
        getCacheablePreset(NotifySuccessSubtlePreset.name)!!.play()
    }

    fun notifyTimerDone() {
        getCacheablePreset(NotifyTimerDonePreset.name)!!.play()
    }

    fun notifyWarnMild() {
        getCacheablePreset(NotifyWarnMildPreset.name)!!.play()
    }

    fun notifyWarnModerate() {
        getCacheablePreset(NotifyWarnModeratePreset.name)!!.play()
    }

    fun passingCar() {
        getCacheablePreset(PassingCarPreset.name)!!.play()
    }

    fun pendulum() {
        getCacheablePreset(PendulumPreset.name)!!.play()
    }

    fun powerDown() {
        getCacheablePreset(PowerDownPreset.name)!!.play()
    }

    fun quadBeat() {
        getCacheablePreset(QuadBeatPreset.name)!!.play()
    }

    fun quadRamp() {
        getCacheablePreset(QuadRampPreset.name)!!.play()
    }

    fun quadThud() {
        getCacheablePreset(QuadThudPreset.name)!!.play()
    }

    fun rain() {
        getCacheablePreset(RainPreset.name)!!.play()
    }

    fun readySteadyGo() {
        getCacheablePreset(ReadySteadyGoPreset.name)!!.play()
    }

    fun reliefSigh() {
        getCacheablePreset(ReliefSighPreset.name)!!.play()
    }

    fun reliefSoft() {
        getCacheablePreset(ReliefSoftPreset.name)!!.play()
    }

    fun ripple() {
        getCacheablePreset(RipplePreset.name)!!.play()
    }

    fun sadnessMelancholic() {
        getCacheablePreset(SadnessMelancholicPreset.name)!!.play()
    }

    fun searching() {
        getCacheablePreset(SearchingPreset.name)!!.play()
    }

    fun searchSuccess() {
        getCacheablePreset(SearchSuccessPreset.name)!!.play()
    }

    fun selectionCrisp() {
        getCacheablePreset(SelectionCrispPreset.name)!!.play()
    }

    fun selectionSnap() {
        getCacheablePreset(SelectionSnapPreset.name)!!.play()
    }

    fun shockwave() {
        getCacheablePreset(ShockwavePreset.name)!!.play()
    }

    fun sneezing() {
        getCacheablePreset(SneezingPreset.name)!!.play()
    }

    fun spark() {
        getCacheablePreset(SparkPreset.name)!!.play()
    }

    fun successFlourish() {
        getCacheablePreset(SuccessFlourishPreset.name)!!.play()
    }

    fun successGentle() {
        getCacheablePreset(SuccessGentlePreset.name)!!.play()
    }

    fun supportSteady() {
        getCacheablePreset(SupportSteadyPreset.name)!!.play()
    }

    fun supportStrong() {
        getCacheablePreset(SupportStrongPreset.name)!!.play()
    }

    fun surpriseGasp() {
        getCacheablePreset(SurpriseGaspPreset.name)!!.play()
    }

    fun tada() {
        getCacheablePreset(TadaPreset.name)!!.play()
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

    fun tideSwell() {
        getCacheablePreset(TideSwellPreset.name)!!.play()
    }

    fun tripleBeat() {
        getCacheablePreset(TripleBeatPreset.name)!!.play()
    }

    fun tripleClick() {
        getCacheablePreset(TripleClickPreset.name)!!.play()
    }

    fun tripleDecay() {
        getCacheablePreset(TripleDecayPreset.name)!!.play()
    }

    fun tripleDrum() {
        getCacheablePreset(TripleDrumPreset.name)!!.play()
    }

    fun tripleEscalation() {
        getCacheablePreset(TripleEscalationPreset.name)!!.play()
    }

    fun tripleFade() {
        getCacheablePreset(TripleFadePreset.name)!!.play()
    }

    fun tripleGentleTap() {
        getCacheablePreset(TripleGentleTapPreset.name)!!.play()
    }

    fun tripleKnock() {
        getCacheablePreset(TripleKnockPreset.name)!!.play()
    }

    fun triplePat() {
        getCacheablePreset(TriplePatPreset.name)!!.play()
    }

    fun triplePulse() {
        getCacheablePreset(TriplePulsePreset.name)!!.play()
    }

    fun tripleStrike() {
        getCacheablePreset(TripleStrikePreset.name)!!.play()
    }

    fun tripleSurge() {
        getCacheablePreset(TripleSurgePreset.name)!!.play()
    }

    fun tripleTap() {
        getCacheablePreset(TripleTapPreset.name)!!.play()
    }

    fun tripleThud() {
        getCacheablePreset(TripleThudPreset.name)!!.play()
    }

    fun victory() {
        getCacheablePreset(VictoryPreset.name)!!.play()
    }

    fun vomiting() {
        getCacheablePreset(VomitingPreset.name)!!.play()
    }

    fun vortex() {
        getCacheablePreset(VortexPreset.name)!!.play()
    }

    fun warningPulse() {
        getCacheablePreset(WarningPulsePreset.name)!!.play()
    }

    fun warningSoft() {
        getCacheablePreset(WarningSoftPreset.name)!!.play()
    }

    fun warningUrgent() {
        getCacheablePreset(WarningUrgentPreset.name)!!.play()
    }

    fun waterfall() {
        getCacheablePreset(WaterfallPreset.name)!!.play()
    }

    fun woodpecker() {
        getCacheablePreset(WoodpeckerPreset.name)!!.play()
    }

    fun zeldaChest() {
        getCacheablePreset(ZeldaChestPreset.name)!!.play()
    }

    fun zipper() {
        getCacheablePreset(ZipperPreset.name)!!.play()
    }
// CODEGEN_END_{getters}
}
