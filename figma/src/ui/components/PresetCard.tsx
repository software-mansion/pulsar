import type { CatalogEntry } from '../../shared/types';
import Visualization from './Visualization';

export default function PresetCard({
  entry,
  compact,
  isBound,
  onPlay,
  onBind,
  onOpen
}: {
  entry: CatalogEntry;
  compact: boolean;
  isBound: boolean;
  onPlay: () => void;
  onBind: () => void;
  onOpen: () => void;
}) {
  const { data } = entry;

  if (compact) {
    return (
      <div
        className="row"
        style={{
          padding: '6px 8px',
          borderBottom: '1px solid var(--border)',
          gap: 8
        }}
      >
        <button className="ghost icon" onClick={onPlay} title="Play">▶</button>
        <div style={{ minWidth: 0, flex: 1 }} onClick={onOpen}>
          <div style={{ fontWeight: 600, cursor: 'pointer' }}>
            {data.name}
            {isBound && <span className="tag" style={{ marginLeft: 6 }}>bound</span>}
          </div>
          <div className="muted" style={{ fontSize: 'var(--fs-2xs)' }}>
            {data.tags.slice(0, 4).join(' · ')} · {data.duration}ms
          </div>
        </div>
        <button className="primary icon" onClick={onBind} title="Bind to selection">Bind</button>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: 10,
        margin: '0 8px 10px',
        background: 'var(--surface)',
        border: '2px solid var(--text)',
        borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow-card)'
      }}
    >
      <div className="row">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 'var(--fs-lg)' }}>
            {data.name}
            {isBound && <span className="tag" style={{ marginLeft: 6 }}>bound</span>}
          </div>
          <div style={{ marginTop: 2 }}>
            {data.tags.map((t) => (
              <span className="tag" key={t}>{t}</span>
            ))}
          </div>
        </div>
        <button className="ghost icon" onClick={onPlay} title="Play">▶</button>
      </div>
      <div style={{ marginTop: 8 }}>
        <Visualization data={data} />
      </div>
      <p className="muted" style={{ margin: '8px 0 8px', fontSize: 'var(--fs-xs)' }}>
        {data.description}
      </p>
      <div className="row">
        <span className="muted" style={{ fontSize: 'var(--fs-2xs)' }}>{data.duration}ms</span>
        <div className="spacer" />
        <button className="ghost" onClick={onOpen}>Details</button>
        <button className="primary" onClick={onBind}>Bind</button>
      </div>
    </div>
  );
}
