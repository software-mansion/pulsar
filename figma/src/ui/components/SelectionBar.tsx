import type { SelectionInfo } from '../../shared/types';
import iconUnlink from '../assets/icon-unlink.svg';

export default function SelectionBar({
  selection,
  onUnbind
}: {
  selection: SelectionInfo | null;
  onUnbind: () => void;
}) {
  return (
    <div
      style={{
        padding: '6px 10px',
        background: 'var(--color-blue-10)',
        borderBottom: '1px solid var(--border)',
        fontSize: 'var(--fs-xs)'
      }}
      className="row"
    >
      {!selection && <span className="muted">Select one node to bind a preset.</span>}
      {selection && !selection.binding && (
        <span>
          <strong>{selection.name}</strong>{' '}
          <span className="muted">({selection.type.toLowerCase()})</span> · no preset bound
        </span>
      )}
      {selection?.binding && (
        <>
          <span>
            <strong>{selection.name}</strong> → <em>{selection.binding.presetName}</em>
          </span>
          <div className="spacer" />
          <button className="icon-btn" title="Unbind" aria-label="Unbind preset" onClick={onUnbind}>
            <img src={iconUnlink} alt="" />
          </button>
        </>
      )}
    </div>
  );
}
