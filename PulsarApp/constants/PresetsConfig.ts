import { Presets } from "react-native-pulsar";
import { PresetProps } from "./types";

// CODEGEN_BEGIN_{imports}
const AfterglowImage = require('@/assets/presets/Afterglow.png');
const AftershockImage = require('@/assets/presets/Aftershock.png');
const AlarmImage = require('@/assets/presets/Alarm.png');
const AnvilImage = require('@/assets/presets/Anvil.png');
const ApplauseImage = require('@/assets/presets/Applause.png');
const AscentImage = require('@/assets/presets/Ascent.png');
const BalloonPopImage = require('@/assets/presets/BalloonPop.png');
const BarrageImage = require('@/assets/presets/Barrage.png');
const BassDropImage = require('@/assets/presets/BassDrop.png');
const BatterImage = require('@/assets/presets/Batter.png');
const BellTollImage = require('@/assets/presets/BellToll.png');
const BlipImage = require('@/assets/presets/Blip.png');
const BloomImage = require('@/assets/presets/Bloom.png');
const BongoImage = require('@/assets/presets/Bongo.png');
const BoulderImage = require('@/assets/presets/Boulder.png');
const BreakingWaveImage = require('@/assets/presets/BreakingWave.png');
const BreathImage = require('@/assets/presets/Breath.png');
const BreathingImage = require('@/assets/presets/Breathing.png');
const BuildupImage = require('@/assets/presets/Buildup.png');
const BurstImage = require('@/assets/presets/Burst.png');
const BuzzImage = require('@/assets/presets/Buzz.png');
const CadenceImage = require('@/assets/presets/Cadence.png');
const CameraShutterImage = require('@/assets/presets/CameraShutter.png');
const CanterImage = require('@/assets/presets/Canter.png');
const CascadeImage = require('@/assets/presets/Cascade.png');
const CastanetsImage = require('@/assets/presets/Castanets.png');
const CatPawImage = require('@/assets/presets/CatPaw.png');
const ChargeImage = require('@/assets/presets/Charge.png');
const ChimeImage = require('@/assets/presets/Chime.png');
const ChipImage = require('@/assets/presets/Chip.png');
const ChirpImage = require('@/assets/presets/Chirp.png');
const ClamorImage = require('@/assets/presets/Clamor.png');
const ClaspImage = require('@/assets/presets/Clasp.png');
const CleaveImage = require('@/assets/presets/Cleave.png');
const CoilImage = require('@/assets/presets/Coil.png');
const CoinDropImage = require('@/assets/presets/CoinDrop.png');
const CombinationLockImage = require('@/assets/presets/CombinationLock.png');
const CrescendoImage = require('@/assets/presets/Crescendo.png');
const DewdropImage = require('@/assets/presets/Dewdrop.png');
const DirgeImage = require('@/assets/presets/Dirge.png');
const DissolveImage = require('@/assets/presets/Dissolve.png');
const DogBarkImage = require('@/assets/presets/DogBark.png');
const DroneImage = require('@/assets/presets/Drone.png');
const EngineRevImage = require('@/assets/presets/EngineRev.png');
const ExhaleImage = require('@/assets/presets/Exhale.png');
const ExplosionImage = require('@/assets/presets/Explosion.png');
const FadeOutImage = require('@/assets/presets/FadeOut.png');
const FanfareImage = require('@/assets/presets/Fanfare.png');
const FeatherImage = require('@/assets/presets/Feather.png');
const FinaleImage = require('@/assets/presets/Finale.png');
const FingerDrumImage = require('@/assets/presets/FingerDrum.png');
const FirecrackerImage = require('@/assets/presets/Firecracker.png');
const FizzImage = require('@/assets/presets/Fizz.png');
const FlareImage = require('@/assets/presets/Flare.png');
const FlickImage = require('@/assets/presets/Flick.png');
const FlinchImage = require('@/assets/presets/Flinch.png');
const FlourishImage = require('@/assets/presets/Flourish.png');
const FlurryImage = require('@/assets/presets/Flurry.png');
const FlushImage = require('@/assets/presets/Flush.png');
const GallopImage = require('@/assets/presets/Gallop.png');
const GavelImage = require('@/assets/presets/Gavel.png');
const GlitchImage = require('@/assets/presets/Glitch.png');
const GuitarStrumImage = require('@/assets/presets/GuitarStrum.png');
const HailImage = require('@/assets/presets/Hail.png');
const HammerImage = require('@/assets/presets/Hammer.png');
const HeartbeatImage = require('@/assets/presets/Heartbeat.png');
const HeraldImage = require('@/assets/presets/Herald.png');
const HoofBeatImage = require('@/assets/presets/HoofBeat.png');
const IgnitionImage = require('@/assets/presets/Ignition.png');
const ImpactImage = require('@/assets/presets/Impact.png');
const JoltImage = require('@/assets/presets/Jolt.png');
const KeyboardMechanicalImage = require('@/assets/presets/KeyboardMechanical.png');
const KeyboardMembraneImage = require('@/assets/presets/KeyboardMembrane.png');
const KnellImage = require('@/assets/presets/Knell.png');
const KnockImage = require('@/assets/presets/Knock.png');
const LamentImage = require('@/assets/presets/Lament.png');
const LatchImage = require('@/assets/presets/Latch.png');
const LighthouseImage = require('@/assets/presets/Lighthouse.png');
const LiltImage = require('@/assets/presets/Lilt.png');
const LockImage = require('@/assets/presets/Lock.png');
const LopeImage = require('@/assets/presets/Lope.png');
const MarchImage = require('@/assets/presets/March.png');
const MetronomeImage = require('@/assets/presets/Metronome.png');
const MurmurImage = require('@/assets/presets/Murmur.png');
const NudgeImage = require('@/assets/presets/Nudge.png');
const PassingCarImage = require('@/assets/presets/PassingCar.png');
const PatterImage = require('@/assets/presets/Patter.png');
const PealImage = require('@/assets/presets/Peal.png');
const PeckImage = require('@/assets/presets/Peck.png');
const PendulumImage = require('@/assets/presets/Pendulum.png');
const PingImage = require('@/assets/presets/Ping.png');
const PipImage = require('@/assets/presets/Pip.png');
const PistonImage = require('@/assets/presets/Piston.png');
const PlinkImage = require('@/assets/presets/Plink.png');
const PlummetImage = require('@/assets/presets/Plummet.png');
const PlunkImage = require('@/assets/presets/Plunk.png');
const PokeImage = require('@/assets/presets/Poke.png');
const PoundImage = require('@/assets/presets/Pound.png');
const PowerDownImage = require('@/assets/presets/PowerDown.png');
const PropelImage = require('@/assets/presets/Propel.png');
const PulseImage = require('@/assets/presets/Pulse.png');
const PummelImage = require('@/assets/presets/Pummel.png');
const PushImage = require('@/assets/presets/Push.png');
const RadarImage = require('@/assets/presets/Radar.png');
const RainImage = require('@/assets/presets/Rain.png');
const RampImage = require('@/assets/presets/Ramp.png');
const RapImage = require('@/assets/presets/Rap.png');
const RatchetImage = require('@/assets/presets/Ratchet.png');
const ReboundImage = require('@/assets/presets/Rebound.png');
const RippleImage = require('@/assets/presets/Ripple.png');
const RivetImage = require('@/assets/presets/Rivet.png');
const RustleImage = require('@/assets/presets/Rustle.png');
const ShockwaveImage = require('@/assets/presets/Shockwave.png');
const SnapImage = require('@/assets/presets/Snap.png');
const SonarImage = require('@/assets/presets/Sonar.png');
const SparkImage = require('@/assets/presets/Spark.png');
const SpinImage = require('@/assets/presets/Spin.png');
const StaggerImage = require('@/assets/presets/Stagger.png');
const StampImage = require('@/assets/presets/Stamp.png');
const StampedeImage = require('@/assets/presets/Stampede.png');
const StompImage = require('@/assets/presets/Stomp.png');
const StoneSkipImage = require('@/assets/presets/StoneSkip.png');
const StrikeImage = require('@/assets/presets/Strike.png');
const SummonImage = require('@/assets/presets/Summon.png');
const SurgeImage = require('@/assets/presets/Surge.png');
const SwayImage = require('@/assets/presets/Sway.png');
const SweepImage = require('@/assets/presets/Sweep.png');
const SwellImage = require('@/assets/presets/Swell.png');
const SyncopateImage = require('@/assets/presets/Syncopate.png');
const ThrobImage = require('@/assets/presets/Throb.png');
const ThudImage = require('@/assets/presets/Thud.png');
const ThumpImage = require('@/assets/presets/Thump.png');
const ThunderImage = require('@/assets/presets/Thunder.png');
const ThunderRollImage = require('@/assets/presets/ThunderRoll.png');
const TickTockImage = require('@/assets/presets/TickTock.png');
const TidalSurgeImage = require('@/assets/presets/TidalSurge.png');
const TideSwellImage = require('@/assets/presets/TideSwell.png');
const TremorImage = require('@/assets/presets/Tremor.png');
const TriggerImage = require('@/assets/presets/Trigger.png');
const TriumphImage = require('@/assets/presets/Triumph.png');
const TrumpetImage = require('@/assets/presets/Trumpet.png');
const TypewriterImage = require('@/assets/presets/Typewriter.png');
const UnfurlImage = require('@/assets/presets/Unfurl.png');
const VortexImage = require('@/assets/presets/Vortex.png');
const WaneImage = require('@/assets/presets/Wane.png');
const WarDrumImage = require('@/assets/presets/WarDrum.png');
const WaterfallImage = require('@/assets/presets/Waterfall.png');
const WaveImage = require('@/assets/presets/Wave.png');
const WispImage = require('@/assets/presets/Wisp.png');
const WobbleImage = require('@/assets/presets/Wobble.png');
const WoodpeckerImage = require('@/assets/presets/Woodpecker.png');
const ZipperImage = require('@/assets/presets/Zipper.png');
// CODEGEN_END_{imports}

export const PresetsConfig: Array<PresetProps> = [
// CODEGEN_BEGIN_{presets}
  {
    name: 'Afterglow',
    description: 'A three-beat phrase that dissolves gently, ideal for soft endings or gradually quieting feedback.',
    tags: ["Bold","Soft","Impulses","Short"],
    duration: 150,
    image: AfterglowImage,
    play: Presets.Afterglow,
  },
  {
    name: 'Aftershock',
    description: 'A firm opening that settles calmly, ideal for transitions needing a strong start and a gentle finish.',
    tags: ["Substantial","Flexible","Impulses","Extended"],
    duration: 500,
    image: AftershockImage,
    play: Presets.Aftershock,
  },
  {
    name: 'Alarm',
    description: 'Relentless and urgent, best for critical errors or emergencies that require immediate attention.',
    tags: ["Bold","Rigid","Pattern","Extended"],
    duration: 1130,
    image: AlarmImage,
    play: Presets.Alarm,
  },
  {
    name: 'Anvil',
    description: 'The full weight of a massive collision, conveys sheer physical force and momentum.',
    tags: ["Bold","Soft","Ramp","Extended"],
    duration: 500,
    image: AnvilImage,
    play: Presets.Anvil,
  },
  {
    name: 'Applause',
    description: 'A growing wave of appreciation, ideal for celebratory moments or social approval.',
    tags: ["Substantial","Flexible","Solid","Long"],
    duration: 1564,
    image: ApplauseImage,
    play: Presets.Applause,
  },
  {
    name: 'Ascent',
    description: 'The rush of leveling up, evoking the classic RPG reward of growth and progression.',
    tags: ["Bold","Flexible","Pattern","Long"],
    duration: 2400,
    image: AscentImage,
    play: Presets.Ascent,
  },
  {
    name: 'BalloonPop',
    description: 'Mounting suspense that bursts into release, perfect for countdowns or suspenseful reveals.',
    tags: ["Substantial","Flexible","Bumps","Long"],
    duration: 1700,
    image: BalloonPopImage,
    play: Presets.BalloonPop,
  },
  {
    name: 'Barrage',
    description: 'An overwhelming storm of rapid impacts, suited for maxing out a meter or total sensory overload moments.',
    tags: ["Bold","Rigid","Impulses","Extended"],
    duration: 309,
    image: BarrageImage,
    play: Presets.Barrage,
  },
  {
    name: 'BassDrop',
    description: 'Two grounded thumps with a tonal descent, suited for distinct double-confirmation feedback.',
    tags: ["Bold","Soft","Impulses","Impulse"],
    duration: 71,
    image: BassDropImage,
    play: Presets.BassDrop,
  },
  {
    name: 'Batter',
    description: 'An unrestrained explosion of rage, suited for catastrophic errors or total loss of control.',
    tags: ["Bold","Flexible","Saw","Extended"],
    duration: 380,
    image: BatterImage,
    play: Presets.Batter,
  },
  {
    name: 'BellToll',
    description: 'Three notes that soften as they land, suited for closing interactions or softening after a strong start.',
    tags: ["Bold","Flexible","Impulses","Extended"],
    duration: 399,
    image: BellTollImage,
    play: Presets.BellToll,
  },
  {
    name: 'Blip',
    description: 'A composed, subtle heads-up, ideal for non-critical warnings that should not interrupt the user.',
    tags: ["Gentle","Flexible","Peak","Short"],
    duration: 200,
    image: BlipImage,
    play: Presets.Blip,
  },
  {
    name: 'Bloom',
    description: 'A quiet confirmation of completion, ideal for subtle task completions or non-intrusive positive reinforcement.',
    tags: ["Gentle","Flexible","Bumps","Extended"],
    duration: 300,
    image: BloomImage,
    play: Presets.Bloom,
  },
  {
    name: 'Bongo',
    description: 'Two balanced bursts of three, suited for structured multi-step or paired sequence feedback.',
    tags: ["Substantial","Flexible","Impulses","Extended"],
    duration: 451,
    image: BongoImage,
    play: Presets.Bongo,
  },
  {
    name: 'Boulder',
    description: 'Deep and weighty without sharpness, great for heavy object impacts or grounded confirmation feedback.',
    tags: ["Bold","Soft","Impulses","Impulse"],
    duration: 0,
    image: BoulderImage,
    play: Presets.Boulder,
  },
  {
    name: 'BreakingWave',
    description: 'Two measured steps leading into a stronger landing, ideal for escalating confirmations or staged actions.',
    tags: ["Substantial","Flexible","Impulses","Short"],
    duration: 202,
    image: BreakingWaveImage,
    play: Presets.BreakingWave,
  },
  {
    name: 'Breath',
    description: 'Slow, calming in-and-out rhythm, ideal for meditation guides or breathing exercises.',
    tags: ["Substantial","Soft","Bumps","Long"],
    duration: 3200,
    image: BreathImage,
    play: Presets.Breath,
  },
  {
    name: 'Breathing',
    description: 'Calm and unobtrusive, ideal for background processing that should not disturb the user.',
    tags: ["Substantial","Soft","Bumps","Long"],
    duration: 6000,
    image: BreathingImage,
    play: Presets.Breathing,
  },
  {
    name: 'Buildup',
    description: 'An energizing crescendo of rising intensity, ideal for charging actions or building anticipation.',
    tags: ["Bold","Flexible","Impulses","Extended"],
    duration: 309,
    image: BuildupImage,
    play: Presets.Buildup,
  },
  {
    name: 'Burst',
    description: 'The tension-and-release of a sneeze, imitates the involuntary build and explosion.',
    tags: ["Bold","Flexible","Peak","Extended"],
    duration: 300,
    image: BurstImage,
    play: Presets.Burst,
  },
  {
    name: 'Buzz',
    description: 'An unmistakable hard rejection, suited for critical errors, access denied, or blocked actions.',
    tags: ["Bold","Rigid","Ramp","Extended"],
    duration: 350,
    image: BuzzImage,
    play: Presets.Buzz,
  },
  {
    name: 'Cadence',
    description: 'A natural two-beat rhythm with a subtle textural shift, suitable for double-tap confirmations.',
    tags: ["Bold","Rigid","Impulses","Short"],
    duration: 199,
    image: CadenceImage,
    play: Presets.Cadence,
  },
  {
    name: 'CameraShutter',
    description: 'The satisfying click of capturing a moment, ideal for photo capture or scan confirmation.',
    tags: ["Substantial","Rigid","Impulses","Short"],
    duration: 150,
    image: CameraShutterImage,
    play: Presets.CameraShutter,
  },
  {
    name: 'Canter',
    description: 'A three-beat rhythm with natural variation, suited for multi-step feedback where each step has character.',
    tags: ["Bold","Soft","Impulses","Short"],
    duration: 173,
    image: CanterImage,
    play: Presets.Canter,
  },
  {
    name: 'Cascade',
    description: 'A long sequence that unwinds from intensity to calm, ideal for complex multi-phase transitions or step-by-step completions.',
    tags: ["Substantial","Flexible","Impulses","Long"],
    duration: 1863,
    image: CascadeImage,
    play: Presets.Cascade,
  },
  {
    name: 'Castanets',
    description: 'A crisp, decisive pair of sharp taps, ideal for double-confirmation or back-to-back interaction feedback.',
    tags: ["Bold","Rigid","Impulses","Short"],
    duration: 199,
    image: CastanetsImage,
    play: Presets.Castanets,
  },
  {
    name: 'CatPaw',
    description: 'A calm, warm pair of taps, ideal for gentle confirmations or soft paired acknowledgements.',
    tags: ["Substantial","Soft","Impulses","Impulse"],
    duration: 75,
    image: CatPawImage,
    play: Presets.CatPaw,
  },
  {
    name: 'Charge',
    description: 'The electric buildup of a countdown, perfect for race starts or any go moment.',
    tags: ["Bold","Rigid","Pattern","Long"],
    duration: 2046,
    image: ChargeImage,
    play: Presets.Charge,
  },
  {
    name: 'Chime',
    description: 'A warm, friendly double-tap, ideal for incoming messages or chat notifications.',
    tags: ["Substantial","Flexible","Bumps","Extended"],
    duration: 380,
    image: ChimeImage,
    play: Presets.Chime,
  },
  {
    name: 'Chip',
    description: 'Sharp, authoritative, and precise, suited for confirmations that demand clarity and definition.',
    tags: ["Substantial","Rigid","Impulses","Impulse"],
    duration: 0,
    image: ChipImage,
    play: Presets.Chip,
  },
  {
    name: 'Chirp',
    description: 'Light-hearted and cheerful, ideal for positive micro-interactions or small wins.',
    tags: ["Gentle","Flexible","Saw","Extended"],
    duration: 360,
    image: ChirpImage,
    play: Presets.Chirp,
  },
  {
    name: 'Clamor',
    description: 'Impossible to ignore, suited for critical warnings, emergency alerts, or safety-critical states.',
    tags: ["Bold","Flexible","Saw","Extended"],
    duration: 430,
    image: ClamorImage,
    play: Presets.Clamor,
  },
  {
    name: 'Clasp',
    description: 'The satisfying snap of acquiring a target, ideal for lock-on, cursor snap-to, or radar acquisition.',
    tags: ["Bold","Rigid","Impulses","Short"],
    duration: 220,
    image: ClaspImage,
    play: Presets.Clasp,
  },
  {
    name: 'Cleave',
    description: 'Signals an irreversible, high-stakes action for deletes, removes, or anything the user cannot undo.',
    tags: ["Bold","Rigid","Impulses","Bumps","Short"],
    duration: 250,
    image: CleaveImage,
    play: Presets.Cleave,
  },
  {
    name: 'Coil',
    description: 'Rising tension that releases into certainty, ideal for long-press activation or charge-complete feedback.',
    tags: ["Substantial","Flexible","Peak","Long"],
    duration: 650,
    image: CoilImage,
    play: Presets.Coil,
  },
  {
    name: 'CoinDrop',
    description: 'A playful cascade of coins, ideal for reward moments, payment confirmations, or in-app purchases.',
    tags: ["Bold","Rigid","Saw","Extended"],
    duration: 675,
    image: CoinDropImage,
    play: Presets.CoinDrop,
  },
  {
    name: 'CombinationLock',
    description: 'The ritual of cracking a code, ideal for combination inputs or multi-step secure unlocking.',
    tags: ["Bold","Rigid","Saw","Long"],
    duration: 980,
    image: CombinationLockImage,
    play: Presets.CombinationLock,
  },
  {
    name: 'Crescendo',
    description: 'A rising build that peaks with energy, ideal for charge-up moments or building anticipation.',
    tags: ["Substantial","Rigid","Impulses","Long"],
    duration: 601,
    image: CrescendoImage,
    play: Presets.Crescendo,
  },
  {
    name: 'Dewdrop',
    description: 'A quiet confirmation of success, ideal for operations that completed without needing attention.',
    tags: ["Substantial","Flexible","Bumps","Short"],
    duration: 210,
    image: DewdropImage,
    play: Presets.Dewdrop,
  },
  {
    name: 'Dirge',
    description: 'Heavy and fading like a dying heartache, best for conveying grief, loss, or deep sorrow.',
    tags: ["Substantial","Soft","Pattern","Long"],
    duration: 2600,
    image: DirgeImage,
    play: Presets.Dirge,
  },
  {
    name: 'Dissolve',
    description: 'A gentle, soothing fade, ideal for calm relief after a mild challenge or successful low-stakes action.',
    tags: ["Gentle","Soft","Ramp","Long"],
    duration: 1200,
    image: DissolveImage,
    play: Presets.Dissolve,
  },
  {
    name: 'DogBark',
    description: 'Two forceful low bursts like a sharp bark, ideal for alert sounds or short punchy notification moments.',
    tags: ["Bold","Soft","Bumps","Extended"],
    duration: 500,
    image: DogBarkImage,
    play: Presets.DogBark,
  },
  {
    name: 'Drone',
    description: 'Flat and going nowhere, communicates idle waiting, disengagement, or nothing happening.',
    tags: ["Gentle","Flexible","Pattern","Long"],
    duration: 1780,
    image: DroneImage,
    play: Presets.Drone,
  },
  {
    name: 'EngineRev',
    description: 'The thrill of revving to full throttle, ideal for racing games or mechanical acceleration feedback.',
    tags: ["Bold","Flexible","Bumps","Long"],
    duration: 1800,
    image: EngineRevImage,
    play: Presets.EngineRev,
  },
  {
    name: 'Exhale',
    description: 'Tension releasing into calm, ideal for completing a stressful task or resolving an error.',
    tags: ["Substantial","Flexible","Ramp","Long"],
    duration: 1200,
    image: ExhaleImage,
    play: Presets.Exhale,
  },
  {
    name: 'Explosion',
    description: 'A catastrophic detonation that echoes into rumble, ideal for game destruction events or dramatic impacts.',
    tags: ["Bold","Soft","Ramp","Long"],
    duration: 1000,
    image: ExplosionImage,
    play: Presets.Explosion,
  },
  {
    name: 'FadeOut',
    description: 'A graceful drift toward silence, ideal for dismissals or transitions that should feel calm and natural.',
    tags: ["Substantial","Flexible","Impulses","Extended"],
    duration: 506,
    image: FadeOutImage,
    play: Presets.FadeOut,
  },
  {
    name: 'Fanfare',
    description: 'A short burst of triumph, ideal for achievement unlocked, rank-ups, or moments that deserve a cheer.',
    tags: ["Bold","Rigid","Bumps","Extended"],
    duration: 580,
    image: FanfareImage,
    play: Presets.Fanfare,
  },
  {
    name: 'Feather',
    description: 'A gentle, non-disruptive nudge, ideal for low-priority reminders.',
    tags: ["Substantial","Flexible","Ramp","Short"],
    duration: 180,
    image: FeatherImage,
    play: Presets.Feather,
  },
  {
    name: 'Finale',
    description: 'A countdown that closes with emphasis, ideal for timer completions or countdown-finished alerts.',
    tags: ["Bold","Flexible","Bumps","Long"],
    duration: 680,
    image: FinaleImage,
    play: Presets.Finale,
  },
  {
    name: 'FingerDrum',
    description: 'Three casual, even taps, ideal for low-key acknowledgements or non-urgent rhythm patterns.',
    tags: ["Substantial","Flexible","Impulses","Extended"],
    duration: 231,
    image: FingerDrumImage,
    play: Presets.FingerDrum,
  },
  {
    name: 'Firecracker',
    description: 'Two maximum-force strikes demanding immediate response, suited for urgent double-confirmations or critical alerts.',
    tags: ["Bold","Rigid","Impulses","Impulse"],
    duration: 75,
    image: FirecrackerImage,
    play: Presets.Firecracker,
  },
  {
    name: 'Fizz',
    description: 'Bubbling with joy, ideal for success celebrations or upbeat positive feedback.',
    tags: ["Substantial","Rigid","Saw","Extended"],
    duration: 500,
    image: FizzImage,
    play: Presets.Fizz,
  },
  {
    name: 'Flare',
    description: 'A mind-blowing jolt, ideal for overwhelming surprise or impossible-to-believe reveals.',
    tags: ["Bold","Rigid","Peak","Extended"],
    duration: 380,
    image: FlareImage,
    play: Presets.Flare,
  },
  {
    name: 'Flick',
    description: 'A light, quick tap with minimal presence, ideal for chips, tags, and filters.',
    tags: ["Gentle","Flexible","Peak","Impulse"],
    duration: 80,
    image: FlickImage,
    play: Presets.Flick,
  },
  {
    name: 'Flinch',
    description: 'A shock to the senses, ideal for unexpected alerts or startling reveals.',
    tags: ["Bold","Flexible","Bumps","Extended"],
    duration: 280,
    image: FlinchImage,
    play: Presets.Flinch,
  },
  {
    name: 'Flourish',
    description: 'Triumphant and expansive, ideal for achievement unlocked or major task completions.',
    tags: ["Bold","Rigid","Peak","Long"],
    duration: 917,
    image: FlourishImage,
    play: Presets.Flourish,
  },
  {
    name: 'Flurry',
    description: 'The thrill of a combo streak, ideal for hit combos, chain multipliers, or rapid-fire scoring.',
    tags: ["Bold","Rigid","Bumps","Extended"],
    duration: 300,
    image: FlurryImage,
    play: Presets.Flurry,
  },
  {
    name: 'Flush',
    description: 'The involuntary heave of disgust, ideal for aversion reactions or gross-out moments in playful UI contexts.',
    tags: ["Bold","Flexible","Peak","Extended"],
    duration: 380,
    image: FlushImage,
    play: Presets.Flush,
  },
  {
    name: 'Gallop',
    description: 'A natural four-beat rhythm, suited for multi-step processes or organic rhythmic feedback.',
    tags: ["Bold","Flexible","Impulses","Long"],
    duration: 750,
    image: GallopImage,
    play: Presets.Gallop,
  },
  {
    name: 'Gavel',
    description: 'Two weighty, deliberate taps, suited for decisive double-step actions or bold acknowledgement feedback.',
    tags: ["Bold","Flexible","Impulses","Short"],
    duration: 201,
    image: GavelImage,
    play: Presets.Gavel,
  },
  {
    name: 'Glitch',
    description: 'The haptic feel of a system glitching, ideal for data corruption, errors, or intentional glitch aesthetics.',
    tags: ["Bold","Rigid","Pattern","Short"],
    duration: 220,
    image: GlitchImage,
    play: Presets.Glitch,
  },
  {
    name: 'GuitarStrum',
    description: 'A rich, resonant strike that lingers, ideal for musical interactions or warm confirmation moments.',
    tags: ["Bold","Flexible","Ramp","Long"],
    duration: 1400,
    image: GuitarStrumImage,
    play: Presets.GuitarStrum,
  },
  {
    name: 'Hail',
    description: 'An unpredictable, relentless barrage, ideal for weather events or disorienting overload feedback.',
    tags: ["Gentle","Rigid","Solid","Extended"],
    duration: 430,
    image: HailImage,
    play: Presets.Hail,
  },
  {
    name: 'Hammer',
    description: 'The insistent urgency of a fist on a door, ideal for forceful alerts or escalating persistent notifications.',
    tags: ["Bold","Soft","Saw","Long"],
    duration: 1050,
    image: HammerImage,
    play: Presets.Hammer,
  },
  {
    name: 'Heartbeat',
    description: 'The familiar lub-dub of life and tension, perfect for health apps or anxious waiting moments.',
    tags: ["Substantial","Soft","Pattern","Long"],
    duration: 1000,
    image: HeartbeatImage,
    play: Presets.Heartbeat,
  },
  {
    name: 'Herald',
    description: 'Two gentle knocks building to a decisive third, ideal for staged confirmations with a clear conclusion.',
    tags: ["Substantial","Rigid","Impulses","Short"],
    duration: 208,
    image: HeraldImage,
    play: Presets.Herald,
  },
  {
    name: 'HoofBeat',
    description: 'Two warm, grounded taps, ideal for mellow double confirmations or soft paired feedback.',
    tags: ["Bold","Soft","Impulses","Short"],
    duration: 201,
    image: HoofBeatImage,
    play: Presets.HoofBeat,
  },
  {
    name: 'Ignition',
    description: 'Three beats that sharpen with each hit, ideal for staged confirmations or escalating emphasis.',
    tags: ["Bold","Flexible","Impulses","Short"],
    duration: 173,
    image: IgnitionImage,
    play: Presets.Ignition,
  },
  {
    name: 'Impact',
    description: 'The instant punch of impact, perfect for collision events or taking a hit in games.',
    tags: ["Bold","Flexible","Peak","Short"],
    duration: 200,
    image: ImpactImage,
    play: Presets.Impact,
  },
  {
    name: 'Jolt',
    description: 'The most intense hit possible, suited for critical alerts or any moment that demands absolute impact.',
    tags: ["Bold","Rigid","Impulses","Impulse"],
    duration: 0,
    image: JoltImage,
    play: Presets.Jolt,
  },
  {
    name: 'KeyboardMechanical',
    description: 'The satisfying two-stage snap of a mechanical key, great for precision typing or keyboard simulations.',
    tags: ["Gentle","Flexible","Impulses","Impulse"],
    duration: 55,
    image: KeyboardMechanicalImage,
    play: Presets.KeyboardMechanical,
  },
  {
    name: 'KeyboardMembrane',
    description: 'A soft, muffled press, best for simulating the quiet feel of a membrane keyboard.',
    tags: ["Gentle","Soft","Impulses","Short"],
    duration: 140,
    image: KeyboardMembraneImage,
    play: Presets.KeyboardMembrane,
  },
  {
    name: 'Knell',
    description: 'A commanding last-chance signal, ideal for final reminders or deadline-critical alerts.',
    tags: ["Bold","Flexible","Bumps","Extended"],
    duration: 550,
    image: KnellImage,
    play: Presets.Knell,
  },
  {
    name: 'Knock',
    description: 'A polite knock announcing arrival, ideal for gentle attention requests or non-urgent presence alerts.',
    tags: ["Substantial","Soft","Bumps","Long"],
    duration: 760,
    image: KnockImage,
    play: Presets.Knock,
  },
  {
    name: 'Lament',
    description: 'The sinking finality of defeat, captures the deflating feeling of a game-over moment.',
    tags: ["Bold","Flexible","Pattern","Long"],
    duration: 2450,
    image: LamentImage,
    play: Presets.Lament,
  },
  {
    name: 'Latch',
    description: 'The clear feel of something switching off, communicates deactivation or opting out.',
    tags: ["Substantial","Flexible","Bumps","Short"],
    duration: 230,
    image: LatchImage,
    play: Presets.Latch,
  },
  {
    name: 'Lighthouse',
    description: 'Steady and bias-free, suitable for neutral status updates or steady-state notifications.',
    tags: ["Substantial","Flexible","Pattern","Long"],
    duration: 1050,
    image: LighthouseImage,
    play: Presets.Lighthouse,
  },
  {
    name: 'Lilt',
    description: 'Warm and personal, ideal for direct messages or social notifications from people you know.',
    tags: ["Substantial","Flexible","Bumps","Extended"],
    duration: 360,
    image: LiltImage,
    play: Presets.Lilt,
  },
  {
    name: 'Lock',
    description: 'The satisfying click of locking into place, ideal for locking, latching, or secure-confirmation interactions.',
    tags: ["Substantial","Flexible","Bumps","Short"],
    duration: 220,
    image: LockImage,
    play: Presets.Lock,
  },
  {
    name: 'Lope',
    description: 'A galloping bounce with swagger, ideal for adventurous or playful UI moments.',
    tags: ["Substantial","Rigid","Pattern","Extended"],
    duration: 450,
    image: LopeImage,
    play: Presets.Lope,
  },
  {
    name: 'March',
    description: 'Like an encouraging pat on the back, ideal for motivational confirmations or achievement feedback.',
    tags: ["Substantial","Soft","Bumps","Long"],
    duration: 900,
    image: MarchImage,
    play: Presets.March,
  },
  {
    name: 'Metronome',
    description: 'Balanced and unemotional, ideal for neutral confirmations, pagination steps, or generic two-step feedback.',
    tags: ["Substantial","Flexible","Impulses","Extended"],
    duration: 280,
    image: MetronomeImage,
    play: Presets.Metronome,
  },
  {
    name: 'Murmur',
    description: 'Two soft, quiet taps, ideal for subtle double-step interactions or unobtrusive confirmations.',
    tags: ["Substantial","Soft","Impulses","Impulse"],
    duration: 80,
    image: MurmurImage,
    play: Presets.Murmur,
  },
  {
    name: 'Nudge',
    description: 'A polite, unobtrusive double tap that announces a notification without being intrusive.',
    tags: ["Substantial","Flexible","Bumps","Short"],
    duration: 180,
    image: NudgeImage,
    play: Presets.Nudge,
  },
  {
    name: 'PassingCar',
    description: 'The whoosh of something passing at speed, ideal for vehicle pass-by or motion-blur effects.',
    tags: ["Bold","Flexible","Peak","Long"],
    duration: 1100,
    image: PassingCarImage,
    play: Presets.PassingCar,
  },
  {
    name: 'Patter',
    description: 'Three mild, unforced taps, ideal for low-key acknowledgements or non-urgent triple feedback.',
    tags: ["Substantial","Soft","Impulses","Short"],
    duration: 179,
    image: PatterImage,
    play: Presets.Patter,
  },
  {
    name: 'Peal',
    description: 'Firm and measured, conveys that something needs attention soon without triggering panic.',
    tags: ["Bold","Flexible","Bumps","Extended"],
    duration: 438,
    image: PealImage,
    play: Presets.Peal,
  },
  {
    name: 'Peck',
    description: 'An ultra-short, precise tap, perfect for small icon buttons.',
    tags: ["Gentle","Flexible","Peak","Impulse"],
    duration: 28,
    image: PeckImage,
    play: Presets.Peck,
  },
  {
    name: 'Pendulum',
    description: 'A rhythmic swing that gradually settles, ideal for winding-down moments or calm settling effects.',
    tags: ["Substantial","Flexible","Bumps","Long"],
    duration: 2400,
    image: PendulumImage,
    play: Presets.Pendulum,
  },
  {
    name: 'Ping',
    description: 'A precise, definitive click, ideal for list selections or any interaction where clarity of choice matters.',
    tags: ["Substantial","Rigid","Impulses","Impulse"],
    duration: 35,
    image: PingImage,
    play: Presets.Ping,
  },
  {
    name: 'Pip',
    description: 'A light, sparkling burst, ideal for in-game collectibles or power-up feedback.',
    tags: ["Gentle","Rigid","Impulses","Impulse"],
    duration: 100,
    image: PipImage,
    play: Presets.Pip,
  },
  {
    name: 'Piston',
    description: 'Two forceful, immediate strikes, ideal for commanding double-confirmations or high-energy paired actions.',
    tags: ["Bold","Flexible","Impulses","Impulse"],
    duration: 73,
    image: PistonImage,
    play: Presets.Piston,
  },
  {
    name: 'Plink',
    description: 'A neutral heads-up suited as a baseline for informational notifications.',
    tags: ["Substantial","Flexible","Bumps","Short"],
    duration: 215,
    image: PlinkImage,
    play: Presets.Plink,
  },
  {
    name: 'Plummet',
    description: 'The terrifying pause before impact, ideal for drop effects or dramatic collision moments.',
    tags: ["Bold","Soft","Peak","Long"],
    duration: 1050,
    image: PlummetImage,
    play: Presets.Plummet,
  },
  {
    name: 'Plunk',
    description: 'Understated but present, suitable for subdued feedback that still has noticeable weight.',
    tags: ["Substantial","Soft","Impulses","Impulse"],
    duration: 0,
    image: PlunkImage,
    play: Presets.Plunk,
  },
  {
    name: 'Poke',
    description: 'Someone specifically called your name, ideal for mentions, tags, or direct-attention notifications.',
    tags: ["Substantial","Flexible","Bumps","Extended"],
    duration: 280,
    image: PokeImage,
    play: Presets.Poke,
  },
  {
    name: 'Pound',
    description: 'Impossible to ignore, ideal for critical alerts or notifications that cannot wait.',
    tags: ["Bold","Rigid","Bumps","Extended"],
    duration: 265,
    image: PoundImage,
    play: Presets.Pound,
  },
  {
    name: 'PowerDown',
    description: 'A steady deceleration to silence, communicates shutdown, power-off, or deactivation.',
    tags: ["Bold","Flexible","Ramp","Long"],
    duration: 1800,
    image: PowerDownImage,
    play: Presets.PowerDown,
  },
  {
    name: 'Propel',
    description: 'A confident forward push communicating that a form or action has been decisively submitted.',
    tags: ["Bold","Flexible","Bumps","Extended"],
    duration: 300,
    image: PropelImage,
    play: Presets.Propel,
  },
  {
    name: 'Pulse',
    description: 'A gentle, steady pulse that quietly signals ongoing activity without demanding attention.',
    tags: ["Gentle","Flexible","Bumps","Long"],
    duration: 2000,
    image: PulseImage,
    play: Presets.Pulse,
  },
  {
    name: 'Pummel',
    description: 'Escalating rage that peaks at full force, suited for blocked actions, critical failures, or frustrated moments.',
    tags: ["Bold","Rigid","Saw","Extended"],
    duration: 450,
    image: PummelImage,
    play: Presets.Pummel,
  },
  {
    name: 'Push',
    description: 'A quieter click that supports without competing, ideal for secondary actions.',
    tags: ["Gentle","Flexible","Peak","Impulse"],
    duration: 90,
    image: PushImage,
    play: Presets.Push,
  },
  {
    name: 'Radar',
    description: 'The focused sweep of active scanning, ideal for network requests or polling states.',
    tags: ["Substantial","Flexible","Pattern","Long"],
    duration: 2520,
    image: RadarImage,
    play: Presets.Radar,
  },
  {
    name: 'Rain',
    description: 'Soft and unpredictable, ideal for ambient atmospheric effects or organic ambient notifications.',
    tags: ["Gentle","Flexible","Pattern","Long"],
    duration: 950,
    image: RainImage,
    play: Presets.Rain,
  },
  {
    name: 'Ramp',
    description: 'The joy of growing stronger, ideal for level-up moments or rank promotion celebrations.',
    tags: ["Bold","Rigid","Bumps","Long"],
    duration: 650,
    image: RampImage,
    play: Presets.Ramp,
  },
  {
    name: 'Rap',
    description: 'A clean double-knock that announces an alert quietly, ideal for non-urgent in-app notifications.',
    tags: ["Substantial","Flexible","Bumps","Short"],
    duration: 120,
    image: RapImage,
    play: Presets.Rap,
  },
  {
    name: 'Ratchet',
    description: 'A firm, assertive triple beat, suited for strong confirmations or emphatic acknowledgements.',
    tags: ["Bold","Rigid","Impulses","Extended"],
    duration: 398,
    image: RatchetImage,
    play: Presets.Ratchet,
  },
  {
    name: 'Rebound',
    description: 'A strong opening that softens on the second hit, ideal for double-tap confirmations.',
    tags: ["Bold","Rigid","Impulses","Impulse"],
    duration: 80,
    image: ReboundImage,
    play: Presets.Rebound,
  },
  {
    name: 'Ripple',
    description: 'A strong hit that radiates outward in softening waves, ideal for touch ripples or impact echo effects.',
    tags: ["Bold","Flexible","Bumps","Extended"],
    duration: 420,
    image: RippleImage,
    play: Presets.Ripple,
  },
  {
    name: 'Rivet',
    description: 'Three sharp, assertive beats, suited for triple-step confirmations or high-confidence feedback.',
    tags: ["Bold","Rigid","Impulses","Short"],
    duration: 150,
    image: RivetImage,
    play: Presets.Rivet,
  },
  {
    name: 'Rustle',
    description: 'A gentle heads-up that does not demand immediate action, ideal for mild warnings.',
    tags: ["Substantial","Flexible","Bumps","Extended"],
    duration: 290,
    image: RustleImage,
    play: Presets.Rustle,
  },
  {
    name: 'Shockwave',
    description: 'The pressure wave of a nearby explosion, ideal for detonations, force fields, or dramatic impacts.',
    tags: ["Bold","Flexible","Ramp","Long"],
    duration: 800,
    image: ShockwaveImage,
    play: Presets.Shockwave,
  },
  {
    name: 'Snap',
    description: 'A firm snap that conveys a locked-in selection, perfect for toggles, switches, or confirming a choice.',
    tags: ["Substantial","Flexible","Impulses","Impulse"],
    duration: 90,
    image: SnapImage,
    play: Presets.Snap,
  },
  {
    name: 'Sonar',
    description: 'The eureka moment, ideal for conveying the satisfying rush of finding what you were looking for.',
    tags: ["Bold","Rigid","Pattern","Long"],
    duration: 2000,
    image: SonarImage,
    play: Presets.Sonar,
  },
  {
    name: 'Spark',
    description: 'The snap of electric ignition, ideal for discharge effects, ignition moments, or quick-fire activation.',
    tags: ["Bold","Rigid","Peak","Short"],
    duration: 185,
    image: SparkImage,
    play: Presets.Spark,
  },
  {
    name: 'Spin',
    description: 'A crisp, mechanical rhythm communicating repeating progress, great for looping or spinner states.',
    tags: ["Substantial","Flexible","Saw","Long"],
    duration: 1808,
    image: SpinImage,
    play: Presets.Spin,
  },
  {
    name: 'Stagger',
    description: 'Woozy and disorienting, ideal for confusion, error overload, or hit-stun effects.',
    tags: ["Substantial","Flexible","Saw","Extended"],
    duration: 320,
    image: StaggerImage,
    play: Presets.Stagger,
  },
  {
    name: 'Stamp',
    description: 'Calm and decisive, communicates acceptance without drama, suited for dialog confirmations.',
    tags: ["Substantial","Soft","Impulses","Short"],
    duration: 205,
    image: StampImage,
    play: Presets.Stamp,
  },
  {
    name: 'Stampede',
    description: 'Four deep, measured thumps, suited for grounded step-by-step confirmation feedback.',
    tags: ["Bold","Soft","Impulses","Long"],
    duration: 750,
    image: StampedeImage,
    play: Presets.Stampede,
  },
  {
    name: 'Stomp',
    description: 'Three deep, grounded beats, suitable for unhurried triple confirmations or calm rhythmic emphasis.',
    tags: ["Bold","Soft","Impulses","Short"],
    duration: 150,
    image: StompImage,
    play: Presets.Stomp,
  },
  {
    name: 'StoneSkip',
    description: 'Three firm taps with a softening finish, suited for decisive but composed triple confirmations.',
    tags: ["Bold","Flexible","Impulses","Short"],
    duration: 181,
    image: StoneSkipImage,
    play: Presets.StoneSkip,
  },
  {
    name: 'Strike',
    description: 'A confident, decisive strike that delivers a clear and satisfying response for the main call-to-action.',
    tags: ["Substantial","Flexible","Peak","Impulse"],
    duration: 80,
    image: StrikeImage,
    play: Presets.Strike,
  },
  {
    name: 'Summon',
    description: 'A commanding signal that refuses to be ignored, ideal for incoming calls or urgent attention-demand moments.',
    tags: ["Bold","Flexible","Bumps","Extended"],
    duration: 500,
    image: SummonImage,
    play: Presets.Summon,
  },
  {
    name: 'Surge',
    description: 'An irrepressible swell of delight, ideal for reaction moments or expressions of pure joy.',
    tags: ["Bold","Rigid","Saw","Extended"],
    duration: 330,
    image: SurgeImage,
    play: Presets.Surge,
  },
  {
    name: 'Sway',
    description: 'Reassuring and rhythmic, ideal for calming or encouraging feedback.',
    tags: ["Substantial","Soft","Bumps","Long"],
    duration: 1900,
    image: SwayImage,
    play: Presets.Sway,
  },
  {
    name: 'Sweep',
    description: 'The rhythmic pulse of active searching, ideal for search operations or background polling states.',
    tags: ["Substantial","Rigid","Pattern","Long"],
    duration: 2100,
    image: SweepImage,
    play: Presets.Sweep,
  },
  {
    name: 'Swell',
    description: 'A patient nudge that quietly escalates, ideal for reminders that build attention without anxiety.',
    tags: ["Substantial","Flexible","Bumps","Extended"],
    duration: 425,
    image: SwellImage,
    play: Presets.Swell,
  },
  {
    name: 'Syncopate',
    description: 'A lively three-beat rhythm with mixed texture, ideal for multi-step confirmations or animated feedback.',
    tags: ["Bold","Rigid","Impulses","Extended"],
    duration: 399,
    image: SyncopateImage,
    play: Presets.Syncopate,
  },
  {
    name: 'Throb',
    description: 'An accelerated heartbeat that signals something is wrong, ideal for pre-danger tension or warning states.',
    tags: ["Substantial","Flexible","Impulses","Short"],
    duration: 230,
    image: ThrobImage,
    play: Presets.Throb,
  },
  {
    name: 'Thud',
    description: 'A soft, warm acknowledgement, ideal for opening a menu or drawer.',
    tags: ["Substantial","Flexible","Peak","Short"],
    duration: 160,
    image: ThudImage,
    play: Presets.Thud,
  },
  {
    name: 'Thump',
    description: 'Confident and present without being harsh, useful for bold feedback that avoids aggression.',
    tags: ["Bold","Flexible","Impulses","Impulse"],
    duration: 0,
    image: ThumpImage,
    play: Presets.Thump,
  },
  {
    name: 'Thunder',
    description: 'The raw power of a thunderstorm, ideal for dramatic reveals or moments of overwhelming force.',
    tags: ["Bold","Soft","Peak","Long"],
    duration: 2000,
    image: ThunderImage,
    play: Presets.Thunder,
  },
  {
    name: 'ThunderRoll',
    description: 'A dramatic arc of mounting intensity, ideal for thunderstorm effects or climactic UI transitions.',
    tags: ["Bold","Flexible","Impulses","Long"],
    duration: 670,
    image: ThunderRollImage,
    play: Presets.ThunderRoll,
  },
  {
    name: 'TickTock',
    description: 'The steady pulse of time, ideal for timing feedback, countdowns, or metronome-style interactions.',
    tags: ["Bold","Flexible","Pattern","Long"],
    duration: 1200,
    image: TickTockImage,
    play: Presets.TickTock,
  },
  {
    name: 'TidalSurge',
    description: 'Two waves of escalating intensity, suited for compound actions or impactful paired confirmations.',
    tags: ["Bold","Flexible","Impulses","Extended"],
    duration: 455,
    image: TidalSurgeImage,
    play: Presets.TidalSurge,
  },
  {
    name: 'TideSwell',
    description: 'A long wave-like arc that rises and falls, ideal for extended ambient effects or fluid UI transitions.',
    tags: ["Substantial","Flexible","Impulses","Long"],
    duration: 727,
    image: TideSwellImage,
    play: Presets.TideSwell,
  },
  {
    name: 'Tremor',
    description: 'Pure, heavy rumble with no sharpness, ideal for seismic events or maximum-weight impact simulations.',
    tags: ["Bold","Soft","Impulses","Impulse"],
    duration: 0,
    image: TremorImage,
    play: Presets.Tremor,
  },
  {
    name: 'Trigger',
    description: 'The decisive moment of release, ideal for weapon discharge, trigger confirmation, or releasing a charged gesture.',
    tags: ["Bold","Flexible","Peak","Extended"],
    duration: 280,
    image: TriggerImage,
    play: Presets.Trigger,
  },
  {
    name: 'Triumph',
    description: 'Pure triumph, conveys the overwhelming joy of a major win or achievement.',
    tags: ["Bold","Flexible","Saw","Long"],
    duration: 1100,
    image: TriumphImage,
    play: Presets.Triumph,
  },
  {
    name: 'Trumpet',
    description: 'A joyful flourish that peaks in triumph, ideal for celebrations or milestone completions.',
    tags: ["Bold","Flexible","Saw","Extended"],
    duration: 460,
    image: TrumpetImage,
    play: Presets.Trumpet,
  },
  {
    name: 'Typewriter',
    description: 'The nostalgic thud of a vintage typewriter, perfect for retro keyboard or analog-feel experiences.',
    tags: ["Bold","Flexible","Peak","Short"],
    duration: 200,
    image: TypewriterImage,
    play: Presets.Typewriter,
  },
  {
    name: 'Unfurl',
    description: 'The unmistakable thrill of discovery, evoking the iconic joy of opening a treasure chest.',
    tags: ["Bold","Flexible","Pattern","Long"],
    duration: 1180,
    image: UnfurlImage,
    play: Presets.Unfurl,
  },
  {
    name: 'Vortex',
    description: 'An irresistible pull into the unknown, ideal for drain animations or dramatic disappearing transitions.',
    tags: ["Substantial","Flexible","Peak","Long"],
    duration: 1400,
    image: VortexImage,
    play: Presets.Vortex,
  },
  {
    name: 'Wane',
    description: 'A lazy, dismissive fade, fitting for sarcastic or indifferent UI moments.',
    tags: ["Gentle","Flexible","Ramp","Extended"],
    duration: 450,
    image: WaneImage,
    play: Presets.Wane,
  },
  {
    name: 'WarDrum',
    description: 'Three steady drum-like beats, ideal for grounded triple confirmations or structured repetitive feedback.',
    tags: ["Bold","Soft","Impulses","Extended"],
    duration: 398,
    image: WarDrumImage,
    play: Presets.WarDrum,
  },
  {
    name: 'Waterfall',
    description: 'A rush of energy that spills and softens, ideal for clearing actions or flowing state transitions.',
    tags: ["Bold","Flexible","Impulses","Extended"],
    duration: 309,
    image: WaterfallImage,
    play: Presets.Waterfall,
  },
  {
    name: 'Wave',
    description: 'Gentle and uninterrupting, communicates ongoing activity without breaking the user\'s focus.',
    tags: ["Substantial","Soft","Bumps","Long"],
    duration: 2800,
    image: WaveImage,
    play: Presets.Wave,
  },
  {
    name: 'Wisp',
    description: 'A barely-there touch, best for ghost or outline buttons that should feel subtle and unobtrusive.',
    tags: ["Gentle","Flexible","Peak","Impulse"],
    duration: 60,
    image: WispImage,
    play: Presets.Wisp,
  },
  {
    name: 'Wobble',
    description: 'A gentle correction without alarm, ideal for minor validation errors or soft negative feedback.',
    tags: ["Substantial","Rigid","Peak","Ramp","Short"],
    duration: 180,
    image: WobbleImage,
    play: Presets.Wobble,
  },
  {
    name: 'Woodpecker',
    description: 'Mechanical and relentless, ideal for repetitive automated sequences where precision is key.',
    tags: ["Bold","Rigid","Solid","Extended"],
    duration: 460,
    image: WoodpeckerImage,
    play: Presets.Woodpecker,
  },
  {
    name: 'Zipper',
    description: 'The familiar drag and snap of a zipper closing, ideal for closure interactions or drawer animations.',
    tags: ["Gentle","Flexible","Solid","Extended"],
    duration: 460,
    image: ZipperImage,
    play: Presets.Zipper,
  },
// CODEGEN_END_{presets}
];