import { useState } from 'react';
import { useEscapeKey } from '../lib/useEscapeKey';
import { LANGS, type Lang, builtInSnippet, customSnippet } from '../lib/snippets';
import type { PresetData } from '../types';
import closeIcon from '../assets/icon-close.svg';
import copyIcon from '../assets/icon-copy.svg';
import checkIcon from '../assets/icon-check.svg';

export function PresetDetailsModal({
  data,
  elementName,
  isCustom = false,
  onClose
}: {
  data: PresetData;
  elementName?: string;
  isCustom?: boolean;
  onClose: () => void;
}) {
  const [lang, setLang] = useState<Lang>('Swift');
  const snippet = isCustom ? customSnippet(lang, data) : builtInSnippet(lang, data.name);
  const json = JSON.stringify(data, null, 2);

  useEscapeKey(onClose);

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
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <header className="modal-head">
          <div className="modal-head-text">
            <div className="modal-title">{data.name}</div>
            {elementName && <div className="modal-subtitle">on {elementName}</div>}
          </div>
          <button className="modal-close" onClick={onClose} title="Close (Esc)" aria-label="Close">
            <img src={closeIcon} alt="" width={14} height={14} />
          </button>
        </header>

        <div className="modal-body">
          {(data.tags.length > 0 || isCustom) && (
            <div className="tags-row">
              {isCustom && <span className="tag tag-custom">Custom</span>}
              {data.tags
                .filter((t) => t !== 'Custom')
                .map((t) => (
                  <span key={t} className="tag tag-white">
                    {t}
                  </span>
                ))}
            </div>
          )}

          {data.description && <p className="modal-description">{data.description}</p>}

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
            <div className="code-block-wrap">
              <pre className="code-block">{snippet}</pre>
              <button
                className="code-copy-btn"
                onClick={() => copy(snippet, 'snippet')}
                title="Copy"
                aria-label={copiedKey === 'snippet' ? 'Copied' : 'Copy'}
              >
                <img
                  src={copiedKey === 'snippet' ? checkIcon : copyIcon}
                  alt=""
                  width={16}
                  height={16}
                />
              </button>
            </div>
          </section>

          <section className="modal-section">
            <div className="modal-section-head">
              <h3>Raw pattern data</h3>
            </div>
            <div className="code-block-wrap">
              <pre className="code-block">{json}</pre>
              <button
                className="code-copy-btn"
                onClick={() => copy(json, 'json')}
                title="Copy"
                aria-label={copiedKey === 'json' ? 'Copied' : 'Copy'}
              >
                <img
                  src={copiedKey === 'json' ? checkIcon : copyIcon}
                  alt=""
                  width={16}
                  height={16}
                />
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
