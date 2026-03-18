import type { PresetConfig } from '../../components/Preset/types';

// CODEGEN_BEGIN_{imports}
import AimingFirePreset from './AimingFire.json';
import AimingFireImage from './AimingFire.png';
import AimingLockPreset from './AimingLock.json';
import AimingLockImage from './AimingLock.png';
import AlarmPreset from './Alarm.json';
import AlarmImage from './Alarm.png';
import AngerFrustrationPreset from './AngerFrustration.json';
import AngerFrustrationImage from './AngerFrustration.png';
import ApplausePreset from './Applause.json';
import ApplauseImage from './Applause.png';
import AttentionPreset from './Attention.json';
import AttentionImage from './Attention.png';
import BalloonPopPreset from './BalloonPop.json';
import BalloonPopImage from './BalloonPop.png';
import BangDoorPreset from './BangDoor.json';
import BangDoorImage from './BangDoor.png';
import BarragePreset from './Barrage.json';
import BarrageImage from './Barrage.png';
import BoredomFlatPreset from './BoredomFlat.json';
import BoredomFlatImage from './BoredomFlat.png';
import BreathPreset from './Breath.json';
import BreathImage from './Breath.png';
import BtnChipPreset from './BtnChip.json';
import BtnChipImage from './BtnChip.png';
import BtnDestructivePreset from './BtnDestructive.json';
import BtnDestructiveImage from './BtnDestructive.png';
import BtnGhostPreset from './BtnGhost.json';
import BtnGhostImage from './BtnGhost.png';
import BtnIconPreset from './BtnIcon.json';
import BtnIconImage from './BtnIcon.png';
import BtnMenuPreset from './BtnMenu.json';
import BtnMenuImage from './BtnMenu.png';
import BtnPrimaryPreset from './BtnPrimary.json';
import BtnPrimaryImage from './BtnPrimary.png';
import BtnSecondaryPreset from './BtnSecondary.json';
import BtnSecondaryImage from './BtnSecondary.png';
import BtnSubmitPreset from './BtnSubmit.json';
import BtnSubmitImage from './BtnSubmit.png';
import BtnToggleOffPreset from './BtnToggleOff.json';
import BtnToggleOffImage from './BtnToggleOff.png';
import BuildupPreset from './Buildup.json';
import BuildupImage from './Buildup.png';
import CameraShutterPreset from './CameraShutter.json';
import CameraShutterImage from './CameraShutter.png';
import CascadePreset from './Cascade.json';
import CascadeImage from './Cascade.png';
import CleanStrikePreset from './CleanStrike.json';
import CleanStrikeImage from './CleanStrike.png';
import CoinDropPreset from './CoinDrop.json';
import CoinDropImage from './CoinDrop.png';
import CombinationLockPreset from './CombinationLock.json';
import CombinationLockImage from './CombinationLock.png';
import ConfirmPreset from './Confirm.json';
import ConfirmImage from './Confirm.png';
import CowboyPreset from './Cowboy.json';
import CowboyImage from './Cowboy.png';
import CrescendoPreset from './Crescendo.json';
import CrescendoImage from './Crescendo.png';
import CrossedEyesPreset from './CrossedEyes.json';
import CrossedEyesImage from './CrossedEyes.png';
import CursingPreset from './Cursing.json';
import CursingImage from './Cursing.png';
import DeepRumblePreset from './DeepRumble.json';
import DeepRumbleImage from './DeepRumble.png';
import DeepThudPreset from './DeepThud.json';
import DeepThudImage from './DeepThud.png';
import DogBarkPreset from './DogBark.json';
import DogBarkImage from './DogBark.png';
import DoubleBeatPreset from './DoubleBeat.json';
import DoubleBeatImage from './DoubleBeat.png';
import DoubleBlastPreset from './DoubleBlast.json';
import DoubleBlastImage from './DoubleBlast.png';
import DoubleBurstPreset from './DoubleBurst.json';
import DoubleBurstImage from './DoubleBurst.png';
import DoubleClickPreset from './DoubleClick.json';
import DoubleClickImage from './DoubleClick.png';
import DoubleGentleTapPreset from './DoubleGentleTap.json';
import DoubleGentleTapImage from './DoubleGentleTap.png';
import DoublePatPreset from './DoublePat.json';
import DoublePatImage from './DoublePat.png';
import DoublePulsePreset from './DoublePulse.json';
import DoublePulseImage from './DoublePulse.png';
import DoublePunchPreset from './DoublePunch.json';
import DoublePunchImage from './DoublePunch.png';
import DoubleStrikePreset from './DoubleStrike.json';
import DoubleStrikeImage from './DoubleStrike.png';
import DoubleTapPreset from './DoubleTap.json';
import DoubleTapImage from './DoubleTap.png';
import DoubleThudPreset from './DoubleThud.json';
import DoubleThudImage from './DoubleThud.png';
import DoubleTripletPreset from './DoubleTriplet.json';
import DoubleTripletImage from './DoubleTriplet.png';
import EngineRevPreset from './EngineRev.json';
import EngineRevImage from './EngineRev.png';
import ErrorBuzzPreset from './ErrorBuzz.json';
import ErrorBuzzImage from './ErrorBuzz.png';
import ErrorSoftPreset from './ErrorSoft.json';
import ErrorSoftImage from './ErrorSoft.png';
import ExplodingHeadPreset from './ExplodingHead.json';
import ExplodingHeadImage from './ExplodingHead.png';
import ExplosionPreset from './Explosion.json';
import ExplosionImage from './Explosion.png';
import EyeRollingPreset from './EyeRolling.json';
import EyeRollingImage from './EyeRolling.png';
import FadeOutPreset from './FadeOut.json';
import FadeOutImage from './FadeOut.png';
import FanfareShortPreset from './FanfareShort.json';
import FanfareShortImage from './FanfareShort.png';
import FirmImpactPreset from './FirmImpact.json';
import FirmImpactImage from './FirmImpact.png';
import GameComboPreset from './GameCombo.json';
import GameComboImage from './GameCombo.png';
import GameHitPreset from './GameHit.json';
import GameHitImage from './GameHit.png';
import GameLevelUpPreset from './GameLevelUp.json';
import GameLevelUpImage from './GameLevelUp.png';
import GamePickupPreset from './GamePickup.json';
import GamePickupImage from './GamePickup.png';
import GlitchPreset from './Glitch.json';
import GlitchImage from './Glitch.png';
import GravityFreefallPreset from './GravityFreefall.json';
import GravityFreefallImage from './GravityFreefall.png';
import GrinningSquintingPreset from './GrinningSquinting.json';
import GrinningSquintingImage from './GrinningSquinting.png';
import GuitarStrumPreset from './GuitarStrum.json';
import GuitarStrumImage from './GuitarStrum.png';
import HailPreset from './Hail.json';
import HailImage from './Hail.png';
import HappinessJoyfulPreset from './HappinessJoyful.json';
import HappinessJoyfulImage from './HappinessJoyful.png';
import HappinessLightPreset from './HappinessLight.json';
import HappinessLightImage from './HappinessLight.png';
import HeartbeatPreset from './Heartbeat.json';
import HeartbeatImage from './Heartbeat.png';
import HeavyImpactPreset from './HeavyImpact.json';
import HeavyImpactImage from './HeavyImpact.png';
import KeyboardMechanicalPreset from './KeyboardMechanical.json';
import KeyboardMechanicalImage from './KeyboardMechanical.png';
import KeyboardMembranePreset from './KeyboardMembrane.json';
import KeyboardMembraneImage from './KeyboardMembrane.png';
import KeyboardTypewriterOldPreset from './KeyboardTypewriterOld.json';
import KeyboardTypewriterOldImage from './KeyboardTypewriterOld.png';
import KnockDoorPreset from './KnockDoor.json';
import KnockDoorImage from './KnockDoor.png';
import LevelUpPreset from './LevelUp.json';
import LevelUpImage from './LevelUp.png';
import LoaderBreathingPreset from './LoaderBreathing.json';
import LoaderBreathingImage from './LoaderBreathing.png';
import LoaderPulsePreset from './LoaderPulse.json';
import LoaderPulseImage from './LoaderPulse.png';
import LoaderRadarPreset from './LoaderRadar.json';
import LoaderRadarImage from './LoaderRadar.png';
import LoaderSpinPreset from './LoaderSpin.json';
import LoaderSpinImage from './LoaderSpin.png';
import LoaderWavePreset from './LoaderWave.json';
import LoaderWaveImage from './LoaderWave.png';
import LockPreset from './Lock.json';
import LockImage from './Lock.png';
import LongPressPreset from './LongPress.json';
import LongPressImage from './LongPress.png';
import MarioGameOverPreset from './MarioGameOver.json';
import MarioGameOverImage from './MarioGameOver.png';
import MaxImpactPreset from './MaxImpact.json';
import MaxImpactImage from './MaxImpact.png';
import MutedImpactPreset from './MutedImpact.json';
import MutedImpactImage from './MutedImpact.png';
import NeutralClearPreset from './NeutralClear.json';
import NeutralClearImage from './NeutralClear.png';
import NeutralSteadyPreset from './NeutralSteady.json';
import NeutralSteadyImage from './NeutralSteady.png';
import NewMessagePreset from './NewMessage.json';
import NewMessageImage from './NewMessage.png';
import NotificationPreset from './Notification.json';
import NotificationImage from './Notification.png';
import NotificationKnockPreset from './NotificationKnock.json';
import NotificationKnockImage from './NotificationKnock.png';
import NotificationUrgentPreset from './NotificationUrgent.json';
import NotificationUrgentImage from './NotificationUrgent.png';
import NotifyInfoStandardPreset from './NotifyInfoStandard.json';
import NotifyInfoStandardImage from './NotifyInfoStandard.png';
import NotifyReminderFinalPreset from './NotifyReminderFinal.json';
import NotifyReminderFinalImage from './NotifyReminderFinal.png';
import NotifyReminderNudgePreset from './NotifyReminderNudge.json';
import NotifyReminderNudgeImage from './NotifyReminderNudge.png';
import NotifyReminderSoftPreset from './NotifyReminderSoft.json';
import NotifyReminderSoftImage from './NotifyReminderSoft.png';
import NotifySocialMentionPreset from './NotifySocialMention.json';
import NotifySocialMentionImage from './NotifySocialMention.png';
import NotifySocialMessagePreset from './NotifySocialMessage.json';
import NotifySocialMessageImage from './NotifySocialMessage.png';
import NotifySuccessSubtlePreset from './NotifySuccessSubtle.json';
import NotifySuccessSubtleImage from './NotifySuccessSubtle.png';
import NotifyTimerDonePreset from './NotifyTimerDone.json';
import NotifyTimerDoneImage from './NotifyTimerDone.png';
import NotifyWarnMildPreset from './NotifyWarnMild.json';
import NotifyWarnMildImage from './NotifyWarnMild.png';
import NotifyWarnModeratePreset from './NotifyWarnModerate.json';
import NotifyWarnModerateImage from './NotifyWarnModerate.png';
import PassingCarPreset from './PassingCar.json';
import PassingCarImage from './PassingCar.png';
import PendulumPreset from './Pendulum.json';
import PendulumImage from './Pendulum.png';
import PowerDownPreset from './PowerDown.json';
import PowerDownImage from './PowerDown.png';
import QuadBeatPreset from './QuadBeat.json';
import QuadBeatImage from './QuadBeat.png';
import QuadRampPreset from './QuadRamp.json';
import QuadRampImage from './QuadRamp.png';
import QuadThudPreset from './QuadThud.json';
import QuadThudImage from './QuadThud.png';
import RainPreset from './Rain.json';
import RainImage from './Rain.png';
import ReadySteadyGoPreset from './ReadySteadyGo.json';
import ReadySteadyGoImage from './ReadySteadyGo.png';
import ReliefSighPreset from './ReliefSigh.json';
import ReliefSighImage from './ReliefSigh.png';
import ReliefSoftPreset from './ReliefSoft.json';
import ReliefSoftImage from './ReliefSoft.png';
import RipplePreset from './Ripple.json';
import RippleImage from './Ripple.png';
import SadnessMelancholicPreset from './SadnessMelancholic.json';
import SadnessMelancholicImage from './SadnessMelancholic.png';
import SearchingPreset from './Searching.json';
import SearchingImage from './Searching.png';
import SearchSuccessPreset from './SearchSuccess.json';
import SearchSuccessImage from './SearchSuccess.png';
import SelectionCrispPreset from './SelectionCrisp.json';
import SelectionCrispImage from './SelectionCrisp.png';
import SelectionSnapPreset from './SelectionSnap.json';
import SelectionSnapImage from './SelectionSnap.png';
import ShockwavePreset from './Shockwave.json';
import ShockwaveImage from './Shockwave.png';
import SneezingPreset from './Sneezing.json';
import SneezingImage from './Sneezing.png';
import SparkPreset from './Spark.json';
import SparkImage from './Spark.png';
import SuccessFlourishPreset from './SuccessFlourish.json';
import SuccessFlourishImage from './SuccessFlourish.png';
import SuccessGentlePreset from './SuccessGentle.json';
import SuccessGentleImage from './SuccessGentle.png';
import SupportSteadyPreset from './SupportSteady.json';
import SupportSteadyImage from './SupportSteady.png';
import SupportStrongPreset from './SupportStrong.json';
import SupportStrongImage from './SupportStrong.png';
import SurpriseGaspPreset from './SurpriseGasp.json';
import SurpriseGaspImage from './SurpriseGasp.png';
import TadaPreset from './Tada.json';
import TadaImage from './Tada.png';
import ThunderPreset from './Thunder.json';
import ThunderImage from './Thunder.png';
import ThunderRollPreset from './ThunderRoll.json';
import ThunderRollImage from './ThunderRoll.png';
import TickTockPreset from './TickTock.json';
import TickTockImage from './TickTock.png';
import TideSwellPreset from './TideSwell.json';
import TideSwellImage from './TideSwell.png';
import TripleBeatPreset from './TripleBeat.json';
import TripleBeatImage from './TripleBeat.png';
import TripleClickPreset from './TripleClick.json';
import TripleClickImage from './TripleClick.png';
import TripleDecayPreset from './TripleDecay.json';
import TripleDecayImage from './TripleDecay.png';
import TripleDrumPreset from './TripleDrum.json';
import TripleDrumImage from './TripleDrum.png';
import TripleEscalationPreset from './TripleEscalation.json';
import TripleEscalationImage from './TripleEscalation.png';
import TripleFadePreset from './TripleFade.json';
import TripleFadeImage from './TripleFade.png';
import TripleGentleTapPreset from './TripleGentleTap.json';
import TripleGentleTapImage from './TripleGentleTap.png';
import TripleKnockPreset from './TripleKnock.json';
import TripleKnockImage from './TripleKnock.png';
import TriplePatPreset from './TriplePat.json';
import TriplePatImage from './TriplePat.png';
import TriplePulsePreset from './TriplePulse.json';
import TriplePulseImage from './TriplePulse.png';
import TripleStrikePreset from './TripleStrike.json';
import TripleStrikeImage from './TripleStrike.png';
import TripleSurgePreset from './TripleSurge.json';
import TripleSurgeImage from './TripleSurge.png';
import TripleTapPreset from './TripleTap.json';
import TripleTapImage from './TripleTap.png';
import TripleThudPreset from './TripleThud.json';
import TripleThudImage from './TripleThud.png';
import VictoryPreset from './Victory.json';
import VictoryImage from './Victory.png';
import VomitingPreset from './Vomiting.json';
import VomitingImage from './Vomiting.png';
import VortexPreset from './Vortex.json';
import VortexImage from './Vortex.png';
import WarningPulsePreset from './WarningPulse.json';
import WarningPulseImage from './WarningPulse.png';
import WarningSoftPreset from './WarningSoft.json';
import WarningSoftImage from './WarningSoft.png';
import WarningUrgentPreset from './WarningUrgent.json';
import WarningUrgentImage from './WarningUrgent.png';
import WaterfallPreset from './Waterfall.json';
import WaterfallImage from './Waterfall.png';
import WoodpeckerPreset from './Woodpecker.json';
import WoodpeckerImage from './Woodpecker.png';
import ZeldaChestPreset from './ZeldaChest.json';
import ZeldaChestImage from './ZeldaChest.png';
import ZipperPreset from './Zipper.json';
import ZipperImage from './Zipper.png';
// CODEGEN_END_{imports}

export const PresetsConfig: Array<PresetConfig> = [
// CODEGEN_BEGIN_{presets}
  { data: AimingFirePreset, image: AimingFireImage },
  { data: AimingLockPreset, image: AimingLockImage },
  { data: AlarmPreset, image: AlarmImage },
  { data: AngerFrustrationPreset, image: AngerFrustrationImage },
  { data: ApplausePreset, image: ApplauseImage },
  { data: AttentionPreset, image: AttentionImage },
  { data: BalloonPopPreset, image: BalloonPopImage },
  { data: BangDoorPreset, image: BangDoorImage },
  { data: BarragePreset, image: BarrageImage },
  { data: BoredomFlatPreset, image: BoredomFlatImage },
  { data: BreathPreset, image: BreathImage },
  { data: BtnChipPreset, image: BtnChipImage },
  { data: BtnDestructivePreset, image: BtnDestructiveImage },
  { data: BtnGhostPreset, image: BtnGhostImage },
  { data: BtnIconPreset, image: BtnIconImage },
  { data: BtnMenuPreset, image: BtnMenuImage },
  { data: BtnPrimaryPreset, image: BtnPrimaryImage },
  { data: BtnSecondaryPreset, image: BtnSecondaryImage },
  { data: BtnSubmitPreset, image: BtnSubmitImage },
  { data: BtnToggleOffPreset, image: BtnToggleOffImage },
  { data: BuildupPreset, image: BuildupImage },
  { data: CameraShutterPreset, image: CameraShutterImage },
  { data: CascadePreset, image: CascadeImage },
  { data: CleanStrikePreset, image: CleanStrikeImage },
  { data: CoinDropPreset, image: CoinDropImage },
  { data: CombinationLockPreset, image: CombinationLockImage },
  { data: ConfirmPreset, image: ConfirmImage },
  { data: CowboyPreset, image: CowboyImage },
  { data: CrescendoPreset, image: CrescendoImage },
  { data: CrossedEyesPreset, image: CrossedEyesImage },
  { data: CursingPreset, image: CursingImage },
  { data: DeepRumblePreset, image: DeepRumbleImage },
  { data: DeepThudPreset, image: DeepThudImage },
  { data: DogBarkPreset, image: DogBarkImage },
  { data: DoubleBeatPreset, image: DoubleBeatImage },
  { data: DoubleBlastPreset, image: DoubleBlastImage },
  { data: DoubleBurstPreset, image: DoubleBurstImage },
  { data: DoubleClickPreset, image: DoubleClickImage },
  { data: DoubleGentleTapPreset, image: DoubleGentleTapImage },
  { data: DoublePatPreset, image: DoublePatImage },
  { data: DoublePulsePreset, image: DoublePulseImage },
  { data: DoublePunchPreset, image: DoublePunchImage },
  { data: DoubleStrikePreset, image: DoubleStrikeImage },
  { data: DoubleTapPreset, image: DoubleTapImage },
  { data: DoubleThudPreset, image: DoubleThudImage },
  { data: DoubleTripletPreset, image: DoubleTripletImage },
  { data: EngineRevPreset, image: EngineRevImage },
  { data: ErrorBuzzPreset, image: ErrorBuzzImage },
  { data: ErrorSoftPreset, image: ErrorSoftImage },
  { data: ExplodingHeadPreset, image: ExplodingHeadImage },
  { data: ExplosionPreset, image: ExplosionImage },
  { data: EyeRollingPreset, image: EyeRollingImage },
  { data: FadeOutPreset, image: FadeOutImage },
  { data: FanfareShortPreset, image: FanfareShortImage },
  { data: FirmImpactPreset, image: FirmImpactImage },
  { data: GameComboPreset, image: GameComboImage },
  { data: GameHitPreset, image: GameHitImage },
  { data: GameLevelUpPreset, image: GameLevelUpImage },
  { data: GamePickupPreset, image: GamePickupImage },
  { data: GlitchPreset, image: GlitchImage },
  { data: GravityFreefallPreset, image: GravityFreefallImage },
  { data: GrinningSquintingPreset, image: GrinningSquintingImage },
  { data: GuitarStrumPreset, image: GuitarStrumImage },
  { data: HailPreset, image: HailImage },
  { data: HappinessJoyfulPreset, image: HappinessJoyfulImage },
  { data: HappinessLightPreset, image: HappinessLightImage },
  { data: HeartbeatPreset, image: HeartbeatImage },
  { data: HeavyImpactPreset, image: HeavyImpactImage },
  { data: KeyboardMechanicalPreset, image: KeyboardMechanicalImage },
  { data: KeyboardMembranePreset, image: KeyboardMembraneImage },
  { data: KeyboardTypewriterOldPreset, image: KeyboardTypewriterOldImage },
  { data: KnockDoorPreset, image: KnockDoorImage },
  { data: LevelUpPreset, image: LevelUpImage },
  { data: LoaderBreathingPreset, image: LoaderBreathingImage },
  { data: LoaderPulsePreset, image: LoaderPulseImage },
  { data: LoaderRadarPreset, image: LoaderRadarImage },
  { data: LoaderSpinPreset, image: LoaderSpinImage },
  { data: LoaderWavePreset, image: LoaderWaveImage },
  { data: LockPreset, image: LockImage },
  { data: LongPressPreset, image: LongPressImage },
  { data: MarioGameOverPreset, image: MarioGameOverImage },
  { data: MaxImpactPreset, image: MaxImpactImage },
  { data: MutedImpactPreset, image: MutedImpactImage },
  { data: NeutralClearPreset, image: NeutralClearImage },
  { data: NeutralSteadyPreset, image: NeutralSteadyImage },
  { data: NewMessagePreset, image: NewMessageImage },
  { data: NotificationPreset, image: NotificationImage },
  { data: NotificationKnockPreset, image: NotificationKnockImage },
  { data: NotificationUrgentPreset, image: NotificationUrgentImage },
  { data: NotifyInfoStandardPreset, image: NotifyInfoStandardImage },
  { data: NotifyReminderFinalPreset, image: NotifyReminderFinalImage },
  { data: NotifyReminderNudgePreset, image: NotifyReminderNudgeImage },
  { data: NotifyReminderSoftPreset, image: NotifyReminderSoftImage },
  { data: NotifySocialMentionPreset, image: NotifySocialMentionImage },
  { data: NotifySocialMessagePreset, image: NotifySocialMessageImage },
  { data: NotifySuccessSubtlePreset, image: NotifySuccessSubtleImage },
  { data: NotifyTimerDonePreset, image: NotifyTimerDoneImage },
  { data: NotifyWarnMildPreset, image: NotifyWarnMildImage },
  { data: NotifyWarnModeratePreset, image: NotifyWarnModerateImage },
  { data: PassingCarPreset, image: PassingCarImage },
  { data: PendulumPreset, image: PendulumImage },
  { data: PowerDownPreset, image: PowerDownImage },
  { data: QuadBeatPreset, image: QuadBeatImage },
  { data: QuadRampPreset, image: QuadRampImage },
  { data: QuadThudPreset, image: QuadThudImage },
  { data: RainPreset, image: RainImage },
  { data: ReadySteadyGoPreset, image: ReadySteadyGoImage },
  { data: ReliefSighPreset, image: ReliefSighImage },
  { data: ReliefSoftPreset, image: ReliefSoftImage },
  { data: RipplePreset, image: RippleImage },
  { data: SadnessMelancholicPreset, image: SadnessMelancholicImage },
  { data: SearchingPreset, image: SearchingImage },
  { data: SearchSuccessPreset, image: SearchSuccessImage },
  { data: SelectionCrispPreset, image: SelectionCrispImage },
  { data: SelectionSnapPreset, image: SelectionSnapImage },
  { data: ShockwavePreset, image: ShockwaveImage },
  { data: SneezingPreset, image: SneezingImage },
  { data: SparkPreset, image: SparkImage },
  { data: SuccessFlourishPreset, image: SuccessFlourishImage },
  { data: SuccessGentlePreset, image: SuccessGentleImage },
  { data: SupportSteadyPreset, image: SupportSteadyImage },
  { data: SupportStrongPreset, image: SupportStrongImage },
  { data: SurpriseGaspPreset, image: SurpriseGaspImage },
  { data: TadaPreset, image: TadaImage },
  { data: ThunderPreset, image: ThunderImage },
  { data: ThunderRollPreset, image: ThunderRollImage },
  { data: TickTockPreset, image: TickTockImage },
  { data: TideSwellPreset, image: TideSwellImage },
  { data: TripleBeatPreset, image: TripleBeatImage },
  { data: TripleClickPreset, image: TripleClickImage },
  { data: TripleDecayPreset, image: TripleDecayImage },
  { data: TripleDrumPreset, image: TripleDrumImage },
  { data: TripleEscalationPreset, image: TripleEscalationImage },
  { data: TripleFadePreset, image: TripleFadeImage },
  { data: TripleGentleTapPreset, image: TripleGentleTapImage },
  { data: TripleKnockPreset, image: TripleKnockImage },
  { data: TriplePatPreset, image: TriplePatImage },
  { data: TriplePulsePreset, image: TriplePulseImage },
  { data: TripleStrikePreset, image: TripleStrikeImage },
  { data: TripleSurgePreset, image: TripleSurgeImage },
  { data: TripleTapPreset, image: TripleTapImage },
  { data: TripleThudPreset, image: TripleThudImage },
  { data: VictoryPreset, image: VictoryImage },
  { data: VomitingPreset, image: VomitingImage },
  { data: VortexPreset, image: VortexImage },
  { data: WarningPulsePreset, image: WarningPulseImage },
  { data: WarningSoftPreset, image: WarningSoftImage },
  { data: WarningUrgentPreset, image: WarningUrgentImage },
  { data: WaterfallPreset, image: WaterfallImage },
  { data: WoodpeckerPreset, image: WoodpeckerImage },
  { data: ZeldaChestPreset, image: ZeldaChestImage },
  { data: ZipperPreset, image: ZipperImage },
// CODEGEN_END_{presets}
];
