import type { SelectionInfo } from '../../shared/types';
import iconPlay from '../assets/icon-play.svg';

export default function SelectionBar({
  selection,
  onUnbind,
  onFocusComponent,
  onOpenPreset
}: {
  selection: SelectionInfo | null;
  onUnbind: () => void;
  // Reveal the selected node on the Figma canvas.
  onFocusComponent: () => void;
  // Scroll to the bound preset in the list and play it.
  onOpenPreset: () => void;
}) {
  return (
    <div
      style={{
        padding: '6px 10px',
        background: 'var(--color-blue-10)',
        borderBottom: '1px solid var(--border)',
        fontSize: 'var(--fs-xs)',
      }}
      className="row"
    >
      {!selection && <span className="muted">Select one node to bind a preset.</span>}
      {selection && !selection.binding && (
        <span className="sel-info">
          <button
            className="sel-link"
            title="Reveal on canvas"
            onClick={onFocusComponent}
          >
            {selection.name}
          </button>
          <span className="muted">({selection.type.toLowerCase()}) · no preset bound</span>
        </span>
      )}
      {selection?.binding && (
        <>
          <span className="sel-info">
            <button
              className="sel-link"
              title="Reveal component on canvas"
              onClick={onFocusComponent}
            >
              {selection.name}
            </button>
            <span className="sel-arrow" aria-hidden>
              →
            </span>
            <button
              className="sel-link sel-link--preset"
              title="Show & play this preset"
              onClick={onOpenPreset}
            >
              <img src={iconPlay} alt="" width={9} height={9} />
              {selection.binding.presetName}
            </button>
          </span>
          <div className="spacer" />
          <button
            className="ghost"
            style={{ boxShadow: 'none' }}
            title="Remove binding"
            aria-label="Remove binding"
            onClick={onUnbind}
          >
            Remove
          </button>
        </>
      )}
    </div>
  );
}
