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
    <div className="preset-card">
      <div className="row" style={{ marginBottom: 8 }}>
        <div style={{ flex: 1, minWidth: 0, fontWeight: 700, fontSize: 'var(--fs-lg)' }}>
          {data.name}
          {isBound && <span className="tag" style={{ marginLeft: 6 }}>bound</span>}
        </div>
        <button className="ghost icon" onClick={onPlay} title="Play">▶</button>
      </div>
      {data.tags.length > 0 && (
        <div
          className="scroll row"
          style={{
            gap: 6,
            marginBottom: 8,
            flexWrap: 'nowrap',
            overflowX: 'auto',
            overflowY: 'hidden',
            paddingBottom: 2
          }}
        >
          {data.tags.map((t) => (
            <span className="tag" key={t} style={{ margin: 0, flex: '0 0 auto' }}>{t}</span>
          ))}
        </div>
      )}
      <Visualization data={data} />
      <div className="row" style={{ marginTop: 8 }}>
        <div className="spacer" />
        <button className="ghost" onClick={onOpen}>Details</button>
        <button className="primary" onClick={onBind}>Bind</button>
      </div>
    </div>
  );
}
