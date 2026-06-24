import styles from './PresetsTab.module.css';
import { useEffect, useRef, useState } from 'react';
import type { CatalogEntry, SelectionInfo, Settings } from '../../shared/types';
import Filters, { type FilterState } from './Filters';
import PresetCard from './PresetCard';
import AddCustomPreset from './AddCustomPreset';
import PhonePanel from './PhonePanel';
import iconLayoutFull from '../assets/icon-layout-full.svg';
import iconLayoutCompact from '../assets/icon-layout-compact.svg';
import iconArrowUp from '../assets/icon-arrow-up.svg';

export default function PresetsTab({
  filter,
  setFilter,
  favouritesOnly,
  setFavouritesOnly,
  customPresets,
  onAddCustomPreset,
  onUpdateCustomPreset,
  onRemoveCustomPreset,
  hapticsToken,
  onHapticsTokenChange,
  onPhoneConnectedChange,
  ensureSharedPreview,
  previewToken,
  settings,
  onSettingsChange,
  filtered,
  favourites,
  selection,
  onToggleFavourite,
  onPlay,
  onBind,
  onOpen,
  onShowTagsGuide,
  modalOpen,
  scrollToId,
  onScrolledToPreset
}: {
  filter: FilterState;
  setFilter: (s: FilterState) => void;
  favouritesOnly: boolean;
  setFavouritesOnly: (v: boolean) => void;
  customPresets: CatalogEntry[];
  onAddCustomPreset: (entry: CatalogEntry) => void;
  onUpdateCustomPreset: (id: string, entry: CatalogEntry) => void;
  onRemoveCustomPreset: (id: string) => void;
  hapticsToken: string | null;
  onHapticsTokenChange: (token: string | null) => void;
  onPhoneConnectedChange: (connected: boolean) => void;
  // Resolves (publishing if needed) this file's read-only preview token for the
  // unified pairing QR, or null when the file isn't preview-ready.
  ensureSharedPreview: () => Promise<string | null>;
  // The current file's preview token, surfaced so an already-paired phone can be
  // handed it once it becomes available.
  previewToken: string | null;
  settings: Settings;
  onSettingsChange: (settings: Settings) => void;
  filtered: CatalogEntry[];
  favourites: Set<string>;
  selection: SelectionInfo | null;
  onToggleFavourite: (id: string) => void;
  onPlay: (entry: CatalogEntry) => void;
  onBind: (entry: CatalogEntry) => void;
  onOpen: (id: string) => void;
  // Opens the "Tags guide" modal (info icon in the Filters header).
  onShowTagsGuide: () => void;
  // Whether the preset-detail modal is open (hides the scroll-to-top FAB).
  modalOpen: boolean;
  // When set, scroll that preset into view + flash it (e.g. jumped to from the
  // selection bar). Cleared via onScrolledToPreset once handled.
  scrollToId: string | null;
  onScrolledToPreset: () => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Scroll to (and briefly flash) the requested preset once it's in the list.
  // Depends on `filtered` so a filter reset that surfaces the card re-runs it.
  useEffect(() => {
    if (!scrollToId) return;
    const el = scrollRef.current?.querySelector<HTMLElement>(
      `[data-preset-id="${CSS.escape(scrollToId)}"]`
    );
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.remove('preset-flash');
    // Reflow so the animation restarts even if the class was just present.
    void el.offsetWidth;
    el.classList.add('preset-flash');
    onScrolledToPreset();
  }, [scrollToId, filtered, onScrolledToPreset]);

  return (
    <>
      <div
        className={`scroll ${styles['preset-scroll']}`}
        ref={scrollRef}
        onScroll={(e) => setShowScrollTop(e.currentTarget.scrollTop > 300)}
      >
        <div className={styles['controls-section']}>
          <div className={styles['controls-search']}>
            <input
              type="text"
              placeholder="Search presets by name or description…"
              value={filter.search}
              onChange={(e) => setFilter({ ...filter, search: e.target.value })}
            />
            {filter.search.length > 0 && (
              <span
                className={`tag ${styles['controls-search-clear']}`}
                onClick={() => setFilter({ ...filter, search: '' })}
              >
                Clear
              </span>
            )}
          </div>
          <div className={styles['controls-card']}>
            <Filters
              state={filter}
              setState={setFilter}
              favouritesOnly={favouritesOnly}
              onFavouritesOnlyChange={setFavouritesOnly}
              onShowTagsGuide={onShowTagsGuide}
            />
            <AddCustomPreset
              customPresets={customPresets}
              onAdd={onAddCustomPreset}
              onUpdate={onUpdateCustomPreset}
              onRemove={onRemoveCustomPreset}
            />
            <PhonePanel
              token={hapticsToken}
              onTokenChange={onHapticsTokenChange}
              onConnectedChange={onPhoneConnectedChange}
              ensureSharedPreview={ensureSharedPreview}
              previewToken={previewToken}
            />
          </div>
        </div>
        <div className={`row ${styles['list-toolbar']}`}>
          <span className={`muted ${styles['list-toolbar-meta']}`}>{filtered.length} results</span>
          <label
            className={`row ${styles['list-toolbar-toggle']}`}
            title="Play audio when selecting a bound node in the editor"
          >
            Sound
            <input
              type="checkbox"
              className="switch"
              checked={settings.soundInEdit}
              onChange={(e) => onSettingsChange({ ...settings, soundInEdit: e.target.checked })}
            />
          </label>
          <div className="spacer" />
          <span className={`muted ${styles['list-toolbar-meta']}`}>Layout:</span>
          <button
            className={`icon ${settings.compactLayout ? 'ghost' : 'primary'}`}
            title="Full cards"
            aria-pressed={!settings.compactLayout}
            onClick={() => onSettingsChange({ ...settings, compactLayout: false })}
          >
            <img src={iconLayoutFull} alt="" width={16} height={16} />
          </button>
          <button
            className={`icon ${settings.compactLayout ? 'primary' : 'ghost'}`}
            title="Compact rows"
            aria-pressed={settings.compactLayout}
            onClick={() => onSettingsChange({ ...settings, compactLayout: true })}
          >
            <img src={iconLayoutCompact} alt="" width={16} height={16} />
          </button>
        </div>
        <div className={styles['preset-list']}>
          {filtered.map((e) => (
            <PresetCard
              key={e.id}
              entry={e}
              compact={settings.compactLayout}
              isBound={selection?.binding?.presetId === e.id}
              isFavourite={favourites.has(e.id)}
              onToggleFavourite={() => onToggleFavourite(e.id)}
              onPlay={() => onPlay(e)}
              onBind={() => onBind(e)}
              onOpen={() => onOpen(e.id)}
            />
          ))}
          {filtered.length === 0 && (
            <p className={`muted ${styles['preset-list-empty']}`}>No presets match.</p>
          )}
        </div>
      </div>

      {!modalOpen && showScrollTop && (
        <button
          className={styles['scroll-top']}
          aria-label="Scroll to top"
          onClick={() => scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <img src={iconArrowUp} alt="" width={20} height={20} />
        </button>
      )}
    </>
  );
}
