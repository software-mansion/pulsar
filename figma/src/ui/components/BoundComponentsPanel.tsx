import styles from './BoundComponentsPanel.module.css';
import { useMemo } from 'react';
import type { BoundItem } from '../../shared/types';
import iconPlay from '../assets/icon-play.svg';
import iconLink from '../assets/icon-link.svg';
import iconChevron from '../assets/icon-chevron-down.svg';

const UNASSIGNED = '__unassigned';

// "Bound components" accordion — lives in the Presets tab's controls card. Lists
// every component that has a haptic preset bound, grouped by top-level frame;
// each row reads "component → preset". Clicking a row reveals the node on the
// canvas and plays its preset. The summary counter shows how many components are
// bound (mirrors the "Custom presets" accordion's counter). The list stays
// fresh on its own: App re-requests it whenever the selection changes, and
// binding/unbinding pushes a selection update.
export default function BoundComponentsPanel({
  items,
  onSelect
}: {
  items: BoundItem[];
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
    <details className="accordion acc-row">
      <summary className="acc-head">
        <span className="acc-icon">
          <img src={iconLink} alt="" />
        </span>
        <span className="acc-title">Bound components</span>
        {items.length > 0 && (
          <span className="tag active tag-flush">{items.length}</span>
        )}
        <span className="acc-chevron" aria-hidden="true">
          <img src={iconChevron} alt="" />
        </span>
      </summary>

      <div className="col acc-body">
        {items.length === 0 ? (
          <p className={`muted ${styles['bound-empty']}`}>
            No components have haptics bound yet. Select a node and bind a preset.
          </p>
        ) : (
          <>
            <p className={`muted ${styles['bound-intro']}`}>
              Click one to play it and reveal it on the canvas.
            </p>
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
                      className={styles['bound-item']}
                      onClick={() => onSelect(item)}
                      title="Play & reveal in canvas"
                    >
                      {/* Reads like the sticky selection bar: this component →
                          this preset. The whole row is the click target (reveal +
                          play), so the chips are non-interactive. */}
                      <span className={styles['bound-chip']} title={item.nodeName}>
                        <span className={styles['bound-chip-label']}>{item.nodeName}</span>
                      </span>
                      <span className={styles['bound-arrow']} aria-hidden>
                        →
                      </span>
                      <span
                        className={`${styles['bound-chip']} ${styles['bound-chip--preset']}`}
                        title={item.presetName}
                      >
                        <img src={iconPlay} alt="" width={9} height={9} />
                        <span className={styles['bound-chip-label']}>{item.presetName}</span>
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </details>
  );
}
