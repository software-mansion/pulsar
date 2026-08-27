import { useEffect, useRef, useState } from 'react';

/**
 * A number that counts up to its new value, pops when it changes, and throws a
 * floating delta chip.
 *
 * The tween runs on `requestAnimationFrame`, which browsers stop entirely for a
 * hidden or throttled page — so a timer always snaps the counter to its target
 * as a backstop. Without it a score bumped while the tab was in the background
 * would come back frozen part-way there and stay wrong for the rest of the run.
 */

const TWEEN_MS = 420;
const DELTA_MS = 900;

type Delta = { id: number; text: string };

type Props = {
  value: number;
  label: string;
  /** Drives the colour of the pop and the delta chip. */
  tone: 'score' | 'moves';
  align?: 'left' | 'right';
  /** Renders the value in the warning colour (used when moves run low). */
  warn?: boolean;
};

export function Counter({ value, label, tone, align = 'left', warn = false }: Props) {
  const [display, setDisplay] = useState(value);
  const [deltas, setDeltas] = useState<Delta[]>([]);
  /**
   * Bumped once per real change — never per tween frame — so remounting the
   * value span replays the pop animation without restarting it 60 times a
   * second. (A CSS animation only re-runs when its name changes or the element
   * is recreated; remounting is the reliable trigger here.)
   */
  const [popId, setPopId] = useState(0);

  const displayRef = useRef(value);
  const previousRef = useRef(value);
  const deltaIdRef = useRef(0);

  useEffect(() => {
    const from = displayRef.current;
    const previous = previousRef.current;
    previousRef.current = value;
    if (from === value) return;

    const difference = value - previous;
    if (difference !== 0) {
      setPopId((current) => current + 1);

      const id = ++deltaIdRef.current;
      const text = difference > 0 ? `+${difference.toLocaleString()}` : `${difference}`;
      setDeltas((current) => [...current, { id, text }]);
      window.setTimeout(
        () => setDeltas((current) => current.filter((entry) => entry.id !== id)),
        DELTA_MS,
      );
    }

    const start = performance.now();
    let raf = 0;

    const step = (now: number) => {
      const progress = Math.min(1, (now - start) / TWEEN_MS);
      // Ease-out cubic: quick off the mark, settling gently onto the number.
      const eased = 1 - (1 - progress) ** 3;
      const next = Math.round(from + (value - from) * eased);
      displayRef.current = next;
      setDisplay(next);
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    // Backstop for a paused rAF — see the note at the top of this file.
    const snap = window.setTimeout(() => {
      if (displayRef.current !== value) {
        displayRef.current = value;
        setDisplay(value);
      }
    }, TWEEN_MS + 250);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(snap);
    };
  }, [value]);

  return (
    <div className={`counter${align === 'right' ? ' counter--right' : ''} counter--${tone}`}>
      <span className="counter__label">{label}</span>

      <span className="counter__slot">
        <span
          /*
           * Namespaced because the delta chips are siblings in this same slot
           * and their ids advance in lockstep with `popId` — both counters are
           * bumped by the very same change. Bare numbers collided on every
           * bump, and React resolves a duplicate key by dropping one of the
           * two children, which is the value itself as often as the chip.
           */
          key={`value-${popId}`}
          className={`counter__value${warn ? ' counter__value--warn' : ''}`}
          // Announce the settled value, not every frame of the tween.
          aria-label={`${label}: ${value}`}
        >
          {display.toLocaleString()}
        </span>

        {deltas.map((delta) => (
          <span key={`delta-${delta.id}`} className="counter__delta" aria-hidden="true">
            {delta.text}
          </span>
        ))}
      </span>
    </div>
  );
}
