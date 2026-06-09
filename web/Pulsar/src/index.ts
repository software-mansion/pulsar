import { AudioGenerator } from "./AudioGenerator.ts";
import Pulsar from "./Pulsar.ts";
import { PatternComposer } from "./PatternComposer.ts";
import { Preset, Presets } from "./Presets.ts";
import { RealtimeComposer } from "./RealtimeComposer.ts";
import Settings from "./Settings.ts";

export default Pulsar;
export { AudioGenerator, PatternComposer, Preset, Presets, Pulsar, RealtimeComposer, Settings };
export type { AudioBufferInfo } from "./AudioGenerator.ts";
export type {
  HapticContinuousSegment,
  HapticLineSegment,
  HapticPattern,
  HapticPulseSegment,
  HapticValuePoint,
  ParsedPattern,
} from "./types.ts";
export type { PresetName, PresetPlaybackResult } from "./Presets.ts";
