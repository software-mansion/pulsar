import FallingBricks from '../../assets/presets/FallingBricks';
import type { PresetProps } from '../Preset/types';

export const PresetsConfig: Array<PresetProps> = [
  {
    name: '🧱 Falling Bricks',
    shortName: 'FallingBricks',
    description: 'That feeling when some bricks fall onto your foot!',
    tags: [
      { label: 'Short', variant: 'blue' },
      { label: 'Happiness', variant: 'blue' },
    ],
    duration: 10000,
    visualization: FallingBricks,
  },
  {
    name: '🧱 Falling Bricks 2',
    shortName: 'FallingBricks',
    description: 'That feeling when some bricks fall onto your foot!',
    tags: [
      { label: 'Super short', variant: 'blue' },
      { label: 'Sadness', variant: 'blue' },
    ],
    duration: 300,
    visualization: FallingBricks,
  },
  {
    name: '🧱 Falling Bricks 3',
    shortName: 'FallingBricks',
    description: 'That feeling when some bricks fall onto your foot!',
    tags: [
      { label: 'Super short', variant: 'blue' },
      { label: 'Happiness', variant: 'blue' },
    ],
    duration: 1000,
    visualization: FallingBricks,
  },
  {
    name: '🧱 Falling Bricks 4',
    shortName: 'FallingBricks',
    description: 'That feeling when some bricks fall onto your foot!',
    tags: [
      { label: 'Super short', variant: 'blue' },
      { label: 'Happiness', variant: 'blue' },
    ],
    duration: 2000,
    visualization: FallingBricks,
  },
];
