import { useMemo } from 'react';
import type { CatalogEntry } from '../../shared/types';
import iconSliders from '../assets/icon-sliders-horizontal.svg';
import iconChevron from '../assets/icon-chevron-down.svg';

// Tag grouping mirrors the docs `TagsInfo`. Within a group selections are OR'd;
// across groups they are AND'd.
const TAG_GROUPS: { groupName: string; tags: string[] }[] = [
  { groupName: 'Source', tags: ['Custom'] },
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
  onFavouritesOnlyChange
}: {
  state: FilterState;
  setState: (s: FilterState) => void;
  favouritesOnly: boolean;
  onFavouritesOnlyChange: (v: boolean) => void;
}) {
  const update = (patch: Partial<FilterState>) => setState({ ...state, ...patch });

  const toggleTag = (tag: string) => {
    const next = new Set(state.tags);
    next.has(tag) ? next.delete(tag) : next.add(tag);
    update({ tags: next });
  };

  const toggleSystem = (preset: string) => {
    const next = new Set(state.systemPresets);
    next.has(preset) ? next.delete(preset) : next.add(preset);
    update({ systemPresets: next });
  };

  const activeCount = state.tags.size + state.systemPresets.size;

  return (
    <details className="accordion acc-row">
      <summary className="acc-head">
        <span className="acc-icon">
          <img src={iconSliders} alt="" />
        </span>
        <span className="acc-title">Filters</span>
        {activeCount > 0 && (
          <span className="tag active" style={{ margin: 0 }}>{activeCount}</span>
        )}
        {activeCount > 0 && (
          <span
            className="tag"
            style={{ margin: 0 }}
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
        {/* Favourites — styled toggle-switch row. */}
        <label className="filter-toggle">
          <span className="star">★</span>
          <span style={{ flex: 1 }}>Favourites only</span>
          <input
            type="checkbox"
            className="switch"
            checked={favouritesOnly}
            onChange={(e) => onFavouritesOnlyChange(e.target.checked)}
          />
        </label>

        <div className="acc-sep" />

        {TAG_GROUPS.map((g) => (
          <div key={g.groupName} className="filter-group">
            <div className="acc-label">{g.groupName}</div>
            <div className="chips-row">
              {g.tags.map((t) => (
                <span
                  key={t}
                  className={`tag ${state.tags.has(t) ? 'active' : ''}`}
                  style={{ margin: 0 }}
                  onClick={() => toggleTag(t)}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        ))}

        <div className="acc-sep" />

        <div className="filter-group" style={{ marginBottom: 0 }}>
          <div className="acc-label">System presets</div>
          <div className="chips-row">
            {SYSTEM_PRESETS.map((s) => (
              <span
                key={s}
                className={`tag ${state.systemPresets.has(s) ? 'active' : ''}`}
                style={{ margin: 0 }}
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
    // Default dataset: user presets plus any user-created custom presets.
    active = entries.filter((e) => e.category === 'user' || e.category === 'custom');
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
