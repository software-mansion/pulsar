import { useRef, useState } from 'react';
import { CodeTabs } from '../CodeTabs/CodeTabs';
import style from './Preset.module.scss';
import { VisualizationPanel } from '../VisualizationPanel/VisualizationPanel';
import { Accordion } from '../Accordion/Accordion';
import { Tag } from '../Tag/Tag';
import type { PresetProps } from './types';
import { API_SERVER_URL } from '../config';

declare global {
  interface Window {
    posthog?: {
      capture: (event: string, properties?: Record<string, unknown>) => void;
    };
  }
}

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
  const [usageViewed, setUsageViewed] = useState(false);

  function handleUsageToggle() {
    if (!usageViewed) {
      window.posthog?.capture('preset_code_copied', { preset_name: name });
      setUsageViewed(true);
    }
  }

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

      <VisualizationPanel visualization={visualization} duration={duration} presetName={name} />

      <div onClick={handleUsageToggle}>
        <Accordion title="Usage" className={style.marginTop}>
          <CodeTabs
            swift={getSwiftPresetImport(shortName || '')}
            reactNative={getReactNativePresetImport(shortName || '')}
          />
        </Accordion>
      </div>
    </div>
  );
}
