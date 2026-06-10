import { useEffect, useState } from 'react';
import type { CatalogEntry } from '../../shared/types';
import { CUSTOM_TAG } from '../../shared/types';
import Visualization from './Visualization';
import iconClose from '../assets/icon-close.svg';
import iconPlay from '../assets/icon-play.svg';
import iconSmartphone from '../assets/icon-smartphone.svg';
import { builtInSnippet, customSnippet, LANGS, type Lang } from './sdkSnippets';

// Plugin's preset-detail modal. Mirrors the preview app's PresetDetailsModal
// recipe (docs-style head bar, blue-10 inner sections, underlined SDK tabs,
// hover-lift/press-shadow copy button) so the two surfaces feel like the same
// dialog rendered in different chromes. Layers a plugin-specific action row
// (Play / Phone / Bind) on top, plus the plugin's waveform Visualization
// component, since neither has an equivalent in the preview.
export default function PresetDetail({
  entry,
  onClose,
  onPlay,
  onPlayOnPhone,
  canPlayOnPhone,
  onBind
}: {
  entry: CatalogEntry;
  onClose: () => void;
  onPlay: () => void;
  onPlayOnPhone: () => void;
  canPlayOnPhone: boolean;
  onBind: () => void;
}) {
  const isCustom = Array.isArray(entry.data.tags) && entry.data.tags.includes(CUSTOM_TAG);
  const [lang, setLang] = useState<Lang>('Swift');
  const snippet = isCustom
    ? customSnippet(lang, entry.data)
    : builtInSnippet(lang, entry.data.name);
  const json = JSON.stringify(entry.data, null, 2);

  // Esc closes — same affordance the preview's modal exposes.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Brief "Copied" confirmation that swaps in the button label for ~1.2s,
  // ported from the preview modal so the affordance feels identical.
  const [copiedKey, setCopiedKey] = useState<'snippet' | 'json' | null>(null);
  const copy = (text: string, key: 'snippet' | 'json') => {
    navigator.clipboard?.writeText(text).then(
      () => {
        setCopiedKey(key);
        window.setTimeout(() => setCopiedKey(null), 1200);
      },
      () => {}
    );
  };

  return (
    <>
      <header className="modal-head">
        <div className="modal-head-text">
          <div className="modal-title">{entry.data.name}</div>
        </div>
        <button className="modal-close" onClick={onClose} title="Close (Esc)" aria-label="Close">
          <img src={iconClose} alt="" width={14} height={14} />
        </button>
      </header>

      <div className="modal-body">
        {/* Action row — Play / Phone / Bind. These are plugin-specific and
            have no counterpart in the preview's modal. Bind is the primary
            CTA (filled blue-20). */}
        <div className="row preset-actions">
          <button className="ghost preset-action-btn" onClick={onPlay} title="Play this preset locally">
            <img src={iconPlay} alt="" width={14} height={14} />
            <span>Play</span>
          </button>
          {canPlayOnPhone && (
            <button
              className="ghost preset-action-btn"
              onClick={onPlayOnPhone}
              title="Play on the paired phone"
            >
              <img src={iconSmartphone} alt="" width={14} height={14} />
              <span>Phone</span>
            </button>
          )}
          <div className="spacer" />
          <button className="primary" onClick={onBind} title="Bind this preset to the selected node">
            Bind
          </button>
        </div>

        {/* Tags row — Custom pill comes first when applicable, then any other
            tags as white pills, matching the preview's filter order. */}
        {(entry.data.tags.length > 0 || isCustom) && (
          <div className="tags-row">
            {isCustom && <span className="tag tag-custom">Custom</span>}
            {entry.data.tags
              .filter((t) => t !== CUSTOM_TAG)
              .map((t) => (
                <span key={t} className="tag tag-white">
                  {t}
                </span>
              ))}
          </div>
        )}

        {/* Waveform — drawn by the existing Visualization component from the
            preset's discrete + continuous arrays. Kept here because seeing the
            shape is part of the plugin's preset-browsing workflow (the preview
            tucks the visual into its prototype iframe instead). */}
        <Visualization data={entry.data} height={80} />

        {entry.data.description && (
          <p className="modal-description">{entry.data.description}</p>
        )}

        <section className="modal-section">
          <div className="modal-section-head">
            <h3>Usage</h3>
          </div>
          <div className="docs-tabs">
            {LANGS.map((l) => (
              <button
                key={l}
                type="button"
                className={`docs-tab${lang === l ? ' active' : ''}`}
                onClick={() => setLang(l)}
              >
                {l}
              </button>
            ))}
          </div>
          <pre className="code-block">{snippet}</pre>
          <div className="modal-section-foot">
            <button className="docs-btn" onClick={() => copy(snippet, 'snippet')}>
              {copiedKey === 'snippet' ? 'Copied' : 'Copy'}
            </button>
          </div>
        </section>

        <section className="modal-section">
          <div className="modal-section-head">
            <h3>Raw pattern data</h3>
          </div>
          <pre className="code-block">{json}</pre>
          <div className="modal-section-foot">
            <button className="docs-btn" onClick={() => copy(json, 'json')}>
              {copiedKey === 'json' ? 'Copied' : 'Copy'}
            </button>
          </div>
        </section>
      </div>
    </>
  );
}
