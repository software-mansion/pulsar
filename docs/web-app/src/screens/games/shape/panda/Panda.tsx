import { useCallback, useEffect, useRef } from 'react';
import markup from './panda.svg?raw';
import { POKE_LANDS_MS, POKE_MS } from '../haptics';
import type { PandaMood } from './moods';

/**
 * The mascot under the board.
 *
 * Artwork: "AI generated panda cute panda" from Pixabay, by Tanrica —
 * https://pixabay.com/pl/vectors/ai-generowane-panda-s%C5%82odka-panda-9623097/
 * The same attribution is repeated in `panda.svg` so it travels with the file.
 *
 * It is a stock sticker whose line art is a single welded path, so the body
 * cannot be posed — but none of the facial features live in that path, and
 * neither does the bamboo. Those are wrapped in named groups (`eye-l-lid`,
 * `pupil-r`, `brow-l`, `blush-r`, `mouth`, `bamboo`, and `stage` for the whole
 * sticker) and every pose in the stylesheet is built from those seven handles
 * plus a rigid-body transform on `stage`.
 *
 * The SVG is injected rather than authored as JSX because it is 120 machine-
 * generated paths: as markup React never diffs it, so a mood change is one
 * class swap on the wrapper and costs nothing at runtime. It is a build-time
 * asset with no interpolation, so there is nothing here to escape.
 */

type Props = {
  mood: PandaMood;
  /** Fired on a poke, for the haptic and sound that go with the hop. */
  onPoke?: () => void;
};

/**
 * The hop, as keyframes rather than a mood class.
 *
 * A mood is a state and a hop is a gesture, so this deliberately composes with
 * whichever mood is showing: poke a sad panda and it hops sadly. Two things
 * follow from that. A CSS class cannot replay an animation that is already
 * running, so poking twice in a row would swallow the second hop; and the mood
 * classes already own `.stage`'s `animation`. A one-shot Web Animation avoids
 * both — it layers over the mood, restarts cleanly on every poke, and hands the
 * group back when it finishes.
 */
const HOP: Keyframe[] = [
  { transform: 'translateY(0) scale(1, 1)', offset: 0 },
  { transform: 'translateY(7px) scale(1.09, 0.9)', offset: 0.14 }, // crouch
  { transform: 'translateY(-34px) scale(0.94, 1.09)', offset: 0.42 }, // launch
  { transform: 'translateY(-31px) scale(0.98, 1.03)', offset: 0.56 }, // hang
  { transform: 'translateY(0) scale(1.13, 0.86)', offset: POKE_LANDS_MS / POKE_MS }, // land
  { transform: 'translateY(0) scale(0.98, 1.02)', offset: 0.9 },
  { transform: 'translateY(0) scale(1, 1)', offset: 1 },
];

export function Panda({ mood, onPoke }: Props) {
  const ref = useRef<HTMLButtonElement>(null);
  const hopRef = useRef<Animation | null>(null);

  useEffect(() => () => hopRef.current?.cancel(), []);

  const poke = useCallback(() => {
    onPoke?.();

    // The haptic still fires for someone who asked for less motion — it is the
    // point of the demo, and it is not vestibular. Only the hop is dropped.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const stage = ref.current?.querySelector<SVGGElement>('.stage');
    if (!stage) return;

    hopRef.current?.cancel();
    hopRef.current = stage.animate(HOP, {
      duration: POKE_MS,
      easing: 'cubic-bezier(0.32, 0, 0.36, 1)',
    });
  }, [onPoke]);

  return (
    <button
      ref={ref}
      type="button"
      className={`panda panda--${mood}`}
      onClick={poke}
      aria-label="Poke the panda"
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  );
}
