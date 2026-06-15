import { useRef, useState } from 'react';
import type { HapticPattern } from 'pulsar-haptics';
import style from '../Preset/Preset.module.scss';
import { Accordion } from '../Accordion/Accordion';
import { Tag } from '../Tag/Tag';
import { Modal } from '../Modal/Modal';
import { WebVisualizationPanel } from './WebVisualizationPanel';
import { WebCodeTabs, type WebCodeTab } from './WebCodeTabs';
import type { WebPresetConfig } from './types';
import codeIcon from '../../assets/new_assets/code.svg';
import copyIcon from '../../assets/new_assets/copy.svg';
import playIcon from '../../assets/new_assets/play.svg';
import pauseIcon from '../../assets/new_assets/pause.svg';
import heartIcon from '../../assets/new_assets/heart.svg';
import heartFillIcon from '../../assets/new_assets/heart-fill.svg';

declare global {
  interface Window {
    posthog?: {
      capture: (event: string, properties?: Record<string, unknown>) => void;
    };
  }
}

function toAnchorId(name: string) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function getWebUsageTabs(name: string): WebCodeTab[] {
  const method = `${name.charAt(0).toLowerCase()}${name.slice(1)}`;
  return [
    {
      id: 'javascript',
      label: 'JavaScript',
      code: `import { Presets } from 'pulsar-haptics';\n\nPresets.${method}();`,
    },
    {
      id: 'react',
      label: 'React',
      code: `import { usePresets } from 'pulsar-haptics/react';\n\nconst presets = usePresets();\npresets.${method}()\n`,
    },
    {
      id: 'browser',
      label: 'Browser',
      code: `<script src="https://unpkg.com/pulsar-haptics"></script>\n\n<script>\n  const presets = Pulsar.Presets;\n  presets.${method}();\n</script>`,
    },
  ];
}

function useWebPlayer(data: WebPresetConfig['data'], soundEnabled: boolean) {
  const [isPlaying, setIsPlaying] = useState(false);
  const presetRef = useRef<{ play: () => Promise<unknown>; stop: () => boolean } | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toggle = async () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (isPlaying) {
      presetRef.current?.stop();
      setIsPlaying(false);
      return;
    }
    setIsPlaying(true);
    window.posthog?.capture('web_preset_played', { preset_name: data.name });
    try {
      const { Preset, Settings } = await import('pulsar-haptics');
      Settings.enableSound(soundEnabled);
      const preset = new Preset(
        data.name,
        data.pattern as unknown as HapticPattern,
      ) as unknown as NonNullable<typeof presetRef.current>;
      presetRef.current = preset;
      preset.play();
      timeoutRef.current = setTimeout(() => setIsPlaying(false), data.duration + 150);
    } catch (error) {
      console.error('Error playing web preset:', error);
      setIsPlaying(false);
    }
  };

  return { isPlaying, toggle };
}

interface WebPresetProps extends WebPresetConfig {
  compact?: boolean;
  soundEnabled?: boolean;
  isFavourite?: boolean;
  onToggleFavourite?: () => void;
}

export function WebPreset(preset: WebPresetProps) {
  const {
    data,
    compact = false,
    soundEnabled = true,
    isFavourite = false,
    onToggleFavourite = () => {},
  } = preset;
  const anchorId = toAnchorId(data.name);
  const [definitionOpen, setDefinitionOpen] = useState(false);

  const definitionJson = JSON.stringify({ pattern: data.pattern }, null, 2);
  const handleCopy = () => navigator.clipboard.writeText(definitionJson);

  const compactPlayer = useWebPlayer(data, soundEnabled);

  const definitionModal = definitionOpen && (
    <Modal title="Preset Definition" onClose={() => setDefinitionOpen(false)}>
      <div className={style.jsonContainer}>
        <pre className={style.jsonBlock}>{definitionJson}</pre>
        <button className={style.copyButton} onClick={handleCopy}>
          <img src={copyIcon.src} alt="Copy" />
        </button>
      </div>
    </Modal>
  );

  if (compact) {
    return (
      <div id={anchorId} className={style.compactPreset}>
        <div className={style.compactName}>
          <span>{data.name}</span>
          <a href={`#${anchorId}`} className={style.anchorLink} aria-label={`Link to ${data.name}`}>
            #
          </a>
        </div>
        {data.tags.length > 0 && (
          <div className={style.compactTags}>
            {data.tags.map((tag, idx) => (
              <Tag key={idx} label={tag} variant="blue" />
            ))}
          </div>
        )}
        <div className={style.compactActions}>
          <button
            className={`${style.compactCodeButton} ${isFavourite ? style.heartActive : ''}`}
            onClick={onToggleFavourite}
            aria-label={isFavourite ? 'Unlike preset' : 'Like preset'}
          >
            <img src={isFavourite ? heartFillIcon.src : heartIcon.src} alt="Favourite" />
          </button>
          <button className={style.compactCodeButton} onClick={() => setDefinitionOpen(true)}>
            <img src={codeIcon.src} alt="Definition" />
          </button>
          <button className={style.compactPlayButton} onClick={compactPlayer.toggle}>
            <img
              src={compactPlayer.isPlaying ? pauseIcon.src : playIcon.src}
              alt={compactPlayer.isPlaying ? 'Pause' : 'Play'}
            />
          </button>
        </div>
        {definitionModal}
      </div>
    );
  }

  return (
    <div id={anchorId} className={style.preset}>
      {data.tags.length > 0 && (
        <div className={style.tagsBar}>
          {data.tags.map((tag, idx) => (
            <Tag key={idx} label={tag} variant="blue" />
          ))}
        </div>
      )}

      <div className={style.topRightButtons}>
        <button
          className={`${style.heartButton} ${isFavourite ? style.heartActive : ''}`}
          onClick={onToggleFavourite}
          aria-label={isFavourite ? 'Unlike preset' : 'Like preset'}
        >
          <img src={isFavourite ? heartFillIcon.src : heartIcon.src} alt="Favourite" />
        </button>
        <button className={style.definitionButton} onClick={() => setDefinitionOpen(true)}>
          <img src={codeIcon.src} alt="Definition" />
        </button>
      </div>

      <div className={style.header}>
        <div className={style.nameRow}>
          <div className={style.name}>{data.name}</div>
          <a href={`#${anchorId}`} className={style.anchorLink} aria-label={`Link to ${data.name}`}>
            #
          </a>
        </div>
        <div className={style.description}>{data.description}</div>
      </div>

      {definitionModal}

      <WebVisualizationPanel visualization={preset} soundEnabled={soundEnabled} />

      <Accordion title="Usage" className={style.marginTop}>
        <WebCodeTabs tabs={getWebUsageTabs(data.name)} />
      </Accordion>
    </div>
  );
}
