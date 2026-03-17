export interface Tag {
  label: string;
  variant: "white" | "blue";
}

export interface PresetProps {
  name: string;
  shortName: string;
  description: string;
  tags: Tag[];
  duration?: number;
  image: any,
  play: () => void;
}
