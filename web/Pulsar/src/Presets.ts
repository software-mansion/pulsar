import { AudioGenerator } from "./AudioGenerator.ts";
import { BUILTIN_PRESETS } from "./builtin-presets.ts";
import { PatternComposer } from "./PatternComposer.ts";
import Settings from "./Settings.ts";
import type { HapticPattern } from "./types.ts";

export type PresetName = keyof typeof BUILTIN_PRESETS;
export type PresetPlaybackResult = {
  haptics: boolean;
  audio: boolean;
  usedAudioFallback: boolean;
};

class Preset {
  public readonly name: string;
  public readonly pattern: HapticPattern;
  private readonly audioGenerator = new AudioGenerator();
  private readonly composer = new PatternComposer();
  private renderedAudio: AudioBuffer | null = null;
  private audioPrepared = false;

  constructor(name: string, pattern: HapticPattern) {
    this.name = name;
    this.pattern = pattern;
    this.composer.parse(this.pattern);
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
      entries.map(([name, pattern]) => [name, new Preset(name, pattern)]),
    ) as Record<PresetName, Preset>;
  }

  public list() {
    return Object.keys(this.presets) as PresetName[];
  }

  public all(): Preset[] {
    return Object.values(this.presets);
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
