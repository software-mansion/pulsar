import styles from './SelectionBar.module.css';
import type { SelectionInfo } from '../../shared/types';
import { usePresetsUiStore } from '../store';
import iconPlay from '../assets/icon-play.svg';
import iconLink from '../assets/icon-link.svg';
import iconPlus from '../assets/icon-plus.svg';
import iconCheck from '../assets/icon-check.svg';

// Headline + supporting line + icon per state. The whole point of the expanded
// bar is that these are a teaching surface: each one names the single next
// action and points at the control that performs it, rather than describing the
// state ("nothing selected") and leaving the user to infer the rest.
const HERO = {
  empty: {
    icon: iconLink,
    title: 'Bind a haptic to a component',
    body: 'Select any component on the Figma canvas to start.'
  },
  unbound: {
    icon: iconPlus,
    title: 'Now pick a preset',
    body: 'Press Add on any Haptics preset in the list below.'
  },
  bound: {
    icon: iconCheck,
    title: 'Haptic connected',
    body: 'Tap the preset to feel it, or Remove to unbind it.'
  }
} as const;

// The sticky strip above the preset list. Two forms, per NN/g's sticky-header
// guidance: full-size at rest (so the flow reads at a glance on first open) and
// compact once the list scrolls (so it stays out of the way but keeps context).
// PresetsTab drives the swap from its scroll position; the transition is a
// height/opacity collapse rather than a swap of two different trees, so nothing
// jumps under the pointer.
//
// Both forms share one structure - a "component -> preset" pair of slots that
// fill in as the user goes. Showing both slots even when empty is what makes the
// relationship legible before anything is selected.
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
  const condensed = usePresetsUiStore((s) => s.selectionCondensed);
  const state = !selection ? 'empty' : !selection.binding ? 'unbound' : 'bound';
  const hero = HERO[state];
  // The one slot the user has to act on next. It pulses (expanded bar only) so
  // the step being asked for is findable without reading. Exactly one at a time,
  // and none once the binding is made - a pulse with nothing left to do is just
  // noise.
  const pending = state === 'empty' ? 'component' : state === 'unbound' ? 'preset' : null;
  const pendingClass = (slot: 'component' | 'preset') =>
    pending === slot ? ` ${styles['pending']}` : '';

  return (
    <div className={`${styles['sel-bar']} ${condensed ? styles['condensed'] : ''}`}>
      <div className={styles['sel-hero']}>
        <div className={styles['sel-hero-inner']}>
          <span className={styles['sel-hero-icon']}>
            <img src={hero.icon} alt="" width={15} height={15} />
          </span>
          <div className={styles['sel-hero-copy']}>
            <div className={styles['sel-hero-title']}>{hero.title}</div>
            <p className={`muted ${styles['sel-hero-body']}`}>{hero.body}</p>
          </div>
        </div>
      </div>

      <div className={`row ${styles['sel-row']}`}>
        <span className={styles['sel-info']}>
          {selection ? (
            <button
              className={styles['sel-link']}
              title="Reveal component on canvas"
              onClick={onFocusComponent}
            >
              {selection.name}
            </button>
          ) : (
            <span className={`${styles['sel-placeholder']}${pendingClass('component')}`}>
              Select Component canvas
            </span>
          )}
          <span className={styles['sel-arrow']} aria-hidden>
            →
          </span>
          {selection?.binding ? (
            <button
              className={`${styles['sel-link']} ${styles['sel-link--preset']}`}
              title="Show & play this preset"
              onClick={onOpenPreset}
            >
              <img src={iconPlay} alt="" width={9} height={9} />
              {selection.binding.presetName}
            </button>
          ) : (
            <span className={`${styles['sel-placeholder']}${pendingClass('preset')}`}>
              Choose a Haptics preset
            </span>
          )}
        </span>
        {selection?.binding && (
          <>
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
    </div>
  );
}
