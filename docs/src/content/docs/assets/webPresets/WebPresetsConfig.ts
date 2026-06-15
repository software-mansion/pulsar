import type { WebPresetConfig } from '../../components/WebPreset/types';

// CODEGEN_BEGIN_{imports}
import AlarmPreset from './Alarm.json';
import AlarmImage from './Alarm.png';
import AlertPreset from './Alert.json';
import AlertImage from './Alert.png';
import BouncePreset from './Bounce.json';
import BounceImage from './Bounce.png';
import BurpPreset from './Burp.json';
import BurpImage from './Burp.png';
import ClatterPreset from './Clatter.json';
import ClatterImage from './Clatter.png';
import ClockworkPreset from './Clockwork.json';
import ClockworkImage from './Clockwork.png';
import ConnectPreset from './Connect.json';
import ConnectImage from './Connect.png';
import CrescendoPreset from './Crescendo.json';
import CrescendoImage from './Crescendo.png';
import CroakPreset from './Croak.json';
import CroakImage from './Croak.png';
import DeflatePreset from './Deflate.json';
import DeflateImage from './Deflate.png';
import DronePreset from './Drone.json';
import DroneImage from './Drone.png';
import DrumrollPreset from './Drumroll.json';
import DrumrollImage from './Drumroll.png';
import FeatherPreset from './Feather.json';
import FeatherImage from './Feather.png';
import FinalePreset from './Finale.json';
import FinaleImage from './Finale.png';
import FlutterPreset from './Flutter.json';
import FlutterImage from './Flutter.png';
import FoghornPreset from './Foghorn.json';
import FoghornImage from './Foghorn.png';
import FuryPreset from './Fury.json';
import FuryImage from './Fury.png';
import HeartbeatPreset from './Heartbeat.json';
import HeartbeatImage from './Heartbeat.png';
import HoldPreset from './Hold.json';
import HoldImage from './Hold.png';
import KnockPreset from './Knock.json';
import KnockImage from './Knock.png';
import KnockoutPreset from './Knockout.json';
import KnockoutImage from './Knockout.png';
import MorsePreset from './Morse.json';
import MorseImage from './Morse.png';
import PatterPreset from './Patter.json';
import PatterImage from './Patter.png';
import PendulumPreset from './Pendulum.json';
import PendulumImage from './Pendulum.png';
import PopcornPreset from './Popcorn.json';
import PopcornImage from './Popcorn.png';
import RejectPreset from './Reject.json';
import RejectImage from './Reject.png';
import RipplePreset from './Ripple.json';
import RippleImage from './Ripple.png';
import RumblePreset from './Rumble.json';
import RumbleImage from './Rumble.png';
import ShatterPreset from './Shatter.json';
import ShatterImage from './Shatter.png';
import ShudderPreset from './Shudder.json';
import ShudderImage from './Shudder.png';
import SirenPreset from './Siren.json';
import SirenImage from './Siren.png';
import SkipPreset from './Skip.json';
import SkipImage from './Skip.png';
import SmashPreset from './Smash.json';
import SmashImage from './Smash.png';
import SneezePreset from './Sneeze.json';
import SneezeImage from './Sneeze.png';
import SurfacePreset from './Surface.json';
import SurfaceImage from './Surface.png';
import SwayPreset from './Sway.json';
import SwayImage from './Sway.png';
import TapPreset from './Tap.json';
import TapImage from './Tap.png';
import ThunderPreset from './Thunder.json';
import ThunderImage from './Thunder.png';
import TimeoutPreset from './Timeout.json';
import TimeoutImage from './Timeout.png';
import TrillPreset from './Trill.json';
import TrillImage from './Trill.png';
import UnwindPreset from './Unwind.json';
import UnwindImage from './Unwind.png';
import WaltzPreset from './Waltz.json';
import WaltzImage from './Waltz.png';
import WarblePreset from './Warble.json';
import WarbleImage from './Warble.png';
import WarDrumPreset from './WarDrum.json';
import WarDrumImage from './WarDrum.png';
import WindupPreset from './Windup.json';
import WindupImage from './Windup.png';
// CODEGEN_END_{imports}

export const WebPresetsConfig: Array<WebPresetConfig> = [
// CODEGEN_BEGIN_{presets}
  { data: AlarmPreset, image: AlarmImage },
  { data: AlertPreset, image: AlertImage },
  { data: BouncePreset, image: BounceImage },
  { data: BurpPreset, image: BurpImage },
  { data: ClatterPreset, image: ClatterImage },
  { data: ClockworkPreset, image: ClockworkImage },
  { data: ConnectPreset, image: ConnectImage },
  { data: CrescendoPreset, image: CrescendoImage },
  { data: CroakPreset, image: CroakImage },
  { data: DeflatePreset, image: DeflateImage },
  { data: DronePreset, image: DroneImage },
  { data: DrumrollPreset, image: DrumrollImage },
  { data: FeatherPreset, image: FeatherImage },
  { data: FinalePreset, image: FinaleImage },
  { data: FlutterPreset, image: FlutterImage },
  { data: FoghornPreset, image: FoghornImage },
  { data: FuryPreset, image: FuryImage },
  { data: HeartbeatPreset, image: HeartbeatImage },
  { data: HoldPreset, image: HoldImage },
  { data: KnockPreset, image: KnockImage },
  { data: KnockoutPreset, image: KnockoutImage },
  { data: MorsePreset, image: MorseImage },
  { data: PatterPreset, image: PatterImage },
  { data: PendulumPreset, image: PendulumImage },
  { data: PopcornPreset, image: PopcornImage },
  { data: RejectPreset, image: RejectImage },
  { data: RipplePreset, image: RippleImage },
  { data: RumblePreset, image: RumbleImage },
  { data: ShatterPreset, image: ShatterImage },
  { data: ShudderPreset, image: ShudderImage },
  { data: SirenPreset, image: SirenImage },
  { data: SkipPreset, image: SkipImage },
  { data: SmashPreset, image: SmashImage },
  { data: SneezePreset, image: SneezeImage },
  { data: SurfacePreset, image: SurfaceImage },
  { data: SwayPreset, image: SwayImage },
  { data: TapPreset, image: TapImage },
  { data: ThunderPreset, image: ThunderImage },
  { data: TimeoutPreset, image: TimeoutImage },
  { data: TrillPreset, image: TrillImage },
  { data: UnwindPreset, image: UnwindImage },
  { data: WaltzPreset, image: WaltzImage },
  { data: WarblePreset, image: WarbleImage },
  { data: WarDrumPreset, image: WarDrumImage },
  { data: WindupPreset, image: WindupImage },
// CODEGEN_END_{presets}
];
