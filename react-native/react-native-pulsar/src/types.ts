export type Pattern = {
  discretePattern: { time: number, amplitude: number, frequency: number }[],
  continuousPattern: {
    amplitude: { time: number, value: number }[],
    frequency: { time: number, value: number }[],
  }
}

export type PatternComposer = {
  play: () => void;
  stop: () => void;
  parse: (pattern: Pattern) => void;
  isParsed: () => boolean;
};

export type AdaptivePresetConfig = (() => void) | Pattern;

export type AdaptivePreset = {
  ios: AdaptivePresetConfig;
  android: AdaptivePresetConfig;
};

export type AdaptiveHaptics = {
  play: () => void;
};
