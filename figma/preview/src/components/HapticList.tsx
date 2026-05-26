import type { ElementInfo } from '../types';

export function HapticList({
  elements,
  highlightsOn,
  onToggleHighlights,
  activeId,
  onActivate,
  onPlay
}: {
  elements: ElementInfo[];
  highlightsOn: boolean;
  onToggleHighlights: (on: boolean) => void;
  activeId: string;
  onActivate: (id: string) => void;
  onPlay: (id: string) => void;
}) {
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
          elements.map((el) => (
            <div
              key={el.id}
              className={`el-row${activeId === el.id ? ' active' : ''}`}
              onMouseEnter={() => onActivate(el.id)}
              onMouseLeave={() => onActivate('')}
              onClick={() => onPlay(el.id)}
            >
              <div className="el-haptic">{el.presetName}</div>
              <div className="el-name">{el.name}</div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
