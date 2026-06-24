import { useMemo, type ReactNode } from 'react';
import type { ElementInfo, FrameInfo } from '../types';

export function HapticList({
  elements,
  frames,
  currentFrameId,
  highlightsOn,
  onToggleHighlights,
  activeId,
  onActivate,
  onPlay,
  onShowDetails,
  footer
}: {
  elements: ElementInfo[];
  frames: Map<string, FrameInfo>;
  currentFrameId: string;
  highlightsOn: boolean;
  onToggleHighlights: (on: boolean) => void;
  activeId: string;
  onActivate: (id: string) => void;
  onPlay: (id: string) => void;
  onShowDetails: (id: string) => void;
  // Optional pinned content below the scrollable list (e.g. the open-on-phone QR).
  footer?: ReactNode;
}) {
  // Group elements by their owning frame id, then sort groups so the currently
  // presented frame comes first and the rest follow in document order (insertion
  // order in the frames Map). Bindings with no frameId fall into a synthetic
  // "Unassigned" bucket so they're still reachable.
  const groups = useMemo(() => {
    const UNASSIGNED = '__unassigned';
    const byFrame = new Map<string, ElementInfo[]>();
    for (const el of elements) {
      const key = el.frameId ?? UNASSIGNED;
      let list = byFrame.get(key);
      if (!list) {
        list = [];
        byFrame.set(key, list);
      }
      list.push(el);
    }

    type Group = { id: string; name: string; items: ElementInfo[] };
    const out: Group[] = [];
    // Current frame first, if it has bindings.
    if (currentFrameId && byFrame.has(currentFrameId)) {
      out.push({
        id: currentFrameId,
        name: frames.get(currentFrameId)?.name ?? 'Current screen',
        items: byFrame.get(currentFrameId)!
      });
      byFrame.delete(currentFrameId);
    }
    // Then everything else in the frames Map's insertion order.
    for (const [id, info] of frames) {
      const items = byFrame.get(id);
      if (!items) continue;
      out.push({ id, name: info.name, items });
      byFrame.delete(id);
    }
    // Anything left has no matching frame metadata — surface it under a
    // generic header so the user can still see and play it.
    for (const [id, items] of byFrame) {
      out.push({ id, name: id === UNASSIGNED ? 'Unassigned' : 'Screen', items });
    }
    return out;
  }, [elements, frames, currentFrameId]);

  return (
    <aside className="aside">
      <div className="aside-head">
        <h2>Haptic elements</h2>
        <label className="toggle">
          <input
            type="checkbox"
            checked={highlightsOn}
            onChange={(e) => onToggleHighlights(e.target.checked)}
          />
          Highlight
        </label>
      </div>
      <div className="list">
        {elements.length === 0 ? (
          <div className="empty-note">No elements have haptics bound on this page.</div>
        ) : (
          groups.map((group) => (
            <div key={group.id} className="screen-group">
              <div
                className={`screen-head${group.id === currentFrameId ? ' active' : ''}`}
                title={group.name}
              >
                <span className="screen-name">{group.name}</span>
                <span className="screen-count">{group.items.length}</span>
              </div>
              {group.items.map((el) => (
                <div
                  key={el.id}
                  className={`el-row${activeId === el.id ? ' active' : ''}`}
                  onMouseEnter={() => onActivate(el.id)}
                  onMouseLeave={() => onActivate('')}
                  onClick={() => onPlay(el.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="el-haptic">
                        <span className="el-haptic-name">{el.presetName}</span>
                        {el.isCustom && <span className="tag tag-custom">Custom</span>}
                      </div>
                      <div className="el-name">{el.name}</div>
                    </div>
                    <button
                      className="details-btn"
                      title="Show preset details"
                      onClick={(e) => {
                        e.stopPropagation();
                        onShowDetails(el.id);
                      }}
                    >
                      ⋯
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
      {footer}
    </aside>
  );
}
