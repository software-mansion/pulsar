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

class Presets {
  private readonly audioGenerator = new AudioGenerator();

  public list() {
    return Object.keys(BUILTIN_PRESETS) as PresetName[];
  }

  public has(name: string): name is PresetName {
    return name in BUILTIN_PRESETS;
  }

  public get(name: string) {
    return this.clonePattern(this.requirePreset(name));
  }

  public async play(name: string): Promise<PresetPlaybackResult> {
    this.audioGenerator.stop();

    const pattern = this.get(name);
    const composer = new PatternComposer();
    composer.parse(pattern);

    const didPlayHaptics = composer.play();
    const shouldUseAudioFallback = !didPlayHaptics && Settings.isSoundEnabled();

    if (!shouldUseAudioFallback) {
      return {
        haptics: didPlayHaptics,
        audio: false,
        usedAudioFallback: false,
      };
    }

    const renderedBuffer = await this.audioGenerator.parse(pattern);
    const didPlayAudio = renderedBuffer ? await this.audioGenerator.play() : false;

    return {
      haptics: didPlayHaptics,
      audio: didPlayAudio,
      usedAudioFallback: renderedBuffer !== null,
    };
  }

  public stop() {
    const didStopHaptics = Settings.stopHaptics();
    const didStopAudio = this.audioGenerator.stop();

    return didStopHaptics || didStopAudio;
  }

  private requirePreset(name: string) {
    if (!this.has(name)) {
      throw new Error(`Unknown haptic preset: ${String(name)}`);
    }

    return BUILTIN_PRESETS[name];
  }

  private clonePattern(pattern: HapticPattern) {
    return pattern.map((entry) => ({ ...entry }));
  }
}

export { BUILTIN_PRESETS, Presets };
