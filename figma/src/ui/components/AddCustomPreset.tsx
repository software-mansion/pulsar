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
          <span className="tag active" style={{ margin: 0 }}>{customPresets.length}</span>
        )}
        <span className="acc-chevron" aria-hidden="true">
          <img src={iconChevron} alt="" />
        </span>
      </summary>

      <div className="col acc-body" style={{ gap: 6 }}>
        <div className="muted" style={{ fontSize: 'var(--fs-2xs)' }}>
          {editingId ? 'Editing custom preset (JSON)' : 'Paste a preset JSON to add it to the list'}
        </div>
        <textarea
          rows={10}
          spellCheck={false}
          value={json}
          onChange={(e) => {
            setJson(e.target.value);
            if (error) setError(null);
          }}
          style={{ fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 'var(--fs-2xs)' }}
        />
        {error && (
          <span style={{ color: 'crimson', fontSize: 'var(--fs-2xs)' }}>{error}</span>
        )}
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
          <div className="col" style={{ gap: 4, marginTop: 4 }}>
            <div className="muted" style={{ fontSize: 'var(--fs-2xs)' }}>Your custom presets</div>
            {customPresets.map((e) => (
              <div key={e.id} className="row" style={{ gap: 6 }}>
                <span
                  style={{
                    fontSize: 'var(--fs-xs)',
                    flex: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                  title={e.data.name}
                >
                  {e.data.name}
                </span>
                <button
                  className="ghost"
                  style={{ padding: '2px 8px' }}
                  onClick={() => setEditingId(e.id)}
                  disabled={editingId === e.id}
                >
                  Edit
                </button>
                <button
                  className="ghost"
                  style={{ padding: '2px 8px' }}
                  title="Remove"
                  onClick={() => {
                    if (editingId === e.id) reset();
                    onRemove(e.id);
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </details>
  );
}
