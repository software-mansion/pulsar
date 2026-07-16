import styles from './Filters.module.css';
import { useMemo } from 'react';
import type { CatalogEntry } from '../../shared/types';
import { toggleInSet } from '../lib/collections';
import iconSliders from '../assets/icon-sliders-horizontal.svg';
import iconChevron from '../assets/icon-chevron-down.svg';
import iconInfo from '../assets/icon-info.svg';

// Tag grouping mirrors the docs `TagsInfo`. Within a group selections are OR'd;
// across groups they are AND'd.
const TAG_GROUPS: { groupName: string; tags: string[] }[] = [
  { groupName: 'Intensity', tags: ['Gentle', 'Substantial', 'Bold'] },
  { groupName: 'Sharpness', tags: ['Soft', 'Flexible', 'Rigid'] },
  { groupName: 'Shape', tags: ['Peak', 'Impulses', 'Solid', 'Bumps', 'Saw', 'Pattern', 'Ramp'] },
  { groupName: 'Duration', tags: ['Impulse', 'Short', 'Extended', 'Long'] }
];

const TAG_TO_GROUP = new Map<string, string>();
for (const g of TAG_GROUPS) for (const t of g.tags) TAG_TO_GROUP.set(t, g.groupName);

// System-preset options. Like the docs, selecting any of these switches the
// dataset from user presets to the matching system presets.
const SYSTEM_PRESETS = ['iOS', 'Android Primitives', 'Android Effects', 'Android Vendor'] as const;
const ANDROID_SYSTEM_TAG: Record<string, string> = {
  'Android Primitives': 'Primitive',
  'Android Effects': 'Effect',
  'Android Vendor': 'Vendor'
};

export type FilterState = {
  search: string;
  tags: Set<string>;
  systemPresets: Set<string>;
};

export default function Filters({
  state,
  setState,
  favouritesOnly,
  onFavouritesOnlyChange,
  onShowTagsGuide
}: {
  state: FilterState;
  setState: (s: FilterState) => void;
  favouritesOnly: boolean;
  onFavouritesOnlyChange: (v: boolean) => void;
  onShowTagsGuide: () => void;
}) {
  const update = (patch: Partial<FilterState>) => setState({ ...state, ...patch });

  const toggleTag = (tag: string) => update({ tags: toggleInSet(state.tags, tag) });
  const toggleSystem = (preset: string) =>
    update({ systemPresets: toggleInSet(state.systemPresets, preset) });

  const activeCount = state.tags.size + state.systemPresets.size;

  return (
    <details className="accordion acc-row">
      <summary className="acc-head">
        <span className="acc-icon">
          <img src={iconSliders} alt="" />
        </span>
        <span className={`acc-title ${styles['filters-title']}`}>
          Filters
          {/* Opens the tags guide. Lives inside <summary>, so swallow the click
              to stop it toggling the accordion. */}
          <button
            type="button"
            className={styles['tags-info-btn']}
            title="Learn more about tags"
            aria-label="Learn more about tags"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onShowTagsGuide();
            }}
          >
            <img src={iconInfo} alt="" width={14} height={14} />
          </button>
        </span>
        {activeCount > 0 && (
          <span className="tag active tag-flush">{activeCount}</span>
        )}
        {activeCount > 0 && (
          <span
            className="tag tag-flush"
            onClick={(e) => {
              e.preventDefault();
              update({ tags: new Set(), systemPresets: new Set() });
            }}
          >
            Clear all
          </span>
        )}
        <span className="acc-chevron" aria-hidden="true">
          <img src={iconChevron} alt="" />
        </span>
      </summary>

      <div className="acc-body">
        {/* Favourites - styled toggle-switch row. */}
        <label className={styles['filter-toggle']}>
          <span className="star">★</span>
          <span className={styles['filter-toggle-label']}>Favourites only</span>
          <input
            type="checkbox"
            className="switch"
            checked={favouritesOnly}
            onChange={(e) => onFavouritesOnlyChange(e.target.checked)}
          />
        </label>

        <div className="acc-sep" />

        {/* Same destination as the info icon by the title - a more discoverable
            text affordance right above the tag groups. */}
        <button type="button" className={styles['tags-learn']} onClick={onShowTagsGuide}>
          <img src={iconInfo} alt="" width={13} height={13} />
          <span>Learn more about tags</span>
        </button>

        {TAG_GROUPS.map((g) => (
          <div key={g.groupName} className={styles['filter-group']}>
            <div className="acc-label">{g.groupName}</div>
            <div className="chips-row">
              {g.tags.map((t) => (
                <span
                  key={t}
                  className={`tag tag-flush ${state.tags.has(t) ? 'active' : ''}`}
                  onClick={() => toggleTag(t)}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        ))}

        <div className="acc-sep" />

        <div className={`${styles['filter-group']} ${styles['filter-group--flush']}`}>
          <div className="acc-label">System presets</div>
          <div className="chips-row">
            {SYSTEM_PRESETS.map((s) => (
              <span
                key={s}
                className={`tag tag-flush ${state.systemPresets.has(s) ? 'active' : ''}`}
                onClick={() => toggleSystem(s)}
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    </details>
  );
}

export function applyFilter(entries: CatalogEntry[], state: FilterState): CatalogEntry[] {
  // 1. Active dataset: system presets when any are selected, else user presets.
  let active: CatalogEntry[];
  if (state.systemPresets.size > 0) {
    const wantIos = state.systemPresets.has('iOS');
    const androidTags = [...state.systemPresets]
      .filter((s) => s in ANDROID_SYSTEM_TAG)
      .map((s) => ANDROID_SYSTEM_TAG[s]);
    active = entries.filter((e) => {
      if (e.category !== 'system') return false;
      if (wantIos && e.platform === 'ios') return true;
      if (e.platform === 'android' && androidTags.some((t) => e.data.tags.includes(t))) return true;
      return false;
    });
  } else {
    // Default dataset: the curated user presets.
    active = entries.filter((e) => e.category === 'user');
  }

  // 2. Tag groups: OR within group, AND across groups.
  if (state.tags.size > 0) {
    const selectedByGroup = new Map<string, string[]>();
    for (const t of state.tags) {
      const group = TAG_TO_GROUP.get(t);
      if (!group) continue;
      const arr = selectedByGroup.get(group) ?? [];
      arr.push(t);
      selectedByGroup.set(group, arr);
    }
    active = active.filter((e) => {
      for (const tagsInGroup of selectedByGroup.values()) {
        if (!tagsInGroup.some((t) => e.data.tags.includes(t))) return false;
      }
      return true;
    });
  }

  // 3. Search by name or description.
  const q = state.search.trim().toLowerCase();
  if (q) {
    active = active.filter(
      (e) =>
        e.data.name.toLowerCase().includes(q) || e.data.description.toLowerCase().includes(q)
    );
  }

  return active;
}

export function useFilterStateInit(): FilterState {
  return useMemo(
    () => ({ search: '', tags: new Set<string>(), systemPresets: new Set<string>() }),
    []
  );
}

// Build a filter state that surfaces `entry` in the list, clearing any search /
// tag filters and selecting the right dataset (user by default, or the
// matching system-preset group for bundled iOS/Android presets). Used when the
// user jumps to a bound preset from the selection bar.
export function filterRevealing(entry: CatalogEntry): FilterState {
  const state: FilterState = { search: '', tags: new Set(), systemPresets: new Set() };
  if (entry.category === 'system') {
    if (entry.platform === 'ios') {
      state.systemPresets.add('iOS');
    } else if (entry.platform === 'android') {
      for (const [label, tag] of Object.entries(ANDROID_SYSTEM_TAG)) {
        if (entry.data.tags.includes(tag)) {
          state.systemPresets.add(label);
          break;
        }
      }
    }
  }
  return state;
}
