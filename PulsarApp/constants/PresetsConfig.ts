import { Presets } from "react-native-pulsar";
import { PresetProps } from "./types";

const placeholder = require('@/assets/images/chart_placeholder.png');

export const PresetsConfig: Array<PresetProps> = [
  {
    name: '✨ Sparkle',
    shortName: 'Sparkle',
    description: "That feeling when some bricks fall onto your foot!",
    tags: ["Gentle", "Soft", "Bump", "Short"],
    duration: 1500,
    image: placeholder,
    play: Presets.Earthquake,
  },
  {
    name: '✨ Sparkle',
    shortName: 'Sparkle',
    description: "That feeling when some bricks fall onto your foot!",
    tags: ["Gentle", "Soft", "Bump", "Short"],
    duration: 1500,
    image: placeholder,
    play: Presets.Earthquake,
  },
];