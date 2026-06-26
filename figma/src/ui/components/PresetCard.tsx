import styles from './PresetCard.module.css';
import type { CatalogEntry } from '../../shared/types';
import Visualization from './Visualization';
import iconPlay from '../assets/icon-play.svg';
import iconClock from '../assets/icon-clock.svg';
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

  // Lighter, borderless favourite star - shared by both layouts.
  const favButton = (
    <button
      className={styles['fav-plain']}
      title={isFavourite ? 'Remove from favourites' : 'Add to favourites'}
      aria-pressed={isFavourite}
      onClick={onToggleFavourite}
    >
      <span className="star">{isFavourite ? '★' : '☆'}</span>
    </button>
  );

  const boundBadge = isBound ? (
    <span className="bound-badge">● selected</span>
  ) : null;

  if (compact) {
    // One dense bordered line: play · name · scrolling tags · duration · fav · bind.
    return (
      <div className={styles['preset-row-compact']} data-preset-id={entry.id}>
        <button className="ghost icon" onClick={onPlay} title="Play">
          <img src={iconPlay} alt="" width={14} height={14} />
        </button>
        <span className={styles['preset-row-compact-name']} onClick={onOpen} title={data.name}>
          {data.name}
        </span>
        {boundBadge}
        <div className={styles['preset-row-compact-tags']}>
          {data.tags.map((t) => (
            <span className="tag tag-flush" key={t}>{t}</span>
          ))}
        </div>
        <span className={`muted ${styles['preset-row-compact-dur']}`} title="Pattern duration">
          {formatDuration(data.duration)}
        </span>
        {favButton}
        <button className="primary" onClick={onBind} title="Bind to selection" aria-label="Bind to selection">
          Add
        </button>
      </div>
    );
  }

  // Expanded card - name, duration pill, star and the Details/Bind actions all
  // sit on the top line; the waveform is the hero below with the play button
  // docked in its bottom-right corner.
  return (
    <div className="preset-card" data-preset-id={entry.id}>
      <div className={styles['preset-card-head']}>
        <span className={styles['preset-card-name']}>{data.name}</span>
        {boundBadge}
        <span className={styles['preset-dur']} title="Pattern duration">
          <img src={iconClock} alt="" />
          {formatDuration(data.duration)}
        </span>
        {favButton}
        <button className="ghost icon" onClick={onOpen} title="Details" aria-label="Open details">
          <img src={iconInfo} alt="" width={14} height={14} />
        </button>
        <button className="ghost icon" onClick={onPlay} title="Play" aria-label="Play">
          <img src={iconPlay} alt="" width={14} height={14} />
        </button>
        <button className="primary" onClick={onBind} title="Bind to selection" aria-label="Bind to selection">
          Add
        </button>
      </div>
      {data.tags.length > 0 && (
        <div className={styles['preset-card-tags']}>
          {data.tags.map((t) => (
            <span className="tag tag-flush" key={t}>{t}</span>
          ))}
        </div>
      )}
      <div className={styles['wv-panel']}>
        <Visualization data={data} />
      </div>
    </div>
  );
}
