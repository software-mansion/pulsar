/**
 * Match-3 board rules, kept as pure functions so the React layer never has
 * to reason about matching — it only plays back the steps this module returns.
 *
 * A move is resolved *up front*: `resolveMove` walks every cascade to
 * completion and hands back an ordered list of `CascadeStep`s. The screen then
 * animates one step at a time, firing the haptics, audio and particles that
 * each step describes. Keeping resolution and playback apart is what lets the
 * haptic for a cascade know how big the cascade is *before* it starts playing.
 */

export const COLS = 8;
export const ROWS = 8;
export const COLORS = 6;

export type SpecialKind = 'none' | 'stripedH' | 'stripedV' | 'wrapped' | 'bomb';

export type Tile = {
  /** Stable across gravity so React can key on it and CSS can animate the fall. */
  id: number;
  /** Index into the palette. A `bomb` matches every colour, so its own is unused. */
  color: number;
  special: SpecialKind;
};

/** Row-major, `null` only ever appears mid-resolution (between clear and gravity). */
export type Board = (Tile | null)[];

export type Rng = () => number;

export const idx = (col: number, row: number) => row * COLS + col;
export const colOf = (i: number) => i % COLS;
export const rowOf = (i: number) => Math.floor(i / COLS);
const inBounds = (col: number, row: number) => col >= 0 && col < COLS && row >= 0 && row < ROWS;

/** Deterministic PRNG — a fixed seed makes a board reproducible for debugging. */
export function createRng(seed: number): Rng {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

let nextId = 1;
const makeTile = (color: number, special: SpecialKind = 'none'): Tile => ({
  id: nextId++,
  color,
  special,
});

/** A bomb is colourless, so it must never take part in a colour run. */
const matchable = (tile: Tile | null): tile is Tile => tile !== null && tile.special !== 'bomb';

// ------------------------------------------------------------------ runs --

type Axis = 'h' | 'v';
type Run = { indices: number[]; axis: Axis };

function findRuns(board: Board): Run[] {
  const runs: Run[] = [];

  const scan = (axis: Axis, outer: number, inner: number, at: (a: number, b: number) => number) => {
    for (let a = 0; a < outer; a++) {
      let start = 0;
      while (start < inner) {
        const first = board[at(a, start)];
        let end = start + 1;
        if (matchable(first)) {
          while (end < inner) {
            const next = board[at(a, end)];
            if (!matchable(next) || next.color !== first.color) break;
            end++;
          }
        }
        if (matchable(first) && end - start >= 3) {
          const indices: number[] = [];
          for (let b = start; b < end; b++) indices.push(at(a, b));
          runs.push({ indices, axis });
        }
        start = end;
      }
    }
  };

  scan('h', ROWS, COLS, (row, col) => idx(col, row));
  scan('v', COLS, ROWS, (col, row) => idx(col, row));
  return runs;
}

export type MatchGroup = {
  indices: number[];
  color: number;
  /** Longest single line inside the group — 4 earns a stripe, 5+ a colour bomb. */
  longest: number;
  /** An L or T shape (a horizontal and a vertical run crossing) earns a wrap. */
  crossed: boolean;
};

/** Merges runs that share a cell, so an L-shape counts as one match, not two. */
function groupRuns(board: Board, runs: Run[]): MatchGroup[] {
  const groups: { runs: Run[]; cells: Set<number> }[] = [];

  for (const run of runs) {
    const touching = groups.filter((group) => run.indices.some((i) => group.cells.has(i)));
    if (touching.length === 0) {
      groups.push({ runs: [run], cells: new Set(run.indices) });
      continue;
    }
    const [target, ...rest] = touching;
    target.runs.push(run);
    run.indices.forEach((i) => target.cells.add(i));
    for (const other of rest) {
      target.runs.push(...other.runs);
      other.cells.forEach((i) => target.cells.add(i));
      groups.splice(groups.indexOf(other), 1);
    }
  }

  return groups.map((group) => {
    const first = board[group.runs[0].indices[0]]!;
    return {
      indices: [...group.cells],
      color: first.color,
      longest: Math.max(...group.runs.map((run) => run.indices.length)),
      crossed:
        group.runs.some((run) => run.axis === 'h') && group.runs.some((run) => run.axis === 'v'),
    };
  });
}

export function findMatches(board: Board): MatchGroup[] {
  return groupRuns(board, findRuns(board));
}

const NEIGHBOURS: readonly (readonly [number, number])[] = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

/**
 * Grows a match to every same-coloured candy orthogonally connected to it.
 *
 * A line of three is only ever the *trigger*: the whole touching blob of that
 * colour goes with it, so an L with a stray tail, or a clump hanging off the
 * end of a run, clears as one satisfying lump instead of leaving orphans that
 * were visibly part of the same shape.
 *
 * Only the cleared set grows — the run metrics that decide which special is
 * earned stay measured on the straight lines, so a sprawling blob cannot
 * accidentally mint a colour bomb.
 */
export function sweepConnected(board: Board, seeds: number[], color: number): number[] {
  const found = new Set<number>(seeds);
  const queue = [...seeds];

  while (queue.length > 0) {
    const index = queue.shift()!;
    const col = colOf(index);
    const row = rowOf(index);

    for (const [stepCol, stepRow] of NEIGHBOURS) {
      const nextCol = col + stepCol;
      const nextRow = row + stepRow;
      if (!inBounds(nextCol, nextRow)) continue;

      const next = idx(nextCol, nextRow);
      if (found.has(next)) continue;

      const tile = board[next];
      if (!matchable(tile) || tile.color !== color) continue;

      found.add(next);
      queue.push(next);
    }
  }

  return [...found];
}

/** A stripe sweeps along the axis the run itself lay on. */
function stripeAxis(group: MatchGroup): 'stripedH' | 'stripedV' {
  return new Set(group.indices.map(rowOf)).size === 1 ? 'stripedH' : 'stripedV';
}

/** Which special a group earns. Crossed shapes beat length. */
export function rewardFor(group: MatchGroup): SpecialKind {
  if (group.longest >= 5) return 'bomb';
  if (group.crossed) return 'wrapped';
  if (group.longest === 4) return stripeAxis(group);
  return 'none';
}

export type MoveOptions = {
  /**
   * When set, a swept blob of at least this many candies earns a striped candy
   * even though its longest straight run was only three.
   *
   * This is the game's generosity dial. Specials are what make a board feel
   * alive, but the honest rules produce roughly one every nine moves — far too
   * sparse for someone still learning to read the board. The screen turns this
   * on for the opening moves and again whenever a player has gone a while
   * without one, so line blasts stay a regular event instead of a rarity.
   */
  generousAt?: number;

  /**
   * Chance, per refilled candy, of copying a neighbour's colour instead of
   * rolling a fresh one.
   *
   * A uniformly random refill is the reason chain reactions feel rare: every
   * new candy is independent, so a follow-on match is pure luck. Nudging
   * refills to clump makes cascades a regular event without touching the
   * matching rules, and because it only ever affects candies falling in from
   * off-screen, the player can never tell it happened.
   */
  cascadeBias?: number;
};

/**
 * A hard ceiling on chain length.
 *
 * `cascadeBias` makes each refill more likely to match, which in principle can
 * keep a board resolving for a very long time. This bounds the worst case so a
 * single swap can never lock the screen up mid-animation.
 */
const MAX_CASCADE = 14;

// ------------------------------------------------------- special blasts --

/** One special going off. The screen turns each of these into its own effect. */
export type Blast = { kind: Exclude<SpecialKind, 'none'>; index: number; color: number };

const rowIndices = (row: number) => Array.from({ length: COLS }, (_, col) => idx(col, row));
const colIndices = (col: number) => Array.from({ length: ROWS }, (_, row) => idx(col, row));

function areaIndices(center: number, radius: number): number[] {
  const out: number[] = [];
  const c = colOf(center);
  const r = rowOf(center);
  for (let dc = -radius; dc <= radius; dc++) {
    for (let dr = -radius; dr <= radius; dr++) {
      if (inBounds(c + dc, r + dr)) out.push(idx(c + dc, r + dr));
    }
  }
  return out;
}

function blastRadius(board: Board, index: number, kind: Exclude<SpecialKind, 'none'>): number[] {
  switch (kind) {
    case 'stripedH':
      return rowIndices(rowOf(index));
    case 'stripedV':
      return colIndices(colOf(index));
    case 'wrapped':
      return areaIndices(index, 1);
    case 'bomb': {
      // A bomb detonated by the cascade (rather than swapped) takes the colour
      // it is sitting next to; on its own it just clears its immediate area.
      const tile = board[index];
      return tile ? areaIndices(index, 1) : [];
    }
  }
}

/**
 * Grows a set of doomed cells until no special inside it is left unfired —
 * this is what makes one striped candy set off the wrapped candy it hits, and
 * that one set off the next. Returns the blasts in detonation order so the
 * screen can stagger their particles and haptics.
 */
function detonate(board: Board, seeds: Iterable<number>, forced: Blast[] = []) {
  const cleared = new Set<number>(seeds);
  const blasts: Blast[] = [];
  const fired = new Set<number>();
  const queue: number[] = [...cleared];

  for (const blast of forced) {
    fired.add(blast.index);
    blasts.push(blast);
    for (const i of blastRadius(board, blast.index, blast.kind)) {
      if (!cleared.has(i)) {
        cleared.add(i);
        queue.push(i);
      }
    }
  }

  while (queue.length > 0) {
    const index = queue.shift()!;
    const tile = board[index];
    if (!tile || tile.special === 'none' || fired.has(index)) continue;

    fired.add(index);
    blasts.push({ kind: tile.special, index, color: tile.color });
    for (const i of blastRadius(board, index, tile.special)) {
      if (!cleared.has(i)) {
        cleared.add(i);
        queue.push(i);
      }
    }
  }

  return { cleared, blasts };
}

/** Every cell holding a given colour — the colour bomb's payload. */
function indicesOfColor(board: Board, color: number): number[] {
  const out: number[] = [];
  board.forEach((tile, i) => {
    if (tile && tile.special !== 'bomb' && tile.color === color) out.push(i);
  });
  return out;
}

// ---------------------------------------------------------------- steps --

export type ClearPhase = {
  /** 1 for the swap itself, 2+ for each cascade it sets off. */
  cascade: number;
  cleared: number[];
  blasts: Blast[];
  created: {
    index: number;
    special: Exclude<SpecialKind, 'none'>;
    color: number;
    /** Granted by the generosity rule rather than earned by a run. */
    bonus: boolean;
  }[];
  /** Size of each colour match, largest first — drives the match haptic. */
  groupSizes: number[];
  points: number;
};

export type FallPhase = {
  board: Board;
  /** How many tiles actually moved — the drop haptic scales with this. */
  moved: number;
  /** Longest fall in cells, so the animation and its haptic can last longer. */
  distance: number;
};

export type CascadeStep = { clear: ClearPhase; boardAfterClear: Board; fall: FallPhase };

export type MoveResult = {
  steps: CascadeStep[];
  board: Board;
  points: number;
  /** Deepest cascade reached — 1 is a plain match, 4+ is worth celebrating. */
  cascade: number;
};

const POINTS_PER_TILE = 60;
/** Each extra cascade level is worth half again as much as the last. */
const cascadeMultiplier = (level: number) => 1 + (level - 1) * 0.5;

/**
 * Colour for a candy falling in from off-screen. See `cascadeBias`: most of the
 * time this is a fresh roll, but some of the time it copies a settled
 * neighbour so the incoming candies arrive already clumped.
 */
function refillColor(board: Board, col: number, row: number, rng: Rng, bias: number): number {
  if (bias > 0 && rng() < bias) {
    const below = row + 1 < ROWS ? board[idx(col, row + 1)] : null;
    const left = col > 0 ? board[idx(col - 1, row)] : null;
    // Specials are excluded: copying a colour bomb's nominal colour would be
    // meaningless, and copying a stripe's would quietly seed more of them.
    const source = [below, left].find((tile) => tile && tile.special === 'none');
    if (source) return source.color;
  }
  return Math.floor(rng() * COLORS);
}

function applyGravity(board: Board, rng: Rng, bias = 0): FallPhase {
  const next: Board = [...board];
  let moved = 0;
  let distance = 0;

  for (let col = 0; col < COLS; col++) {
    let write = ROWS - 1;
    for (let row = ROWS - 1; row >= 0; row--) {
      const tile = next[idx(col, row)];
      if (!tile) continue;
      if (write !== row) {
        next[idx(col, write)] = tile;
        next[idx(col, row)] = null;
        moved++;
        distance = Math.max(distance, write - row);
      }
      write--;
    }
    // Everything above `write` is empty and refills from off the top. Filled
    // bottom-up so `refillColor` can see the candy that landed below it.
    for (let row = write; row >= 0; row--) {
      next[idx(col, row)] = makeTile(refillColor(next, col, row, rng, bias));
      moved++;
      distance = Math.max(distance, row + 1);
    }
  }

  return { board: next, moved, distance };
}

/**
 * Runs the board to a standstill: match, blow up whatever the match touched,
 * drop, refill, repeat. `forced` carries the blast a special-on-special swap
 * produces, which fires before any colour matching happens.
 */
function settle(
  board: Board,
  rng: Rng,
  forced: Blast[],
  seeds: number[] = [],
  options: MoveOptions = {},
): MoveResult {
  const steps: CascadeStep[] = [];
  let working = board;
  let points = 0;
  let cascade = 0;
  let pendingForced = forced;
  let pendingSeeds = seeds;

  for (;;) {
    const groups = pendingForced.length > 0 || pendingSeeds.length > 0 ? [] : findMatches(working);
    if (groups.length === 0 && pendingForced.length === 0 && pendingSeeds.length === 0) break;

    cascade++;
    const multiplier = cascadeMultiplier(cascade);

    // Specials are placed after the clear, at the cell that earned them.
    const created: ClearPhase['created'] = [];
    const seedSet = new Set<number>(pendingSeeds);
    const sweptSizes: number[] = [];
    for (const group of groups) {
      const swept = sweepConnected(working, group.indices, group.color);
      swept.forEach((i) => seedSet.add(i));
      sweptSizes.push(swept.length);

      // Measured on the runs, not the swept blob — see `sweepConnected`.
      let reward = rewardFor(group);
      let bonus = false;
      if (
        reward === 'none' &&
        options.generousAt !== undefined &&
        swept.length >= options.generousAt
      ) {
        reward = stripeAxis(group);
        bonus = true;
      }
      if (reward !== 'none') {
        created.push({ index: pickRewardCell(group), special: reward, color: group.color, bonus });
      }
    }

    const { cleared, blasts } = detonate(working, seedSet, pendingForced);
    pendingForced = [];
    pendingSeeds = [];

    // A cell that earned a special keeps it instead of being emptied.
    const survivors = new Map(created.map((entry) => [entry.index, entry]));
    const afterClear: Board = working.map((tile, i) => {
      const reward = survivors.get(i);
      if (reward) return makeTile(reward.color, reward.special);
      return cleared.has(i) ? null : tile;
    });

    const groupSizes = sweptSizes.sort((a, b) => b - a);
    const stepPoints = Math.round(cleared.size * POINTS_PER_TILE * multiplier);
    points += stepPoints;

    const fall = applyGravity(afterClear, rng, options.cascadeBias ?? 0);
    steps.push({
      clear: {
        cascade,
        cleared: [...cleared],
        blasts,
        created,
        groupSizes,
        points: stepPoints,
      },
      boardAfterClear: afterClear,
      fall,
    });

    working = fall.board;
    if (cascade >= MAX_CASCADE) break;
  }

  return { steps, board: working, points, cascade };
}

/** Where a special lands: the crossing of an L, otherwise the middle of the run. */
function pickRewardCell(group: MatchGroup): number {
  if (group.crossed) {
    const counts = new Map<number, number>();
    for (const i of group.indices) {
      const sameRow = group.indices.filter((j) => rowOf(j) === rowOf(i)).length;
      const sameCol = group.indices.filter((j) => colOf(j) === colOf(i)).length;
      counts.set(i, sameRow + sameCol);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
  }
  return group.indices[Math.floor(group.indices.length / 2)];
}

// ----------------------------------------------------------------- moves --

export const areAdjacent = (a: number, b: number) =>
  Math.abs(colOf(a) - colOf(b)) + Math.abs(rowOf(a) - rowOf(b)) === 1;

/** How two swapped specials combine — named so the UI can pick a matching effect. */
export type ComboKind =
  | 'none'
  | 'bombColor'
  | 'bombBomb'
  | 'bombStriped'
  | 'stripedStriped'
  | 'stripedWrapped'
  | 'wrappedWrapped';

export type Move = MoveResult & { combo: ComboKind };

/**
 * Attempts a swap. Returns `null` when the swap is illegal — the screen plays
 * its "reject" haptic and springs the tiles back.
 */
export function resolveMove(
  board: Board,
  a: number,
  b: number,
  rng: Rng,
  options: MoveOptions = {},
): Move | null {
  if (!areAdjacent(a, b)) return null;
  const first = board[a];
  const second = board[b];
  if (!first || !second) return null;

  const swapped: Board = [...board];
  swapped[a] = second;
  swapped[b] = first;

  const combo = comboOf(first, second);
  if (combo !== 'none') {
    const { forced, seeds } = comboPayload(swapped, a, b, first, second, combo);
    return { ...settle(swapped, rng, forced, seeds, options), combo };
  }

  // A plain swap only stands if it actually makes a match.
  if (findMatches(swapped).length === 0) return null;
  return { ...settle(swapped, rng, [], [], options), combo: 'none' };
}

function comboOf(first: Tile, second: Tile): ComboKind {
  const kinds = [first.special, second.special];
  const has = (kind: SpecialKind) => kinds.includes(kind);
  const striped = kinds.filter((k) => k === 'stripedH' || k === 'stripedV').length;

  if (first.special === 'bomb' && second.special === 'bomb') return 'bombBomb';
  if (has('bomb') && striped === 1) return 'bombStriped';
  if (has('bomb') && has('wrapped')) return 'bombStriped';
  if (has('bomb')) return 'bombColor';
  if (striped === 2) return 'stripedStriped';
  if (striped === 1 && has('wrapped')) return 'stripedWrapped';
  if (first.special === 'wrapped' && second.special === 'wrapped') return 'wrappedWrapped';
  return 'none';
}

/** Turns a special-on-special swap into the blasts it should set off. */
function comboPayload(
  board: Board,
  a: number,
  b: number,
  first: Tile,
  second: Tile,
  combo: ComboKind,
): { forced: Blast[]; seeds: number[] } {
  // After the swap, `first` sits at b and `second` at a.
  const bombAt = first.special === 'bomb' ? b : a;
  const otherAt = bombAt === b ? a : b;
  const other = bombAt === b ? second : first;

  switch (combo) {
    case 'bombBomb':
      // Both bombs go: the whole board clears.
      return { forced: [], seeds: board.map((_, i) => i) };

    case 'bombColor':
      return { forced: [], seeds: [bombAt, ...indicesOfColor(board, other.color)] };

    case 'bombStriped': {
      // Every candy of the partner's colour becomes a special and fires at once.
      const targets = indicesOfColor(board, other.color);
      const kind = other.special === 'wrapped' ? 'wrapped' : 'stripedH';
      return {
        forced: targets.map((index) => ({ kind, index, color: other.color })),
        seeds: [bombAt, otherAt],
      };
    }

    case 'stripedStriped':
      // A cross: the full row and the full column through the swap.
      return {
        forced: [
          { kind: 'stripedH', index: a, color: first.color },
          { kind: 'stripedV', index: a, color: first.color },
        ],
        seeds: [a, b],
      };

    case 'stripedWrapped': {
      // A three-wide band sweeping both ways.
      const forced: Blast[] = [];
      for (let d = -1; d <= 1; d++) {
        const row = rowOf(a) + d;
        const col = colOf(a) + d;
        if (row >= 0 && row < ROWS)
          forced.push({ kind: 'stripedH', index: idx(colOf(a), row), color: first.color });
        if (col >= 0 && col < COLS)
          forced.push({ kind: 'stripedV', index: idx(col, rowOf(a)), color: first.color });
      }
      return { forced, seeds: [a, b] };
    }

    case 'wrappedWrapped':
      return {
        forced: [{ kind: 'wrapped', index: a, color: first.color }],
        seeds: areaIndices(a, 2),
      };

    default:
      return { forced: [], seeds: [] };
  }
}

// ----------------------------------------------------------------- setup --

/** True when at least one legal swap exists, so the player is never stuck. */
export function hasValidMove(board: Board): boolean {
  for (let i = 0; i < board.length; i++) {
    const tile = board[i];
    if (tile && tile.special !== 'none') return true;
    for (const j of [i + 1, i + COLS]) {
      if (j >= board.length || !areAdjacent(i, j)) continue;
      const trial: Board = [...board];
      trial[i] = board[j];
      trial[j] = board[i];
      if (findMatches(trial).length > 0) return true;
    }
  }
  return false;
}

export type MoveHint = { from: number; to: number; score: number };

/**
 * The most rewarding legal swap on the board, used to nudge a stuck player.
 *
 * Scored on the immediate result only — matches, swept size, whether a special
 * is earned — rather than by simulating the whole cascade. A hint is checked
 * against every adjacent pair on the board, so it has to be cheap; and pointing
 * at a move that pays off *visibly* teaches more than pointing at one that
 * happens to trigger a long chain the player cannot see coming.
 */
export function findBestMove(board: Board, options: MoveOptions = {}): MoveHint | null {
  let best: MoveHint | null = null;

  const consider = (from: number, to: number) => {
    const first = board[from];
    const second = board[to];
    if (!first || !second) return;

    const swapped: Board = [...board];
    swapped[from] = second;
    swapped[to] = first;

    // A special-on-special swap is always the most interesting thing available.
    if (first.special !== 'none' && second.special !== 'none') {
      const score = 1000;
      if (!best || score > best.score) best = { from, to, score };
      return;
    }

    const groups = findMatches(swapped);
    if (groups.length === 0) return;

    let score = 0;
    for (const group of groups) {
      const swept = sweepConnected(swapped, group.indices, group.color).length;
      score += swept;
      if (rewardFor(group) !== 'none') score += 12;
      else if (options.generousAt !== undefined && swept >= options.generousAt) score += 8;
    }

    if (!best || score > best.score) best = { from, to, score };
  };

  for (let i = 0; i < board.length; i++) {
    if (colOf(i) < COLS - 1) consider(i, i + 1);
    if (rowOf(i) < ROWS - 1) consider(i, i + COLS);
  }

  return best;
}

export function createBoard(rng: Rng): Board {
  for (let attempt = 0; attempt < 200; attempt++) {
    const board: Board = new Array(COLS * ROWS).fill(null);
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        // Reject a colour that would complete a line, so the board opens quiet.
        const banned = new Set<number>();
        const left = board[idx(col - 1, row)];
        const left2 = board[idx(col - 2, row)];
        if (col >= 2 && left && left2 && left.color === left2.color) banned.add(left.color);
        const up = board[idx(col, row - 1)];
        const up2 = board[idx(col, row - 2)];
        if (row >= 2 && up && up2 && up.color === up2.color) banned.add(up.color);

        const choices = Array.from({ length: COLORS }, (_, c) => c).filter((c) => !banned.has(c));
        board[idx(col, row)] = makeTile(choices[Math.floor(rng() * choices.length)]);
      }
    }
    if (hasValidMove(board)) return board;
  }
  throw new Error('Could not generate a solvable board');
}

/** Reshuffles the colours in place when the player runs out of legal swaps. */
export function shuffleBoard(board: Board, rng: Rng): Board {
  for (let attempt = 0; attempt < 200; attempt++) {
    const tiles = board.filter((tile): tile is Tile => tile !== null);
    for (let i = tiles.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
    }
    if (findMatches(tiles).length === 0 && hasValidMove(tiles)) return tiles;
  }
  return createBoard(rng);
}
