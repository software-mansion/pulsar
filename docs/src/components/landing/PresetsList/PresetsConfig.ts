import AlarmPreset from '../../../content/docs/assets/presets/Alarm.json';
import AlarmImage from '../../../content/docs/assets/presets/Alarm.png';
import FadeOutPreset from '../../../content/docs/assets/presets/FadeOut.json';
import FadeOutImage from '../../../content/docs/assets/presets/FadeOut.png';
import type { PresetConfig } from '../../../content/docs/components/Preset/types';

export const PresetsConfig: Array<PresetConfig> = [
  {
    data: AlarmPreset,
    image: AlarmImage,
  },
  {
    data: FadeOutPreset,
    image: FadeOutImage,
  },
];
