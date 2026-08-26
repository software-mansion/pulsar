import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { PRESETS, collectTags } from '../data/presets';
import { groupsForTags } from '../data/tags';
import { PresetCard } from '../components/PresetCard';
import { HapticsBanner } from '../components/HapticsBanner';
import { ArrowUpIcon, SlidersIcon, XIcon } from '../components/Icons';

const FAVOURITES_KEY = 'pulsar_web_app_favourites';

export function PresetsScreen() {
  const [query, setQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [favouritesOnly, setFavouritesOnly] = useState(false);
  const [favourites, setFavourites] = useState<Set<string>>(new Set());
  const [showScrollTop, setShowScrollTop] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(FAVOURITES_KEY);
      if (stored) setFavourites(new Set(JSON.parse(stored) as string[]));
    } catch {
      // Corrupt or unavailable storage just means "no favourites yet".
    }
  }, []);

  const tagGroups = useMemo(() => groupsForTags(new Set(collectTags(PRESETS))), []);

  /**
   * Tags are AND-ed across groups but OR-ed inside one, matching the mobile
   * filter modal: "Bold *and* Short", but "Bold *or* Gentle".
   */
  const visible = useMemo(() => {
    const selectedByGroup = tagGroups
      .map((group) =>
        group.tags.map((tag) => tag.name).filter((name) => selectedTags.includes(name)),
      )
      .filter((names) => names.length > 0);

    let result = PRESETS.filter((entry) =>
      selectedByGroup.every((names) => names.some((name) => entry.data.tags.includes(name))),
    );

    if (favouritesOnly) {
      result = result.filter((entry) => favourites.has(entry.data.name));
    }

    const needle = deferredQuery.trim().toLowerCase();
    if (needle) {
      result = result.filter(
        (entry) =>
          entry.data.name.toLowerCase().includes(needle) ||
          entry.data.description.toLowerCase().includes(needle) ||
          entry.data.tags.some((tag) => tag.toLowerCase().includes(needle)),
      );
    }

    return result;
  }, [deferredQuery, favourites, favouritesOnly, selectedTags, tagGroups]);

  function toggleFavourite(name: string) {
    setFavourites((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      try {
        localStorage.setItem(FAVOURITES_KEY, JSON.stringify(Array.from(next)));
      } catch {
        // Non-persisted favourites are still fine for this session.
      }
      return next;
    });
  }

  function toggleTag(name: string) {
    setSelectedTags((prev) =>
      prev.includes(name) ? prev.filter((tag) => tag !== name) : [...prev, name],
    );
  }

  return (
    <div
      className="screen"
      ref={scrollRef}
      onScroll={(event) => setShowScrollTop(event.currentTarget.scrollTop > 500)}
    >
      <h1 className="title">Get to know Pulsar presets</h1>
      <p className="lead">
        Do not spend time creating your own patterns. Just use ours and enjoy the benefits of having
        haptics in your app by using presets.
      </p>

      <HapticsBanner />

      <div className="presets-head">
        <h2 className="subtitle">Presets</h2>
        <button
          type="button"
          className="btn--ghost"
          style={{ background: 'none', border: 'none' }}
          aria-expanded={showFilters}
          aria-label="Toggle filters"
          onClick={() => setShowFilters((value) => !value)}
        >
          <SlidersIcon size={25} />
        </button>
      </div>

      <div className="search">
        <input
          type="search"
          value={query}
          placeholder="Search presets..."
          aria-label="Search presets"
          onChange={(event) => setQuery(event.target.value)}
        />
        {query && (
          <button
            type="button"
            className="btn--ghost"
            aria-label="Clear search"
            onClick={() => setQuery('')}
          >
            <XIcon size={16} />
          </button>
        )}
      </div>

      {showFilters && (
        <div className="card" style={{ marginBottom: 12 }}>
          <label className="switch" style={{ marginTop: 0 }}>
            <input
              type="checkbox"
              checked={favouritesOnly}
              onChange={(event) => setFavouritesOnly(event.target.checked)}
            />
            Favourites only
          </label>
          {tagGroups.map((group) => (
            <div key={group.groupName} style={{ marginTop: 14 }}>
              <p className="muted" style={{ margin: '0 0 6px' }}>
                {group.groupName}
              </p>
              <div className="tags">
                {group.tags.map((tag) => (
                  <button
                    key={tag.name}
                    type="button"
                    title={tag.description}
                    aria-pressed={selectedTags.includes(tag.name)}
                    className={`tag tag--selectable${selectedTags.includes(tag.name) ? ' tag--selected' : ''}`}
                    onClick={() => toggleTag(tag.name)}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {selectedTags.length > 0 && (
            <button
              type="button"
              className="btn"
              style={{ marginTop: 14, width: '100%' }}
              onClick={() => setSelectedTags([])}
            >
              Clear {selectedTags.length} filter{selectedTags.length === 1 ? '' : 's'}
            </button>
          )}
        </div>
      )}

      <div className="stack" style={{ marginTop: 0 }}>
        {visible.map((entry) => (
          <PresetCard
            key={entry.data.name}
            entry={entry}
            favourite={favourites.has(entry.data.name)}
            onToggleFavourite={toggleFavourite}
          />
        ))}
      </div>

      {visible.length === 0 && (
        <div className="card empty">
          <h3 className="subtitle">No presets found 😕</h3>
          <p className="lead">Try a different search term or clear your filters.</p>
        </div>
      )}

      {showScrollTop && (
        <button
          type="button"
          className="btn scroll-top"
          aria-label="Scroll to top"
          onClick={() => scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <ArrowUpIcon size={22} />
        </button>
      )}
    </div>
  );
}
