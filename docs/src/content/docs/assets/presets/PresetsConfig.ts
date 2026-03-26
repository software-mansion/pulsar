import type { PresetConfig } from '../../components/Preset/types';

// CODEGEN_BEGIN_{imports}
import AfterglowPreset from './Afterglow.json';
import AfterglowImage from './Afterglow.png';
import AftershockPreset from './Aftershock.json';
import AftershockImage from './Aftershock.png';
import AlarmPreset from './Alarm.json';
import AlarmImage from './Alarm.png';
import AnvilPreset from './Anvil.json';
import AnvilImage from './Anvil.png';
import ApplausePreset from './Applause.json';
import ApplauseImage from './Applause.png';
import AscentPreset from './Ascent.json';
import AscentImage from './Ascent.png';
import BalloonPopPreset from './BalloonPop.json';
import BalloonPopImage from './BalloonPop.png';
import BarragePreset from './Barrage.json';
import BarrageImage from './Barrage.png';
import BassDropPreset from './BassDrop.json';
import BassDropImage from './BassDrop.png';
import BatterPreset from './Batter.json';
import BatterImage from './Batter.png';
import BellTollPreset from './BellToll.json';
import BellTollImage from './BellToll.png';
import BlipPreset from './Blip.json';
import BlipImage from './Blip.png';
import BloomPreset from './Bloom.json';
import BloomImage from './Bloom.png';
import BongoPreset from './Bongo.json';
import BongoImage from './Bongo.png';
import BoulderPreset from './Boulder.json';
import BoulderImage from './Boulder.png';
import BreakingWavePreset from './BreakingWave.json';
import BreakingWaveImage from './BreakingWave.png';
import BreathPreset from './Breath.json';
import BreathImage from './Breath.png';
import BreathingPreset from './Breathing.json';
import BreathingImage from './Breathing.png';
import BuildupPreset from './Buildup.json';
import BuildupImage from './Buildup.png';
import BurstPreset from './Burst.json';
import BurstImage from './Burst.png';
import BuzzPreset from './Buzz.json';
import BuzzImage from './Buzz.png';
import CadencePreset from './Cadence.json';
import CadenceImage from './Cadence.png';
import CameraShutterPreset from './CameraShutter.json';
import CameraShutterImage from './CameraShutter.png';
import CanterPreset from './Canter.json';
import CanterImage from './Canter.png';
import CascadePreset from './Cascade.json';
import CascadeImage from './Cascade.png';
import CastanetsPreset from './Castanets.json';
import CastanetsImage from './Castanets.png';
import CatPawPreset from './CatPaw.json';
import CatPawImage from './CatPaw.png';
import ChargePreset from './Charge.json';
import ChargeImage from './Charge.png';
import ChimePreset from './Chime.json';
import ChimeImage from './Chime.png';
import ChipPreset from './Chip.json';
import ChipImage from './Chip.png';
import ChirpPreset from './Chirp.json';
import ChirpImage from './Chirp.png';
import ClamorPreset from './Clamor.json';
import ClamorImage from './Clamor.png';
import ClaspPreset from './Clasp.json';
import ClaspImage from './Clasp.png';
import CleavePreset from './Cleave.json';
import CleaveImage from './Cleave.png';
import CoilPreset from './Coil.json';
import CoilImage from './Coil.png';
import CoinDropPreset from './CoinDrop.json';
import CoinDropImage from './CoinDrop.png';
import CombinationLockPreset from './CombinationLock.json';
import CombinationLockImage from './CombinationLock.png';
import CrescendoPreset from './Crescendo.json';
import CrescendoImage from './Crescendo.png';
import DewdropPreset from './Dewdrop.json';
import DewdropImage from './Dewdrop.png';
import DirgePreset from './Dirge.json';
import DirgeImage from './Dirge.png';
import DissolvePreset from './Dissolve.json';
import DissolveImage from './Dissolve.png';
import DogBarkPreset from './DogBark.json';
import DogBarkImage from './DogBark.png';
import DronePreset from './Drone.json';
import DroneImage from './Drone.png';
import EngineRevPreset from './EngineRev.json';
import EngineRevImage from './EngineRev.png';
import ExhalePreset from './Exhale.json';
import ExhaleImage from './Exhale.png';
import ExplosionPreset from './Explosion.json';
import ExplosionImage from './Explosion.png';
import FadeOutPreset from './FadeOut.json';
import FadeOutImage from './FadeOut.png';
import FanfarePreset from './Fanfare.json';
import FanfareImage from './Fanfare.png';
import FeatherPreset from './Feather.json';
import FeatherImage from './Feather.png';
import FinalePreset from './Finale.json';
import FinaleImage from './Finale.png';
import FingerDrumPreset from './FingerDrum.json';
import FingerDrumImage from './FingerDrum.png';
import FirecrackerPreset from './Firecracker.json';
import FirecrackerImage from './Firecracker.png';
import FizzPreset from './Fizz.json';
import FizzImage from './Fizz.png';
import FlarePreset from './Flare.json';
import FlareImage from './Flare.png';
import FlickPreset from './Flick.json';
import FlickImage from './Flick.png';
import FlinchPreset from './Flinch.json';
import FlinchImage from './Flinch.png';
import FlourishPreset from './Flourish.json';
import FlourishImage from './Flourish.png';
import FlurryPreset from './Flurry.json';
import FlurryImage from './Flurry.png';
import FlushPreset from './Flush.json';
import FlushImage from './Flush.png';
import GallopPreset from './Gallop.json';
import GallopImage from './Gallop.png';
import GavelPreset from './Gavel.json';
import GavelImage from './Gavel.png';
import GlitchPreset from './Glitch.json';
import GlitchImage from './Glitch.png';
import GuitarStrumPreset from './GuitarStrum.json';
import GuitarStrumImage from './GuitarStrum.png';
import HailPreset from './Hail.json';
import HailImage from './Hail.png';
import HammerPreset from './Hammer.json';
import HammerImage from './Hammer.png';
import HeartbeatPreset from './Heartbeat.json';
import HeartbeatImage from './Heartbeat.png';
import HeraldPreset from './Herald.json';
import HeraldImage from './Herald.png';
import HoofBeatPreset from './HoofBeat.json';
import HoofBeatImage from './HoofBeat.png';
import IgnitionPreset from './Ignition.json';
import IgnitionImage from './Ignition.png';
import ImpactPreset from './Impact.json';
import ImpactImage from './Impact.png';
import JoltPreset from './Jolt.json';
import JoltImage from './Jolt.png';
import KeyboardMechanicalPreset from './KeyboardMechanical.json';
import KeyboardMechanicalImage from './KeyboardMechanical.png';
import KeyboardMembranePreset from './KeyboardMembrane.json';
import KeyboardMembraneImage from './KeyboardMembrane.png';
import KnellPreset from './Knell.json';
import KnellImage from './Knell.png';
import KnockPreset from './Knock.json';
import KnockImage from './Knock.png';
import LamentPreset from './Lament.json';
import LamentImage from './Lament.png';
import LatchPreset from './Latch.json';
import LatchImage from './Latch.png';
import LighthousePreset from './Lighthouse.json';
import LighthouseImage from './Lighthouse.png';
import LiltPreset from './Lilt.json';
import LiltImage from './Lilt.png';
import LockPreset from './Lock.json';
import LockImage from './Lock.png';
import LopePreset from './Lope.json';
import LopeImage from './Lope.png';
import MarchPreset from './March.json';
import MarchImage from './March.png';
import MetronomePreset from './Metronome.json';
import MetronomeImage from './Metronome.png';
import MurmurPreset from './Murmur.json';
import MurmurImage from './Murmur.png';
import NudgePreset from './Nudge.json';
import NudgeImage from './Nudge.png';
import PassingCarPreset from './PassingCar.json';
import PassingCarImage from './PassingCar.png';
import PatterPreset from './Patter.json';
import PatterImage from './Patter.png';
import PealPreset from './Peal.json';
import PealImage from './Peal.png';
import PeckPreset from './Peck.json';
import PeckImage from './Peck.png';
import PendulumPreset from './Pendulum.json';
import PendulumImage from './Pendulum.png';
import PingPreset from './Ping.json';
import PingImage from './Ping.png';
import PipPreset from './Pip.json';
import PipImage from './Pip.png';
import PistonPreset from './Piston.json';
import PistonImage from './Piston.png';
import PlinkPreset from './Plink.json';
import PlinkImage from './Plink.png';
import PlummetPreset from './Plummet.json';
import PlummetImage from './Plummet.png';
import PlunkPreset from './Plunk.json';
import PlunkImage from './Plunk.png';
import PokePreset from './Poke.json';
import PokeImage from './Poke.png';
import PoundPreset from './Pound.json';
import PoundImage from './Pound.png';
import PowerDownPreset from './PowerDown.json';
import PowerDownImage from './PowerDown.png';
import PropelPreset from './Propel.json';
import PropelImage from './Propel.png';
import PulsePreset from './Pulse.json';
import PulseImage from './Pulse.png';
import PummelPreset from './Pummel.json';
import PummelImage from './Pummel.png';
import PushPreset from './Push.json';
import PushImage from './Push.png';
import RadarPreset from './Radar.json';
import RadarImage from './Radar.png';
import RainPreset from './Rain.json';
import RainImage from './Rain.png';
import RampPreset from './Ramp.json';
import RampImage from './Ramp.png';
import RapPreset from './Rap.json';
import RapImage from './Rap.png';
import RatchetPreset from './Ratchet.json';
import RatchetImage from './Ratchet.png';
import ReboundPreset from './Rebound.json';
import ReboundImage from './Rebound.png';
import RipplePreset from './Ripple.json';
import RippleImage from './Ripple.png';
import RivetPreset from './Rivet.json';
import RivetImage from './Rivet.png';
import RustlePreset from './Rustle.json';
import RustleImage from './Rustle.png';
import ShockwavePreset from './Shockwave.json';
import ShockwaveImage from './Shockwave.png';
import SnapPreset from './Snap.json';
import SnapImage from './Snap.png';
import SonarPreset from './Sonar.json';
import SonarImage from './Sonar.png';
import SparkPreset from './Spark.json';
import SparkImage from './Spark.png';
import SpinPreset from './Spin.json';
import SpinImage from './Spin.png';
import StaggerPreset from './Stagger.json';
import StaggerImage from './Stagger.png';
import StampPreset from './Stamp.json';
import StampImage from './Stamp.png';
import StampedePreset from './Stampede.json';
import StampedeImage from './Stampede.png';
import StompPreset from './Stomp.json';
import StompImage from './Stomp.png';
import StoneSkipPreset from './StoneSkip.json';
import StoneSkipImage from './StoneSkip.png';
import StrikePreset from './Strike.json';
import StrikeImage from './Strike.png';
import SummonPreset from './Summon.json';
import SummonImage from './Summon.png';
import SurgePreset from './Surge.json';
import SurgeImage from './Surge.png';
import SwayPreset from './Sway.json';
import SwayImage from './Sway.png';
import SweepPreset from './Sweep.json';
import SweepImage from './Sweep.png';
import SwellPreset from './Swell.json';
import SwellImage from './Swell.png';
import SyncopatePreset from './Syncopate.json';
import SyncopateImage from './Syncopate.png';
import ThrobPreset from './Throb.json';
import ThrobImage from './Throb.png';
import ThudPreset from './Thud.json';
import ThudImage from './Thud.png';
import ThumpPreset from './Thump.json';
import ThumpImage from './Thump.png';
import ThunderPreset from './Thunder.json';
import ThunderImage from './Thunder.png';
import ThunderRollPreset from './ThunderRoll.json';
import ThunderRollImage from './ThunderRoll.png';
import TickTockPreset from './TickTock.json';
import TickTockImage from './TickTock.png';
import TidalSurgePreset from './TidalSurge.json';
import TidalSurgeImage from './TidalSurge.png';
import TideSwellPreset from './TideSwell.json';
import TideSwellImage from './TideSwell.png';
import TremorPreset from './Tremor.json';
import TremorImage from './Tremor.png';
import TriggerPreset from './Trigger.json';
import TriggerImage from './Trigger.png';
import TriumphPreset from './Triumph.json';
import TriumphImage from './Triumph.png';
import TrumpetPreset from './Trumpet.json';
import TrumpetImage from './Trumpet.png';
import TypewriterPreset from './Typewriter.json';
import TypewriterImage from './Typewriter.png';
import UnfurlPreset from './Unfurl.json';
import UnfurlImage from './Unfurl.png';
import VortexPreset from './Vortex.json';
import VortexImage from './Vortex.png';
import WanePreset from './Wane.json';
import WaneImage from './Wane.png';
import WarDrumPreset from './WarDrum.json';
import WarDrumImage from './WarDrum.png';
import WaterfallPreset from './Waterfall.json';
import WaterfallImage from './Waterfall.png';
import WavePreset from './Wave.json';
import WaveImage from './Wave.png';
import WispPreset from './Wisp.json';
import WispImage from './Wisp.png';
import WobblePreset from './Wobble.json';
import WobbleImage from './Wobble.png';
import WoodpeckerPreset from './Woodpecker.json';
import WoodpeckerImage from './Woodpecker.png';
import ZipperPreset from './Zipper.json';
import ZipperImage from './Zipper.png';
// CODEGEN_END_{imports}

export const PresetsConfig: Array<PresetConfig> = [
// CODEGEN_BEGIN_{presets}
  { data: AfterglowPreset, image: AfterglowImage },
  { data: AftershockPreset, image: AftershockImage },
  { data: AlarmPreset, image: AlarmImage },
  { data: AnvilPreset, image: AnvilImage },
  { data: ApplausePreset, image: ApplauseImage },
  { data: AscentPreset, image: AscentImage },
  { data: BalloonPopPreset, image: BalloonPopImage },
  { data: BarragePreset, image: BarrageImage },
  { data: BassDropPreset, image: BassDropImage },
  { data: BatterPreset, image: BatterImage },
  { data: BellTollPreset, image: BellTollImage },
  { data: BlipPreset, image: BlipImage },
  { data: BloomPreset, image: BloomImage },
  { data: BongoPreset, image: BongoImage },
  { data: BoulderPreset, image: BoulderImage },
  { data: BreakingWavePreset, image: BreakingWaveImage },
  { data: BreathPreset, image: BreathImage },
  { data: BreathingPreset, image: BreathingImage },
  { data: BuildupPreset, image: BuildupImage },
  { data: BurstPreset, image: BurstImage },
  { data: BuzzPreset, image: BuzzImage },
  { data: CadencePreset, image: CadenceImage },
  { data: CameraShutterPreset, image: CameraShutterImage },
  { data: CanterPreset, image: CanterImage },
  { data: CascadePreset, image: CascadeImage },
  { data: CastanetsPreset, image: CastanetsImage },
  { data: CatPawPreset, image: CatPawImage },
  { data: ChargePreset, image: ChargeImage },
  { data: ChimePreset, image: ChimeImage },
  { data: ChipPreset, image: ChipImage },
  { data: ChirpPreset, image: ChirpImage },
  { data: ClamorPreset, image: ClamorImage },
  { data: ClaspPreset, image: ClaspImage },
  { data: CleavePreset, image: CleaveImage },
  { data: CoilPreset, image: CoilImage },
  { data: CoinDropPreset, image: CoinDropImage },
  { data: CombinationLockPreset, image: CombinationLockImage },
  { data: CrescendoPreset, image: CrescendoImage },
  { data: DewdropPreset, image: DewdropImage },
  { data: DirgePreset, image: DirgeImage },
  { data: DissolvePreset, image: DissolveImage },
  { data: DogBarkPreset, image: DogBarkImage },
  { data: DronePreset, image: DroneImage },
  { data: EngineRevPreset, image: EngineRevImage },
  { data: ExhalePreset, image: ExhaleImage },
  { data: ExplosionPreset, image: ExplosionImage },
  { data: FadeOutPreset, image: FadeOutImage },
  { data: FanfarePreset, image: FanfareImage },
  { data: FeatherPreset, image: FeatherImage },
  { data: FinalePreset, image: FinaleImage },
  { data: FingerDrumPreset, image: FingerDrumImage },
  { data: FirecrackerPreset, image: FirecrackerImage },
  { data: FizzPreset, image: FizzImage },
  { data: FlarePreset, image: FlareImage },
  { data: FlickPreset, image: FlickImage },
  { data: FlinchPreset, image: FlinchImage },
  { data: FlourishPreset, image: FlourishImage },
  { data: FlurryPreset, image: FlurryImage },
  { data: FlushPreset, image: FlushImage },
  { data: GallopPreset, image: GallopImage },
  { data: GavelPreset, image: GavelImage },
  { data: GlitchPreset, image: GlitchImage },
  { data: GuitarStrumPreset, image: GuitarStrumImage },
  { data: HailPreset, image: HailImage },
  { data: HammerPreset, image: HammerImage },
  { data: HeartbeatPreset, image: HeartbeatImage },
  { data: HeraldPreset, image: HeraldImage },
  { data: HoofBeatPreset, image: HoofBeatImage },
  { data: IgnitionPreset, image: IgnitionImage },
  { data: ImpactPreset, image: ImpactImage },
  { data: JoltPreset, image: JoltImage },
  { data: KeyboardMechanicalPreset, image: KeyboardMechanicalImage },
  { data: KeyboardMembranePreset, image: KeyboardMembraneImage },
  { data: KnellPreset, image: KnellImage },
  { data: KnockPreset, image: KnockImage },
  { data: LamentPreset, image: LamentImage },
  { data: LatchPreset, image: LatchImage },
  { data: LighthousePreset, image: LighthouseImage },
  { data: LiltPreset, image: LiltImage },
  { data: LockPreset, image: LockImage },
  { data: LopePreset, image: LopeImage },
  { data: MarchPreset, image: MarchImage },
  { data: MetronomePreset, image: MetronomeImage },
  { data: MurmurPreset, image: MurmurImage },
  { data: NudgePreset, image: NudgeImage },
  { data: PassingCarPreset, image: PassingCarImage },
  { data: PatterPreset, image: PatterImage },
  { data: PealPreset, image: PealImage },
  { data: PeckPreset, image: PeckImage },
  { data: PendulumPreset, image: PendulumImage },
  { data: PingPreset, image: PingImage },
  { data: PipPreset, image: PipImage },
  { data: PistonPreset, image: PistonImage },
  { data: PlinkPreset, image: PlinkImage },
  { data: PlummetPreset, image: PlummetImage },
  { data: PlunkPreset, image: PlunkImage },
  { data: PokePreset, image: PokeImage },
  { data: PoundPreset, image: PoundImage },
  { data: PowerDownPreset, image: PowerDownImage },
  { data: PropelPreset, image: PropelImage },
  { data: PulsePreset, image: PulseImage },
  { data: PummelPreset, image: PummelImage },
  { data: PushPreset, image: PushImage },
  { data: RadarPreset, image: RadarImage },
  { data: RainPreset, image: RainImage },
  { data: RampPreset, image: RampImage },
  { data: RapPreset, image: RapImage },
  { data: RatchetPreset, image: RatchetImage },
  { data: ReboundPreset, image: ReboundImage },
  { data: RipplePreset, image: RippleImage },
  { data: RivetPreset, image: RivetImage },
  { data: RustlePreset, image: RustleImage },
  { data: ShockwavePreset, image: ShockwaveImage },
  { data: SnapPreset, image: SnapImage },
  { data: SonarPreset, image: SonarImage },
  { data: SparkPreset, image: SparkImage },
  { data: SpinPreset, image: SpinImage },
  { data: StaggerPreset, image: StaggerImage },
  { data: StampPreset, image: StampImage },
  { data: StampedePreset, image: StampedeImage },
  { data: StompPreset, image: StompImage },
  { data: StoneSkipPreset, image: StoneSkipImage },
  { data: StrikePreset, image: StrikeImage },
  { data: SummonPreset, image: SummonImage },
  { data: SurgePreset, image: SurgeImage },
  { data: SwayPreset, image: SwayImage },
  { data: SweepPreset, image: SweepImage },
  { data: SwellPreset, image: SwellImage },
  { data: SyncopatePreset, image: SyncopateImage },
  { data: ThrobPreset, image: ThrobImage },
  { data: ThudPreset, image: ThudImage },
  { data: ThumpPreset, image: ThumpImage },
  { data: ThunderPreset, image: ThunderImage },
  { data: ThunderRollPreset, image: ThunderRollImage },
  { data: TickTockPreset, image: TickTockImage },
  { data: TidalSurgePreset, image: TidalSurgeImage },
  { data: TideSwellPreset, image: TideSwellImage },
  { data: TremorPreset, image: TremorImage },
  { data: TriggerPreset, image: TriggerImage },
  { data: TriumphPreset, image: TriumphImage },
  { data: TrumpetPreset, image: TrumpetImage },
  { data: TypewriterPreset, image: TypewriterImage },
  { data: UnfurlPreset, image: UnfurlImage },
  { data: VortexPreset, image: VortexImage },
  { data: WanePreset, image: WaneImage },
  { data: WarDrumPreset, image: WarDrumImage },
  { data: WaterfallPreset, image: WaterfallImage },
  { data: WavePreset, image: WaveImage },
  { data: WispPreset, image: WispImage },
  { data: WobblePreset, image: WobbleImage },
  { data: WoodpeckerPreset, image: WoodpeckerImage },
  { data: ZipperPreset, image: ZipperImage },
// CODEGEN_END_{presets}
];
