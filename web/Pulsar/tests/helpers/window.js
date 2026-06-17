// Install, delete, and restore globalThis.window so tests can exercise
// Settings.canActuallyVibrate(), which reads window.matchMedia at call time.
// Node has no `window`, so without this every test only hits the
// `window === undefined` branch.

const WIN = "window";

// Stack of prior states: { kind: "own", descriptor } or { kind: "absent" }.
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

/** Replace globalThis.window with a stub; restoreWindow() undoes it. */
export function installWindow(stub) {
  stack.push(snapshot());
  Object.defineProperty(globalThis, WIN, {
    configurable: true,
    writable: true,
    value: stub,
  });
}

/** Restore the most recent window state. Returns false if the stack was empty. */
export function restoreWindow() {
  const entry = stack.pop();
  if (!entry) {
    return false;
  }
  applySnapshot(entry);
  return true;
}

/** Remove globalThis.window entirely; restoreWindow() puts it back. */
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

/** Install a window stub, run fn, and always restore in a finally block. */
export async function withWindow(stub, fn) {
  installWindow(stub);
  try {
    return await fn();
  } finally {
    restoreWindow();
  }
}

/** Remove globalThis.window, run fn, and always restore in a finally block. */
export async function withoutWindow(fn) {
  deleteWindow();
  try {
    return await fn();
  } finally {
    restoreWindow();
  }
}

/**
 * Build a window stub whose matchMedia() records queried strings into `queries`
 * and reports the given `matches`. Pass `matchMedia: null` for a window with no
 * matchMedia function.
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
