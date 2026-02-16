export interface Tag {
  label: string;
  variant: "white" | "blue";
}

export type DiscretePoint = { time: number, amplitude: number, frequency: number };
export type ContinuesPattern = {
  amplitude: { time: number, value: number }[],
  frequency: { time: number, value: number }[],
}
export type PatternData = {
  discretePattern: DiscretePoint[],
  continuesPattern: ContinuesPattern,
}

export type PresetConfig = { 
  image: ImageMetadata; 
  data: PatternData;
}

export interface PresetProps {
  name: string;
  shortName: string;
  description: string;
  tags: Tag[];
  duration?: number;
  visualization: PresetConfig,
}
