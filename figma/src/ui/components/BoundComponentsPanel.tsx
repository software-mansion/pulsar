import { useMemo } from 'react';
import type { BoundItem } from '../../shared/types';

const UNASSIGNED = '__unassigned';

export default function BoundComponentsPanel({
  items,
  onRefresh,
  onSelect
}: {
  items: BoundItem[];
  onRefresh: () => void;
  onSelect: (item: BoundItem) => void;
}) {
  // Group bound items by their top-level frame, preserving the order each
  // frame was first seen in the list (which is document order for `findAll`).
  // Mirrors the preview's HapticList grouping so the two surfaces feel like
  // the same panel rendered in different chromes.
  const groups = useMemo(() => {
    const out: { id: string; name: string; items: BoundItem[] }[] = [];
    const indexById = new Map<string, number>();
    for (const item of items) {
      const key = item.frameId ?? UNASSIGNED;
      let idx = indexById.get(key);
      if (idx === undefined) {
        idx = out.length;
        indexById.set(key, idx);
        out.push({
          id: key,
          name: item.frameName ?? (key === UNASSIGNED ? 'Unassigned' : 'Screen'),
          items: []
        });
      }
      out[idx].items.push(item);
    }
    return out;
  }, [items]);

  return (
    <div className="col scroll" style={{ padding: 12, gap: 8, flex: 1, minHeight: 0 }}>
      <div className="row">
        <div style={{ fontWeight: 700, fontSize: 'var(--fs-lg)' }}>Bound components</div>
        <div className="spacer" />
        <button className="ghost" onClick={onRefresh} title="Refresh list">
          Refresh
        </button>
      </div>
      <p className="muted" style={{ margin: 0, fontSize: 'var(--fs-xs)' }}>
        Components with a haptic preset bound. Click one to hear it and jump to it
        in the canvas.
      </p>

      {items.length === 0 ? (
        <p className="muted" style={{ padding: '16px 2px' }}>
          No components have haptics bound yet. Select a node and bind a preset.
        </p>
      ) : (
        <div style={{ marginTop: 4 }}>
          {groups.map((group) => (
            <div key={group.id} className="bound-group">
              <div className="bound-group-head" title={group.name}>
                <span className="bound-group-name">{group.name}</span>
                <span className="bound-group-count">{group.items.length}</span>
              </div>
              {group.items.map((item) => (
                <div
                  key={item.nodeId}
                  className="preset-card"
                  style={{ cursor: 'pointer', marginBottom: 8 }}
                  onClick={() => onSelect(item)}
                  title="Play & reveal in canvas"
                >
                  <div className="row" style={{ gap: 6 }}>
                    <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                      {item.presetName}
                    </span>
                    <div className="spacer" />
                    <span className="bound-badge">{item.nodeType}</span>
                  </div>
                  <div
                    className="muted"
                    style={{
                      fontSize: 'var(--fs-xs)',
                      marginTop: 2,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {item.nodeName}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
