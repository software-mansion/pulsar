import { useRef } from 'react';
import { CodeTabs } from '../CodeTabs/CodeTabs';
import style from './Preset.module.scss';
import { VisualizationPanel } from '../VisualizationPanel/VisualizationPanel';
import { Accordion } from '../Accordion/Accordion';
import { Tag } from '../Tag/Tag';
import type { PresetProps } from './types';
import { API_SERVER_URL } from '../config';

function getSwiftPresetImport(shortName: string) {
  return `import Pulsar\n\nPulsar.${shortName}.play()`;
}

function getReactNativePresetImport(shortName: string) {
  return `import { Pulsar } from '@haptics/library';\n\nPulsar.${shortName}.play();`;
}

export function Preset({
  name,
  shortName,
  description,
  tags,
  duration = 0,
  visualization,
}: PresetProps) {
  return (
    <div className={style.preset}>
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

      <VisualizationPanel visualization={visualization} duration={duration} />

      <Accordion title="Usage" className={style.marginTop}>
        <CodeTabs
          swift={getSwiftPresetImport(shortName || '')}
          reactNative={getReactNativePresetImport(shortName || '')}
        />
      </Accordion>
    </div>
  );
}
