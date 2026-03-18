import AVFoundation
import UIKit
import Foundation
import AVFAudio

@objc public class PresetsWrapper : NSObject {
  private var playSound: Bool = true
  private var useCache: Bool = true
  private var cache: [String: Preset] = [:]
  private var haptics: Pulsar!
  
  private var mapper: [String: Preset.Type] = [
    "SystemImpactLight": SystemImpactLightPreset.self,
    "SystemImpactMedium": SystemImpactMediumPreset.self,
    "SystemImpactHeavy": SystemImpactHeavyPreset.self,
    "SystemImpactSoft": SystemImpactSoftPreset.self,
    "SystemImpactRigid": SystemImpactRigidPreset.self,
    "SystemNotificationSuccess": SystemNotificationSuccessPreset.self,
    "SystemNotificationWarning": SystemNotificationWarningPreset.self,
    "SystemNotificationError": SystemNotificationErrorPreset.self,
    "SystemSelection": SystemSelectionPreset.self,
    
// CODEGEN_BEGIN_{mappers}
    "AimingFire": AimingFirePreset.self,
    "AimingLock": AimingLockPreset.self,
    "Alarm": AlarmPreset.self,
    "AngerFrustration": AngerFrustrationPreset.self,
    "Applause": ApplausePreset.self,
    "Attention": AttentionPreset.self,
    "BalloonPop": BalloonPopPreset.self,
    "BangDoor": BangDoorPreset.self,
    "Barrage": BarragePreset.self,
    "BoredomFlat": BoredomFlatPreset.self,
    "Breath": BreathPreset.self,
    "BtnChip": BtnChipPreset.self,
    "BtnDestructive": BtnDestructivePreset.self,
    "BtnGhost": BtnGhostPreset.self,
    "BtnIcon": BtnIconPreset.self,
    "BtnMenu": BtnMenuPreset.self,
    "BtnPrimary": BtnPrimaryPreset.self,
    "BtnSecondary": BtnSecondaryPreset.self,
    "BtnSubmit": BtnSubmitPreset.self,
    "BtnToggleOff": BtnToggleOffPreset.self,
    "Buildup": BuildupPreset.self,
    "CameraShutter": CameraShutterPreset.self,
    "Cascade": CascadePreset.self,
    "CleanStrike": CleanStrikePreset.self,
    "CoinDrop": CoinDropPreset.self,
    "CombinationLock": CombinationLockPreset.self,
    "Confirm": ConfirmPreset.self,
    "Cowboy": CowboyPreset.self,
    "Crescendo": CrescendoPreset.self,
    "CrossedEyes": CrossedEyesPreset.self,
    "Cursing": CursingPreset.self,
    "DeepRumble": DeepRumblePreset.self,
    "DeepThud": DeepThudPreset.self,
    "DogBark": DogBarkPreset.self,
    "DoubleBeat": DoubleBeatPreset.self,
    "DoubleBlast": DoubleBlastPreset.self,
    "DoubleBurst": DoubleBurstPreset.self,
    "DoubleClick": DoubleClickPreset.self,
    "DoubleGentleTap": DoubleGentleTapPreset.self,
    "DoublePat": DoublePatPreset.self,
    "DoublePulse": DoublePulsePreset.self,
    "DoublePunch": DoublePunchPreset.self,
    "DoubleStrike": DoubleStrikePreset.self,
    "DoubleTap": DoubleTapPreset.self,
    "DoubleThud": DoubleThudPreset.self,
    "DoubleTriplet": DoubleTripletPreset.self,
    "EngineRev": EngineRevPreset.self,
    "ErrorBuzz": ErrorBuzzPreset.self,
    "ErrorSoft": ErrorSoftPreset.self,
    "ExplodingHead": ExplodingHeadPreset.self,
    "Explosion": ExplosionPreset.self,
    "EyeRolling": EyeRollingPreset.self,
    "FadeOut": FadeOutPreset.self,
    "FanfareShort": FanfareShortPreset.self,
    "FirmImpact": FirmImpactPreset.self,
    "GameCombo": GameComboPreset.self,
    "GameHit": GameHitPreset.self,
    "GameLevelUp": GameLevelUpPreset.self,
    "GamePickup": GamePickupPreset.self,
    "Glitch": GlitchPreset.self,
    "GravityFreefall": GravityFreefallPreset.self,
    "GrinningSquinting": GrinningSquintingPreset.self,
    "GuitarStrum": GuitarStrumPreset.self,
    "Hail": HailPreset.self,
    "HappinessJoyful": HappinessJoyfulPreset.self,
    "HappinessLight": HappinessLightPreset.self,
    "Heartbeat": HeartbeatPreset.self,
    "HeavyImpact": HeavyImpactPreset.self,
    "KeyboardMechanical": KeyboardMechanicalPreset.self,
    "KeyboardMembrane": KeyboardMembranePreset.self,
    "KeyboardTypewriterOld": KeyboardTypewriterOldPreset.self,
    "KnockDoor": KnockDoorPreset.self,
    "LevelUp": LevelUpPreset.self,
    "LoaderBreathing": LoaderBreathingPreset.self,
    "LoaderPulse": LoaderPulsePreset.self,
    "LoaderRadar": LoaderRadarPreset.self,
    "LoaderSpin": LoaderSpinPreset.self,
    "LoaderWave": LoaderWavePreset.self,
    "Lock": LockPreset.self,
    "LongPress": LongPressPreset.self,
    "MarioGameOver": MarioGameOverPreset.self,
    "MaxImpact": MaxImpactPreset.self,
    "MutedImpact": MutedImpactPreset.self,
    "NeutralClear": NeutralClearPreset.self,
    "NeutralSteady": NeutralSteadyPreset.self,
    "NewMessage": NewMessagePreset.self,
    "Notification": NotificationPreset.self,
    "NotificationKnock": NotificationKnockPreset.self,
    "NotificationUrgent": NotificationUrgentPreset.self,
    "NotifyInfoStandard": NotifyInfoStandardPreset.self,
    "NotifyReminderFinal": NotifyReminderFinalPreset.self,
    "NotifyReminderNudge": NotifyReminderNudgePreset.self,
    "NotifyReminderSoft": NotifyReminderSoftPreset.self,
    "NotifySocialMention": NotifySocialMentionPreset.self,
    "NotifySocialMessage": NotifySocialMessagePreset.self,
    "NotifySuccessSubtle": NotifySuccessSubtlePreset.self,
    "NotifyTimerDone": NotifyTimerDonePreset.self,
    "NotifyWarnMild": NotifyWarnMildPreset.self,
    "NotifyWarnModerate": NotifyWarnModeratePreset.self,
    "PassingCar": PassingCarPreset.self,
    "Pendulum": PendulumPreset.self,
    "PowerDown": PowerDownPreset.self,
    "QuadBeat": QuadBeatPreset.self,
    "QuadRamp": QuadRampPreset.self,
    "QuadThud": QuadThudPreset.self,
    "Rain": RainPreset.self,
    "ReadySteadyGo": ReadySteadyGoPreset.self,
    "ReliefSigh": ReliefSighPreset.self,
    "ReliefSoft": ReliefSoftPreset.self,
    "Ripple": RipplePreset.self,
    "SadnessMelancholic": SadnessMelancholicPreset.self,
    "Searching": SearchingPreset.self,
    "SearchSuccess": SearchSuccessPreset.self,
    "SelectionCrisp": SelectionCrispPreset.self,
    "SelectionSnap": SelectionSnapPreset.self,
    "Shockwave": ShockwavePreset.self,
    "Sneezing": SneezingPreset.self,
    "Spark": SparkPreset.self,
    "SuccessFlourish": SuccessFlourishPreset.self,
    "SuccessGentle": SuccessGentlePreset.self,
    "SupportSteady": SupportSteadyPreset.self,
    "SupportStrong": SupportStrongPreset.self,
    "SurpriseGasp": SurpriseGaspPreset.self,
    "Tada": TadaPreset.self,
    "Thunder": ThunderPreset.self,
    "ThunderRoll": ThunderRollPreset.self,
    "TickTock": TickTockPreset.self,
    "TideSwell": TideSwellPreset.self,
    "TripleBeat": TripleBeatPreset.self,
    "TripleClick": TripleClickPreset.self,
    "TripleDecay": TripleDecayPreset.self,
    "TripleDrum": TripleDrumPreset.self,
    "TripleEscalation": TripleEscalationPreset.self,
    "TripleFade": TripleFadePreset.self,
    "TripleGentleTap": TripleGentleTapPreset.self,
    "TripleKnock": TripleKnockPreset.self,
    "TriplePat": TriplePatPreset.self,
    "TriplePulse": TriplePulsePreset.self,
    "TripleStrike": TripleStrikePreset.self,
    "TripleSurge": TripleSurgePreset.self,
    "TripleTap": TripleTapPreset.self,
    "TripleThud": TripleThudPreset.self,
    "Victory": VictoryPreset.self,
    "Vomiting": VomitingPreset.self,
    "Vortex": VortexPreset.self,
    "WarningPulse": WarningPulsePreset.self,
    "WarningSoft": WarningSoftPreset.self,
    "WarningUrgent": WarningUrgentPreset.self,
    "Waterfall": WaterfallPreset.self,
    "Woodpecker": WoodpeckerPreset.self,
    "ZeldaChest": ZeldaChestPreset.self,
    "Zipper": ZipperPreset.self,
// CODEGEN_END_{mappers}
  ]
  
  public init(haptics: Pulsar) {
    super.init()
    self.haptics = haptics
  }
  
  public func enableCache(state: Bool) {
    self.useCache = state
    if (!state) {
      resetCache()
    }
  }
  
  public func isCacheEnabled() -> Bool {
    return self.useCache
  }
  
  public func resetCache() {
    cache.removeAll()
  }
  
  public func preloadPresetByNames(_ names: Array<String>) {
    for (name) in names {
      preloadPresetByName(name)
    }
  }
  
  public func preloadPresetByName(_ name: String) {
    self.useCache = true
    _ = getCacheablePreset(mapper[name]!)
  }
  
  @objc public func getByName(_ name: String) -> Preset? {
    guard mapper.keys.contains(name) else {
      return nil
    }
    return getCacheablePreset(mapper[name]!)
  }
  
  private func getCacheablePreset(_ type: Preset.Type) -> Preset {
    if (useCache) {
      if let cachedPreset = cache[type.name] {
        return cachedPreset
      } else {
        let preset = type.getInstance(haptics: haptics!)
        cache[type.name] = preset
        return preset
      }
    }
    return type.getInstance(haptics: haptics!)
  }
  
  public func systemImpactLight() {
    getCacheablePreset(SystemImpactLightPreset.self).play()
  }
  
  public func systemImpactMedium() {
    getCacheablePreset(SystemImpactMediumPreset.self).play()
  }
  
  public func systemImpactHeavy() {
    getCacheablePreset(SystemImpactHeavyPreset.self).play()
  }
  
  public func systemImpactSoft() {
    getCacheablePreset(SystemImpactSoftPreset.self).play()
  }
  
  public func systemImpactRigid() {
    getCacheablePreset(SystemImpactRigidPreset.self).play()
  }
  
  public func systemNotificationSuccess() {
    getCacheablePreset(SystemNotificationSuccessPreset.self).play()
  }
  
  public func systemNotificationWarning() {
    getCacheablePreset(SystemNotificationWarningPreset.self).play()
  }
  
  public func systemNotificationError() {
    getCacheablePreset(SystemNotificationErrorPreset.self).play()
  }
  
  public func systemSelection() {
    getCacheablePreset(SystemSelectionPreset.self).play()
  }
  
// CODEGEN_BEGIN_{getters}
  public func aimingFire() {
    getCacheablePreset(AimingFirePreset.self).play()
  }

  public func aimingLock() {
    getCacheablePreset(AimingLockPreset.self).play()
  }

  public func alarm() {
    getCacheablePreset(AlarmPreset.self).play()
  }

  public func angerFrustration() {
    getCacheablePreset(AngerFrustrationPreset.self).play()
  }

  public func applause() {
    getCacheablePreset(ApplausePreset.self).play()
  }

  public func attention() {
    getCacheablePreset(AttentionPreset.self).play()
  }

  public func balloonPop() {
    getCacheablePreset(BalloonPopPreset.self).play()
  }

  public func bangDoor() {
    getCacheablePreset(BangDoorPreset.self).play()
  }

  public func barrage() {
    getCacheablePreset(BarragePreset.self).play()
  }

  public func boredomFlat() {
    getCacheablePreset(BoredomFlatPreset.self).play()
  }

  public func breath() {
    getCacheablePreset(BreathPreset.self).play()
  }

  public func btnChip() {
    getCacheablePreset(BtnChipPreset.self).play()
  }

  public func btnDestructive() {
    getCacheablePreset(BtnDestructivePreset.self).play()
  }

  public func btnGhost() {
    getCacheablePreset(BtnGhostPreset.self).play()
  }

  public func btnIcon() {
    getCacheablePreset(BtnIconPreset.self).play()
  }

  public func btnMenu() {
    getCacheablePreset(BtnMenuPreset.self).play()
  }

  public func btnPrimary() {
    getCacheablePreset(BtnPrimaryPreset.self).play()
  }

  public func btnSecondary() {
    getCacheablePreset(BtnSecondaryPreset.self).play()
  }

  public func btnSubmit() {
    getCacheablePreset(BtnSubmitPreset.self).play()
  }

  public func btnToggleOff() {
    getCacheablePreset(BtnToggleOffPreset.self).play()
  }

  public func buildup() {
    getCacheablePreset(BuildupPreset.self).play()
  }

  public func cameraShutter() {
    getCacheablePreset(CameraShutterPreset.self).play()
  }

  public func cascade() {
    getCacheablePreset(CascadePreset.self).play()
  }

  public func cleanStrike() {
    getCacheablePreset(CleanStrikePreset.self).play()
  }

  public func coinDrop() {
    getCacheablePreset(CoinDropPreset.self).play()
  }

  public func combinationLock() {
    getCacheablePreset(CombinationLockPreset.self).play()
  }

  public func confirm() {
    getCacheablePreset(ConfirmPreset.self).play()
  }

  public func cowboy() {
    getCacheablePreset(CowboyPreset.self).play()
  }

  public func crescendo() {
    getCacheablePreset(CrescendoPreset.self).play()
  }

  public func crossedEyes() {
    getCacheablePreset(CrossedEyesPreset.self).play()
  }

  public func cursing() {
    getCacheablePreset(CursingPreset.self).play()
  }

  public func deepRumble() {
    getCacheablePreset(DeepRumblePreset.self).play()
  }

  public func deepThud() {
    getCacheablePreset(DeepThudPreset.self).play()
  }

  public func dogBark() {
    getCacheablePreset(DogBarkPreset.self).play()
  }

  public func doubleBeat() {
    getCacheablePreset(DoubleBeatPreset.self).play()
  }

  public func doubleBlast() {
    getCacheablePreset(DoubleBlastPreset.self).play()
  }

  public func doubleBurst() {
    getCacheablePreset(DoubleBurstPreset.self).play()
  }

  public func doubleClick() {
    getCacheablePreset(DoubleClickPreset.self).play()
  }

  public func doubleGentleTap() {
    getCacheablePreset(DoubleGentleTapPreset.self).play()
  }

  public func doublePat() {
    getCacheablePreset(DoublePatPreset.self).play()
  }

  public func doublePulse() {
    getCacheablePreset(DoublePulsePreset.self).play()
  }

  public func doublePunch() {
    getCacheablePreset(DoublePunchPreset.self).play()
  }

  public func doubleStrike() {
    getCacheablePreset(DoubleStrikePreset.self).play()
  }

  public func doubleTap() {
    getCacheablePreset(DoubleTapPreset.self).play()
  }

  public func doubleThud() {
    getCacheablePreset(DoubleThudPreset.self).play()
  }

  public func doubleTriplet() {
    getCacheablePreset(DoubleTripletPreset.self).play()
  }

  public func engineRev() {
    getCacheablePreset(EngineRevPreset.self).play()
  }

  public func errorBuzz() {
    getCacheablePreset(ErrorBuzzPreset.self).play()
  }

  public func errorSoft() {
    getCacheablePreset(ErrorSoftPreset.self).play()
  }

  public func explodingHead() {
    getCacheablePreset(ExplodingHeadPreset.self).play()
  }

  public func explosion() {
    getCacheablePreset(ExplosionPreset.self).play()
  }

  public func eyeRolling() {
    getCacheablePreset(EyeRollingPreset.self).play()
  }

  public func fadeOut() {
    getCacheablePreset(FadeOutPreset.self).play()
  }

  public func fanfareShort() {
    getCacheablePreset(FanfareShortPreset.self).play()
  }

  public func firmImpact() {
    getCacheablePreset(FirmImpactPreset.self).play()
  }

  public func gameCombo() {
    getCacheablePreset(GameComboPreset.self).play()
  }

  public func gameHit() {
    getCacheablePreset(GameHitPreset.self).play()
  }

  public func gameLevelUp() {
    getCacheablePreset(GameLevelUpPreset.self).play()
  }

  public func gamePickup() {
    getCacheablePreset(GamePickupPreset.self).play()
  }

  public func glitch() {
    getCacheablePreset(GlitchPreset.self).play()
  }

  public func gravityFreefall() {
    getCacheablePreset(GravityFreefallPreset.self).play()
  }

  public func grinningSquinting() {
    getCacheablePreset(GrinningSquintingPreset.self).play()
  }

  public func guitarStrum() {
    getCacheablePreset(GuitarStrumPreset.self).play()
  }

  public func hail() {
    getCacheablePreset(HailPreset.self).play()
  }

  public func happinessJoyful() {
    getCacheablePreset(HappinessJoyfulPreset.self).play()
  }

  public func happinessLight() {
    getCacheablePreset(HappinessLightPreset.self).play()
  }

  public func heartbeat() {
    getCacheablePreset(HeartbeatPreset.self).play()
  }

  public func heavyImpact() {
    getCacheablePreset(HeavyImpactPreset.self).play()
  }

  public func keyboardMechanical() {
    getCacheablePreset(KeyboardMechanicalPreset.self).play()
  }

  public func keyboardMembrane() {
    getCacheablePreset(KeyboardMembranePreset.self).play()
  }

  public func keyboardTypewriterOld() {
    getCacheablePreset(KeyboardTypewriterOldPreset.self).play()
  }

  public func knockDoor() {
    getCacheablePreset(KnockDoorPreset.self).play()
  }

  public func levelUp() {
    getCacheablePreset(LevelUpPreset.self).play()
  }

  public func loaderBreathing() {
    getCacheablePreset(LoaderBreathingPreset.self).play()
  }

  public func loaderPulse() {
    getCacheablePreset(LoaderPulsePreset.self).play()
  }

  public func loaderRadar() {
    getCacheablePreset(LoaderRadarPreset.self).play()
  }

  public func loaderSpin() {
    getCacheablePreset(LoaderSpinPreset.self).play()
  }

  public func loaderWave() {
    getCacheablePreset(LoaderWavePreset.self).play()
  }

  public func lock() {
    getCacheablePreset(LockPreset.self).play()
  }

  public func longPress() {
    getCacheablePreset(LongPressPreset.self).play()
  }

  public func marioGameOver() {
    getCacheablePreset(MarioGameOverPreset.self).play()
  }

  public func maxImpact() {
    getCacheablePreset(MaxImpactPreset.self).play()
  }

  public func mutedImpact() {
    getCacheablePreset(MutedImpactPreset.self).play()
  }

  public func neutralClear() {
    getCacheablePreset(NeutralClearPreset.self).play()
  }

  public func neutralSteady() {
    getCacheablePreset(NeutralSteadyPreset.self).play()
  }

  public func newMessage() {
    getCacheablePreset(NewMessagePreset.self).play()
  }

  public func notification() {
    getCacheablePreset(NotificationPreset.self).play()
  }

  public func notificationKnock() {
    getCacheablePreset(NotificationKnockPreset.self).play()
  }

  public func notificationUrgent() {
    getCacheablePreset(NotificationUrgentPreset.self).play()
  }

  public func notifyInfoStandard() {
    getCacheablePreset(NotifyInfoStandardPreset.self).play()
  }

  public func notifyReminderFinal() {
    getCacheablePreset(NotifyReminderFinalPreset.self).play()
  }

  public func notifyReminderNudge() {
    getCacheablePreset(NotifyReminderNudgePreset.self).play()
  }

  public func notifyReminderSoft() {
    getCacheablePreset(NotifyReminderSoftPreset.self).play()
  }

  public func notifySocialMention() {
    getCacheablePreset(NotifySocialMentionPreset.self).play()
  }

  public func notifySocialMessage() {
    getCacheablePreset(NotifySocialMessagePreset.self).play()
  }

  public func notifySuccessSubtle() {
    getCacheablePreset(NotifySuccessSubtlePreset.self).play()
  }

  public func notifyTimerDone() {
    getCacheablePreset(NotifyTimerDonePreset.self).play()
  }

  public func notifyWarnMild() {
    getCacheablePreset(NotifyWarnMildPreset.self).play()
  }

  public func notifyWarnModerate() {
    getCacheablePreset(NotifyWarnModeratePreset.self).play()
  }

  public func passingCar() {
    getCacheablePreset(PassingCarPreset.self).play()
  }

  public func pendulum() {
    getCacheablePreset(PendulumPreset.self).play()
  }

  public func powerDown() {
    getCacheablePreset(PowerDownPreset.self).play()
  }

  public func quadBeat() {
    getCacheablePreset(QuadBeatPreset.self).play()
  }

  public func quadRamp() {
    getCacheablePreset(QuadRampPreset.self).play()
  }

  public func quadThud() {
    getCacheablePreset(QuadThudPreset.self).play()
  }

  public func rain() {
    getCacheablePreset(RainPreset.self).play()
  }

  public func readySteadyGo() {
    getCacheablePreset(ReadySteadyGoPreset.self).play()
  }

  public func reliefSigh() {
    getCacheablePreset(ReliefSighPreset.self).play()
  }

  public func reliefSoft() {
    getCacheablePreset(ReliefSoftPreset.self).play()
  }

  public func ripple() {
    getCacheablePreset(RipplePreset.self).play()
  }

  public func sadnessMelancholic() {
    getCacheablePreset(SadnessMelancholicPreset.self).play()
  }

  public func searching() {
    getCacheablePreset(SearchingPreset.self).play()
  }

  public func searchSuccess() {
    getCacheablePreset(SearchSuccessPreset.self).play()
  }

  public func selectionCrisp() {
    getCacheablePreset(SelectionCrispPreset.self).play()
  }

  public func selectionSnap() {
    getCacheablePreset(SelectionSnapPreset.self).play()
  }

  public func shockwave() {
    getCacheablePreset(ShockwavePreset.self).play()
  }

  public func sneezing() {
    getCacheablePreset(SneezingPreset.self).play()
  }

  public func spark() {
    getCacheablePreset(SparkPreset.self).play()
  }

  public func successFlourish() {
    getCacheablePreset(SuccessFlourishPreset.self).play()
  }

  public func successGentle() {
    getCacheablePreset(SuccessGentlePreset.self).play()
  }

  public func supportSteady() {
    getCacheablePreset(SupportSteadyPreset.self).play()
  }

  public func supportStrong() {
    getCacheablePreset(SupportStrongPreset.self).play()
  }

  public func surpriseGasp() {
    getCacheablePreset(SurpriseGaspPreset.self).play()
  }

  public func tada() {
    getCacheablePreset(TadaPreset.self).play()
  }

  public func thunder() {
    getCacheablePreset(ThunderPreset.self).play()
  }

  public func thunderRoll() {
    getCacheablePreset(ThunderRollPreset.self).play()
  }

  public func tickTock() {
    getCacheablePreset(TickTockPreset.self).play()
  }

  public func tideSwell() {
    getCacheablePreset(TideSwellPreset.self).play()
  }

  public func tripleBeat() {
    getCacheablePreset(TripleBeatPreset.self).play()
  }

  public func tripleClick() {
    getCacheablePreset(TripleClickPreset.self).play()
  }

  public func tripleDecay() {
    getCacheablePreset(TripleDecayPreset.self).play()
  }

  public func tripleDrum() {
    getCacheablePreset(TripleDrumPreset.self).play()
  }

  public func tripleEscalation() {
    getCacheablePreset(TripleEscalationPreset.self).play()
  }

  public func tripleFade() {
    getCacheablePreset(TripleFadePreset.self).play()
  }

  public func tripleGentleTap() {
    getCacheablePreset(TripleGentleTapPreset.self).play()
  }

  public func tripleKnock() {
    getCacheablePreset(TripleKnockPreset.self).play()
  }

  public func triplePat() {
    getCacheablePreset(TriplePatPreset.self).play()
  }

  public func triplePulse() {
    getCacheablePreset(TriplePulsePreset.self).play()
  }

  public func tripleStrike() {
    getCacheablePreset(TripleStrikePreset.self).play()
  }

  public func tripleSurge() {
    getCacheablePreset(TripleSurgePreset.self).play()
  }

  public func tripleTap() {
    getCacheablePreset(TripleTapPreset.self).play()
  }

  public func tripleThud() {
    getCacheablePreset(TripleThudPreset.self).play()
  }

  public func victory() {
    getCacheablePreset(VictoryPreset.self).play()
  }

  public func vomiting() {
    getCacheablePreset(VomitingPreset.self).play()
  }

  public func vortex() {
    getCacheablePreset(VortexPreset.self).play()
  }

  public func warningPulse() {
    getCacheablePreset(WarningPulsePreset.self).play()
  }

  public func warningSoft() {
    getCacheablePreset(WarningSoftPreset.self).play()
  }

  public func warningUrgent() {
    getCacheablePreset(WarningUrgentPreset.self).play()
  }

  public func waterfall() {
    getCacheablePreset(WaterfallPreset.self).play()
  }

  public func woodpecker() {
    getCacheablePreset(WoodpeckerPreset.self).play()
  }

  public func zeldaChest() {
    getCacheablePreset(ZeldaChestPreset.self).play()
  }

  public func zipper() {
    getCacheablePreset(ZipperPreset.self).play()
  }
// CODEGEN_END_{getters}
}
