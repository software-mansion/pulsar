import {
  lazy,
  memo,
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import type { CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import {
  COLS,
  ROWS,
  areAdjacent,
  colOf,
  createBoard,
  createRng,
  findBestMove,
  hasValidMove,
  idx,
  resolveMove,
  rowOf,
  shuffleBoard,
  type Board,
  type CascadeStep,
  type ComboKind,
  type Move,
  type Rng,
  type Tile as TileData,
} from './engine';
import { ShapeSprite } from './ShapeSprite';
import { Counter } from './Counter';
import { MoodPriority, usePandaMood } from './panda/moods';
import { gameAudio } from './audio';
import { FANFARE_MS, hapticsAvailable, INVITE_MS, resetHaptics } from './haptics';
import { createParticleField, type ParticleField } from './particles';
import {
  bannerEffect,
  blastEffect,
  comboEffect,
  bornEffect,
  clearShake,
  fanfareEffect,
  finaleEffect,
  gameOverEffect,
  inviteEffect,
  landingEffect,
  matchEffect,
  pokeEffect,
  rejectEffect,
  selectEffect,
  shuffleEffect,
  swapEffect,
  type BannerKind,
  type Effects,
} from './effects';

/**
 * Playback, not logic.
 *
 * `resolveMove` has already decided everything by the time this component runs:
 * it hands back an ordered list of cascade steps, and this file walks them,
 * pausing for each animation and firing the matching effects. Splitting it that
 * way is what lets the celebration know how deep a chain is *before* the first
 * shape pops, so the finale can be scheduled rather than discovered.
 */

/*
 * The mascot's artwork is ~54 kB of inlined SVG — a quarter of the app's entry
 * chunk for something only this screen draws. Split out, it is fetched when the
 * game mounts and never by someone who only opens Presets. `.panda` carries the
 * artwork's aspect ratio, so the box is the right size before it arrives and
 * nothing below it shifts when it lands.
 */
const Panda = lazy(() => import('./panda/Panda').then((m) => ({ default: m.Panda })));

const STARTING_MOVES = 25;

/**
 * How the game keeps itself lively.
 *
 * Played honestly, a striped shape turns up about once every two moves for
 * someone who spots the best swap — but the worst dry spell measured over 500
 * moves was fourteen, which is a long time to see nothing happen. So the rules
 * loosen in two situations: for the opening moves, where a new player needs to
 * see what a special *does* before they can learn to aim for one, and again
 * whenever anyone has gone several moves without one. Left on permanently the
 * same dial produces more than one special per move and the board turns to
 * soup, so it is deliberately temporary in both cases.
 */
const WARMUP_MOVES = 8;
const PITY_MOVES = 4;
const GENEROUS_AT = 4;

/**
 * Chance that a refilled shape copies a neighbour's colour — see
 * `MoveOptions.cascadeBias`.
 *
 * Measured over 500 played-out moves: at 0 a chain of any length happens on 43%
 * of moves and only 24% are worth celebrating. At 0.20 that becomes 69% and
 * 49%, which roughly doubles how often a combo turns up. Past about 0.3 it runs
 * away — 88% of moves chain and each takes nearly six cascade steps, which at
 * 550ms a step means the player spends most of the game watching rather than
 * playing. The opening is nudged higher because a first impression should sparkle.
 */
const CASCADE_BIAS = 0.2;
const CASCADE_BIAS_WARMUP = 0.28;

/** Idle time before the board points out a move it can see. */
const HINT_AFTER_MS = 4200;

/** Left alone for this long, the panda under the board nods off. */
const DOZE_AFTER_MS = 14000;

/**
 * Delay before the opening greeting.
 *
 * The particle field is built asynchronously, so firing on mount would play the
 * haptic into a screen with nothing to show for it.
 */
const INVITE_DELAY_MS = 420;

/** Animation budget for each phase, in ms. Effects are timed against these. */
const SWAP_MS = 175;
const CLEAR_MS = 285;
const FALL_MS = 265;

const wait = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

/**
 * How far, as a fraction of a cell, a shape must be pushed before the swap
 * commits. Low enough to feel eager, high enough that a tap with a shaky finger
 * stays a tap.
 */
const COMMIT_AT = 0.42;

/** The grabbed shape never slides further than this, so it reads as a nudge. */
const MAX_NUDGE = 0.62;

/**
 * The illegal-move refusal. `REJECT_LEAN` is only needed for a tap-then-tap
 * swap, which has no drag offset to inherit; a dragged swap keeps whatever the
 * player already pushed. `REJECT_HOLD_MS` is the beat the shape visibly resists
 * before sliding home.
 */
const REJECT_LEAN = 0.34;
const REJECT_HOLD_MS = 90;

/**
 * The recoil, as fractions of however far the player actually pushed.
 *
 * Expressing the bounce relative to the push (rather than as an overshooting
 * easing curve) is what keeps it safe: a hard shove and a gentle nudge both
 * recoil by the same *proportion*, so the shape never swings out of its own
 * cell and into its neighbours however hard the illegal swap was attempted.
 */
const REJECT_SPRING: { at: number; ms: number }[] = [
  { at: -0.26, ms: 150 },
  { at: 0.1, ms: 110 },
  { at: 0, ms: 90 },
];

const REJECT_SETTLE_MS = REJECT_SPRING.reduce((total, stage) => total + stage.ms, 0);

/**
 * A live pixel offset applied to two neighbouring shapes.
 *
 * Both the drag and the illegal-move wiggle use it, which is the point: a
 * rejected swap must never touch the board. Moving shapes by *offset* leaves
 * the grid untouched, so nothing has to be swapped and un-swapped, and the
 * springy grid transition — which overshoots a third of a cell into the
 * neighbouring shapes — never gets interrupted and reversed mid-flight.
 */
type Nudge = {
  from: number;
  to: number;
  dx: number;
  dy: number;
  kind: 'drag' | 'reject';
  /** The offset at the moment the push ended — the spring scales off it. */
  pushedX: number;
  pushedY: number;
  /** Duration for this leg of the spring; the CSS reads it as `--settle-ms`. */
  settleMs?: number;
};

/**
 * One shape. Memoised because a drag re-renders the board on every pointermove
 * and only the two shapes being pushed actually change — without this, all 64
 * SVGs would re-render at pointer rate.
 */
const Tile = memo(function Tile({
  tile,
  index,
  clearing,
  selected,
  hinted,
  grabbed,
  displaced,
  rejecting,
  settleMs,
  dx,
  dy,
}: {
  tile: TileData;
  index: number;
  clearing: boolean;
  selected: boolean;
  /** Part of the move the board is suggesting after an idle spell. */
  hinted: boolean;
  /** The shape under the finger — it lifts and rides above the board. */
  grabbed: boolean;
  /** The neighbour it is pushing against — it slides, but does not lift. */
  displaced: boolean;
  /** Part of an illegal-move spring: a tight ease, staged from JS. */
  rejecting: boolean;
  settleMs?: number;
  dx: number;
  dy: number;
}) {
  const col = colOf(index);
  const row = rowOf(index);
  const transform =
    dx !== 0 || dy !== 0
      ? `translate(calc(${col * 100}% + ${dx}px), calc(${row * 100}% + ${dy}px))`
      : `translate(${col * 100}%, ${row * 100}%)`;

  return (
    <div
      className={[
        'shape',
        clearing ? 'shape--clearing' : '',
        selected ? 'shape--selected' : '',
        hinted ? 'shape--hint' : '',
        grabbed ? 'shape--grabbed' : '',
        displaced ? 'shape--displaced' : '',
        rejecting ? 'shape--rejecting' : '',
        tile.special !== 'none' ? 'shape--special' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={
        settleMs === undefined
          ? { transform }
          : ({ transform, '--settle-ms': `${settleMs}ms` } as CSSProperties)
      }
    >
      <ShapeSprite color={tile.color} special={tile.special} />
    </div>
  );
});

/** What a cascade earns as a banner. Index by depth, clamped. */
const CASCADE_TITLES = ['Sweet!', 'Tasty!', 'Delicious!', 'Divine!', 'Unstoppable!'];

/**
 * The combos that earn a screen kick. Deliberately narrow: shaking the whole app
 * is the loudest thing the game can do, so it is saved for a wipeout or a chain
 * five deep rather than spent on every special.
 */
const SUPER_COMBOS: ReadonlySet<ComboKind> = new Set<ComboKind>([
  'bombBomb',
  'bombStriped',
  'bombColor',
  'wrappedWrapped',
]);

const SUPER_CASCADE = 5;

const COMBO_TITLES: Record<Exclude<ComboKind, 'none'>, string> = {
  bombColor: 'Colour bomb!',
  bombBomb: 'Total wipeout!',
  bombStriped: 'Charged bomb!',
  stripedStriped: 'Double stripe!',
  stripedWrapped: 'Striped wrap!',
  wrappedWrapped: 'Mega wrap!',
};

type Banner = { id: number; title: string; detail: string; kind: BannerKind };

/**
 * How long each kind stays up. A bonus banner is instructional and has to be
 * read; a cascade label is pure punctuation and outstays its welcome if it
 * lingers; a super combo has earned the extra beat.
 */
const BANNER_MS: Record<BannerKind, number> = {
  bonus: 1700,
  cascade: 1300,
  combo: 1500,
  super: 1900,
  info: 1500,
};

export function ShapeCascade() {
  const rngRef = useRef<Rng>(createRng(Date.now() >>> 0));
  const [board, setBoard] = useState<Board>(() => createBoard(rngRef.current));
  const [clearing, setClearing] = useState<ReadonlySet<number>>(() => new Set());
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(STARTING_MOVES);
  const [busy, setBusy] = useState(false);
  const [banner, setBanner] = useState<Banner | null>(null);
  const [dryStreak, setDryStreak] = useState(0);
  const [hint, setHint] = useState<{ from: number; to: number } | null>(null);
  /** The live chain counter. `exiting` keeps it mounted long enough to leave. */
  const [combo, setCombo] = useState<{ level: number; exiting: boolean } | null>(null);

  /**
   * The mascot reacts to the same beats the haptics do — see `panda/moods.ts`
   * for why its reactions are arbitrated the same way rather than simply set.
   */
  const {
    mood: pandaMood,
    react: pandaReact,
    settle: pandaSettle,
    reset: pandaReset,
  } = usePandaMood();

  const boardRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  /**
   * The particle canvas is rendered into the app shell rather than the board,
   * because the board must keep `overflow: hidden` for the shapes' drop-in and
   * that clips sparks at its border. Spanning the shell lets a blast throw
   * confetti across the whole app, and the shell's own clipping keeps it inside
   * the frame.
   */
  const [shell, setShell] = useState<HTMLElement | null>(null);
  const effectsRef = useRef<Effects>({ field: null });
  const sizeRef = useRef({ width: 1, height: 1 });
  const [nudge, setNudge] = useState<Nudge | null>(null);
  /** Guards the delayed clear in `settleNudge` against a newer settle. */
  const nudgeGenRef = useRef(0);
  /** So the end-of-run cadence plays once, not on every re-render while over. */
  const endedRef = useRef(false);
  const dragRef = useRef<{ from: number; originX: number; originY: number; done: boolean } | null>(
    null,
  );
  /** Bumped on restart/unmount so an in-flight cascade stops touching state. */
  const runRef = useRef(0);
  const bannerIdRef = useRef(0);

  useLayoutEffect(() => {
    setShell(document.querySelector<HTMLElement>('.shell'));
  }, []);

  // A greeting when the game opens. Browsers ignore `navigator.vibrate` without
  // sticky user activation, so this is felt by someone who tapped through from
  // the games list and quietly skipped for a direct link — see `invitePattern`.
  useEffect(() => {
    const run = runRef.current;
    const timer = window.setTimeout(() => {
      if (runRef.current !== run) return;
      gameAudio.unlock();
      inviteEffect(effectsRef.current, sizeRef.current);
      pandaReact('wave', MoodPriority.finale, INVITE_MS + 700);
    }, INVITE_DELAY_MS);
    return () => window.clearTimeout(timer);
    // `pandaReact` is stable, so this still runs only on mount.
  }, [pandaReact]);

  // --------------------------------------------------------- particles --

  // Depends on `shell` because the canvas lives in a portal into it: on the
  // first commit that portal has not rendered, so `canvasRef` is still empty
  // and there is nothing to attach a GPU context to. Re-running once the shell
  // is known is what gives this effect a canvas to work with.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let field: ParticleField | null = null;
    let raf = 0;
    let last = performance.now();
    let cancelled = false;

    void createParticleField(canvas).then((created) => {
      if (cancelled) {
        created.destroy();
        return;
      }
      field = created;
      effectsRef.current.field = created;

      const loop = (now: number) => {
        // Clamped so a backgrounded tab does not resume with a huge timestep
        // that teleports every particle off screen.
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;

        // Re-read each frame so the origin survives scrolling and resizing
        // without needing listeners for either; two rect reads are far cheaper
        // than getting this subtly wrong.
        const boardElement = boardRef.current;
        const shellElement = canvas.parentElement;
        if (boardElement && shellElement) {
          const boardRect = boardElement.getBoundingClientRect();
          const shellRect = shellElement.getBoundingClientRect();
          created.resize(shellRect.width, shellRect.height);
          created.setOrigin(boardRect.left - shellRect.left, boardRect.top - shellRect.top);
        }

        created.frame(dt);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      effectsRef.current.field = null;
      field?.destroy();
    };
  }, [shell]);

  // Keep the particle canvas locked to the board's pixel size.
  useLayoutEffect(() => {
    const element = boardRef.current;
    if (!element) return;

    // Board size only: it is what effect positions are expressed in. The canvas
    // is sized to the shell instead, inside the frame loop.
    const apply = (width: number, height: number) => {
      if (width <= 0 || height <= 0) return;
      sizeRef.current = { width, height };
    };

    // Measure synchronously first. The particle field is built asynchronously,
    // so if the observer's only callback lands before the field exists, its
    // measurement goes nowhere and the canvas is left at its 1x1 default —
    // taking every burst position and the drag's commit distance down with it.
    // This effect is layout-phase, so it always runs before that creation.
    const rect = element.getBoundingClientRect();
    apply(rect.width, rect.height);

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      apply(width, height);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    return () => {
      runRef.current++;
      resetHaptics();
      clearShake();
      gameAudio.close();
    };
  }, []);

  /**
   * Queues the "ta-daaa" to land once the finale has finished.
   *
   * They are kept apart deliberately: both claim the top haptic priority, so
   * overlapping them would have the fanfare cancel the finale mid-swell and the
   * player would feel one truncated buzz instead of two distinct gestures.
   */
  const playFanfareAfter = useCallback((delayMs: number, run: number) => {
    window.setTimeout(() => {
      if (runRef.current !== run) return;
      fanfareEffect(effectsRef.current, sizeRef.current);
    }, delayMs);
  }, []);

  const showBanner = useCallback((title: string, detail: string, kind: BannerKind) => {
    bannerIdRef.current += 1;
    const id = bannerIdRef.current;
    setBanner({ id, title, detail, kind });
    bannerEffect(effectsRef.current, kind, sizeRef.current);
    window.setTimeout(() => {
      setBanner((current) => (current?.id === id ? null : current));
    }, BANNER_MS[kind]);
  }, []);

  /**
   * The generosity dial for this move — see `WARMUP_MOVES`. Derived rather than
   * stored so it can never drift out of step with the counters it reads.
   */
  const movesPlayed = STARTING_MOVES - moves;
  const warmingUp = movesPlayed < WARMUP_MOVES;
  const generousAt = warmingUp || dryStreak >= PITY_MOVES ? GENEROUS_AT : undefined;
  const cascadeBias = warmingUp ? CASCADE_BIAS_WARMUP : CASCADE_BIAS;

  /** Centre of a cell in canvas pixels — where a burst should originate. */
  const pointOf = useCallback((index: number, source: Board) => {
    const { width, height } = sizeRef.current;
    return {
      x: ((colOf(index) + 0.5) / COLS) * width,
      y: ((rowOf(index) + 0.5) / ROWS) * height,
      color: source[index]?.color ?? 0,
    };
  }, []);

  /**
   * Eases any live offset home on the no-overshoot curve, then clears it.
   *
   * Offsets are never dropped to zero in one step: doing that hands the shape
   * to the springy grid transition, which overshoots a third of a cell into its
   * neighbours — the jolt that made a refused swap look like the row moving.
   */
  const settleNudge = useCallback(() => {
    const generation = ++nudgeGenRef.current;
    let elapsed = 0;

    for (const stage of REJECT_SPRING) {
      const at = stage.at;
      const ms = stage.ms;
      window.setTimeout(() => {
        if (nudgeGenRef.current !== generation) return;
        setNudge((current) =>
          current
            ? {
                ...current,
                // Each stage is a fraction of the offset the player pushed, so
                // the recoil is proportional and always lands back on zero.
                dx: current.pushedX * at,
                dy: current.pushedY * at,
                kind: 'reject',
                settleMs: ms,
              }
            : null,
        );
      }, elapsed);
      elapsed += ms;
    }

    window.setTimeout(() => {
      if (nudgeGenRef.current === generation) setNudge(null);
    }, elapsed + 40);
  }, []);

  // ---------------------------------------------------------- playback --

  const playStep = useCallback(
    async (step: CascadeStep, before: Board, run: number) => {
      const boardSize = sizeRef.current;

      // Mark the doomed shapes so CSS can pop them, then fire their effects.
      setClearing(new Set(step.clear.cleared.map((index) => before[index]?.id ?? -1)));

      const points = step.clear.cleared
        .filter((index) => before[index])
        .map((index) => pointOf(index, before));
      const tiles = step.clear.cleared.length;

      matchEffect(effectsRef.current, points, tiles, step.clear.cascade);
      pandaReact('happy', MoodPriority.beat, 620);

      if (step.clear.cascade >= 2) {
        setCombo({ level: step.clear.cascade, exiting: false });
        comboEffect(effectsRef.current, step.clear.cascade, boardSize);
        // Held a little longer as the chain deepens, so a long cascade keeps
        // the face lit rather than flickering back on every link.
        pandaReact('excited', MoodPriority.event, 520 + step.clear.cascade * 120);
      }

      // Specials fire slightly after the pop so the two are distinguishable.
      step.clear.blasts.forEach((blast, order) => {
        window.setTimeout(
          () => {
            if (runRef.current !== run) return;
            blastEffect(
              effectsRef.current,
              blast.kind,
              { ...pointOf(blast.index, before), color: blast.color },
              boardSize,
            );
          },
          60 + order * 55,
        );
      });

      step.clear.created.forEach((entry) => {
        window.setTimeout(() => {
          if (runRef.current !== run) return;
          bornEffect(effectsRef.current, entry.special, {
            ...pointOf(entry.index, before),
            color: entry.color,
          });
          pandaReact('excited', MoodPriority.event, 780);
          // Say so when one was granted rather than earned, and say what it
          // does — a striped shape is useless to a player who has not worked
          // out that swapping it fires the line.
          if (entry.bonus) showBanner('Bonus stripe!', 'Swap it to blast the line', 'bonus');
        }, 120);
      });

      setScore((current) => current + step.clear.points);
      await wait(CLEAR_MS);
      if (runRef.current !== run) return;

      setBoard(step.fall.board);
      setClearing(new Set());
      landingEffect(step.fall.moved, step.fall.distance);

      await wait(FALL_MS);
    },
    [pointOf, showBanner, pandaReact],
  );

  const playMove = useCallback(
    async (from: number, to: number) => {
      const run = runRef.current;
      setBusy(true);
      setSelected(null);

      const result: Move | null = resolveMove(board, from, to, rngRef.current, {
        generousAt,
        cascadeBias,
      });

      // An illegal swap leans the two shapes into each other and lets them
      // settle. Crucially the board is never changed, so there is no swap to
      // undo and the springy grid transition is never interrupted halfway
      // through its overshoot — that reversal is what used to shove the
      // surrounding row.
      if (!result) {
        rejectEffect();
        pandaReact('grumpy', MoodPriority.event, 640);

        const horizontal = colOf(from) !== colOf(to);
        const direction = horizontal
          ? Math.sign(colOf(to) - colOf(from))
          : Math.sign(rowOf(to) - rowOf(from));
        const lean = cellSize() * REJECT_LEAN * direction;

        // Inherit the offset the drag already built and just hold it: the shape
        // is seen to push, refuse, and slide back in one continuous motion. A
        // tap-then-tap swap has no offset to inherit, so it leans from rest.
        setNudge((current) =>
          current
            ? { ...current, kind: 'reject' }
            : {
                from,
                to,
                dx: horizontal ? lean : 0,
                dy: horizontal ? 0 : lean,
                pushedX: horizontal ? lean : 0,
                pushedY: horizontal ? 0 : lean,
                kind: 'reject',
              },
        );
        await wait(REJECT_HOLD_MS);
        if (runRef.current !== run) return;

        settleNudge();
        await wait(REJECT_SETTLE_MS + 60);
        if (runRef.current !== run) return;

        setBusy(false);
        return;
      }

      const swapped: Board = [...board];
      swapped[from] = board[to];
      swapped[to] = board[from];

      swapEffect();
      // Cleared together with the board change: the shape is already part-way
      // to its new cell, so dropping the offset as the grid updates lets it
      // finish the journey instead of springing back first.
      setNudge(null);
      setBoard(swapped);
      await wait(SWAP_MS);
      if (runRef.current !== run) return;

      setMoves((current) => Math.max(0, current - 1));
      pandaSettle('idle');

      const madeSpecial = result.steps.some((step) => step.clear.created.length > 0);
      setDryStreak((current) => (madeSpecial ? 0 : current + 1));

      // A special-on-special swap is the whole event, so it is crowned up
      // front; a long chain earns its celebration only once it has played out.
      const comboTitle = result.combo === 'none' ? null : COMBO_TITLES[result.combo];
      if (comboTitle) {
        const superCombo = SUPER_COMBOS.has(result.combo) || result.cascade >= SUPER_CASCADE;
        showBanner(comboTitle, 'Special combo', superCombo ? 'super' : 'combo');
        const finaleMs = finaleEffect(
          effectsRef.current,
          Math.max(3, result.cascade),
          sizeRef.current,
          { superCombo },
        );
        // The fanfare lands after the finale, so the celebration is held
        // across both rather than dropping out between them.
        pandaReact(
          superCombo ? 'love' : 'excited',
          MoodPriority.finale,
          finaleMs + (superCombo ? FANFARE_MS : 260),
        );
        if (superCombo) playFanfareAfter(finaleMs, run);
      }

      let previous = swapped;
      for (const step of result.steps) {
        await playStep(step, previous, run);
        if (runRef.current !== run) return;
        previous = step.fall.board;
      }

      // Let the counter play its exit rather than vanishing with the last step.
      setCombo((current) => (current ? { ...current, exiting: true } : null));
      window.setTimeout(() => setCombo(null), 420);

      if (!comboTitle && result.cascade >= 3) {
        const title = CASCADE_TITLES[Math.min(CASCADE_TITLES.length - 1, result.cascade - 3)];
        const superCascade = result.cascade >= SUPER_CASCADE;
        showBanner(title, `${result.cascade}x cascade`, superCascade ? 'super' : 'cascade');
        const finaleMs = finaleEffect(effectsRef.current, result.cascade, sizeRef.current, {
          superCombo: superCascade,
        });
        pandaReact(
          superCascade ? 'love' : 'excited',
          MoodPriority.finale,
          finaleMs + (superCascade ? FANFARE_MS : 260),
        );
        if (superCascade) playFanfareAfter(finaleMs, run);
        await wait(320);
      }

      // A board with no legal swap left would soft-lock the game.
      if (!hasValidMove(previous)) {
        showBanner('No moves left', 'Reshuffling the board', 'info');
        shuffleEffect();
        await wait(360);
        if (runRef.current !== run) return;
        setBoard(shuffleBoard(previous, rngRef.current));
        await wait(FALL_MS);
      }

      if (runRef.current === run) setBusy(false);
    },
    [
      board,
      playStep,
      settleNudge,
      generousAt,
      cascadeBias,
      showBanner,
      playFanfareAfter,
      pandaReact,
      pandaSettle,
    ],
  );

  /**
   * After a few idle seconds, point at the best swap the board has.
   *
   * Reading a match-3 grid is a learned skill, and a player who cannot find a
   * move learns nothing from staring at one. `findBestMove` costs a fraction of
   * a millisecond, so this can simply run whenever the board settles.
   */
  useEffect(() => {
    if (busy || moves === 0) {
      setHint(null);
      return;
    }
    const timer = window.setTimeout(() => {
      const best = findBestMove(board, { generousAt });
      if (best) setHint({ from: best.from, to: best.to });
      // These are resting moods, not reactions: the player is thinking, and a
      // face that snapped back to neutral after a second would just twitch.
      pandaSettle('curious');
    }, HINT_AFTER_MS);
    const doze = window.setTimeout(() => pandaSettle('sleepy'), DOZE_AFTER_MS);

    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(doze);
    };
  }, [board, busy, moves, generousAt, pandaSettle]);

  // ------------------------------------------------------------- input --

  const cellAt = useCallback((clientX: number, clientY: number): number | null => {
    const element = boardRef.current;
    if (!element) return null;
    const rect = element.getBoundingClientRect();
    const col = Math.floor(((clientX - rect.left) / rect.width) * COLS);
    const row = Math.floor(((clientY - rect.top) / rect.height) * ROWS);
    if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return null;
    return idx(col, row);
  }, []);

  /**
   * Cell size straight from layout rather than the cached board size — the
   * gesture's commit distance is measured in cells, so it must never be able
   * to inherit a stale measurement.
   */
  const cellSize = useCallback(() => {
    const element = boardRef.current;
    return element ? element.getBoundingClientRect().width / COLS : 0;
  }, []);

  /** The cell one step from `from` in a direction, or null at the board edge. */
  const neighbour = useCallback((from: number, stepCol: number, stepRow: number) => {
    const col = colOf(from) + stepCol;
    const row = rowOf(from) + stepRow;
    if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return null;
    return idx(col, row);
  }, []);

  const canPlay = !busy && moves > 0;

  const endDrag = useCallback(() => {
    const drag = dragRef.current;
    dragRef.current = null;
    // A committed gesture has handed its offset to `playMove`, which owns it
    // from there. Only an abandoned drag settles itself.
    if (drag && !drag.done) settleNudge();
  }, [settleNudge]);

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    // The AudioContext can only start inside a gesture, so unlock on any touch.
    gameAudio.unlock();
    setHint(null);
    if (!canPlay) return;

    const index = cellAt(event.clientX, event.clientY);
    if (index === null) return;

    // Stops the browser from starting its own drag or text selection on top of
    // the gesture — that is what turns a shape grab into a smeared highlight.
    event.preventDefault();

    // Capture keeps a drag alive when the finger leaves the board, but it
    // throws on a pointer id the browser no longer considers active. That must
    // not take the move down with it.
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Non-fatal: without capture the drag simply ends at the board edge.
    }

    if (selected !== null && areAdjacent(selected, index)) {
      endDrag();
      void playMove(selected, index);
      return;
    }

    dragRef.current = { from: index, originX: event.clientX, originY: event.clientY, done: false };
    setSelected(index);
    selectEffect();
    pandaReact('curious', MoodPriority.nudge, 900);
  }

  /**
   * A gesture pushes one shape against one neighbour.
   *
   * The direction comes from the drag *vector* measured against where the
   * finger went down — never from whichever cell the pointer happens to be
   * over. That distinction is what keeps a long swipe to a single swap instead
   * of letting the shape walk along the row under the cursor.
   */
  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.done) return;

    // A mouse that is no longer held must not keep driving the board. Without
    // this, one missed pointerup leaves the gesture armed and plain hovering
    // starts swapping shapes.
    if (event.pointerType === 'mouse' && event.buttons === 0) {
      endDrag();
      return;
    }
    if (!canPlay) return;

    const cell = cellSize();
    if (cell <= 0) return;

    const dx = event.clientX - drag.originX;
    const dy = event.clientY - drag.originY;

    // Lock to the dominant axis: a diagonal drag is still one swap, not two.
    const horizontal = Math.abs(dx) >= Math.abs(dy);
    const travel = horizontal ? dx : dy;
    const direction = Math.sign(travel);
    if (direction === 0) return;

    const target = neighbour(drag.from, horizontal ? direction : 0, horizontal ? 0 : direction);
    if (target === null) return;

    const distance = Math.abs(travel);
    const offset = Math.min(distance, cell * MAX_NUDGE) * direction;
    setNudge({
      from: drag.from,
      to: target,
      dx: horizontal ? offset : 0,
      dy: horizontal ? 0 : offset,
      pushedX: horizontal ? offset : 0,
      pushedY: horizontal ? 0 : offset,
      kind: 'drag',
    });

    if (distance >= cell * COMMIT_AT) {
      // The offset stays exactly where the player put it; `playMove` decides
      // whether it carries on into the swap or slides back.
      drag.done = true;
      void playMove(drag.from, target);
    }
  }

  function onPointerUp() {
    // A gesture that never reached the commit distance stays a tap, so the
    // shape remains selected and tap-then-tap still works.
    endDrag();
  }

  function restart() {
    runRef.current++;
    dragRef.current = null;
    nudgeGenRef.current++;
    setNudge(null);
    resetHaptics();
    clearShake();
    effectsRef.current.field?.clear();
    rngRef.current = createRng((Date.now() ^ (Math.random() * 1e9)) >>> 0);
    setBoard(createBoard(rngRef.current));
    setClearing(new Set());
    setSelected(null);
    setScore(0);
    setMoves(STARTING_MOVES);
    setBanner(null);
    setHint(null);
    setDryStreak(0);
    setCombo(null);
    endedRef.current = false;
    setBusy(false);
    pandaReset('idle');
    pandaReact('wave', MoodPriority.finale, 1400);
  }

  const over = moves === 0 && !busy;

  // Fires on the transition into "out of moves", and re-arms on restart.
  useEffect(() => {
    if (!over) {
      endedRef.current = false;
      return;
    }
    if (endedRef.current) return;
    endedRef.current = true;
    gameOverEffect(effectsRef.current, sizeRef.current);
    pandaSettle('sad');
  }, [over, pandaSettle]);

  return (
    <>
      <div className="shape-hud">
        <Counter value={score} label="Score" tone="score" />
        <Counter value={moves} label="Moves" tone="moves" align="right" warn={moves <= 5} />
      </div>

      <div
        ref={boardRef}
        className="shape-board"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        role="application"
        aria-label="Shape board"
      >
        {board.map((tile, index) => {
          if (!tile) return null;

          // The grabbed shape follows the finger; the one it is pushing against
          // slides the opposite way by the same amount.
          const pushed = nudge?.from === index;
          const displaced = nudge?.to === index;
          const dx = pushed ? nudge.dx : displaced ? -nudge.dx : 0;
          const dy = pushed ? nudge.dy : displaced ? -nudge.dy : 0;
          const dragging = nudge?.kind === 'drag';
          const hinted = hint !== null && (hint.from === index || hint.to === index);

          return (
            <Tile
              key={tile.id}
              tile={tile}
              index={index}
              clearing={clearing.has(tile.id)}
              selected={selected === index}
              hinted={hinted}
              grabbed={pushed && dragging}
              displaced={displaced && dragging}
              rejecting={(pushed || displaced) && !dragging}
              settleMs={nudge?.settleMs}
              dx={dx}
              dy={dy}
            />
          );
        })}

        {combo && combo.level >= 2 && (
          <div
            // Keyed on the level so each tick remounts and replays the pop.
            key={combo.level}
            className={`shape-combo${combo.exiting ? ' shape-combo--out' : ''}`}
            style={{ '--heat': `${Math.min(1, (combo.level - 2) / 6)}` } as CSSProperties}
            aria-live="polite"
          >
            <span className="shape-combo__value">&times;{combo.level}</span>
            <span className="shape-combo__label">combo</span>
          </div>
        )}

        {banner && (
          <div className={`shape-banner shape-banner--${banner.kind}`} key={banner.id}>
            {banner.kind === 'super' && <span className="shape-banner__wave" aria-hidden="true" />}
            <span className="shape-banner__title">{banner.title}</span>
            <span className="shape-banner__detail">{banner.detail}</span>
          </div>
        )}

        {over && (
          <div className="shape-over">
            <span className="shape-over__title">Out of moves</span>
            <span className="shape-over__score">{score.toLocaleString()} points</span>
            <button type="button" className="btn" onClick={restart}>
              Play again
            </button>
          </div>
        )}
      </div>

      <Suspense fallback={<div className="panda" />}>
        <Panda mood={pandaMood} onPoke={pokeEffect} />
      </Suspense>

      {shell && createPortal(<canvas ref={canvasRef} className="shape-particles" />, shell)}

      {/*
        Kept only where it explains something the player would otherwise find
        baffling: on a device with no Vibration API a haptics demo appears to do
        nothing, so it says why. Everywhere else the game speaks for itself.
      */}
      {!hapticsAvailable() && (
        <p className="hint shape-footnote">
          This browser has no Vibration API, so the haptics are playing as sound instead. Open it on
          an Android phone to feel them.
        </p>
      )}
    </>
  );
}
