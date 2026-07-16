import styles from './PresetsTab.module.css';
import { useEffect, useRef, useState } from 'react';
import type { BoundItem, CatalogEntry, Settings } from '../../shared/types';
import Filters, { type FilterState } from './Filters';
import PresetCard from './PresetCard';
import CustomPresetsPanel from './CustomPresetsPanel';
import BoundComponentsPanel from './BoundComponentsPanel';
import LivePreviewReminder from './LivePreviewReminder';
import iconLayoutFull from '../assets/icon-layout-full.svg';
import iconLayoutCompact from '../assets/icon-layout-compact.svg';
import iconArrowUp from '../assets/icon-arrow-up.svg';
import { usePresetsUiStore } from '../store';

// Scroll offsets at which the selection bar swaps between its full and compact
// forms. Deliberately split (not one threshold) so a scroll that hovers on the
// boundary can't flap the bar open and shut.
const CONDENSE_AT = 40;
const EXPAND_AT = 8;

export default function PresetsTab({
  filter,
  setFilter,
  favouritesOnly,
  setFavouritesOnly,
  boundItems,
  onSelectBound,
  liveConfigComplete,
  onConfigureLivePreview,
  settings,
  onSettingsChange,
  filtered,
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
  // Components that currently have a haptic preset bound - shown in a collapsible
  // "Bound components" accordion. Clicking a row reveals + plays it.
  boundItems: BoundItem[];
  onSelectBound: (item: BoundItem) => void;
  // Whether the Live preview setup (file key + paired phone) is finished. While
  // false, a reminder banner is shown at the top of the list.
  liveConfigComplete: boolean;
  // Jumps to the Live preview tab (where the setup configurator lives).
  onConfigureLivePreview: () => void;
  settings: Settings;
  onSettingsChange: (settings: Settings) => void;
  filtered: CatalogEntry[];
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
  const setSelectionCondensed = usePresetsUiStore((s) => s.setSelectionCondensed);

  // The bar is shared with other tabs, which don't scroll - make sure we hand it
  // back expanded when this tab goes away (and on remount, where scrollTop is 0
  // again but the store still holds the last value).
  useEffect(() => {
    setSelectionCondensed(false);
    return () => setSelectionCondensed(false);
  }, [setSelectionCondensed]);

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
        onScroll={(e) => {
          const top = e.currentTarget.scrollTop;
          setShowScrollTop(top > 300);
          if (top > CONDENSE_AT) setSelectionCondensed(true);
          else if (top < EXPAND_AT) setSelectionCondensed(false);
        }}
      >
        {!liveConfigComplete && <LivePreviewReminder onConfigure={onConfigureLivePreview} />}
        {/* Library section - the Pulsar Studio notice and a jump list of
            already-bound components. Neither acts on the list below, so they sit
            apart from the filter block and are divided off from it. */}
        <div className={styles['library-section']}>
          <div className={styles['controls-card']}>
            <CustomPresetsPanel />
            <BoundComponentsPanel items={boundItems} onSelect={onSelectBound} />
          </div>
        </div>

        {/* Filter block - search, the tag filters, and the result count they
            produce, stacked directly on top of the list they narrow. No divider
            below it: the count and the list read as one continuous surface. */}
        <div className={styles['filter-section']}>
          <div>
            <div className="panel-title">Preset list</div>
            <p className={`muted ${styles['filter-intro']}`}>
              Connect a haptic preset with a component.
            </p>
          </div>
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
        </div>
        <div className={styles['preset-list']}>
          {filtered.map((e) => (
            <PresetCard
              key={e.id}
              entry={e}
              compact={settings.compactLayout}
              onToggleFavourite={onToggleFavourite}
              onPlay={onPlay}
              onBind={onBind}
              onOpen={onOpen}
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
