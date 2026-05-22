import { useMemo } from 'react';
import type { CatalogEntry } from '../../shared/types';

const TAG_GROUPS: Record<string, string[]> = {
  Intensity: ['Bold', 'Substantial', 'Gentle'],
  Texture: ['Flexible', 'Rigid', 'Soft', 'Elastic'],
  Shape: ['Peak', 'Bumps', 'Ramp', 'Saw', 'Solid', 'Impulses', 'Impulse'],
  Duration: ['Short', 'Extended', 'Long'],
  Source: ['System', 'iOS Fallback', 'Vendor', 'Effect', 'Primitive']
};

export type FilterState = {
  search: string;
  tags: Set<string>;
  category: 'all' | 'user' | 'system';
  platform: 'all' | 'ios' | 'android';
};

export default function Filters({
  state,
  setState,
  total,
  visible
}: {
  state: FilterState;
  setState: (s: FilterState) => void;
  total: number;
  visible: number;
}) {
  const update = (patch: Partial<FilterState>) => setState({ ...state, ...patch });
  const toggle = (tag: string) => {
    const next = new Set(state.tags);
    next.has(tag) ? next.delete(tag) : next.add(tag);
    update({ tags: next });
  };

  return (
    <div style={{ padding: 8, borderBottom: '1px solid var(--border)' }}>
      <input
        type="text"
        placeholder="Search presets…"
        value={state.search}
        onChange={(e) => update({ search: e.target.value })}
      />
      <div className="row" style={{ marginTop: 6, gap: 4 }}>
        {(['all', 'user', 'system'] as const).map((c) => (
          <span
            key={c}
            className={`tag ${state.category === c ? 'active' : ''}`}
            onClick={() => update({ category: c })}
          >
            {c}
          </span>
        ))}
        {state.category !== 'user' && (
          <>
            <span className="muted" style={{ fontSize: 'var(--fs-2xs)' }}>·</span>
            {(['all', 'ios', 'android'] as const).map((p) => (
              <span
                key={p}
                className={`tag ${state.platform === p ? 'active' : ''}`}
                onClick={() => update({ platform: p })}
              >
                {p}
              </span>
            ))}
          </>
        )}
        <div className="spacer" />
        <span className="muted" style={{ fontSize: 'var(--fs-2xs)' }}>
          {visible}/{total}
        </span>
      </div>
      <details style={{ marginTop: 6 }}>
        <summary className="muted" style={{ fontSize: 'var(--fs-xs)', cursor: 'pointer' }}>
          Tags ({state.tags.size})
        </summary>
        <div style={{ marginTop: 6 }}>
          {Object.entries(TAG_GROUPS).map(([group, tags]) => (
            <div key={group} style={{ marginBottom: 4 }}>
              <div className="muted" style={{ fontSize: 'var(--fs-2xs)', marginBottom: 2 }}>{group}</div>
              {tags.map((t) => (
                <span
                  key={t}
                  className={`tag ${state.tags.has(t) ? 'active' : ''}`}
                  onClick={() => toggle(t)}
                >
                  {t}
                </span>
              ))}
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}

export function applyFilter(entries: CatalogEntry[], state: FilterState): CatalogEntry[] {
  const q = state.search.trim().toLowerCase();
  return entries.filter((e) => {
    if (state.category !== 'all' && e.category !== state.category) return false;
    if (state.category !== 'user' && state.platform !== 'all' && e.platform !== state.platform) return false;
    if (state.tags.size > 0) {
      for (const t of state.tags) if (!e.data.tags.includes(t)) return false;
    }
    if (q) {
      const hay = (e.data.name + ' ' + e.data.description + ' ' + e.data.tags.join(' ')).toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export function useFilterStateInit(): FilterState {
  return useMemo(
    () => ({ search: '', tags: new Set<string>(), category: 'all', platform: 'all' }),
    []
  );
}
