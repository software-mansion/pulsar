import type { BoundItem } from '../../shared/types';

export default function BoundComponentsPanel({
  items,
  onRefresh,
  onSelect
}: {
  items: BoundItem[];
  onRefresh: () => void;
  onSelect: (item: BoundItem) => void;
}) {
  return (
    <div className="col" style={{ padding: 12, gap: 8, flex: 1, minHeight: 0, overflow: 'hidden' }}>
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
        <div className="scroll" style={{ flex: 1, marginTop: 4 }}>
          {items.map((item) => (
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
      )}
    </div>
  );
}
