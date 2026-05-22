import { useState, type CSSProperties } from 'react';
import type { CatalogEntry } from '../../shared/types';
import Visualization from './Visualization';

const SNIPPETS = (name: string) => ({
  Swift: `import Pulsar\n\nlet engine = try HapticEngine()\ntry engine.play(.${camel(name)})`,
  Kotlin: `import com.swmansion.pulsar.Pulsar\n\nPulsar.play(Pulsar.Presets.${camel(name)})`,
  'React Native': `import { Pulsar } from 'react-native-pulsar';\n\nPulsar.play(Pulsar.Presets.${camel(name)});`,
  Flutter: `import 'package:pulsar/pulsar.dart';\n\nPulsar.play(Pulsar.Presets.${camel(name)});`
});

function camel(s: string) {
  return s.charAt(0).toLowerCase() + s.slice(1);
}

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
  const [lang, setLang] = useState<keyof ReturnType<typeof SNIPPETS>>('Swift');
  const snippets = SNIPPETS(entry.data.name);
  const json = JSON.stringify(entry.data, null, 2);

  const copy = (text: string) => {
    navigator.clipboard?.writeText(text).catch(() => {});
  };

  return (
    <div className="col" style={{ padding: 12, height: '100%' }}>
      <div className="row">
        <button className="ghost" onClick={onClose}>← Back</button>
        <div className="spacer" />
        <button className="ghost" onClick={onPlay}>▶ Play</button>
        {canPlayOnPhone && (
          <button className="ghost" onClick={onPlayOnPhone} title="Play on paired phone">
            📱 Phone
          </button>
        )}
        <button className="primary" onClick={onBind}>Bind</button>
      </div>
      <div>
        <div style={{ fontWeight: 700, fontSize: 'var(--fs-xl)' }}>{entry.data.name}</div>
        <div style={{ marginTop: 4 }}>
          {entry.data.tags.map((t) => (
            <span className="tag" key={t}>{t}</span>
          ))}
        </div>
      </div>
      <Visualization data={entry.data} height={80} />
      <p className="muted" style={{ margin: 0 }}>{entry.data.description}</p>

      {/* Usage: SDK code snippets, collapsible */}
      <details className="accordion">
        <summary className="row" style={{ fontWeight: 600, fontSize: 'var(--fs-sm)' }}>
          <span className="caret" aria-hidden="true">▸</span>
          Usage
        </summary>
        <div className="row" style={{ flexWrap: 'wrap', gap: 0, marginTop: 8 }}>
          {(['Swift', 'Kotlin', 'React Native', 'Flutter'] as const).map((t) => (
            <span
              key={t}
              className={`tab ${lang === t ? 'active' : ''}`}
              onClick={() => setLang(t)}
            >
              {t}
            </span>
          ))}
        </div>
        <pre className="mono scroll" style={CODE_STYLE}>{snippets[lang]}</pre>
        <div className="row" style={{ marginTop: 8 }}>
          <div className="spacer" />
          <button className="ghost" onClick={() => copy(snippets[lang])}>Copy</button>
        </div>
      </details>

      {/* Raw JSON, separate from Usage */}
      <details className="accordion">
        <summary className="row" style={{ fontWeight: 600, fontSize: 'var(--fs-sm)' }}>
          <span className="caret" aria-hidden="true">▸</span>
          JSON
        </summary>
        <pre className="mono scroll" style={{ ...CODE_STYLE, marginTop: 8 }}>{json}</pre>
        <div className="row" style={{ marginTop: 8 }}>
          <div className="spacer" />
          <button className="ghost" onClick={() => copy(json)}>Copy</button>
        </div>
      </details>
    </div>
  );
}

const CODE_STYLE: CSSProperties = {
  background: 'var(--color-blue-10)',
  padding: 8,
  borderRadius: 4,
  margin: 0,
  maxHeight: 200,
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word'
};
