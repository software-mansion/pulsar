// Safe fake-timer + manual scheduler helper for tests under node:test.
//
// The library uses globalThis.setTimeout / clearTimeout to drive its realtime
// PWM loop. The existing RealtimeComposer tests installed and restored those
// globals by hand and re-implemented a tiny scheduled[] queue five times over.
// That pattern has two latent bugs the helper fixes:
//
//   1. If a test threw before reaching the finally block (e.g. an assertion
//      failed between assigning globalThis.setTimeout and the restoration line),
//      the bogus setTimeout would leak into the rest of the process — including
//      node:test's own timeout machinery, which depends on the real setTimeout.
//      withFakeTimers guarantees restoration before any exception propagates.
//
//   2. The hand-rolled scheduler array was inconsistent across files: some
//      tests tracked clearedHandles, some did not; none tracked vibrate calls
//      or supported a time-based tick(). This helper offers a single, well
//      defined manual-scheduler API.
//
// USAGE
//
//   await withFakeTimers((scheduler) => {
//     composer.set(0.5, 0.5);
//
//     // direct access (matches the existing scheduled[] pattern)
//     assert.equal(scheduler.calls.length, 1);
//     assert.equal(scheduler.calls[0].delay, 240);
//
//     // run the next pending callback regardless of delay
//     scheduler.runNext();
//
//     // OR advance virtual time, firing every callback whose delay
//     // accumulates to <= deltaMs since installation
//     scheduler.tick(500);
//   });
//
// The scheduler also exposes `scheduler.cancelled` — an array of handles that
// were passed to clearTimeout — replacing the ad-hoc `clearedHandles` arrays.

const realSetTimeout = globalThis.setTimeout;
const realClearTimeout = globalThis.clearTimeout;

/**
 * Create a fresh manual scheduler. Exposed for tests that want to construct
 * the scheduler directly without using the withFakeTimers wrapper (rare —
 * prefer withFakeTimers, which also installs globals safely).
 */
export function createManualScheduler() {
  /** @type {Array<{ id: number, callback: () => void, delay: number, scheduledAt: number, cancelled: boolean }>} */
  const calls = [];
  /** @type {Array<{ id: number, callback: () => void, delay: number, scheduledAt: number, cancelled: boolean }>} */
  const cancelled = [];
  let now = 0;
  let nextId = 1;

  function schedule(callback, delay) {
    if (typeof callback !== "function") {
      throw new TypeError("scheduler.schedule(callback, delay): callback must be a function");
    }
    const handle = {
      id: nextId++,
      callback,
      delay: Number(delay) || 0,
      scheduledAt: now,
      cancelled: false,
    };
    calls.push(handle);
    return handle;
  }

  function cancel(handle) {
    if (!handle || typeof handle !== "object") {
      // Real clearTimeout silently ignores garbage; mirror that.
      return;
    }
    // Allow callers to also pass numeric ids if they prefer.
    const target = calls.find((c) => c === handle || c.id === handle);
    if (!target || target.cancelled) {
      return;
    }
    target.cancelled = true;
    cancelled.push(target);
  }

  /**
   * Run the next pending (non-cancelled) callback in insertion order,
   * regardless of its delay. Returns true if a callback ran, false otherwise.
   * Useful when a test only cares about the sequencing of scheduled work,
   * not the absolute timestamps — matches the existing
   * `scheduled[0].callback()` idiom.
   */
  function runNext() {
    for (const handle of calls) {
      if (handle.cancelled) continue;
      if (handle.fired) continue;
      handle.fired = true;
      now = handle.scheduledAt + handle.delay;
      handle.callback();
      return true;
    }
    return false;
  }

  /**
   * Advance virtual time by deltaMs and fire every non-cancelled callback
   * whose deadline (scheduledAt + delay) falls within the new "now" window,
   * in insertion order. Returns the number of callbacks that fired.
   *
   * Callbacks scheduled during a tick are themselves eligible if their
   * deadline still falls within the window, mirroring real timers.
   */
  function tick(deltaMs) {
    const delta = Number(deltaMs);
    if (!Number.isFinite(delta) || delta < 0) {
      throw new RangeError(`scheduler.tick(deltaMs): deltaMs must be a non-negative finite number, got ${deltaMs}`);
    }
    const target = now + delta;
    let fired = 0;
    // Loop until no more callbacks can fire in the window — handles
    // re-entrant scheduling from inside a callback.
    // Bound iterations to avoid runaway tests.
    const HARD_LIMIT = 10_000;
    let iterations = 0;
    while (iterations++ < HARD_LIMIT) {
      const next = calls.find(
        (c) => !c.cancelled && !c.fired && c.scheduledAt + c.delay <= target,
      );
      if (!next) break;
      next.fired = true;
      now = next.scheduledAt + next.delay;
      next.callback();
      fired++;
    }
    if (iterations >= HARD_LIMIT) {
      throw new Error("scheduler.tick: exceeded 10_000 iterations — likely an infinite scheduling loop");
    }
    now = target;
    return fired;
  }

  return {
    /** Array of every scheduled handle in insertion order. Mirrors `scheduled[]`. */
    calls,
    /** Alias for `calls` — matches the legacy `scheduled[]` idiom in older tests. */
    scheduled: calls,
    /** Array of handles passed to clearTimeout. Mirrors `clearedHandles[]`. */
    cancelled,
    /** Alias for `cancelled` — matches the legacy `cleared[]` idiom in older tests. */
    cleared: cancelled,
    /** Current virtual time in ms since helper installation. */
    get now() {
      return now;
    },
    schedule,
    cancel,
    runNext,
    tick,
  };
}

/**
 * Install a manual scheduler as globalThis.setTimeout / clearTimeout for the
 * duration of fn, then restore the real timers — even when fn throws or
 * rejects. The scheduler is passed to fn.
 *
 * fn may be sync or async; the returned promise resolves/rejects with fn's
 * result. Restoration happens synchronously before any rejection propagates.
 */
export async function withFakeTimers(fn) {
  if (typeof fn !== "function") {
    throw new TypeError("withFakeTimers(fn): fn must be a function");
  }
  const scheduler = createManualScheduler();
  const previousSetTimeout = globalThis.setTimeout;
  const previousClearTimeout = globalThis.clearTimeout;

  globalThis.setTimeout = (callback, delay) => scheduler.schedule(callback, delay);
  globalThis.clearTimeout = (handle) => scheduler.cancel(handle);

  try {
    return await fn(scheduler);
  } finally {
    // Restore eagerly: even if a subsequent microtask awaits, node:test's own
    // timeout machinery (built on the real setTimeout we captured at module
    // load) must keep working. We restore to whatever was there when we were
    // called, so nested withFakeTimers also works.
    globalThis.setTimeout = previousSetTimeout;
    globalThis.clearTimeout = previousClearTimeout;
  }
}

/**
 * Escape hatch: synchronously restore the *real* setTimeout/clearTimeout
 * captured at module load time. Useful if a test detects that a previous test
 * leaked fake timers and wants to hard-reset before continuing.
 */
export function restoreRealTimers() {
  globalThis.setTimeout = realSetTimeout;
  globalThis.clearTimeout = realClearTimeout;
}
