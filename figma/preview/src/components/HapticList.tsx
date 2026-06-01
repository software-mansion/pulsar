import type { ElementInfo } from '../types';

export function HapticList({
  elements,
  highlightsOn,
  onToggleHighlights,
  activeId,
  onActivate,
  onPlay,
  onShowDetails
}: {
  elements: ElementInfo[];
  highlightsOn: boolean;
  onToggleHighlights: (on: boolean) => void;
  activeId: string;
  onActivate: (id: string) => void;
  onPlay: (id: string) => void;
  onShowDetails: (id: string) => void;
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
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="el-haptic">{el.presetName}</div>
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
          ))
        )}
      </div>
    </aside>
  );
}
