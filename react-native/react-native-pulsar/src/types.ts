export type Pattern = {
  discretePattern: { time: number, amplitude: number, frequency: number }[],
  continuesPattern: {
    amplitude: { time: number, value: number }[],
    frequency: { time: number, value: number }[],
  }
}

export type PatternComposer = {
  play: () => void;
  parse: (pattern: Pattern) => void;
  isParsed: () => boolean;
};
