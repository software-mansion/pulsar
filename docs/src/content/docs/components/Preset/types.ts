export interface Tag {
  label: string;
  variant: 'white' | 'blue';
}

export type DiscretePoint = { time: number, amplitude: number, frequency: number };
export type ContinuousPattern = {
  amplitude: { time: number, value: number }[],
  frequency: { time: number, value: number }[],
}
export type PatternData = {
  name: string;
  description: string;
  tags: string[];
  duration: number;
  discretePattern: DiscretePoint[],
  continuousPattern: ContinuousPattern,
}

export type PresetConfig = {
  image: ImageMetadata;
  data: PatternData;
};
