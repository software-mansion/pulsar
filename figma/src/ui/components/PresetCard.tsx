import type { CatalogEntry } from '../../shared/types';
import Visualization from './Visualization';

const formatDuration = (ms: number) =>
  ms >= 1000 ? `${(ms / 1000).toFixed(ms % 1000 === 0 ? 0 : 1)} s` : `${Math.round(ms)} ms`;

export default function PresetCard({
  entry,
  compact,
  isBound,
  isFavourite,
  onToggleFavourite,
  onPlay,
  onBind,
  onOpen
}: {
  entry: CatalogEntry;
  compact: boolean;
  isBound: boolean;
  isFavourite: boolean;
  onToggleFavourite: () => void;
  onPlay: () => void;
  onBind: () => void;
  onOpen: () => void;
}) {
  const { data } = entry;

  const favButton = (
    <button
      className="fav"
      title={isFavourite ? 'Remove from favourites' : 'Add to favourites'}
      aria-pressed={isFavourite}
      onClick={onToggleFavourite}
    >
      <span className="star">{isFavourite ? '★' : '☆'}</span>
    </button>
  );

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
            {isBound && <span className="bound-badge" style={{ marginLeft: 6 }}>● bound</span>}
          </div>
          <div className="muted" style={{ fontSize: 'var(--fs-2xs)' }}>
            {[...data.tags.slice(0, 4), formatDuration(data.duration)].join(' · ')}
          </div>
        </div>
        {favButton}
        <button className="primary icon" onClick={onBind} title="Bind to selection">Bind</button>
      </div>
    );
  }

  return (
    <div className="preset-card">
      <div className="row" style={{ marginBottom: 8 }}>
        <div style={{ flex: 1, minWidth: 0, fontWeight: 700, fontSize: 'var(--fs-lg)' }}>
          {data.name}
          {isBound && <span className="bound-badge" style={{ marginLeft: 6 }}>● bound</span>}
        </div>
        {favButton}
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
      <div className="row" style={{ marginTop: 6 }}>
        <span
          className="muted"
          style={{ fontSize: 'var(--fs-2xs)' }}
          title="Pattern duration"
        >
          {formatDuration(data.duration)}
        </span>
        <div className="spacer" />
        <button className="ghost" onClick={onOpen}>Details</button>
        <button className="primary" onClick={onBind}>Bind</button>
      </div>
    </div>
  );
}
