import styles from './AddCustomPreset.module.css';
import { useEffect, useState } from 'react';
import type { CatalogEntry } from '../../shared/types';
import {
  EMPTY_PRESET_TEMPLATE,
  makeEntry,
  parseCustomPresetJson,
  stringifyPreset
} from './customPreset';
import iconPlus from '../assets/icon-square-plus.svg';
import iconChevron from '../assets/icon-chevron-down.svg';
import iconWaveform from '../assets/icon-audio-waveform.svg';
import iconPencil from '../assets/icon-pencil.svg';
import iconTrash from '../assets/icon-trash-2.svg';

export default function AddCustomPreset({
  customPresets,
  onAdd,
  onUpdate,
  onRemove
}: {
  customPresets: CatalogEntry[];
  onAdd: (entry: CatalogEntry) => void;
  onUpdate: (id: string, entry: CatalogEntry) => void;
  onRemove: (id: string) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [json, setJson] = useState<string>(EMPTY_PRESET_TEMPLATE);
  const [error, setError] = useState<string | null>(null);

  // When entering edit mode, pre-fill the textarea with that preset's JSON.
  useEffect(() => {
    if (!editingId) return;
    const e = customPresets.find((p) => p.id === editingId);
    if (e) setJson(stringifyPreset(e.data));
  }, [editingId]);

  const reset = () => {
    setEditingId(null);
    setJson(EMPTY_PRESET_TEMPLATE);
    setError(null);
  };

  const submit = () => {
    try {
      const data = parseCustomPresetJson(json);
      const entry = makeEntry(data, editingId ?? undefined);
      if (editingId) onUpdate(editingId, entry);
      else onAdd(entry);
      reset();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <details className="accordion acc-row">
      <summary className="acc-head">
        <span className="acc-icon">
          <img src={iconPlus} alt="" />
        </span>
        <span className="acc-title">Custom presets</span>
        {customPresets.length > 0 && (
          <span className="tag active tag-flush">{customPresets.length}</span>
        )}
        <span className="acc-chevron" aria-hidden="true">
          <img src={iconChevron} alt="" />
        </span>
      </summary>

      <div className="col acc-body">
        <div>
          <div className="acc-label">{editingId ? 'Editing preset (JSON)' : 'Paste preset JSON'}</div>
          <textarea
            className={styles['preset-editor']}
            rows={8}
            spellCheck={false}
            value={json}
            onChange={(e) => {
              setJson(e.target.value);
              if (error) setError(null);
            }}
          />
        </div>
        {error && <span className={styles['preset-error']}>{error}</span>}
        <div className="row">
          <button className="primary" onClick={submit} disabled={!json.trim()}>
            {editingId ? 'Save changes' : 'Add to presets'}
          </button>
          {(editingId || json !== EMPTY_PRESET_TEMPLATE) && (
            <button className="ghost" onClick={reset}>
              {editingId ? 'Cancel' : 'Clear'}
            </button>
          )}
        </div>

        {customPresets.length > 0 && (
          <div>
            <div className="acc-sep" />
            <div className="acc-label">Your presets</div>
            <div className={`col ${styles['custom-preset-list']}`}>
              {customPresets.map((e) => (
                <div key={e.id} className={styles['preset-row']}>
                  <img className={styles['preset-row-icon']} src={iconWaveform} alt="" />
                  <span className={styles['preset-row-name']} title={e.data.name}>
                    {e.data.name}
                  </span>
                  <button
                    className={styles['icon-btn']}
                    title="Edit"
                    aria-label="Edit preset"
                    onClick={() => setEditingId(e.id)}
                    disabled={editingId === e.id}
                  >
                    <img src={iconPencil} alt="" />
                  </button>
                  <button
                    className={styles['icon-btn']}
                    title="Remove"
                    aria-label="Remove preset"
                    onClick={() => {
                      if (editingId === e.id) reset();
                      onRemove(e.id);
                    }}
                  >
                    <img src={iconTrash} alt="" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </details>
  );
}
