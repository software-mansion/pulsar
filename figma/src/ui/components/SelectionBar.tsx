import styles from './SelectionBar.module.css';
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
    <div className={`row ${styles['sel-bar']}`}>
      {!selection && <span className="muted">Select one node to bind a preset.</span>}
      {selection && !selection.binding && (
        <span className={styles['sel-info']}>
          <button
            className={styles['sel-link']}
            title="Reveal component on canvas"
            onClick={onFocusComponent}
          >
            {selection.name}
          </button>
          <span className={styles['sel-arrow']} aria-hidden>
            →
          </span>
          <span className={styles['sel-placeholder']}>Select preset for component</span>
        </span>
      )}
      {selection?.binding && (
        <>
          <span className={styles['sel-info']}>
            <button
              className={styles['sel-link']}
              title="Reveal component on canvas"
              onClick={onFocusComponent}
            >
              {selection.name}
            </button>
            <span className={styles['sel-arrow']} aria-hidden>
              →
            </span>
            <button
              className={`${styles['sel-link']} ${styles['sel-link--preset']}`}
              title="Show & play this preset"
              onClick={onOpenPreset}
            >
              <img src={iconPlay} alt="" width={9} height={9} />
              {selection.binding.presetName}
            </button>
          </span>
          <div className="spacer" />
          <button
            className={`ghost ${styles['sel-remove']}`}
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
