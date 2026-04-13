export interface PresetProps {
  name: string;
  description: string;
  tags: string[];
  duration?: number;
  image: any,
  play: () => void;
}
