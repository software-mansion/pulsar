import { useRef } from 'react';
import { CodeTabs } from '../CodeTabs/CodeTabs';
import style from './Preset.module.scss';
import { VisualizationPanel } from '../VisualizationPanel/VisualizationPanel';
import { Accordion } from '../Accordion/Accordion';
import { Tag } from '../Tag/Tag';
import type { PresetProps } from './types';
import { AudioPatternUtility } from './audio-player';

function getSwiftPresetImport(shortName: string) {
  return `import Pulsar\n\nPulsar.${shortName}.play()`;
}

function getReactNativePresetImport(shortName: string) {
  return `import { Pulsar } from '@haptics/library';\n\nPulsar.${shortName}.play();`;
}

export function Preset({ name, shortName, description, tags, duration = 0, visualization }: PresetProps) {
  const audioPlayerRef = useRef<AudioPatternUtility | null>(null);
  const isParsed = useRef<boolean>(false);

  if (!audioPlayerRef.current) {
    audioPlayerRef.current = new AudioPatternUtility();
  }

  const handlePlayClick = async () => {
    const audioPlayer = audioPlayerRef.current;
    if (!audioPlayer) return;

    if (audioPlayer.isPlaying()) {
      audioPlayer.stop();
    } else {
      try {
        if (!isParsed.current) {
          await audioPlayer.parsePattern(visualization.data);
          isParsed.current = true;
        }
        await audioPlayer.play();
      } catch (error) {
        console.error('Error playing audio:', error);
      }
    }
  };
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
      image={visualization.image}
      duration={duration}
      onPlayClick={handlePlayClick}
      onRecordClick={() => console.log('Record')}
    />
    <Accordion title='Usage' className={style.marginTop}>
      <CodeTabs 
        swift={getSwiftPresetImport(shortName || '')}
        reactNative={getReactNativePresetImport(shortName || '')}
      />
    </Accordion>
  </div>
}
