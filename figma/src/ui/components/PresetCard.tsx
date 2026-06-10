import type { CatalogEntry } from '../../shared/types';
import Visualization from './Visualization';
import iconPlay from '../assets/icon-play.svg';
import iconClock from '../assets/icon-clock.svg';
import iconLink from '../assets/icon-link.svg';
import iconInfo from '../assets/icon-info.svg';

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

  // Lighter, borderless favourite star — shared by both layouts.
  const favButton = (
    <button
      className="fav-plain"
      title={isFavourite ? 'Remove from favourites' : 'Add to favourites'}
      aria-pressed={isFavourite}
      onClick={onToggleFavourite}
    >
      <span className="star">{isFavourite ? '★' : '☆'}</span>
    </button>
  );

  const boundBadge = isBound ? (
    <span className="bound-badge" style={{ flexShrink: 0 }}>● bound</span>
  ) : null;

  if (compact) {
    // One dense bordered line: play · name · scrolling tags · duration · fav · bind.
    return (
      <div className="preset-row-compact">
        <button className="ghost icon" onClick={onPlay} title="Play">
          <img src={iconPlay} alt="" width={14} height={14} />
        </button>
        <span className="preset-row-compact-name" onClick={onOpen} title={data.name}>
          {data.name}
        </span>
        {boundBadge}
        <div className="preset-row-compact-tags">
          {data.tags.map((t) => (
            <span className="tag" key={t} style={{ margin: 0 }}>{t}</span>
          ))}
        </div>
        <span className="muted preset-row-compact-dur" title="Pattern duration">
          {formatDuration(data.duration)}
        </span>
        {favButton}
        <button className="primary icon" onClick={onBind} title="Bind to selection" aria-label="Bind to selection">
          <img src={iconLink} alt="" width={14} height={14} />
        </button>
      </div>
    );
  }

  // Expanded card — name, duration pill, star and the Details/Bind actions all
  // sit on the top line; the waveform is the hero below with the play button
  // docked in its bottom-right corner.
  return (
    <div className="preset-card">
      <div className="preset-card-head">
        <span className="preset-card-name">{data.name}</span>
        {boundBadge}
        <span className="preset-dur" title="Pattern duration">
          <img src={iconClock} alt="" />
          {formatDuration(data.duration)}
        </span>
        {favButton}
        <button className="ghost icon" onClick={onOpen} title="Details" aria-label="Open details">
          <img src={iconInfo} alt="" width={14} height={14} />
        </button>
        <button className="primary icon" onClick={onBind} title="Bind to selection" aria-label="Bind to selection">
          <img src={iconLink} alt="" width={14} height={14} />
        </button>
      </div>
      {data.tags.length > 0 && (
        <div className="preset-card-tags">
          {data.tags.map((t) => (
            <span className="tag" key={t} style={{ margin: 0 }}>{t}</span>
          ))}
        </div>
      )}
      <div className="wv-panel">
        <Visualization data={data} />
        <button className="ghost icon wv-play" onClick={onPlay} title="Play">
          <img src={iconPlay} alt="" width={14} height={14} />
        </button>
      </div>
    </div>
  );
}
