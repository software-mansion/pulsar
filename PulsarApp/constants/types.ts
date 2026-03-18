export interface PresetProps {
  name: string;
  shortName: string;
  description: string;
  tags: string[];
  duration?: number;
  image: any,
  play: () => void;
}
