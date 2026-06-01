import { useEffect, useState } from 'react';
import type { PresetData } from '../types';

const LANGS = ['Swift', 'Kotlin', 'React Native', 'Flutter'] as const;
type Lang = (typeof LANGS)[number];

const camel = (s: string) => s.charAt(0).toLowerCase() + s.slice(1).replace(/\s+/g, '');

const snippetsFor = (name: string): Record<Lang, string> => ({
  Swift: `import Pulsar\n\nlet engine = try HapticEngine()\ntry engine.play(.${camel(name)})`,
  Kotlin: `import com.swmansion.pulsar.Pulsar\n\nPulsar.play(Pulsar.Presets.${camel(name)})`,
  'React Native': `import { Pulsar } from 'react-native-pulsar';\n\nPulsar.play(Pulsar.Presets.${camel(name)});`,
  Flutter: `import 'package:pulsar/pulsar.dart';\n\nPulsar.play(Pulsar.Presets.${camel(name)});`
});

export function PresetDetailsModal({
  data,
  elementName,
  onClose
}: {
  data: PresetData;
  elementName?: string;
  onClose: () => void;
}) {
  const [lang, setLang] = useState<Lang>('Swift');
  const snippets = snippetsFor(data.name);
  const json = JSON.stringify(data, null, 2);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const copy = (text: string) => {
    navigator.clipboard?.writeText(text).catch(() => {});
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-body">
          <div className="row" style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 'var(--fs-xl)' }}>{data.name}</div>
              {elementName && (
                <div className="muted" style={{ fontSize: 'var(--fs-xs)', marginTop: 2 }}>
                  on {elementName}
                </div>
              )}
            </div>
            <button className="modal-close" onClick={onClose} title="Close (Esc)">
              ✕
            </button>
          </div>

          {data.tags.length > 0 && (
            <div>
              {data.tags.map((t) => (
                <span key={t} className="tag">{t}</span>
              ))}
            </div>
          )}

          {data.description && (
            <p className="muted" style={{ margin: 0, fontSize: 'var(--fs-sm)' }}>
              {data.description}
            </p>
          )}

          {/* Usage: language tabs + snippet */}
          <div>
            <div style={{ fontWeight: 600, marginBottom: 6, fontSize: 'var(--fs-sm)' }}>Usage</div>
            <div style={{ display: 'flex', gap: 0, flexWrap: 'wrap', marginBottom: 8 }}>
              {LANGS.map((l) => (
                <span
                  key={l}
                  className={`tab ${lang === l ? 'active' : ''}`}
                  onClick={() => setLang(l)}
                >
                  {l}
                </span>
              ))}
            </div>
            <pre className="code">{snippets[lang]}</pre>
            <div style={{ display: 'flex', marginTop: 6 }}>
              <span className="spacer" />
              <button className="docs-btn" onClick={() => copy(snippets[lang])}>
                Copy
              </button>
            </div>
          </div>

          {/* Raw JSON */}
          <div>
            <div style={{ fontWeight: 600, marginBottom: 6, fontSize: 'var(--fs-sm)' }}>
              JSON config
            </div>
            <pre className="code">{json}</pre>
            <div style={{ display: 'flex', marginTop: 6 }}>
              <span className="spacer" />
              <button className="docs-btn" onClick={() => copy(json)}>
                Copy
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
