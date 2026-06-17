// Helpers for installing, deleting, and restoring globalThis.window inside tests.
//
// Settings.canActuallyVibrate() reads `window` (and `window.matchMedia`) at call
// time to skip vibration on non-touch devices:
//
//   if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
//     return true;
//   }
//   return window.matchMedia("(pointer: coarse)").matches;
//
// Node has no `window` global, so without these helpers every test silently
// exercises only the `window === undefined` branch. These helpers let tests
// install a stub `window` (with or without matchMedia) and restore the previous
// state precisely — including the common case where `window` was never an own
// property of globalThis to begin with.

const WIN = "window";

// Stack of saved states so nested installs don't clobber each other. Each entry
// is one of:
//   { kind: "own", descriptor }   — there was an own property; re-define it.
//   { kind: "absent" }            — there was no own property; delete after.
const stack = [];

function snapshot() {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, WIN);
  if (descriptor) {
    return { kind: "own", descriptor };
  }
  return { kind: "absent" };
}

function applySnapshot(entry) {
  try {
    delete globalThis[WIN];
  } catch {
    // Non-configurable original; overwrite via defineProperty below.
  }

  if (entry.kind === "own") {
    Object.defineProperty(globalThis, WIN, entry.descriptor);
  }
}

/**
 * Replace globalThis.window with a stub. The previous descriptor (or its
 * absence) is pushed onto an internal stack. Call restoreWindow() to undo.
 *
 * @param {object} stub The replacement window value (commonly { matchMedia }).
 */
export function installWindow(stub) {
  stack.push(snapshot());
  Object.defineProperty(globalThis, WIN, {
    configurable: true,
    writable: true,
    value: stub,
  });
}

/**
 * Restore the most recent window state saved by installWindow/deleteWindow.
 * Returns true if a state was restored, false if the stack was empty.
 */
export function restoreWindow() {
  const entry = stack.pop();
  if (!entry) {
    return false;
  }
  applySnapshot(entry);
  return true;
}

/**
 * Remove globalThis.window entirely (so `typeof window === "undefined"`),
 * remembering the previous state so restoreWindow() can put it back.
 */
export function deleteWindow() {
  stack.push(snapshot());
  try {
    delete globalThis[WIN];
  } catch {
    Object.defineProperty(globalThis, WIN, {
      configurable: true,
      writable: true,
      value: undefined,
    });
  }
}

/**
 * Install a window stub, run an (async) function, and ALWAYS restore the
 * previous window state in a finally block — even if fn throws/rejects.
 *
 * @template T
 * @param {object} stub The replacement window value.
 * @param {() => Promise<T> | T} fn
 * @returns {Promise<T>}
 */
export async function withWindow(stub, fn) {
  installWindow(stub);
  try {
    return await fn();
  } finally {
    restoreWindow();
  }
}

/**
 * Remove globalThis.window, run an (async) function, and ALWAYS restore the
 * previous window state in a finally block.
 *
 * @template T
 * @param {() => Promise<T> | T} fn
 * @returns {Promise<T>}
 */
export async function withoutWindow(fn) {
  deleteWindow();
  try {
    return await fn();
  } finally {
    restoreWindow();
  }
}

/**
 * Build a window stub whose matchMedia() records every query string and returns
 * a MediaQueryList-like object with the given `matches` value. The returned
 * `queries` array is the live record of every query string passed to
 * matchMedia, in call order.
 *
 * Pass `matchMedia: null` to build a window WITHOUT a matchMedia function (to
 * exercise the `typeof window.matchMedia !== "function"` fallback branch).
 *
 * @param {{ matches?: boolean, matchMedia?: null }} [options]
 * @returns {{ window: object, queries: string[] }}
 */
export function makeWindow({ matches = true, matchMedia } = {}) {
  const queries = [];

  if (matchMedia === null) {
    return { window: {}, queries };
  }

  const window = {
    matchMedia(query) {
      queries.push(query);
      return { matches, media: query };
    },
  };

  return { window, queries };
}
