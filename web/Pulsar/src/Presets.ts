import { AudioGenerator } from "./AudioGenerator.ts";
import { PatternComposer } from "./PatternComposer.ts";
import Settings from "./Settings.ts";
import type { HapticPattern } from "./types.ts";

const BUILTIN_PRESETS = {
  tap: [{ type: "continuous", timestamp: 0, duration: 35 }],
  doubleTap: [
    { type: "continuous", timestamp: 0, duration: 30 },
    { type: "continuous", timestamp: 90, duration: 30 },
  ],
  success: [
    { type: "continuous", timestamp: 0, duration: 40 },
    { type: "continuous", timestamp: 90, duration: 55 },
    { type: "continuous", timestamp: 180, duration: 90 },
  ],
  warning: [
    { type: "pulse", timestamp: 0, duration: 240, intensity: 0.35, frequency: 0.9 },
    { type: "continuous", timestamp: 320, duration: 120 },
  ],
  heartbeat: [
    { type: "continuous", timestamp: 0, duration: 45 },
    { type: "continuous", timestamp: 120, duration: 70 },
    { type: "continuous", timestamp: 420, duration: 45 },
    { type: "continuous", timestamp: 540, duration: 70 },
  ],
} satisfies Record<string, HapticPattern>;

export type PresetName = keyof typeof BUILTIN_PRESETS;
export type PresetPlaybackResult = {
  haptics: boolean;
  audio: boolean;
  usedAudioFallback: boolean;
};

class Preset {
  public readonly pattern: HapticPattern;
  private readonly audioGenerator = new AudioGenerator();
  private readonly composer = new PatternComposer();
  private renderedAudio: AudioBuffer | null = null;
  private audioPrepared = false;

  constructor(pattern: HapticPattern) {
    this.pattern = pattern;
    this.composer.parse(pattern);
  }

  public async play(): Promise<PresetPlaybackResult> {
    this.audioGenerator.stop();

    const didPlayHaptics = this.composer.play();
    const shouldUseAudioFallback = !didPlayHaptics && Settings.isSoundEnabled();

    if (!shouldUseAudioFallback) {
      return {
        haptics: didPlayHaptics,
        audio: false,
        usedAudioFallback: false,
      };
    }

    if (!this.audioPrepared) {
      this.renderedAudio = await this.audioGenerator.parse(this.pattern);
      this.audioPrepared = true;
    }

    const didPlayAudio = this.renderedAudio ? await this.audioGenerator.play() : false;

    return {
      haptics: didPlayHaptics,
      audio: didPlayAudio,
      usedAudioFallback: this.renderedAudio !== null,
    };
  }

  public stop() {
    return this.audioGenerator.stop();
  }
}

class Presets {
  private readonly presets: Record<PresetName, Preset>;
  private currentlyPlaying: Preset | null = null;

  constructor() {
    const entries = Object.entries(BUILTIN_PRESETS) as [PresetName, HapticPattern][];
    this.presets = Object.fromEntries(
      entries.map(([name, pattern]) => [name, new Preset(pattern)]),
    ) as Record<PresetName, Preset>;
  }

  public list() {
    return Object.keys(this.presets) as PresetName[];
  }

  public has(name: string): name is PresetName {
    return name in this.presets;
  }

  public get(name: string): Preset {
    if (!this.has(name)) {
      throw new Error(`Unknown haptic preset: ${String(name)}`);
    }

    return this.presets[name];
  }

  public async play(name: string): Promise<PresetPlaybackResult> {
    this.currentlyPlaying?.stop();

    const preset = this.get(name);
    this.currentlyPlaying = preset;

    return preset.play();
  }

  public stop() {
    const didStopHaptics = Settings.stopHaptics();
    const didStopAudio = this.currentlyPlaying?.stop() ?? false;

    return didStopHaptics || didStopAudio;
  }
}

export { BUILTIN_PRESETS, Preset, Presets };
