import style from '../PresetsList/PresetsList.module.scss';
import arrowIcon from '../../assets/new_assets/arrow.svg';
import infoIcon from '../../assets/new_assets/info.svg';
import { WebFilters } from './WebFilters';
import { WebPreset } from '../WebPreset/WebPreset';
import { useState, useMemo, useEffect, useRef, useDeferredValue } from 'react';
import { createPortal } from 'react-dom';
import { TagsModal } from '../TagsModal/TagsModal';
import { TagsInfo } from '../PresetsList/Tags';
import { WebPresetsConfig } from '../../assets/webPresets/WebPresetsConfig';
import { NoResult } from '../NoResult/NoResult';
import { WebChartModal } from '../WebPreset/WebChartModal';

const COMPACT_LAYOUT_KEY = 'web_presets_compact_layout';
const FAVOURITES_KEY = 'web_presets_favourites';
const SOUND_ENABLED_KEY = 'web_presets_sound_enabled';

declare global {
  interface Window {
    posthog?: {
      capture: (event: string, properties?: Record<string, unknown>) => void;
    };
  }
}

export function WebPresetsList() {
  const headerRef = useRef<HTMLDivElement>(null);
  const [showModal, setShowModal] = useState<'no' | 'tags' | 'chart'>('no');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
  const [compactLayout, setCompactLayout] = useState<boolean>(
    () => typeof window !== 'undefined' && localStorage.getItem(COMPACT_LAYOUT_KEY) === 'true',
  );
  const [soundEnabled, setSoundEnabled] = useState<boolean>(
    () => typeof window === 'undefined' || localStorage.getItem(SOUND_ENABLED_KEY) !== 'false',
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [favourites, setFavourites] = useState<Set<string>>(new Set());
  const [showFavouritesOnly, setShowFavouritesOnly] = useState(false);
  const deferredQuery = useDeferredValue(searchQuery);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(FAVOURITES_KEY);
      if (stored) setFavourites(new Set(JSON.parse(stored)));
    } catch {}
  }, []);

  useEffect(() => {
    const handleScroll = () => setShowScrollToTop(window.scrollY > 500);
    setPortalRoot(document.body);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  function handleCompactToggle(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.checked;
    setCompactLayout(value);
    localStorage.setItem(COMPACT_LAYOUT_KEY, String(value));
  }

  function handleSoundToggle(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.checked;
    setSoundEnabled(value);
    localStorage.setItem(SOUND_ENABLED_KEY, String(value));
    window.posthog?.capture(value ? 'web_preset_sound_enabled' : 'web_preset_sound_disabled');
  }

  function handleToggleFavourite(presetName: string) {
    setFavourites((prev) => {
      const next = new Set(prev);
      if (next.has(presetName)) {
        next.delete(presetName);
      } else {
        next.add(presetName);
      }
      localStorage.setItem(FAVOURITES_KEY, JSON.stringify(Array.from(next)));
      return next;
    });
  }

  function handleScrollToTop() {
    headerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const selectedTagsByGroup = useMemo(() => {
    const grouped: Record<string, string[]> = {};
    selectedTags.forEach((tagName) => {
      TagsInfo.forEach((group) => {
        if (group.tags.some((tag) => tag.name === tagName)) {
          (grouped[group.groupName] ||= []).push(tagName);
        }
      });
    });
    return grouped;
  }, [selectedTags]);

  const filteredPresets = useMemo(() => {
    let result = WebPresetsConfig;

    if (selectedTags.length > 0) {
      result = result.filter((preset) => {
        const presetTagLabels = preset.data.tags;
        for (const groupName in selectedTagsByGroup) {
          const hasTagFromGroup = selectedTagsByGroup[groupName].some((tagName) =>
            presetTagLabels.includes(tagName),
          );
          if (!hasTagFromGroup) return false;
        }
        return true;
      });
    }

    if (showFavouritesOnly) {
      result = result.filter((preset) => favourites.has(preset.data.name));
    }

    if (deferredQuery.trim()) {
      const query = deferredQuery.trim().toLowerCase();
      result = result.filter(
        (preset) =>
          preset.data.name.toLowerCase().includes(query) ||
          preset.data.description.toLowerCase().includes(query),
      );
    }

    return result;
  }, [selectedTags, selectedTagsByGroup, showFavouritesOnly, favourites, deferredQuery]);

  return (
    <div className={['not-content', style.presets].join(' ')}>
      <div ref={headerRef} className={style.header}>
        <div className={style.title}>Web presets</div>
        <div className={style.info}>
          <div className={style.inner} onClick={() => setShowModal('tags')}>
            <div>Learn more about tags</div>
            <img src={infoIcon.src} />
          </div>
          <div className={style.inner} onClick={() => setShowModal('chart')}>
            <div>Learn more about chart visualization</div>
            <img src={infoIcon.src} />
          </div>
        </div>
      </div>

      <WebFilters selectedTags={selectedTags} setSelectedTags={setSelectedTags} />

      <div className={style.togglesRow}>
        <label className={style.compactToggle}>
          <input type="checkbox" checked={compactLayout} onChange={handleCompactToggle} />
          Compact list
        </label>
        <label className={style.compactToggle}>
          <input type="checkbox" checked={soundEnabled} onChange={handleSoundToggle} />
          Enable sound
        </label>
        <label className={style.compactToggle}>
          <input
            type="checkbox"
            checked={showFavouritesOnly}
            onChange={(e) => setShowFavouritesOnly(e.target.checked)}
          />
          Show favourites only
        </label>
      </div>

      <div className={style.searchBlock}>
        <label className={style.searchLabel} htmlFor="web-preset-search">
          Find by name
        </label>
        <div className={style.searchContainer}>
          <input
            id="web-preset-search"
            type="search"
            className={style.searchInput}
            placeholder="Search presets by name or description..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            autoCorrect="off"
            spellCheck={false}
            aria-label="Search presets by name or description"
          />
          {searchQuery.length > 0 && (
            <button
              type="button"
              className={style.searchClear}
              onClick={() => setSearchQuery('')}
              aria-label="Clear preset search"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {filteredPresets.length > 0 && (
        <div className={style.resultCount}>{filteredPresets.length} results</div>
      )}

      {filteredPresets.length === 0 &&
        (deferredQuery.trim() ? (
          <div className={style.searchEmptyState}>
            <div className={style.searchEmptyTitle}>No presets found</div>
            <div className={style.searchEmptyDescription}>
              Try a different search term or clear the search.
            </div>
          </div>
        ) : (
          <NoResult />
        ))}

      {filteredPresets.map((preset) => (
        <WebPreset
          key={preset.data.name}
          {...preset}
          compact={compactLayout}
          soundEnabled={soundEnabled}
          isFavourite={favourites.has(preset.data.name)}
          onToggleFavourite={() => handleToggleFavourite(preset.data.name)}
        />
      ))}

      {showModal === 'tags' && <TagsModal onClose={() => setShowModal('no')} />}
      {showModal === 'chart' && <WebChartModal onClose={() => setShowModal('no')} />}

      {portalRoot &&
        showScrollToTop &&
        createPortal(
          <button
            type="button"
            className={style.scrollToTopButton}
            onClick={handleScrollToTop}
            aria-label="Scroll to top"
          >
            <img src={arrowIcon.src} alt="" aria-hidden="true" />
          </button>,
          portalRoot,
        )}
    </div>
  );
}
