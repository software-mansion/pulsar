// Helpers for installing, deleting, and restoring globalThis.navigator inside tests.
//
// The Settings module reads navigator at call time via
// `typeof navigator !== "undefined" && typeof navigator.vibrate === "function"`,
// so tests need to override globalThis.navigator and then restore it precisely —
// including the case where the global was never an own property to begin with.

const NAV = "navigator";

// Stack of saved states so nested installs/withNavigator calls don't clobber
// each other. Each entry is one of:
//   { kind: "own", descriptor }   — there was an own property; we'll re-define it.
//   { kind: "absent" }            — there was no own property; we'll delete after.
const stack = [];

function snapshot() {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, NAV);
  if (descriptor) {
    return { kind: "own", descriptor };
  }
  return { kind: "absent" };
}

function applySnapshot(entry) {
  // First, get rid of whatever is currently sitting on the global so the
  // following defineProperty/delete starts from a clean slate.
  try {
    delete globalThis[NAV];
  } catch {
    // If the existing descriptor is non-configurable we can't remove it; the
    // best we can do is overwrite via defineProperty below.
  }

  if (entry.kind === "own") {
    Object.defineProperty(globalThis, NAV, entry.descriptor);
  }
  // else: "absent" — nothing to restore; the delete above already returned us
  // to the state where globalThis has no own `navigator` property.
}

/**
 * Replace globalThis.navigator with a stub. The previous descriptor (or absence
 * thereof) is pushed onto an internal stack. Call restoreNavigator() to undo.
 *
 * @param {object} stub The replacement navigator value (commonly { vibrate }).
 */
export function installNavigator(stub) {
  stack.push(snapshot());
  Object.defineProperty(globalThis, NAV, {
    configurable: true,
    writable: true,
    value: stub,
  });
}

/**
 * Restore the most recent navigator state saved by installNavigator/deleteNavigator.
 * Returns true if a state was restored, false if the stack was empty.
 */
export function restoreNavigator() {
  const entry = stack.pop();
  if (!entry) {
    return false;
  }
  applySnapshot(entry);
  return true;
}

/**
 * Remove globalThis.navigator entirely (so `typeof navigator === "undefined"`),
 * remembering the previous state so restoreNavigator() can put it back.
 *
 * Returns a restore function that, when called, undoes the deletion (equivalent
 * to calling restoreNavigator()). The function is idempotent — calling it more
 * than once is a no-op.
 */
export function deleteNavigator() {
  stack.push(snapshot());
  try {
    delete globalThis[NAV];
  } catch {
    // Fall back to defining an undefined value if delete fails. This still
    // makes typeof === "undefined" false (typeof an undefined value is
    // "undefined"), so it preserves the intended observable behavior in the
    // unlikely event of a non-configurable original.
    Object.defineProperty(globalThis, NAV, {
      configurable: true,
      writable: true,
      value: undefined,
    });
  }

  let restored = false;
  return function restore() {
    if (restored) return;
    restored = true;
    restoreNavigator();
  };
}

/**
 * Install a navigator stub, run an (async) function, and ALWAYS restore the
 * previous navigator state in a finally block — even if fn throws/rejects.
 *
 * @template T
 * @param {object} stub The replacement navigator value.
 * @param {() => Promise<T> | T} fn The function to run with the stub installed.
 * @returns {Promise<T>}
 */
export async function withNavigator(stub, fn) {
  installNavigator(stub);
  try {
    return await fn();
  } finally {
    restoreNavigator();
  }
}

/**
 * Remove globalThis.navigator, run an (async) function, and ALWAYS restore
 * the previous navigator state in a finally block.
 *
 * @template T
 * @param {() => Promise<T> | T} fn
 * @returns {Promise<T>}
 */
export async function withoutNavigator(fn) {
  deleteNavigator();
  try {
    return await fn();
  } finally {
    restoreNavigator();
  }
}

/**
 * Build a navigator stub whose vibrate() records every call and returns the
 * given result. The returned `calls` array is the live record — push order is
 * call order; each entry is the argument passed to vibrate (number or array).
 *
 * @param {{ result?: boolean }} [options]
 * @returns {{ navigator: { vibrate: (pattern: number | number[]) => boolean }, calls: Array<number | number[]> }}
 */
export function makeVibrateRecorder({ result = true } = {}) {
  const calls = [];
  const vibrate = (pattern) => {
    calls.push(pattern);
    return result;
  };
  // The returned object both IS a navigator (has `vibrate`) and exposes its own
  // `navigator` field so tests can destructure either pattern:
  //
  //   const recorder = makeVibrateRecorder();
  //   withNavigator(recorder, ...);
  //
  //   const { navigator, calls } = makeVibrateRecorder();
  //   withNavigator(navigator, ...);
  const recorder = { vibrate, calls };
  recorder.navigator = recorder;
  return recorder;
}

/**
 * Convenience wrapper for makeVibrateRecorder({ result: false }) — a navigator
 * whose vibrate() always returns false, used to exercise the failure path of
 * PatternComposer.play, RealtimeComposer.set, and friends.
 *
 * @returns {{ navigator: { vibrate: (pattern: number | number[]) => boolean }, calls: Array<number | number[]> }}
 */
export function makeFailingVibrate() {
  return makeVibrateRecorder({ result: false });
}
