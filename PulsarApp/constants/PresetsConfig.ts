import { Presets } from "react-native-pulsar";
import { PresetProps } from "./types";

const placeholder = require('@/assets/images/chart_placeholder.png');

export const PresetsConfig: Array<PresetProps> = [
  {
    name: '✨ Sparkle',
    shortName: 'Sparkle',
    description: "That feeling when some bricks fall onto your foot!",
    tags: [
      { label: "Short", variant: "blue" },
      { label: "Happiness", variant: "blue" }
    ],
    duration: 1500,
    image: placeholder,
    play: Presets.Earthquake,
  },
  {
    name: '🧱 Falling Bricks 2',
    shortName: 'FallingBricks',
    description: "That feeling when some bricks fall onto your foot!",
    tags: [
      { label: "Super short", variant: "blue" },
      { label: "Sadness", variant: "blue" }
    ],
    duration: 300,
    image: placeholder,
    play: Presets.Earthquake
  },
  {
    name: '🧱 Falling Bricks 3',
    shortName: 'FallingBricks',
    description: "That feeling when some bricks fall onto your foot!",
    tags: [
      { label: "Super short", variant: "blue" },
      { label: "Happiness", variant: "blue" }
    ],
    duration: 1000,
    image: placeholder,
    play: Presets.Earthquake
  },
  {
    name: '🧱 Falling Bricks 4',
    shortName: 'FallingBricks',
    description: "That feeling when some bricks fall onto your foot!",
    tags: [
      { label: "Super short", variant: "blue" },
      { label: "Happiness", variant: "blue" }
    ],
    duration: 2000,
    image: placeholder,
    play: Presets.Earthquake
  },
];