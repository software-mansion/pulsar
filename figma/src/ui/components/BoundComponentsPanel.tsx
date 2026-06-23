import styles from './BoundComponentsPanel.module.css';
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
    <div className={`col scroll ${styles['bound-panel']}`}>
      <div className="row">
        <div className="panel-title">Bound components</div>
        <div className="spacer" />
        <button className="ghost" onClick={onRefresh} title="Refresh list">
          Refresh
        </button>
      </div>
      <p className={`muted ${styles['bound-intro']}`}>
        Components with a haptic preset bound. Click one to hear it and jump to it
        in the canvas.
      </p>

      {items.length === 0 ? (
        <p className={`muted ${styles['bound-empty']}`}>
          No components have haptics bound yet. Select a node and bind a preset.
        </p>
      ) : (
        <div className={styles['bound-groups']}>
          {groups.map((group) => (
            <div key={group.id} className={styles['bound-group']}>
              <div className={styles['bound-group-head']} title={group.name}>
                <span className={styles['bound-group-name']}>{group.name}</span>
                <span className={styles['bound-group-count']}>{group.items.length}</span>
              </div>
              {group.items.map((item) => (
                <div
                  key={item.nodeId}
                  className={`preset-card ${styles['bound-item']}`}
                  onClick={() => onSelect(item)}
                  title="Play & reveal in canvas"
                >
                  <div className={`row ${styles['bound-item-row']}`}>
                    <span className={styles['bound-item-name']}>{item.presetName}</span>
                    <div className="spacer" />
                    <span className="bound-badge">{item.nodeType}</span>
                  </div>
                  <div className={`muted ${styles['bound-item-sub']}`}>{item.nodeName}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
