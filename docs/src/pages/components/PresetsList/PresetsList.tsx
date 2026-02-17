import style from './PresetsList.module.scss';
import { Preset } from '../Preset/Preset';
import { PresetsConfig } from './PresetsConfig';

export function PresetsList() {

  return <div className={['not-content', style.presets].join(' ')}>
    {PresetsConfig.map((preset, index) => (
      <Preset key={index} {...preset} />
    ))}
  </div>
}
