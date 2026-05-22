import { useState } from 'react';
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
  const [tab, setTab] = useState<keyof ReturnType<typeof SNIPPETS> | 'json'>('Swift');
  const snippets = SNIPPETS(entry.data.name);
  const code =
    tab === 'json' ? JSON.stringify(entry.data, null, 2) : snippets[tab];

  const copy = () => {
    navigator.clipboard?.writeText(code).catch(() => {});
  };

  return (
    <div className="col" style={{ padding: 12, height: '100%' }}>
      <div className="row">
        <button className="ghost" onClick={onClose}>← Back</button>
        <div className="spacer" />
        <button className="ghost" onClick={onPlay}>▶ Play</button>
        {canPlayOnPhone && (
          <button className="primary" onClick={onPlayOnPhone} title="Play on paired phone">
            📱 Phone
          </button>
        )}
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

      <div className="row" style={{ flexWrap: 'wrap', gap: 4 }}>
        {(['Swift', 'Kotlin', 'React Native', 'Flutter', 'json'] as const).map((t) => (
          <span
            key={t}
            className={`tag ${tab === t ? 'active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t === 'json' ? 'JSON' : t}
          </span>
        ))}
      </div>

      <pre
        className="mono scroll"
        style={{
          background: 'var(--color-blue-10)',
          padding: 8,
          borderRadius: 4,
          margin: 0,
          flex: 1,
          maxHeight: 200,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}
      >
        {code}
      </pre>

      <div className="row">
        <button className="ghost" onClick={copy}>Copy</button>
        <div className="spacer" />
        <button className="primary" onClick={onBind}>Bind to selection</button>
      </div>
    </div>
  );
}
