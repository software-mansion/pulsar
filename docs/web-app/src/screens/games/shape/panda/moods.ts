import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * The panda's mood, and the arbitration that decides which one wins.
 *
 * The mascot reacts to the same moments the haptics do, and it inherits the
 * same problem: a cascade fires a dozen events inside a second, so the naive
 * "set the mood on every event" would have a five-chain finale replaced by the
 * `happy` of the ordinary match that lands a beat later. As in `playHaptic`,
 * a reaction therefore carries a priority and refuses to be interrupted by
 * anything less important that is still running.
 *
 * Reactions are transient. Each one holds the face for a while and then falls
 * back to the *resting* mood, which is what `settle` changes — the panda dozes
 * off while the player thinks, and stays sad once the run is over, without
 * either of those having to be re-asserted after every match.
 */

export type PandaMood =
  | 'idle'
  | 'sleepy'
  | 'curious'
  | 'happy'
  | 'excited'
  | 'love'
  | 'wave'
  | 'grumpy'
  | 'sad';

/** Higher wins. A match must never talk over a super-combo celebration. */
export const MoodPriority = {
  /** Selecting a shape, or a hint appearing. */
  nudge: 0,
  /** An ordinary match cleared. */
  beat: 1,
  /** A special was born, or a cascade got long enough to notice. */
  event: 2,
  /** Super combo, fanfare, game over — the moments the run is remembered for. */
  finale: 3,
} as const;

export type MoodPriority = (typeof MoodPriority)[keyof typeof MoodPriority];

export type PandaController = {
  mood: PandaMood;
  /** Play `mood` for `ms`, then fall back to the resting mood. */
  react: (mood: PandaMood, priority: MoodPriority, ms: number) => void;
  /** Change what the panda falls back to. Applies immediately when idle. */
  settle: (mood: PandaMood) => void;
  /** Drop any reaction and reset the resting mood — for restart and unmount. */
  reset: (mood?: PandaMood) => void;
};

export function usePandaMood(initial: PandaMood = 'idle'): PandaController {
  const [mood, setMood] = useState<PandaMood>(initial);
  const restingRef = useRef<PandaMood>(initial);
  const activeRef = useRef<{ priority: MoodPriority; timer: number } | null>(null);

  const stop = useCallback(() => {
    if (!activeRef.current) return;
    window.clearTimeout(activeRef.current.timer);
    activeRef.current = null;
  }, []);

  const react = useCallback<PandaController['react']>((next, priority, ms) => {
    const active = activeRef.current;
    if (active && priority < active.priority) return;
    if (active) window.clearTimeout(active.timer);

    setMood(next);
    activeRef.current = {
      priority,
      timer: window.setTimeout(() => {
        activeRef.current = null;
        setMood(restingRef.current);
      }, ms),
    };
  }, []);

  const settle = useCallback<PandaController['settle']>((next) => {
    restingRef.current = next;
    // A reaction in flight keeps the face; it will land on `next` when it ends.
    if (!activeRef.current) setMood(next);
  }, []);

  const reset = useCallback<PandaController['reset']>(
    (next = 'idle') => {
      stop();
      restingRef.current = next;
      setMood(next);
    },
    [stop],
  );

  useEffect(() => stop, [stop]);

  return { mood, react, settle, reset };
}
