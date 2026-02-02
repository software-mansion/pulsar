import style from './PresetsList.module.scss';
import infoIcon from '../../../assets/new_assets/info.svg'
import { Filters } from '../Filters/Filters';
import { Preset } from '../Preset/Preset';

export function PresetsList() {
  return <div className={['not-content', style.presets].join(' ')}>

    <div className={style.header}>
      <div className={style.title}>Presets</div>
      <div className={style.info}>
        <div>Learn more about tags</div>
        <img src={infoIcon.src} />
      </div>
    </div>

    <Filters />

    <Preset
      name='🧱 Falling Bricks'
      shortName='FallingBricks'
      description="That feeling when some bricks fall onto your foot!"
      tags={[
        { label: "Short", variant: "blue" },
        { label: "Happy", variant: "blue" }
      ]} 
    />
    <Preset
      name='🧱 Falling Bricks'
      shortName='FallingBricks'
      description="That feeling when some bricks fall onto your foot!"
      tags={[
        { label: "Short", variant: "blue" },
        { label: "Happy", variant: "blue" }
      ]} 
    />
    <Preset
      name='🧱 Falling Bricks'
      shortName='FallingBricks'
      description="That feeling when some bricks fall onto your foot!"
      tags={[
        { label: "Short", variant: "blue" },
        { label: "Happy", variant: "blue" }
      ]} 
    />
    
  </div>
}
