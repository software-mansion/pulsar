import { Presets } from "react-native-pulsar";
import { PresetProps } from "./types";

// CODEGEN_BEGIN_{imports}
const AimingFireImage = require('@/assets/presets/AimingFire.png');
const AimingLockImage = require('@/assets/presets/AimingLock.png');
const AlarmImage = require('@/assets/presets/Alarm.png');
const AngerFrustrationImage = require('@/assets/presets/AngerFrustration.png');
const ApplauseImage = require('@/assets/presets/Applause.png');
const AttentionImage = require('@/assets/presets/Attention.png');
const BalloonPopImage = require('@/assets/presets/BalloonPop.png');
const BangDoorImage = require('@/assets/presets/BangDoor.png');
const BarrageImage = require('@/assets/presets/Barrage.png');
const BoredomFlatImage = require('@/assets/presets/BoredomFlat.png');
const BreathImage = require('@/assets/presets/Breath.png');
const BtnChipImage = require('@/assets/presets/BtnChip.png');
const BtnDestructiveImage = require('@/assets/presets/BtnDestructive.png');
const BtnGhostImage = require('@/assets/presets/BtnGhost.png');
const BtnIconImage = require('@/assets/presets/BtnIcon.png');
const BtnMenuImage = require('@/assets/presets/BtnMenu.png');
const BtnPrimaryImage = require('@/assets/presets/BtnPrimary.png');
const BtnSecondaryImage = require('@/assets/presets/BtnSecondary.png');
const BtnSubmitImage = require('@/assets/presets/BtnSubmit.png');
const BtnToggleOffImage = require('@/assets/presets/BtnToggleOff.png');
const BuildupImage = require('@/assets/presets/Buildup.png');
const CameraShutterImage = require('@/assets/presets/CameraShutter.png');
const CascadeImage = require('@/assets/presets/Cascade.png');
const CleanStrikeImage = require('@/assets/presets/CleanStrike.png');
const CoinDropImage = require('@/assets/presets/CoinDrop.png');
const CombinationLockImage = require('@/assets/presets/CombinationLock.png');
const ConfirmImage = require('@/assets/presets/Confirm.png');
const CowboyImage = require('@/assets/presets/Cowboy.png');
const CrescendoImage = require('@/assets/presets/Crescendo.png');
const CrossedEyesImage = require('@/assets/presets/CrossedEyes.png');
const CursingImage = require('@/assets/presets/Cursing.png');
const DeepRumbleImage = require('@/assets/presets/DeepRumble.png');
const DeepThudImage = require('@/assets/presets/DeepThud.png');
const DogBarkImage = require('@/assets/presets/DogBark.png');
const DoubleBeatImage = require('@/assets/presets/DoubleBeat.png');
const DoubleBlastImage = require('@/assets/presets/DoubleBlast.png');
const DoubleBurstImage = require('@/assets/presets/DoubleBurst.png');
const DoubleClickImage = require('@/assets/presets/DoubleClick.png');
const DoubleGentleTapImage = require('@/assets/presets/DoubleGentleTap.png');
const DoublePatImage = require('@/assets/presets/DoublePat.png');
const DoublePulseImage = require('@/assets/presets/DoublePulse.png');
const DoublePunchImage = require('@/assets/presets/DoublePunch.png');
const DoubleStrikeImage = require('@/assets/presets/DoubleStrike.png');
const DoubleTapImage = require('@/assets/presets/DoubleTap.png');
const DoubleThudImage = require('@/assets/presets/DoubleThud.png');
const DoubleTripletImage = require('@/assets/presets/DoubleTriplet.png');
const EngineRevImage = require('@/assets/presets/EngineRev.png');
const ErrorBuzzImage = require('@/assets/presets/ErrorBuzz.png');
const ErrorSoftImage = require('@/assets/presets/ErrorSoft.png');
const ExplodingHeadImage = require('@/assets/presets/ExplodingHead.png');
const ExplosionImage = require('@/assets/presets/Explosion.png');
const EyeRollingImage = require('@/assets/presets/EyeRolling.png');
const FadeOutImage = require('@/assets/presets/FadeOut.png');
const FanfareShortImage = require('@/assets/presets/FanfareShort.png');
const FirmImpactImage = require('@/assets/presets/FirmImpact.png');
const GameComboImage = require('@/assets/presets/GameCombo.png');
const GameHitImage = require('@/assets/presets/GameHit.png');
const GameLevelUpImage = require('@/assets/presets/GameLevelUp.png');
const GamePickupImage = require('@/assets/presets/GamePickup.png');
const GlitchImage = require('@/assets/presets/Glitch.png');
const GravityFreefallImage = require('@/assets/presets/GravityFreefall.png');
const GrinningSquintingImage = require('@/assets/presets/GrinningSquinting.png');
const GuitarStrumImage = require('@/assets/presets/GuitarStrum.png');
const HailImage = require('@/assets/presets/Hail.png');
const HappinessJoyfulImage = require('@/assets/presets/HappinessJoyful.png');
const HappinessLightImage = require('@/assets/presets/HappinessLight.png');
const HeartbeatImage = require('@/assets/presets/Heartbeat.png');
const HeavyImpactImage = require('@/assets/presets/HeavyImpact.png');
const KeyboardMechanicalImage = require('@/assets/presets/KeyboardMechanical.png');
const KeyboardMembraneImage = require('@/assets/presets/KeyboardMembrane.png');
const KeyboardTypewriterOldImage = require('@/assets/presets/KeyboardTypewriterOld.png');
const KnockDoorImage = require('@/assets/presets/KnockDoor.png');
const LevelUpImage = require('@/assets/presets/LevelUp.png');
const LoaderBreathingImage = require('@/assets/presets/LoaderBreathing.png');
const LoaderPulseImage = require('@/assets/presets/LoaderPulse.png');
const LoaderRadarImage = require('@/assets/presets/LoaderRadar.png');
const LoaderSpinImage = require('@/assets/presets/LoaderSpin.png');
const LoaderWaveImage = require('@/assets/presets/LoaderWave.png');
const LockImage = require('@/assets/presets/Lock.png');
const LongPressImage = require('@/assets/presets/LongPress.png');
const MarioGameOverImage = require('@/assets/presets/MarioGameOver.png');
const MaxImpactImage = require('@/assets/presets/MaxImpact.png');
const MutedImpactImage = require('@/assets/presets/MutedImpact.png');
const NeutralClearImage = require('@/assets/presets/NeutralClear.png');
const NeutralSteadyImage = require('@/assets/presets/NeutralSteady.png');
const NewMessageImage = require('@/assets/presets/NewMessage.png');
const NotificationImage = require('@/assets/presets/Notification.png');
const NotificationKnockImage = require('@/assets/presets/NotificationKnock.png');
const NotificationUrgentImage = require('@/assets/presets/NotificationUrgent.png');
const NotifyInfoStandardImage = require('@/assets/presets/NotifyInfoStandard.png');
const NotifyReminderFinalImage = require('@/assets/presets/NotifyReminderFinal.png');
const NotifyReminderNudgeImage = require('@/assets/presets/NotifyReminderNudge.png');
const NotifyReminderSoftImage = require('@/assets/presets/NotifyReminderSoft.png');
const NotifySocialMentionImage = require('@/assets/presets/NotifySocialMention.png');
const NotifySocialMessageImage = require('@/assets/presets/NotifySocialMessage.png');
const NotifySuccessSubtleImage = require('@/assets/presets/NotifySuccessSubtle.png');
const NotifyTimerDoneImage = require('@/assets/presets/NotifyTimerDone.png');
const NotifyWarnMildImage = require('@/assets/presets/NotifyWarnMild.png');
const NotifyWarnModerateImage = require('@/assets/presets/NotifyWarnModerate.png');
const PassingCarImage = require('@/assets/presets/PassingCar.png');
const PendulumImage = require('@/assets/presets/Pendulum.png');
const PowerDownImage = require('@/assets/presets/PowerDown.png');
const QuadBeatImage = require('@/assets/presets/QuadBeat.png');
const QuadRampImage = require('@/assets/presets/QuadRamp.png');
const QuadThudImage = require('@/assets/presets/QuadThud.png');
const RainImage = require('@/assets/presets/Rain.png');
const ReadySteadyGoImage = require('@/assets/presets/ReadySteadyGo.png');
const ReliefSighImage = require('@/assets/presets/ReliefSigh.png');
const ReliefSoftImage = require('@/assets/presets/ReliefSoft.png');
const RippleImage = require('@/assets/presets/Ripple.png');
const SadnessMelancholicImage = require('@/assets/presets/SadnessMelancholic.png');
const SearchingImage = require('@/assets/presets/Searching.png');
const SearchSuccessImage = require('@/assets/presets/SearchSuccess.png');
const SelectionCrispImage = require('@/assets/presets/SelectionCrisp.png');
const SelectionSnapImage = require('@/assets/presets/SelectionSnap.png');
const ShockwaveImage = require('@/assets/presets/Shockwave.png');
const SneezingImage = require('@/assets/presets/Sneezing.png');
const SparkImage = require('@/assets/presets/Spark.png');
const SuccessFlourishImage = require('@/assets/presets/SuccessFlourish.png');
const SuccessGentleImage = require('@/assets/presets/SuccessGentle.png');
const SupportSteadyImage = require('@/assets/presets/SupportSteady.png');
const SupportStrongImage = require('@/assets/presets/SupportStrong.png');
const SurpriseGaspImage = require('@/assets/presets/SurpriseGasp.png');
const TadaImage = require('@/assets/presets/Tada.png');
const ThunderImage = require('@/assets/presets/Thunder.png');
const ThunderRollImage = require('@/assets/presets/ThunderRoll.png');
const TickTockImage = require('@/assets/presets/TickTock.png');
const TideSwellImage = require('@/assets/presets/TideSwell.png');
const TripleBeatImage = require('@/assets/presets/TripleBeat.png');
const TripleClickImage = require('@/assets/presets/TripleClick.png');
const TripleDecayImage = require('@/assets/presets/TripleDecay.png');
const TripleDrumImage = require('@/assets/presets/TripleDrum.png');
const TripleEscalationImage = require('@/assets/presets/TripleEscalation.png');
const TripleFadeImage = require('@/assets/presets/TripleFade.png');
const TripleGentleTapImage = require('@/assets/presets/TripleGentleTap.png');
const TripleKnockImage = require('@/assets/presets/TripleKnock.png');
const TriplePatImage = require('@/assets/presets/TriplePat.png');
const TriplePulseImage = require('@/assets/presets/TriplePulse.png');
const TripleStrikeImage = require('@/assets/presets/TripleStrike.png');
const TripleSurgeImage = require('@/assets/presets/TripleSurge.png');
const TripleTapImage = require('@/assets/presets/TripleTap.png');
const TripleThudImage = require('@/assets/presets/TripleThud.png');
const VictoryImage = require('@/assets/presets/Victory.png');
const VomitingImage = require('@/assets/presets/Vomiting.png');
const VortexImage = require('@/assets/presets/Vortex.png');
const WarningPulseImage = require('@/assets/presets/WarningPulse.png');
const WarningSoftImage = require('@/assets/presets/WarningSoft.png');
const WarningUrgentImage = require('@/assets/presets/WarningUrgent.png');
const WaterfallImage = require('@/assets/presets/Waterfall.png');
const WoodpeckerImage = require('@/assets/presets/Woodpecker.png');
const ZeldaChestImage = require('@/assets/presets/ZeldaChest.png');
const ZipperImage = require('@/assets/presets/Zipper.png');
// CODEGEN_END_{imports}

export const PresetsConfig: Array<PresetProps> = [
// CODEGEN_BEGIN_{presets}
  {
    name: 'AimingFire',
    description: 'A sharp, powerful strike followed by a decaying echo, ideal for confirming a triggered action like firing a weapon or releasing a charged gesture.',
    tags: ["Bold","Flexible","Bumps","Extended"],
    duration: 280,
    image: AimingFireImage,
    play: Presets.AimingFire,
  },
  {
    name: 'AimingLock',
    description: 'Two rapid sharp snaps in quick succession with the second slightly stronger, ideal for targeting lock-on or radar acquisition feedback.',
    tags: ["Bold","Rigid","Bumps","Short"],
    duration: 220,
    image: AimingLockImage,
    play: Presets.AimingLock,
  },
  {
    name: 'Alarm',
    description: 'A relentless alternating high-low pulse pattern that mimics a ringing alarm bell, best used for urgent alerts or critical error states.',
    tags: ["Bold","Flexible","Pattern","Extended"],
    duration: 1130,
    image: AlarmImage,
    play: Presets.Alarm,
  },
  {
    name: 'AngerFrustration',
    description: 'An escalating burst of sharp, high-frequency impacts that builds to a maximum strike, conveying intense frustration or a forceful block event.',
    tags: ["Bold","Rigid","Pattern","Extended"],
    duration: 450,
    image: AngerFrustrationImage,
    play: Presets.AngerFrustration,
  },
  {
    name: 'Applause',
    description: 'A slowly building wave of discrete taps that gradually increases in intensity and sharpness, ideal for celebratory or crowd-approval moments.',
    tags: ["Bold","Rigid","Bump","Long"],
    duration: 1564,
    image: ApplauseImage,
    play: Presets.Applause,
  },
  {
    name: 'Attention',
    description: 'One long strong pulse followed by two shorter firm taps in a long-short-short pattern, ideal for attention-grabbing signals or incoming-call alerts.',
    tags: ["Bold","Flexible","Bumps","Extended"],
    duration: 500,
    image: AttentionImage,
    play: Presets.Attention,
  },
  {
    name: 'BalloonPop',
    description: 'Escalating bumps of increasing intensity build tension before culminating in a full-force burst, perfect for countdown completions or suspenseful reveals.',
    tags: ["Bold","Flexible","Bumps","Long"],
    duration: 1700,
    image: BalloonPopImage,
    play: Presets.BalloonPop,
  },
  {
    name: 'BangDoor',
    description: 'A series of progressively louder and faster thuds with a deep, low frequency that feels like an insistent fist banging on a door, suitable for urgent or forceful interaction feedback.',
    tags: ["Bold","Soft","Pattern","Long"],
    duration: 1050,
    image: BangDoorImage,
    play: Presets.BangDoor,
  },
  {
    name: 'Barrage',
    description: 'Seven bold, sharp high-frequency taps in rapid succession, delivering an intense extended impulse pattern.',
    tags: ["Bold","Rigid","Impulses","Extended"],
    duration: 309,
    image: BarrageImage,
    play: Presets.Barrage,
  },
  {
    name: 'BoredomFlat',
    description: 'A monotonous, low-intensity repeating tap with no variation in amplitude or frequency, ideal for representing idle waiting or disengagement.',
    tags: ["Gentle","Flexible","Pattern","Long"],
    duration: 1780,
    image: BoredomFlatImage,
    play: Presets.BoredomFlat,
  },
  {
    name: 'Breath',
    description: 'A smooth low-frequency inhale-exhale cycle that swells and subsides twice, ideal for meditation, breathing exercises, or calm ambient feedback.',
    tags: ["Substantial","Soft","Bumps","Long"],
    duration: 3200,
    image: BreathImage,
    play: Presets.Breath,
  },
  {
    name: 'BtnChip',
    description: 'A light, quick tap with minimal presence — ideal for small selection elements like chips, tags, and filters.',
    tags: ["Substantial","Flexible","Impulses","Impulse"],
    duration: 80,
    image: BtnChipImage,
    play: Presets.BtnChip,
  },
  {
    name: 'BtnDestructive',
    description: 'Two sharp, high-frequency warning strikes that haptically signal an irreversible action such as delete or remove.',
    tags: ["Bold","Rigid","Bumps","Short"],
    duration: 250,
    image: BtnDestructiveImage,
    play: Presets.BtnDestructive,
  },
  {
    name: 'BtnGhost',
    description: 'A very delicate, barely-there touch — best suited for ghost or outline buttons that should feel subtle and unobtrusive.',
    tags: ["Gentle","Flexible","Impulses","Impulse"],
    duration: 60,
    image: BtnGhostImage,
    play: Presets.BtnGhost,
  },
  {
    name: 'BtnIcon',
    description: 'An ultra-short, precise tap — perfect for small icon buttons where a quick, clean response is needed without label text.',
    tags: ["Substantial","Flexible","Impulses","Impulse"],
    duration: 28,
    image: BtnIconImage,
    play: Presets.BtnIcon,
  },
  {
    name: 'BtnMenu',
    description: 'A single soft, warm tap that gently acknowledges opening a menu or drawer without disrupting the user\'s flow.',
    tags: ["Substantial","Flexible","Bump","Short"],
    duration: 160,
    image: BtnMenuImage,
    play: Presets.BtnMenu,
  },
  {
    name: 'BtnPrimary',
    description: 'A confident, decisive strike with a short echo — delivers a clear and satisfying response for the main call-to-action button.',
    tags: ["Substantial","Flexible","Impulses","Impulse"],
    duration: 80,
    image: BtnPrimaryImage,
    play: Presets.BtnPrimary,
  },
  {
    name: 'BtnSecondary',
    description: 'A softer, quieter click that is less dominant than a primary CTA but still clearly perceptible — ideal for secondary actions.',
    tags: ["Substantial","Flexible","Impulses","Impulse"],
    duration: 90,
    image: BtnSecondaryImage,
    play: Presets.BtnSecondary,
  },
  {
    name: 'BtnSubmit',
    description: 'Two escalating strikes that feel like a confident forward push, communicating that a form or action has been decisively submitted.',
    tags: ["Bold","Flexible","Bumps","Extended"],
    duration: 300,
    image: BtnSubmitImage,
    play: Presets.BtnSubmit,
  },
  {
    name: 'BtnToggleOff',
    description: 'A firm initial tap followed by a lighter secondary bump that descends in both amplitude and frequency, clearly communicating deactivation or turning something off.',
    tags: ["Substantial","Flexible","Bumps","Short"],
    duration: 230,
    image: BtnToggleOffImage,
    play: Presets.BtnToggleOff,
  },
  {
    name: 'Buildup',
    description: 'Seven bold taps with steadily increasing frequency, building from soft to sharp across an extended impulse pattern.',
    tags: ["Bold","Flexible","Impulses","Extended"],
    duration: 309,
    image: BuildupImage,
    play: Presets.Buildup,
  },
  {
    name: 'CameraShutter',
    description: 'Two distinct high-frequency clicks in quick succession that mimic a camera\'s mirror lift and shutter release, ideal for photo capture confirmation.',
    tags: ["Bold","Rigid","Bumps","Short"],
    duration: 150,
    image: CameraShutterImage,
    play: Presets.CameraShutter,
  },
  {
    name: 'Cascade',
    description: 'Twelve discrete taps across four intensity groups descending from bold to soft, suited for complex multi-phase feedback.',
    tags: ["Substantial","Flexible","Impulses","Long"],
    duration: 1863,
    image: CascadeImage,
    play: Presets.Cascade,
  },
  {
    name: 'CleanStrike',
    description: 'A strong impulse at maximum sharpness that delivers a clean, precise, and firm tap — well-suited for crisp confirmations that need both authority and definition.',
    tags: ["Substantial","Rigid","Impulses","Impulse"],
    duration: 0,
    image: CleanStrikeImage,
    play: Presets.CleanStrike,
  },
  {
    name: 'CoinDrop',
    description: 'A rapid sequence of irregular high-frequency taps of varying strength that mimics coins falling one by one, ideal for reward or payment confirmation feedback.',
    tags: ["Bold","Rigid","Pattern","Extended"],
    duration: 675,
    image: CoinDropImage,
    play: Presets.CoinDrop,
  },
  {
    name: 'CombinationLock',
    description: 'Five evenly spaced crisp metallic clicks followed by one strong final strike, simulating the turning of a combination lock dial with the last click confirming the correct code.',
    tags: ["Bold","Rigid","Pattern","Long"],
    duration: 980,
    image: CombinationLockImage,
    play: Presets.CombinationLock,
  },
  {
    name: 'Confirm',
    description: 'Two equal, clean taps spaced 150ms apart that feel calm and decisive, suitable for dialog confirmations or acknowledgement interactions.',
    tags: ["Substantial","Flexible","Bumps","Short"],
    duration: 205,
    image: ConfirmImage,
    play: Presets.Confirm,
  },
  {
    name: 'Cowboy',
    description: 'A bouncy strong-weak alternating pattern with high sharpness that evokes a galloping horse rhythm, perfect for adventurous or playful UI moments.',
    tags: ["Substantial","Rigid","Pattern","Extended"],
    duration: 450,
    image: CowboyImage,
    play: Presets.Cowboy,
  },
  {
    name: 'Crescendo',
    description: 'Seven taps with steadily increasing amplitude and frequency, building to a peak in a long escalating pattern.',
    tags: ["Substantial","Flexible","Impulses","Long"],
    duration: 601,
    image: CrescendoImage,
    play: Presets.Crescendo,
  },
  {
    name: 'CrossedEyes',
    description: 'A disorienting sequence of impacts with rapidly shifting frequency that fades out, simulating the woozy dizziness of being stunned or hit.',
    tags: ["Substantial","Flexible","Pattern","Extended"],
    duration: 320,
    image: CrossedEyesImage,
    play: Presets.CrossedEyes,
  },
  {
    name: 'Cursing',
    description: 'An explosive burst of five rapid maximum-intensity impacts with a mid-range frequency that conveys unrestrained rage, suited for critical failure or violent error states.',
    tags: ["Bold","Flexible","Pattern","Extended"],
    duration: 380,
    image: CursingImage,
    play: Presets.Cursing,
  },
  {
    name: 'DeepRumble',
    description: 'Maximum amplitude with zero sharpness, producing the deepest and most rumbling single burst possible — ideal for heavy physical impact simulations.',
    tags: ["Bold","Soft","Impulses","Impulse"],
    duration: 0,
    image: DeepRumbleImage,
    play: Presets.DeepRumble,
  },
  {
    name: 'DeepThud',
    description: 'A full-strength impulse with very low sharpness that produces a deep, thuddy sensation — great for heavy impacts that feel weighty rather than sharp.',
    tags: ["Bold","Soft","Impulses","Impulse"],
    duration: 0,
    image: DeepThudImage,
    play: Presets.DeepThud,
  },
  {
    name: 'DogBark',
    description: 'Two strong low-frequency bursts with a short pause between them, ideal for alert barks or sharp double-knock sound effects.',
    tags: ["Bold","Soft","Bumps","Extended"],
    duration: 500,
    image: DogBarkImage,
    play: Presets.DogBark,
  },
  {
    name: 'DoubleBeat',
    description: 'Two bold, consistently low-frequency taps forming a firm soft double impulse pattern.',
    tags: ["Bold","Soft","Impulses","Short"],
    duration: 201,
    image: DoubleBeatImage,
    play: Presets.DoubleBeat,
  },
  {
    name: 'DoubleBlast',
    description: 'Two maximum-intensity, maximum-sharpness impulses fired in rapid succession — ideal for urgent double-confirmation or high-impact alert feedback.',
    tags: ["Bold","Rigid","Impulses","Impulse"],
    duration: 75,
    image: DoubleBlastImage,
    play: Presets.DoubleBlast,
  },
  {
    name: 'DoubleBurst',
    description: 'Six taps in two groups escalating from medium to bold amplitude with decreasing frequency, for a strong double-burst pattern.',
    tags: ["Bold","Flexible","Impulses","Extended"],
    duration: 455,
    image: DoubleBurstImage,
    play: Presets.DoubleBurst,
  },
  {
    name: 'DoubleClick',
    description: 'Two bold, consistently high-frequency sharp taps delivering a crisp double impulse.',
    tags: ["Bold","Rigid","Impulses","Short"],
    duration: 199,
    image: DoubleClickImage,
    play: Presets.DoubleClick,
  },
  {
    name: 'DoubleGentleTap',
    description: 'Two medium-strength, consistent low-frequency taps forming a gentle double impulse.',
    tags: ["Substantial","Soft","Impulses","Impulse"],
    duration: 80,
    image: DoubleGentleTapImage,
    play: Presets.DoubleGentleTap,
  },
  {
    name: 'DoublePat',
    description: 'Two medium-amplitude, low-frequency taps forming a soft double impulse pattern.',
    tags: ["Substantial","Soft","Impulses","Impulse"],
    duration: 75,
    image: DoublePatImage,
    play: Presets.DoublePat,
  },
  {
    name: 'DoublePulse',
    description: 'Two bold taps with descending frequency from sharp to mid, forming a varied double impulse.',
    tags: ["Bold","Rigid","Impulses","Short"],
    duration: 199,
    image: DoublePulseImage,
    play: Presets.DoublePulse,
  },
  {
    name: 'DoublePunch',
    description: 'Two full-strength impulses in quick succession with a flexible texture — useful for double-tap confirmations or paired action feedback.',
    tags: ["Bold","Flexible","Impulses","Impulse"],
    duration: 73,
    image: DoublePunchImage,
    play: Presets.DoublePunch,
  },
  {
    name: 'DoubleStrike',
    description: 'Two bold taps with low-to-mid frequency range, creating a strong double impulse with varied sharpness.',
    tags: ["Bold","Flexible","Impulses","Short"],
    duration: 201,
    image: DoubleStrikeImage,
    play: Presets.DoubleStrike,
  },
  {
    name: 'DoubleTap',
    description: 'Two bold taps with high-to-soft frequency transition, suitable for strong double-tap confirmation.',
    tags: ["Bold","Rigid","Impulses","Impulse"],
    duration: 80,
    image: DoubleTapImage,
    play: Presets.DoubleTap,
  },
  {
    name: 'DoubleThud',
    description: 'Two bold discrete taps with decreasing frequency, ideal for distinct double-confirmation feedback.',
    tags: ["Bold","Soft","Impulses","Impulse"],
    duration: 71,
    image: DoubleThudImage,
    play: Presets.DoubleThud,
  },
  {
    name: 'DoubleTriplet',
    description: 'Six medium taps in two groups with consistent mid-range amplitude and frequency, creating a double-triple rhythm.',
    tags: ["Substantial","Flexible","Impulses","Extended"],
    duration: 451,
    image: DoubleTripletImage,
    play: Presets.DoubleTriplet,
  },
  {
    name: 'EngineRev',
    description: 'Two revving surges separated by a gear-shift dip, building from idle to full throttle, ideal for racing games or mechanical acceleration feedback.',
    tags: ["Bold","Flexible","Bumps","Long"],
    duration: 1800,
    image: EngineRevImage,
    play: Presets.EngineRev,
  },
  {
    name: 'ErrorBuzz',
    description: 'A sharp, high-frequency buzz that ramps down quickly, delivering an unmistakable rejection signal suited for critical errors or denied actions.',
    tags: ["Bold","Rigid","Ramp","Extended"],
    duration: 350,
    image: ErrorBuzzImage,
    play: Presets.ErrorBuzz,
  },
  {
    name: 'ErrorSoft',
    description: 'A single, crisp tap with a high-frequency character that fades swiftly, providing a non-intrusive rejection cue for minor validation errors.',
    tags: ["Substantial","Rigid","Ramp","Short"],
    duration: 180,
    image: ErrorSoftImage,
    play: Presets.ErrorSoft,
  },
  {
    name: 'ExplodingHead',
    description: 'A rapid ramp to full-peak intensity followed by a sharp decay, ideal for overwhelming surprise or mind-blowing reveal moments.',
    tags: ["Bold","Rigid","Bump","Extended"],
    duration: 380,
    image: ExplodingHeadImage,
    play: Presets.ExplodingHead,
  },
  {
    name: 'Explosion',
    description: 'A maximum-force detonation impact that decays into a long, deep rumble, ideal for game explosions or dramatic destructive events.',
    tags: ["Bold","Soft","Ramp","Long"],
    duration: 1000,
    image: ExplosionImage,
    play: Presets.Explosion,
  },
  {
    name: 'EyeRolling',
    description: 'A slow, lazy ramp-down that languidly fades away, evoking a dismissive eye-roll and fitting for sarcastic or indifferent UI moments.',
    tags: ["Substantial","Flexible","Ramp","Extended"],
    duration: 450,
    image: EyeRollingImage,
    play: Presets.EyeRolling,
  },
  {
    name: 'FadeOut',
    description: 'Six taps with steadily decreasing amplitude and frequency, forming a long fading impulse sequence.',
    tags: ["Substantial","Flexible","Impulses","Extended"],
    duration: 506,
    image: FadeOutImage,
    play: Presets.FadeOut,
  },
  {
    name: 'FanfareShort',
    description: 'Four ascending pulses with growing intensity and sharpness like a triumphant musical fanfare, ideal for achievement unlocked or victory moments.',
    tags: ["Bold","Rigid","Bumps","Extended"],
    duration: 580,
    image: FanfareShortImage,
    play: Presets.FanfareShort,
  },
  {
    name: 'FirmImpact',
    description: 'A full-strength impulse at moderate frequency that blends power with a slightly rounded edge — useful for bold but not overly sharp feedback.',
    tags: ["Bold","Flexible","Impulses","Impulse"],
    duration: 0,
    image: FirmImpactImage,
    play: Presets.FirmImpact,
  },
  {
    name: 'GameCombo',
    description: 'Four rapid escalating taps in quick succession with growing intensity, ideal for hit-combo multipliers or rapid-fire scoring feedback in games.',
    tags: ["Bold","Rigid","Bumps","Extended"],
    duration: 300,
    image: GameComboImage,
    play: Presets.GameCombo,
  },
  {
    name: 'GameHit',
    description: 'A hard, snappy strike that decays rapidly through diminishing resonance, perfect for registering damage or collision impacts in games.',
    tags: ["Bold","Flexible","Ramp","Short"],
    duration: 200,
    image: GameHitImage,
    play: Presets.GameHit,
  },
  {
    name: 'GameLevelUp',
    description: 'Four rising pulses that escalate from a gentle tap to a full triumphant peak, ideal for level-up or rank-promotion celebrations in games.',
    tags: ["Bold","Rigid","Bumps","Long"],
    duration: 650,
    image: GameLevelUpImage,
    play: Presets.GameLevelUp,
  },
  {
    name: 'GamePickup',
    description: 'A light, sparkling double-burst that mimics picking up an item — ideal for in-game collectible or power-up feedback.',
    tags: ["Gentle","Rigid","Impulses","Impulse"],
    duration: 100,
    image: GamePickupImage,
    play: Presets.GamePickup,
  },
  {
    name: 'Glitch',
    description: 'A chaotic sequence of alternating full-strength and near-silent impacts with wildly shifting frequency, evoking a corrupted signal or digital system error.',
    tags: ["Bold","Rigid","Pattern","Short"],
    duration: 220,
    image: GlitchImage,
    play: Presets.Glitch,
  },
  {
    name: 'GravityFreefall',
    description: 'A near-silent buildup that accelerates into a sudden full-force impact, ideal for drop effects or dramatic collision moments.',
    tags: ["Bold","Soft","Bump","Long"],
    duration: 1050,
    image: GravityFreefallImage,
    play: Presets.GravityFreefall,
  },
  {
    name: 'GrinningSquinting',
    description: 'Four rapid high-frequency pulses that gradually swell in intensity, evoking vibrant joy and laughter ideal for reaction or delight moments.',
    tags: ["Bold","Rigid","Bumps","Extended"],
    duration: 330,
    image: GrinningSquintingImage,
    play: Presets.GrinningSquinting,
  },
  {
    name: 'GuitarStrum',
    description: 'A bold attack that slowly decays over a long sustain like a plucked string, great for musical interactions or satisfying confirmation moments.',
    tags: ["Bold","Flexible","Ramp","Long"],
    duration: 1400,
    image: GuitarStrumImage,
    play: Presets.GuitarStrum,
  },
  {
    name: 'Hail',
    description: 'Dense, irregular high-frequency strikes of varying intensity over a steady background, simulating a barrage of hailstones hitting a surface.',
    tags: ["Gentle","Rigid","Solid","Extended"],
    duration: 430,
    image: HailImage,
    play: Presets.Hail,
  },
  {
    name: 'HappinessJoyful',
    description: 'A rising sequence of bouncy, sharp taps that crescendo like bubbles of joy, ideal for success celebrations or upbeat positive feedback.',
    tags: ["Substantial","Rigid","Pattern","Extended"],
    duration: 500,
    image: HappinessJoyfulImage,
    play: Presets.HappinessJoyful,
  },
  {
    name: 'HappinessLight',
    description: 'Three gentle bouncing taps with slightly rising intensity and sharpness, evoking light-hearted joy ideal for positive micro-interactions or upbeat feedback.',
    tags: ["Substantial","Rigid","Bumps","Extended"],
    duration: 360,
    image: HappinessLightImage,
    play: Presets.HappinessLight,
  },
  {
    name: 'Heartbeat',
    description: 'A rhythmic lub-dub double-beat pattern with a strong first strike and softer echo, perfect for conveying life, tension, or a living system state.',
    tags: ["Bold","Soft","Pattern","Long"],
    duration: 1000,
    image: HeartbeatImage,
    play: Presets.Heartbeat,
  },
  {
    name: 'HeavyImpact',
    description: 'A maximum-amplitude, deep-frequency collision that rumbles down to silence, conveying the weight of a massive physical impact.',
    tags: ["Bold","Soft","Ramp","Extended"],
    duration: 500,
    image: HeavyImpactImage,
    play: Presets.HeavyImpact,
  },
  {
    name: 'KeyboardMechanical',
    description: 'A two-phase mechanical click with a distinct actuation point followed by a sharp snap — great for simulating the feel of a mechanical keyboard key press.',
    tags: ["Substantial","Rigid","Impulses","Impulse"],
    duration: 55,
    image: KeyboardMechanicalImage,
    play: Presets.KeyboardMechanical,
  },
  {
    name: 'KeyboardMembrane',
    description: 'A soft, muffled press with no distinct click point — best for simulating the quiet, cushioned feel of a membrane keyboard.',
    tags: ["Gentle","Flexible","Impulses","Short"],
    duration: 140,
    image: KeyboardMembraneImage,
    play: Presets.KeyboardMembrane,
  },
  {
    name: 'KeyboardTypewriterOld',
    description: 'A heavy initial strike with a mechanical resonance and two decaying echoes, evoking the satisfying thud of a vintage typewriter key, perfect for retro keyboard feedback.',
    tags: ["Bold","Flexible","Bumps","Short"],
    duration: 200,
    image: KeyboardTypewriterOldImage,
    play: Presets.KeyboardTypewriterOld,
  },
  {
    name: 'KnockDoor',
    description: 'Three evenly spaced identical low-frequency taps with natural decay, evoking a polite door knock ideal for attention requests or gentle arrival signals.',
    tags: ["Substantial","Soft","Bumps","Long"],
    duration: 760,
    image: KnockDoorImage,
    play: Presets.KnockDoor,
  },
  {
    name: 'LevelUp',
    description: 'An ascending arpeggio of seven taps with accelerating tempo and rising amplitude that peaks in a long triumphant hold, evoking a classic RPG level-up reward.',
    tags: ["Bold","Flexible","Pattern","Long"],
    duration: 2400,
    image: LevelUpImage,
    play: Presets.LevelUp,
  },
  {
    name: 'LoaderBreathing',
    description: 'A slow, deep inhale-exhale amplitude cycle that feels like calm breathing, ideal for indicating background processing without distracting the user.',
    tags: ["Substantial","Soft","Pattern","Long"],
    duration: 6000,
    image: LoaderBreathingImage,
    play: Presets.LoaderBreathing,
  },
  {
    name: 'LoaderPulse',
    description: 'A gentle, steady on-off pulse that quietly signals ongoing activity without demanding attention, suitable as a subtle loading indicator.',
    tags: ["Gentle","Flexible","Pattern","Long"],
    duration: 2000,
    image: LoaderPulseImage,
    play: Presets.LoaderPulse,
  },
  {
    name: 'LoaderRadar',
    description: 'A sharp ping followed by a quick decaying echo repeating every 800ms like a radar sweep, ideal for showing a system actively scanning or waiting for a server response.',
    tags: ["Substantial","Flexible","Pattern","Long"],
    duration: 2520,
    image: LoaderRadarImage,
    play: Presets.LoaderRadar,
  },
  {
    name: 'LoaderSpin',
    description: 'Eight evenly spaced crisp ticks per cycle that feel like a mechanical spinner rotating, great for indicating a looping process with precise, regular feedback.',
    tags: ["Substantial","Flexible","Pattern","Long"],
    duration: 1808,
    image: LoaderSpinImage,
    play: Presets.LoaderSpin,
  },
  {
    name: 'LoaderWave',
    description: 'A smooth sinusoidal oscillation that gently rises and falls like an ocean wave, designed for calm background loading states that should not break the user\'s focus.',
    tags: ["Substantial","Soft","Pattern","Long"],
    duration: 2800,
    image: LoaderWaveImage,
    play: Presets.LoaderWave,
  },
  {
    name: 'Lock',
    description: 'A soft preparatory tap followed by a crisp high-intensity snap, ideal for locking, latching, or secure-confirmation interactions.',
    tags: ["Bold","Rigid","Bumps","Short"],
    duration: 220,
    image: LockImage,
    play: Presets.Lock,
  },
  {
    name: 'LongPress',
    description: 'A gentle rising tension over the hold duration that culminates in a sharp high-intensity confirmation thud, ideal for long-press activation or charge-complete feedback.',
    tags: ["Bold","Rigid","Bump","Long"],
    duration: 650,
    image: LongPressImage,
    play: Presets.LongPress,
  },
  {
    name: 'MarioGameOver',
    description: 'Three descending staccato hits followed by a long low rumble that fades away, capturing the deflating feeling of a game-over defeat.',
    tags: ["Bold","Flexible","Pattern","Long"],
    duration: 2450,
    image: MarioGameOverImage,
    play: Presets.MarioGameOver,
  },
  {
    name: 'MaxImpact',
    description: 'A single maximum-strength, maximum-sharpness burst — delivers the most intense and crisp haptic hit possible, suited for critical alerts or emphatic confirmations.',
    tags: ["Bold","Rigid","Impulses","Impulse"],
    duration: 0,
    image: MaxImpactImage,
    play: Presets.MaxImpact,
  },
  {
    name: 'MutedImpact',
    description: 'A mid-strength impulse with low sharpness that feels muted and rounded — suitable for understated feedback that still has noticeable weight.',
    tags: ["Substantial","Soft","Impulses","Impulse"],
    duration: 0,
    image: MutedImpactImage,
    play: Presets.MutedImpact,
  },
  {
    name: 'NeutralClear',
    description: 'Two identical clean mid-intensity taps evenly spaced, ideal for neutral confirmation, pagination steps, or generic two-step UI feedback.',
    tags: ["Substantial","Flexible","Bumps","Extended"],
    duration: 280,
    image: NeutralClearImage,
    play: Presets.NeutralClear,
  },
  {
    name: 'NeutralSteady',
    description: 'Three evenly spaced, balanced taps with no emotional charge, suitable for neutral status updates or steady-state notifications.',
    tags: ["Substantial","Flexible","Pattern","Long"],
    duration: 1050,
    image: NeutralSteadyImage,
    play: Presets.NeutralSteady,
  },
  {
    name: 'NewMessage',
    description: 'Two ascending taps with the second slightly stronger and sharper, ideal for friendly message arrival or chat notification feedback.',
    tags: ["Substantial","Flexible","Bumps","Extended"],
    duration: 380,
    image: NewMessageImage,
    play: Presets.NewMessage,
  },
  {
    name: 'Notification',
    description: 'A gentle double tap with a softer second hit that politely announces an incoming notification without being intrusive.',
    tags: ["Substantial","Flexible","Bumps","Short"],
    duration: 180,
    image: NotificationImage,
    play: Presets.Notification,
  },
  {
    name: 'NotificationKnock',
    description: 'A discrete two-tap notification using only impulse events, delivering a clean double-knock that announces an alert with minimal continuous vibration.',
    tags: ["Substantial","Flexible","Bumps","Short"],
    duration: 120,
    image: NotificationKnockImage,
    play: Presets.NotificationKnock,
  },
  {
    name: 'NotificationUrgent',
    description: 'Three rapid identical high-intensity sharp taps that are impossible to ignore, ideal for critical alerts or urgent notifications requiring immediate attention.',
    tags: ["Bold","Rigid","Bumps","Extended"],
    duration: 265,
    image: NotificationUrgentImage,
    play: Presets.NotificationUrgent,
  },
  {
    name: 'NotifyInfoStandard',
    description: 'Two identical clean mid-intensity taps at a neutral frequency, ideal as the baseline double-tap for informational notifications.',
    tags: ["Substantial","Flexible","Bumps","Short"],
    duration: 215,
    image: NotifyInfoStandardImage,
    play: Presets.NotifyInfoStandard,
  },
  {
    name: 'NotifyReminderFinal',
    description: 'A strong initial impact that sustains then decays before a softer follow-up pulse, ideal for urgent last-call reminder or deadline-critical alerts.',
    tags: ["Bold","Flexible","Bumps","Extended"],
    duration: 550,
    image: NotifyReminderFinalImage,
    play: Presets.NotifyReminderFinal,
  },
  {
    name: 'NotifyReminderNudge',
    description: 'A gentle first tap followed after a pause by a slightly firmer second tap, ideal for soft reminder nudges that escalate attention without urgency.',
    tags: ["Substantial","Flexible","Bumps","Extended"],
    duration: 425,
    image: NotifyReminderNudgeImage,
    play: Presets.NotifyReminderNudge,
  },
  {
    name: 'NotifyReminderSoft',
    description: 'A gentle, warm tap that fades softly, providing a polite and non-disruptive nudge for reminders or low-priority notifications.',
    tags: ["Substantial","Flexible","Ramp","Short"],
    duration: 180,
    image: NotifyReminderSoftImage,
    play: Presets.NotifyReminderSoft,
  },
  {
    name: 'NotifySocialMention',
    description: 'Three quick firm taps with the final one slightly stronger, ideal for social mention or tag notifications where someone specifically called your attention.',
    tags: ["Substantial","Flexible","Bumps","Extended"],
    duration: 280,
    image: NotifySocialMentionImage,
    play: Presets.NotifySocialMention,
  },
  {
    name: 'NotifySocialMessage',
    description: 'Two ascending taps with rising sharpness, giving a warm personal feel ideal for direct messages or social notifications from contacts.',
    tags: ["Substantial","Flexible","Bumps","Extended"],
    duration: 360,
    image: NotifySocialMessageImage,
    play: Presets.NotifySocialMessage,
  },
  {
    name: 'NotifySuccessSubtle',
    description: 'Two ascending taps where the second is slightly higher in amplitude and frequency, conveying quiet satisfaction on a successful operation without drawing too much attention.',
    tags: ["Substantial","Flexible","Bumps","Short"],
    duration: 210,
    image: NotifySuccessSubtleImage,
    play: Presets.NotifySuccessSubtle,
  },
  {
    name: 'NotifyTimerDone',
    description: 'Three evenly paced taps in a 1-2-3 rhythm with the final one stronger and longer, ideal for timer completion or countdown-finished alerts.',
    tags: ["Bold","Flexible","Bumps","Long"],
    duration: 680,
    image: NotifyTimerDoneImage,
    play: Presets.NotifyTimerDone,
  },
  {
    name: 'NotifyWarnMild',
    description: 'A firm initial tap followed by a softer echo, ideal for mild warnings or gentle attention-drawing notifications that do not require immediate action.',
    tags: ["Substantial","Flexible","Bumps","Extended"],
    duration: 290,
    image: NotifyWarnMildImage,
    play: Presets.NotifyWarnMild,
  },
  {
    name: 'NotifyWarnModerate',
    description: 'Three evenly spaced firm taps of equal intensity, conveying a measured urgency ideal for moderate warnings that require a response but not panic.',
    tags: ["Bold","Flexible","Bumps","Extended"],
    duration: 438,
    image: NotifyWarnModerateImage,
    play: Presets.NotifyWarnModerate,
  },
  {
    name: 'PassingCar',
    description: 'A smooth Doppler-like swell that rises from silence to a peak then gradually fades, ideal for vehicle pass-by or motion-blur effects.',
    tags: ["Bold","Flexible","Bump","Long"],
    duration: 1100,
    image: PassingCarImage,
    play: Presets.PassingCar,
  },
  {
    name: 'Pendulum',
    description: 'Rhythmic swinging oscillations that gradually fade away, evoking the natural deceleration of a pendulum coming to rest.',
    tags: ["Substantial","Flexible","Bumps","Long"],
    duration: 2400,
    image: PendulumImage,
    play: Presets.Pendulum,
  },
  {
    name: 'PowerDown',
    description: 'A sustained vibration that steadily slows and diminishes like an engine spinning down to a halt, suitable for shutdown or deactivation events.',
    tags: ["Bold","Flexible","Ramp","Long"],
    duration: 1800,
    image: PowerDownImage,
    play: Presets.PowerDown,
  },
  {
    name: 'QuadBeat',
    description: 'Four bold taps alternating between mid and low frequency across a long pattern, offering varied rhythmic feedback.',
    tags: ["Bold","Flexible","Impulses","Long"],
    duration: 750,
    image: QuadBeatImage,
    play: Presets.QuadBeat,
  },
  {
    name: 'QuadRamp',
    description: 'Four taps starting bold and sharp then settling into medium soft taps, ideal for an attention-grabbing then settling pattern.',
    tags: ["Substantial","Flexible","Impulses","Extended"],
    duration: 500,
    image: QuadRampImage,
    play: Presets.QuadRamp,
  },
  {
    name: 'QuadThud',
    description: 'Four bold, consistently low-frequency taps spread across a long pattern, ideal for spaced strong soft feedback.',
    tags: ["Bold","Soft","Impulses","Long"],
    duration: 750,
    image: QuadThudImage,
    play: Presets.QuadThud,
  },
  {
    name: 'Rain',
    description: 'Irregular gentle taps of varying intensity that mimic individual raindrops falling, suitable for ambient atmospheric effects or soft ambient notifications.',
    tags: ["Gentle","Flexible","Pattern","Long"],
    duration: 950,
    image: RainImage,
    play: Presets.Rain,
  },
  {
    name: 'ReadySteadyGo',
    description: 'Three escalating strikes spaced like a countdown — each stronger and sharper than the last — building up to a maximum full-hold final impact, perfect for race-start or countdown sequences.',
    tags: ["Bold","Rigid","Pattern","Long"],
    duration: 2046,
    image: ReadySteadyGoImage,
    play: Presets.ReadySteadyGo,
  },
  {
    name: 'ReliefSigh',
    description: 'A medium intensity release that transitions from tension to calm over a long exhale, well-suited for completing a stressful task or resolving an error.',
    tags: ["Substantial","Flexible","Ramp","Long"],
    duration: 1200,
    image: ReliefSighImage,
    play: Presets.ReliefSigh,
  },
  {
    name: 'ReliefSoft',
    description: 'A gentle, soothing fade that dissolves from a soft onset to silence, conveying calm relief after a mild challenge or a successful low-stakes action.',
    tags: ["Gentle","Soft","Ramp","Long"],
    duration: 1200,
    image: ReliefSoftImage,
    play: Presets.ReliefSoft,
  },
  {
    name: 'Ripple',
    description: 'A strong initial impact followed by progressively weaker and softer waves, mimicking the ripple effect of a stone dropped in water.',
    tags: ["Bold","Flexible","Bumps","Extended"],
    duration: 420,
    image: RippleImage,
    play: Presets.Ripple,
  },
  {
    name: 'SadnessMelancholic',
    description: 'Slow, heavy beats that gradually diminish in amplitude and frequency like a fading heartache, best used to convey grief, loss, or deep sorrow.',
    tags: ["Substantial","Soft","Pattern","Long"],
    duration: 2600,
    image: SadnessMelancholicImage,
    play: Presets.SadnessMelancholic,
  },
  {
    name: 'Searching',
    description: 'A sharp ping with a long fade-out tail repeating every 600ms like a radar scan, ideal for search operations or polling animations.',
    tags: ["Substantial","Rigid","Pattern","Long"],
    duration: 2100,
    image: SearchingImage,
    play: Presets.Searching,
  },
  {
    name: 'SearchSuccess',
    description: 'Three quiet scanning pings followed by a sudden sharp burst and two triumphant echoes, conveying the satisfying moment of finding what you were looking for.',
    tags: ["Bold","Rigid","Pattern","Long"],
    duration: 2000,
    image: SearchSuccessImage,
    play: Presets.SearchSuccess,
  },
  {
    name: 'SelectionCrisp',
    description: 'A sharp, high-frequency click that delivers a precise and unambiguous selection confirmation — ideal for list items and picker controls.',
    tags: ["Substantial","Rigid","Impulses","Impulse"],
    duration: 35,
    image: SelectionCrispImage,
    play: Presets.SelectionCrisp,
  },
  {
    name: 'SelectionSnap',
    description: 'A firm snap followed by a lighter echo that conveys a locked-in selection — perfect for toggles, switches, or confirming a choice.',
    tags: ["Substantial","Flexible","Impulses","Impulse"],
    duration: 90,
    image: SelectionSnapImage,
    play: Presets.SelectionSnap,
  },
  {
    name: 'Shockwave',
    description: 'An instantaneous peak of full force that dissipates outward over nearly a second, evoking a pressure wave from a nearby explosion.',
    tags: ["Bold","Flexible","Ramp","Long"],
    duration: 800,
    image: ShockwaveImage,
    play: Presets.Shockwave,
  },
  {
    name: 'Sneezing',
    description: 'A gentle build-up through two rising taps that explodes into a strong final impact, perfectly imitating the tension-and-release sensation of a sneeze.',
    tags: ["Bold","Flexible","Pattern","Extended"],
    duration: 300,
    image: SneezingImage,
    play: Presets.Sneezing,
  },
  {
    name: 'Spark',
    description: 'Three rapid escalating pulses that snap from low to maximum intensity, ideal for electric discharge or quick-fire ignition feedback.',
    tags: ["Bold","Rigid","Bump","Short"],
    duration: 185,
    image: SparkImage,
    play: Presets.Spark,
  },
  {
    name: 'SuccessFlourish',
    description: 'A sweeping rise to a strong peak that gradually trails off with softening taps, ideal for achievement unlocked or triumphant completion feedback.',
    tags: ["Bold","Rigid","Bump","Long"],
    duration: 917,
    image: SuccessFlourishImage,
    play: Presets.SuccessFlourish,
  },
  {
    name: 'SuccessGentle',
    description: 'A soft preliminary tap that steps up to a slightly firmer confirmation pulse, ideal for subtle task completion or non-intrusive positive feedback.',
    tags: ["Substantial","Flexible","Bumps","Extended"],
    duration: 300,
    image: SuccessGentleImage,
    play: Presets.SuccessGentle,
  },
  {
    name: 'SupportSteady',
    description: 'Rhythmic, reassuring taps that slowly rise and hold like a gentle hand on the shoulder, well suited for calming or encouraging feedback.',
    tags: ["Substantial","Soft","Pattern","Long"],
    duration: 1900,
    image: SupportSteadyImage,
    play: Presets.SupportSteady,
  },
  {
    name: 'SupportStrong',
    description: 'Three confident, firm taps with trailing warmth that feel like an encouraging pat on the back, ideal for motivational confirmations or achievement feedback.',
    tags: ["Substantial","Soft","Pattern","Long"],
    duration: 900,
    image: SupportStrongImage,
    play: Presets.SupportStrong,
  },
  {
    name: 'SurpriseGasp',
    description: 'Two rapid, intense pulses like a sharp intake of breath from shock, well-suited for unexpected alerts or startling reveals.',
    tags: ["Bold","Flexible","Bumps","Extended"],
    duration: 280,
    image: SurpriseGaspImage,
    play: Presets.SurpriseGasp,
  },
  {
    name: 'Tada',
    description: 'A crescendo of six quickening taps that climax in a bold triumphant strike with a held resonance, ideal for celebrations, completions, or fanfare moments.',
    tags: ["Bold","Flexible","Pattern","Extended"],
    duration: 460,
    image: TadaImage,
    play: Presets.Tada,
  },
  {
    name: 'Thunder',
    description: 'A deep low-frequency rumble that slowly builds before erupting into a thunderous peak and then rolling off into a long resonating echo, ideal for thunderstorm or dramatic impact moments.',
    tags: ["Bold","Soft","Bump","Long"],
    duration: 2000,
    image: ThunderImage,
    play: Presets.Thunder,
  },
  {
    name: 'ThunderRoll',
    description: 'Thirteen taps escalating in frequency then fading in amplitude, forming a bold long impulse arc.',
    tags: ["Bold","Flexible","Impulses","Long"],
    duration: 670,
    image: ThunderRollImage,
    play: Presets.ThunderRoll,
  },
  {
    name: 'TickTock',
    description: 'An alternating strong-weak double tick pattern that mimics a clock\'s tick-tock rhythm, suitable for timing feedback or metronome-style interactions.',
    tags: ["Bold","Flexible","Pattern","Long"],
    duration: 1200,
    image: TickTockImage,
    play: Presets.TickTock,
  },
  {
    name: 'TideSwell',
    description: 'Fourteen medium-amplitude taps with frequency rising then falling, creating a smooth long arc of impulses.',
    tags: ["Substantial","Flexible","Impulses","Long"],
    duration: 727,
    image: TideSwellImage,
    play: Presets.TideSwell,
  },
  {
    name: 'TripleBeat',
    description: 'Three bold taps with mixed mid-to-low frequencies, creating a varied triple impulse pattern.',
    tags: ["Bold","Soft","Impulses","Short"],
    duration: 173,
    image: TripleBeatImage,
    play: Presets.TripleBeat,
  },
  {
    name: 'TripleClick',
    description: 'Three bold, consistently high-frequency sharp taps in an extended pattern for strong rigid confirmation.',
    tags: ["Bold","Rigid","Impulses","Extended"],
    duration: 398,
    image: TripleClickImage,
    play: Presets.TripleClick,
  },
  {
    name: 'TripleDecay',
    description: 'Three bold taps with descending frequency from sharp to soft, forming a varied extended triple pattern.',
    tags: ["Bold","Flexible","Impulses","Extended"],
    duration: 399,
    image: TripleDecayImage,
    play: Presets.TripleDecay,
  },
  {
    name: 'TripleDrum',
    description: 'Three bold, consistently low-frequency taps in an extended pattern, suited for strong repeated soft feedback.',
    tags: ["Bold","Soft","Impulses","Extended"],
    duration: 398,
    image: TripleDrumImage,
    play: Presets.TripleDrum,
  },
  {
    name: 'TripleEscalation',
    description: 'Three bold taps escalating in frequency, delivering a dynamic triple impulse with increasing sharpness.',
    tags: ["Bold","Flexible","Impulses","Short"],
    duration: 173,
    image: TripleEscalationImage,
    play: Presets.TripleEscalation,
  },
  {
    name: 'TripleFade',
    description: 'Three bold taps with gradually decreasing amplitude and low frequency, creating a fading triple rhythm.',
    tags: ["Bold","Soft","Impulses","Short"],
    duration: 150,
    image: TripleFadeImage,
    play: Presets.TripleFade,
  },
  {
    name: 'TripleGentleTap',
    description: 'Three medium-strength taps with low-to-mid frequency range, forming a consistent soft triple pattern.',
    tags: ["Substantial","Soft","Impulses","Short"],
    duration: 179,
    image: TripleGentleTapImage,
    play: Presets.TripleGentleTap,
  },
  {
    name: 'TripleKnock',
    description: 'Two medium taps followed by a bold sharp impulse, escalating into a strong triple confirmation pattern.',
    tags: ["Substantial","Rigid","Impulses","Short"],
    duration: 208,
    image: TripleKnockImage,
    play: Presets.TripleKnock,
  },
  {
    name: 'TriplePat',
    description: 'Three consistent medium taps with flexible frequency, offering a steady extended triple rhythm.',
    tags: ["Substantial","Flexible","Impulses","Extended"],
    duration: 231,
    image: TriplePatImage,
    play: Presets.TriplePat,
  },
  {
    name: 'TriplePulse',
    description: 'Three bold taps with mixed high-mid-high frequency, creating a strong extended triple pattern with varied sharpness.',
    tags: ["Bold","Rigid","Impulses","Extended"],
    duration: 399,
    image: TriplePulseImage,
    play: Presets.TriplePulse,
  },
  {
    name: 'TripleStrike',
    description: 'Three bold taps with descending frequency from rigid to soft, suitable for a firm triple-tap confirmation.',
    tags: ["Bold","Flexible","Impulses","Short"],
    duration: 181,
    image: TripleStrikeImage,
    play: Presets.TripleStrike,
  },
  {
    name: 'TripleSurge',
    description: 'Two medium flexible taps followed by a bold soft impulse, forming an escalating triple pattern.',
    tags: ["Substantial","Flexible","Impulses","Short"],
    duration: 202,
    image: TripleSurgeImage,
    play: Presets.TripleSurge,
  },
  {
    name: 'TripleTap',
    description: 'Three bold, sharp high-frequency taps delivering a crisp triple-confirmation pattern.',
    tags: ["Bold","Rigid","Impulses","Short"],
    duration: 150,
    image: TripleTapImage,
    play: Presets.TripleTap,
  },
  {
    name: 'TripleThud',
    description: 'Three bold, low-frequency taps in a steady triple pattern suited for strong but soft rhythmic feedback.',
    tags: ["Bold","Soft","Impulses","Short"],
    duration: 150,
    image: TripleThudImage,
    play: Presets.TripleThud,
  },
  {
    name: 'Victory',
    description: 'A building fanfare of rising taps that peaks in three powerful repeated strikes, conveying triumph and achievement for major success moments.',
    tags: ["Bold","Flexible","Pattern","Long"],
    duration: 1100,
    image: VictoryImage,
    play: Presets.Victory,
  },
  {
    name: 'Vomiting',
    description: 'A quick ramp to a strong peak followed by a slow low-frequency decay, ideal for disgust reactions or sudden forceful expulsion moments.',
    tags: ["Bold","Flexible","Bump","Extended"],
    duration: 380,
    image: VomitingImage,
    play: Presets.Vomiting,
  },
  {
    name: 'Vortex',
    description: 'An exponentially accelerating spiral that pulls from a whisper to a full-force peak before snapping off, ideal for black-hole pull or draining funnel effects.',
    tags: ["Bold","Rigid","Bump","Long"],
    duration: 1400,
    image: VortexImage,
    play: Presets.Vortex,
  },
  {
    name: 'WarningPulse',
    description: 'A strong sharp strike followed by a softer echo like an accelerated heartbeat, ideal for warning alerts or pre-danger tension feedback.',
    tags: ["Bold","Flexible","Bumps","Short"],
    duration: 230,
    image: WarningPulseImage,
    play: Presets.WarningPulse,
  },
  {
    name: 'WarningSoft',
    description: 'A single, composed pulse that tapers off cleanly, delivering a subtle heads-up for non-critical warnings without interrupting the user.',
    tags: ["Substantial","Flexible","Ramp","Short"],
    duration: 200,
    image: WarningSoftImage,
    play: Presets.WarningSoft,
  },
  {
    name: 'WarningUrgent',
    description: 'Four rapid uniform bold taps delivered in quick succession, demanding immediate user attention ideal for critical warnings or emergency alerts.',
    tags: ["Bold","Rigid","Bumps","Extended"],
    duration: 430,
    image: WarningUrgentImage,
    play: Presets.WarningUrgent,
  },
  {
    name: 'Waterfall',
    description: 'Seven bold taps with rapidly decreasing frequency, transitioning from sharp to soft across an extended pattern.',
    tags: ["Bold","Flexible","Impulses","Extended"],
    duration: 309,
    image: WaterfallImage,
    play: Presets.Waterfall,
  },
  {
    name: 'Woodpecker',
    description: 'Ten evenly-spaced, hard taps at constant amplitude and high frequency, like rapid machine-like pecking, suitable for mechanical or repetitive action feedback.',
    tags: ["Substantial","Rigid","Solid","Extended"],
    duration: 460,
    image: WoodpeckerImage,
    play: Presets.Woodpecker,
  },
  {
    name: 'ZeldaChest',
    description: 'A rapid four-note ascending arpeggio with escalating amplitude followed by a long sustained triumphant hold, evoking the classic treasure chest discovery moment.',
    tags: ["Bold","Flexible","Pattern","Long"],
    duration: 1180,
    image: ZeldaChestImage,
    play: Presets.ZeldaChest,
  },
  {
    name: 'Zipper',
    description: 'A quiet, steady buzz punctuated by evenly-spaced ticks that ends with a final snap, mimicking the sensation of pulling a zipper closed.',
    tags: ["Gentle","Flexible","Solid","Extended"],
    duration: 460,
    image: ZipperImage,
    play: Presets.Zipper,
  },
// CODEGEN_END_{presets}
];