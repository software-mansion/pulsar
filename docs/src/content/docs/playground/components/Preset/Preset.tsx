import { CodeTabs } from '../CodeTabs/CodeTabs';
import style from './Preset.module.scss';
import arrowIcon from '../../../assets/new_assets/arrow.svg';
import { VisualizationPanel } from '../VisualizationPanel/VisualizationPanel';
import { Accordion } from '../Accordion/Accordion';

interface Props {
  index?: number;
  children?: React.ReactNode;
}

export function Preset({ index, children }: Props) {
  return <div className={style.NAME}>
    <VisualizationPanel
      image={arrowIcon}
      onPlayClick={() => console.log('Play')}
      onRecordClick={() => console.log('Record')}
    />
    <Accordion title='Usage' defaultOpen={true}>
      <CodeTabs 
        swift="import Happytic\n\nHappytic.FallingBricks.play()"
        reactNative="import { Happytic } from '@haptics/library';\n\nHappytic.FallingBricks.play();"
      />
    </Accordion>
  </div>
}
