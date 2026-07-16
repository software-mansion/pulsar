import { memo } from 'react';
import styles from './PresetCard.module.css';
import type { CatalogEntry } from '../../shared/types';
import Visualization from './Visualization';
import { usePresetsUiStore } from '../store';
import iconPlay from '../assets/icon-play.svg';
import iconClock from '../assets/icon-clock.svg';
import iconInfo from '../assets/icon-info.svg';
import iconPlus from '../assets/icon-plus.svg';

const formatDuration = (ms: number) =>
  ms >= 1000 ? `${(ms / 1000).toFixed(ms % 1000 === 0 ? 0 : 1)} s` : `${Math.round(ms)} ms`;

// Memoized + subscribes to just "am I favourited / bound?" from the store, so a
// favourite toggle or a selection change re-renders only the affected card(s),
// not the whole 151-card grid. The callbacks take the entry/id (not a per-card
// closure) so the parent can pass stable references that don't break memo.
const PresetCard = memo(function PresetCard({
  entry,
  compact,
  onToggleFavourite,
  onPlay,
  onBind,
  onOpen
}: {
  entry: CatalogEntry;
  compact: boolean;
  onToggleFavourite: (id: string) => void;
  onPlay: (entry: CatalogEntry) => void;
  onBind: (entry: CatalogEntry) => void;
  onOpen: (id: string) => void;
}) {
  const isFavourite = usePresetsUiStore((s) => s.favourites.has(entry.id));
  const isBound = usePresetsUiStore((s) => s.selection?.binding?.presetId === entry.id);
  const { data } = entry;

  // Lighter, borderless favourite star - shared by both layouts.
  const favButton = (
    <button
      className={styles['fav-plain']}
      title={isFavourite ? 'Remove from favourites' : 'Add to favourites'}
      aria-pressed={isFavourite}
      onClick={() => onToggleFavourite(entry.id)}
    >
      <span className="star">{isFavourite ? '★' : '☆'}</span>
    </button>
  );

  // Bind-to-selection action - shared by both layouts.
  const bindButton = (
    <button
      className={`primary ${styles['bind-button']}`}
      onClick={() => onBind(entry)}
      title="Bind to selection"
      aria-label="Bind to selection"
    >
      <img src={iconPlus} alt="" width={13} height={13} />
      Add
    </button>
  );

  const boundBadge = isBound ? (
    <span className="bound-badge">● selected</span>
  ) : null;

  if (compact) {
    // One dense bordered line: play · name · scrolling tags · duration · fav · bind.
    return (
      <div className={styles['preset-row-compact']} data-preset-id={entry.id}>
        <button className="ghost icon" onClick={() => onPlay(entry)} title="Play">
          <img src={iconPlay} alt="" width={14} height={14} />
        </button>
        <span className={styles['preset-row-compact-name']} onClick={() => onOpen(entry.id)} title={data.name}>
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
        {bindButton}
      </div>
    );
  }

  // Expanded card - name, duration pill, star and the Details/Bind actions all
  // sit on the top line; the waveform is the hero below with the play button
  // docked in its bottom-right corner.
  return (
    <div className="preset-card" data-preset-id={entry.id}>
      <div className={styles['preset-card-head']}>
        <span className={styles['preset-card-title']}>
          <span className={styles['preset-card-name']}>{data.name}</span>
          {/* Quiet info affordance right by the name - mirrors the "Filters"
              accordion title. */}
          <button
            type="button"
            className={styles['info-btn']}
            onClick={() => onOpen(entry.id)}
            title="Details"
            aria-label="Open details"
          >
            <img src={iconInfo} alt="" width={14} height={14} />
          </button>
        </span>
        {boundBadge}
        <span className={styles['preset-dur']} title="Pattern duration">
          <img src={iconClock} alt="" />
          {formatDuration(data.duration)}
        </span>
        {favButton}
        <button className="ghost icon" onClick={() => onPlay(entry)} title="Play" aria-label="Play">
          <img src={iconPlay} alt="" width={14} height={14} />
        </button>
        {bindButton}
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
});

export default PresetCard;
