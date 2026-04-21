import { useState, useRef } from 'react';
import { CodeTabs } from '../CodeTabs/CodeTabs';
import style from './Preset.module.scss';
import { VisualizationPanel } from '../VisualizationPanel/VisualizationPanel';
import { Accordion } from '../Accordion/Accordion';
import { Tag } from '../Tag/Tag';
import { Modal } from '../Modal/Modal';
import type { PresetConfig } from './types';
import codeIcon from '../../assets/new_assets/code.svg';
import copyIcon from '../../assets/new_assets/copy.svg';
import playIcon from '../../assets/new_assets/play.svg';
import pauseIcon from '../../assets/new_assets/pause.svg';
import heartIcon from '../../assets/new_assets/heart.svg';
import heartFillIcon from '../../assets/new_assets/heart-fill.svg';
import { AudioPatternUtility } from './audio-player';
import { API_SERVER_URL } from '../config';

declare global {
  interface Window {
    posthog?: {
      capture: (event: string, properties?: Record<string, unknown>) => void;
    };
  }
}

function getSwiftPresetImport(shortName: string) {
  const normalizedName = shortName.charAt(0).toLowerCase() + shortName.slice(1);
  return `import Pulsar\n\nlet pulsar = Pulsar()\npulsar.getPresets().${normalizedName}()`;
}

const SYSTEM_CROSS_PLATFORM_PRESETS = new Set([
  'ImpactLight', 'ImpactMedium', 'ImpactHeavy', 'ImpactSoft', 'ImpactRigid',
  'NotificationSuccess', 'NotificationWarning', 'NotificationError', 'Selection',
]);

function getReactNativePresetImport(shortName: string) {
  if (shortName.startsWith('System')) {
    const name = shortName.slice('System'.length).replace('Preset', '');
    const normalizedName = name.charAt(0).toLowerCase() + name.slice(1);
    if (SYSTEM_CROSS_PLATFORM_PRESETS.has(name)) {
      return `import { Presets } from 'react-native-pulsar';\n\nPresets.System.${normalizedName}()`;
    }
    return `import { Presets } from 'react-native-pulsar';\n\nPresets.System.Android.${normalizedName}()`;
  }
  const normalizedName = shortName.charAt(0).toLowerCase() + shortName.slice(1);
  return `import { Presets } from 'react-native-pulsar';\n\nPresets.${normalizedName}()`;
}

function getKotlinPresetImport(shortName: string) {
  const normalizedName = shortName.charAt(0).toLowerCase() + shortName.slice(1);
  return `import com.swmansion.pulsar\n\nlet pulsar = Pulsar()\npulsar.getPresets().${normalizedName}()`;
}

function toAnchorId(name: string) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

interface CompactPresetInternalProps {
  preset: PresetConfig;
  anchorId: string;
  definitionJson: string;
  handleCopy: () => void;
  definitionOpen: boolean;
  setDefinitionOpen: (open: boolean) => void;
  soundEnabled: boolean;
  isFavourite: boolean;
  onToggleFavourite: () => void;
}

function CompactPreset({ preset, anchorId, definitionJson, handleCopy, definitionOpen, setDefinitionOpen, soundEnabled, isFavourite, onToggleFavourite }: CompactPresetInternalProps) {
  const { data } = preset;
  const [isPlaying, setIsPlaying] = useState(false);
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
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      window.posthog?.capture('preset_played', { preset_name: data.name });
      const token = localStorage.getItem('hapticsToken');
      if (token) {
        fetch(`${API_SERVER_URL}/broadcast`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: data.name, token }),
        }).catch(console.error);
      }
      try {
        if (!isParsed.current) {
          await audioPlayer.parsePattern(data);
          isParsed.current = true;
        }
        if (soundEnabled) {
          audioPlayer.play().then(() => setIsPlaying(false));
        } else {
          setIsPlaying(false);
        }
      } catch (error) {
        console.error('Error playing audio:', error);
        setIsPlaying(false);
      }
    }
  };

  return (
    <div id={anchorId} className={style.compactPreset}>
      <div className={style.compactName}>
        <span>{data.name}</span>
        <a href={`#${anchorId}`} className={style.anchorLink} aria-label={`Link to ${data.name}`}>#</a>
      </div>
      {data.tags && data.tags.length > 0 && (
        <div className={style.compactTags}>
          {data.tags.map((tag, idx) => (
            <Tag key={idx} label={tag} variant='blue' />
          ))}
        </div>
      )}
      <div className={style.compactActions}>
        <button className={`${style.compactCodeButton} ${isFavourite ? style.heartActive : ''}`} onClick={onToggleFavourite} aria-label={isFavourite ? 'Unlike preset' : 'Like preset'}>
          <img src={isFavourite ? heartFillIcon.src : heartIcon.src} alt="Favourite" />
        </button>
        <button className={style.compactCodeButton} onClick={() => setDefinitionOpen(true)}>
          <img src={codeIcon.src} alt="Definition" />
        </button>
        <button className={style.compactPlayButton} onClick={handlePlayClick}>
          <img src={isPlaying ? pauseIcon.src : playIcon.src} alt={isPlaying ? 'Pause' : 'Play'} />
        </button>
      </div>
      {definitionOpen && (
        <Modal title="Preset Definition" onClose={() => setDefinitionOpen(false)}>
          <div className={style.jsonContainer}>
            <pre className={style.jsonBlock}>{definitionJson}</pre>
            <button className={style.copyButton} onClick={handleCopy}>
              <img src={copyIcon.src} alt="Copy" />
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

interface PresetProps extends PresetConfig {
  compact?: boolean;
  soundEnabled?: boolean;
  isFavourite?: boolean;
  onToggleFavourite?: () => void;
}

export function Preset(preset: PresetProps) {
  const { data, compact = false, soundEnabled = true, isFavourite = false, onToggleFavourite = () => {} } = preset;
  const anchorId = toAnchorId(data.name);
  const [usageViewed, setUsageViewed] = useState(false);
  const [definitionOpen, setDefinitionOpen] = useState(false);

  function handleUsageToggle() {
    if (!usageViewed) {
      window.posthog?.capture('preset_code_copied', { preset_name: data.name });
      setUsageViewed(true);
    }
  }

  const definitionJson = JSON.stringify(
    { continuousPattern: data.continuousPattern, discretePattern: data.discretePattern },
    null,
    2
  );

  function handleCopy() {
    navigator.clipboard.writeText(definitionJson);
  }

  if (compact) {
    return (
      <CompactPreset preset={preset} anchorId={anchorId} definitionJson={definitionJson} handleCopy={handleCopy} definitionOpen={definitionOpen} setDefinitionOpen={setDefinitionOpen} soundEnabled={soundEnabled} isFavourite={isFavourite} onToggleFavourite={onToggleFavourite} />
    );
  }

  return (
    <div id={anchorId} className={style.preset}>
      {data.tags && data.tags.length > 0 && (
        <div className={style.tagsBar}>
          {data.tags.map((tag, idx) => (
            <Tag key={idx} label={tag} variant='blue' />
          ))}
        </div>
      )}

      <div className={style.topRightButtons}>
        <button className={`${style.heartButton} ${isFavourite ? style.heartActive : ''}`} onClick={onToggleFavourite} aria-label={isFavourite ? 'Unlike preset' : 'Like preset'}>
          <img src={isFavourite ? heartFillIcon.src : heartIcon.src} alt="Favourite" />
        </button>
        <button className={style.definitionButton} onClick={() => setDefinitionOpen(true)}>
          <img src={codeIcon.src} alt="Definition" />
        </button>
      </div>

      <div className={style.header}>
        <div className={style.nameRow}>
          <div className={style.name}>{data.name}</div>
          <a href={`#${anchorId}`} className={style.anchorLink} aria-label={`Link to ${data.name}`}>#</a>
        </div>
        <div className={style.description}>{data.description}</div>
      </div>

      {definitionOpen && (
        <Modal title="Preset Definition" onClose={() => setDefinitionOpen(false)}>
          <div className={style.jsonContainer}>
            <pre className={style.jsonBlock}>{definitionJson}</pre>
            <button className={style.copyButton} onClick={handleCopy}>
              <img src={copyIcon.src} alt="Copy" />
            </button>
          </div>
        </Modal>
      )}

      <VisualizationPanel visualization={preset} presetName={data.name} soundEnabled={soundEnabled} />

      <div onClick={handleUsageToggle}>
        <Accordion title="Usage" className={style.marginTop}>
          <CodeTabs
            swift={getSwiftPresetImport(data.name)}
            kotlin={getKotlinPresetImport(data.name)}
            reactNative={getReactNativePresetImport(data.name)}
          />
        </Accordion>
      </div>
    </div>
  );
}
