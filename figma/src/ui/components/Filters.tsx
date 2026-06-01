import { useMemo } from 'react';
import type { CatalogEntry } from '../../shared/types';

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
    <div style={{ padding: 8, borderBottom: '1px solid var(--border)' }}>
      {/* Search */}
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          placeholder="Search presets by name or description…"
          value={state.search}
          onChange={(e) => update({ search: e.target.value })}
        />
        {state.search.length > 0 && (
          <span
            className="tag"
            style={{ position: 'absolute', right: 4, top: 4, margin: 0 }}
            onClick={() => update({ search: '' })}
          >
            Clear
          </span>
        )}
      </div>

      {/* Filters accordion: grouped tag chips + system presets */}
      <details className="accordion" style={{ marginTop: 8, borderTop: 'none', paddingTop: 0 }}>
        <summary
          className="row"
          style={{ fontWeight: 600, fontSize: 'var(--fs-sm)' }}
        >
          <span className="caret" aria-hidden="true">▸</span>
          Filters
          {activeCount > 0 && (
            <span className="tag active" style={{ margin: 0 }}>{activeCount}</span>
          )}
          {activeCount > 0 && (
            <>
              <div className="spacer" />
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
            </>
          )}
        </summary>

        <div style={{ marginTop: 8 }}>
          {/* Show favourites only */}
          <label
            className="row"
            style={{ marginBottom: 8, gap: 6, cursor: 'pointer', fontSize: 'var(--fs-sm)', userSelect: 'none' }}
          >
            <input
              type="checkbox"
              checked={favouritesOnly}
              onChange={(e) => onFavouritesOnlyChange(e.target.checked)}
            />
            <span className="star" style={{ color: 'var(--color-primary)' }}>★</span>
            Show favourites only
          </label>

          {TAG_GROUPS.map((g) => (
            <div key={g.groupName} style={{ marginBottom: 8 }}>
              <div className="muted" style={{ fontSize: 'var(--fs-2xs)', marginBottom: 4 }}>
                {g.groupName}
              </div>
              <div className="row" style={{ flexWrap: 'wrap', gap: 6 }}>
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

          <div style={{ marginBottom: 4 }}>
            <div className="muted" style={{ fontSize: 'var(--fs-2xs)', marginBottom: 4 }}>
              System presets
            </div>
            <div className="row" style={{ flexWrap: 'wrap', gap: 6 }}>
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
    </div>
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
