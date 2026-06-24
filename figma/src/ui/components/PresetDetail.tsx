import styles from './PresetDetail.module.css';
import { useEffect, useState } from 'react';
import type { CatalogEntry } from '../../shared/types';
import { CUSTOM_TAG } from '../../shared/types';
import Visualization from './Visualization';
import iconClose from '../assets/icon-close.svg';
import iconPlay from '../assets/icon-play.svg';
import iconSmartphone from '../assets/icon-smartphone.svg';
import iconCopy from '../assets/icon-copy.svg';
import iconCheck from '../assets/icon-check.svg';
import { builtInSnippet, customSnippet, LANGS, type Lang } from './sdkSnippets';

// Plugin's preset-detail modal. Mirrors the preview app's PresetDetailsModal
// recipe (docs-style head bar, blue-10 inner sections, underlined SDK tabs,
// corner copy-icon button) so the two surfaces feel like the same
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

  // Brief "Copied" confirmation that swaps the copy glyph for a check ~1.2s,
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
      <header className={styles['modal-head']}>
        <div className={styles['modal-head-text']}>
          <div className={styles['modal-title']}>{entry.data.name}</div>
        </div>
        <button className={styles['modal-close']} onClick={onClose} title="Close (Esc)" aria-label="Close">
          <img src={iconClose} alt="" width={14} height={14} />
        </button>
      </header>

      <div className={styles['modal-body']}>
        {/* Action row — Play / Phone / Bind. These are plugin-specific and
            have no counterpart in the preview's modal. Bind is the primary
            CTA (filled blue-20). */}
        <div className={`row ${styles['preset-actions']}`}>
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
          <div className={styles['tags-row']}>
            {isCustom && <span className={`tag ${styles['tag-custom']}`}>Custom</span>}
            {entry.data.tags
              .filter((t) => t !== CUSTOM_TAG)
              .map((t) => (
                <span key={t} className={`tag ${styles['tag-white']}`}>
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
          <p className={styles['modal-description']}>{entry.data.description}</p>
        )}

        <section className={styles['modal-section']}>
          <div className={styles['modal-section-head']}>
            <h3>Usage</h3>
          </div>
          <div className={styles['docs-tabs']}>
            {LANGS.map((l) => (
              <button
                key={l}
                type="button"
                className={`${styles['docs-tab']}${lang === l ? ` ${styles['active']}` : ''}`}
                onClick={() => setLang(l)}
              >
                {l}
              </button>
            ))}
          </div>
          <div className={styles['code-block-wrap']}>
            <pre className={styles['code-block']}>{snippet}</pre>
            <button
              className={styles['code-copy-btn']}
              onClick={() => copy(snippet, 'snippet')}
              title="Copy"
              aria-label={copiedKey === 'snippet' ? 'Copied' : 'Copy'}
            >
              <img
                src={copiedKey === 'snippet' ? iconCheck : iconCopy}
                alt=""
                width={16}
                height={16}
              />
            </button>
          </div>
        </section>

        <section className={styles['modal-section']}>
          <div className={styles['modal-section-head']}>
            <h3>Raw pattern data</h3>
          </div>
          <div className={styles['code-block-wrap']}>
            <pre className={styles['code-block']}>{json}</pre>
            <button
              className={styles['code-copy-btn']}
              onClick={() => copy(json, 'json')}
              title="Copy"
              aria-label={copiedKey === 'json' ? 'Copied' : 'Copy'}
            >
              <img
                src={copiedKey === 'json' ? iconCheck : iconCopy}
                alt=""
                width={16}
                height={16}
              />
            </button>
          </div>
        </section>
      </div>
    </>
  );
}
