// Shared helpers to normalize the Settings singleton between tests.
//
// Settings is a module-level singleton that holds two flags
// (hapticsEnabled, soundEnabled) and a Set of stop-haptics handlers.
// Because the module is imported once and cached, state leaks across
// test files unless explicitly reset. These helpers provide:
//
//   * resetSettings()        - force flags back to defaults and clear any
//                              stop handlers that THIS test process registered
//                              via trackStopHandlers().
//   * trackStopHandlers()    - wrap Settings.registerStopHapticsHandler so the
//                              test can register handlers without leaking
//                              module-level Set state across files.
//   * beforeEachResetSettings(t) - convenience: register a beforeEach on a
//                              node:test describe context that calls
//                              resetSettings() before every test.
//
// NOTE: Settings does not export the internal `stopHapticsHandlers` Set, so we
// cannot directly clear handlers registered by other code paths (e.g. modules
// that register on import). What we CAN do is reliably unregister every
// handler whose registration went through `trackStopHandlers().register(...)`
// or `resetSettings`'s tracked global set. Tests that want clean state should
// register via the tracker.

import Settings from "../../src/Settings.ts";

// Module-level set of unregister callbacks for handlers registered through
// any tracker created in this process. resetSettings() drains this set on
// every call so handlers from previous tests do not leak.
const globalUnregisters = new Set();

/**
 * Reset Settings flags to defaults and unregister every stop-haptics handler
 * that was registered via trackStopHandlers() in this process.
 *
 * Idempotent — safe to call before every test.
 */
export function resetSettings() {
  // Force the public flags back to their default (true) values.
  // We go through the public API to avoid reaching into module internals.
  Settings.enableSound(true);
  // enableHaptics(true) is a no-op on the handler set (it only fires handlers
  // when disabling), so it is safe to call here.
  Settings.enableHaptics(true);

  // Drain every tracked unregister callback. Each unregister is idempotent
  // per Settings.registerStopHapticsHandler's documented contract.
  for (const unregister of globalUnregisters) {
    try {
      unregister();
    } catch {
      // Ignore — unregister functions are documented as idempotent and
      // should not throw, but we never want resetSettings itself to throw.
    }
  }
  globalUnregisters.clear();
}

/**
 * Create a tracker that wraps Settings.registerStopHapticsHandler so test code
 * can register handlers and later call unregisterAll() to drop them all at
 * once. Each `register(fn)` returns the underlying unregister function (still
 * usable directly).
 *
 * The tracker also feeds the process-wide set used by resetSettings(), so
 * forgetting to call unregisterAll() is recovered by the next resetSettings().
 *
 * Usage:
 *   const tracker = trackStopHandlers();
 *   tracker.register(() => { ... });
 *   ...
 *   tracker.unregisterAll();
 */
export function trackStopHandlers() {
  const localUnregisters = new Set();

  return {
    /**
     * Register a stop-haptics handler. Returns the raw unregister function
     * from Settings (calling it removes the handler from both the local and
     * global tracker sets).
     */
    register(handler) {
      const rawUnregister = Settings.registerStopHapticsHandler(handler);
      const wrapped = () => {
        rawUnregister();
        localUnregisters.delete(wrapped);
        globalUnregisters.delete(wrapped);
      };
      localUnregisters.add(wrapped);
      globalUnregisters.add(wrapped);
      return wrapped;
    },

    /**
     * Unregister every handler that was registered through this tracker.
     * Safe to call multiple times.
     */
    unregisterAll() {
      for (const unregister of localUnregisters) {
        try {
          unregister();
        } catch {
          // Swallow — idempotent contract.
        }
      }
      localUnregisters.clear();
    },

    /**
     * Number of currently-tracked handlers (for assertions in tests).
     */
    size() {
      return localUnregisters.size;
    },
  };
}

/**
 * Convenience: registers a beforeEach hook on a node:test describe context so
 * a single line in a test file resets Settings before every test().
 *
 * Usage inside `describe("...", (t) => { beforeEachResetSettings(t); ... })`.
 * Also accepts the top-level `test` import as `t` — node:test exposes a
 * beforeEach on both surfaces.
 */
export function beforeEachResetSettings(t) {
  const beforeEach = t && typeof t.beforeEach === "function" ? t.beforeEach : null;
  if (!beforeEach) {
    throw new TypeError(
      "beforeEachResetSettings: expected a node:test context with a beforeEach hook"
    );
  }
  beforeEach(() => {
    resetSettings();
  });
}
