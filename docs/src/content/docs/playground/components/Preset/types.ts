export interface Tag {
  label: string;
  variant: "white" | "blue";
}

export type PresetConfig = { 
  image: ImageMetadata; 
  data: { 
    continuesPattern: { 
      frequency: number[];
      amplitude: number[];
    };
    discretePattern: {
      time: number;
      amplitude: number;
      frequency: number;
    }[];
  };
}

export interface PresetProps {
  name: string;
  shortName: string;
  description: string;
  tags: Tag[];
  duration?: number;
  visualization: PresetConfig,
}
