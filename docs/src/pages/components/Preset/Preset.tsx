import style from './Preset.module.scss';
import { VisualizationPanel } from '../../../content/docs/components/VisualizationPanel/VisualizationPanel';
import { Tag } from '../../../content/docs/components/Tag/Tag';
import type { PresetConfig } from '../../../content/docs/components/Preset/types';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { BASE_PATH } from '../../../../config';

const TOAST_EXIT_DURATION = 300;

export function Preset(preset: PresetConfig) {
  const { data } = preset;
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  function dismissToast() {
    setIsExiting(true);
    setTimeout(() => {
      setIsToastVisible(false);
      setIsExiting(false);
    }, TOAST_EXIT_DURATION);
  }

  useEffect(() => {
    if (!isToastVisible) return;
    const timer = setTimeout(dismissToast, 6000);
    return () => clearTimeout(timer);
  }, [isToastVisible]);

  return (
    <div className={style.preset}>
      {data.tags && data.tags.length > 0 && (
        <div className={style.tagsBar}>
          {data.tags.map((tag, idx) => (
            <Tag key={idx} label={tag} />
          ))}
        </div>
      )}

      <div className={style.header}>
        <div className={style.name}>{data.name}</div>
        <div className={style.description}>{data.description}</div>
      </div>

      <VisualizationPanel
        visualization={preset}
        playOnDevice={() => { setIsToastVisible(true); setIsExiting(false); }}
        presetName={data.name}
      />

      {isToastVisible && createPortal(
        <div className={`${style.toast} ${isExiting ? style.toastExit : style.toastEnter}`} role="status">
          <span>
            To play haptics on your phone, visit the{' '}
            <a href={`${BASE_PATH}/presets-playground`}>Presets Playground</a>
            {' '}where you can connect your device.
          </span>
          <button
            className={style.toastClose}
            onClick={dismissToast}
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>,
        document.body
      )}
    </div>
  );
}
