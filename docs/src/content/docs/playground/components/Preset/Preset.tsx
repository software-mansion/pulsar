import { CodeTabs } from '../CodeTabs/CodeTabs';
import style from './Preset.module.scss';
import placeholderImage from '../../../assets/new_assets/chart_placeholder.png';
import { VisualizationPanel } from '../VisualizationPanel/VisualizationPanel';
import { Accordion } from '../Accordion/Accordion';
import { Tag } from '../Tag/Tag';

interface Tag {
  label: string;
  variant: "white" | "blue";
}

interface Props {
  name?: string;
  shortName?: string;
  description?: string;
  index?: number;
  tags?: Tag[];
}

function getSwiftPresetImport(shortName: string) {
  return `import Pulsar\n\nPulsar.${shortName}.play()`;
}

function getReactNativePresetImport(shortName: string) {
  return `import { Pulsar } from '@haptics/library';\n\nPulsar.${shortName}.play();`;
}

export function Preset({ name, shortName, description, index, tags }: Props) {
  return <div className={style.preset}>

    {tags && tags.length > 0 && (
      <div className={style.tagsBar}>
        {tags.map((tag, idx) => (
          <Tag key={idx} label={tag.label} variant={tag.variant} />
        ))}
      </div>
    )}

    <div className={style.header}>
      <div className={style.name}>{name}</div>
      <div className={style.description}>{description}</div>
    </div>
    
    <VisualizationPanel
      image={placeholderImage}
      onPlayClick={() => console.log('Play')}
      onRecordClick={() => console.log('Record')}
    />
    <Accordion title='Usage' defaultOpen={true} className={style.marginTop}>
      <CodeTabs 
        swift={getSwiftPresetImport(shortName || '')}
        reactNative={getReactNativePresetImport(shortName || '')}
      />
    </Accordion>
  </div>
}
