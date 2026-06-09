// Minimal hook test utilities for tests that need to render React hooks without jsdom.
//
// Strategy: use `react-test-renderer` (added as a devDependency). It is officially
// maintained by the React team, runs in pure Node — no `document`/`window` required —
// and supports `useEffect` flushing via `act()`. We expose a tiny `renderHook` helper
// shaped after the @testing-library/react-hooks API: `{ result, rerender, unmount }`.
//
// react-test-renderer's `act` already handles effect flushing synchronously when the
// callback is sync, and awaits microtask drains when async. We re-export it so test
// authors can wrap state updates that happen outside of render.
//
// We deliberately do NOT polyfill `document` / `window`. If a future React update
// requires a DOM-ish shim at import-time, that should fail loudly here so callers
// can adjust — silent polyfills would mask the failure.

import React from "react";
import TestRenderer from "react-test-renderer";

const { act, create } = TestRenderer;

/**
 * Renders the given hook callback inside an invisible host component, returning
 * a handle that exposes the latest hook return value plus helpers for re-rendering
 * with new props and unmounting.
 *
 * The returned `result.current` mirrors the value the hook returned on the most
 * recent render — read it AFTER `renderHook` / `rerender` / `act` calls.
 *
 * @template TProps, TValue
 * @param {(props: TProps) => TValue} callback The hook to invoke.
 * @param {{ initialProps?: TProps }} [options]
 * @returns {{
 *   result: { current: TValue | undefined },
 *   rerender: (newProps?: TProps) => void,
 *   unmount: () => void,
 * }}
 */
export function renderHook(callback, options = {}) {
  if (typeof callback !== "function") {
    throw new TypeError("renderHook: callback must be a function");
  }

  const result = { current: undefined };

  function HookHost(props) {
    // Wrapping the assignment in a stable variable avoids the eslint
    // "expression-statement-as-side-effect" complaint without disabling rules.
    result.current = callback(props.hookProps);
    return null;
  }

  let renderer;
  act(() => {
    renderer = create(React.createElement(HookHost, { hookProps: options.initialProps }));
  });

  return {
    result,
    rerender(newProps) {
      act(() => {
        renderer.update(React.createElement(HookHost, { hookProps: newProps }));
      });
    },
    unmount() {
      act(() => {
        renderer.unmount();
      });
    },
  };
}

/**
 * Re-export of react-test-renderer's `act`. Wrap state updates outside of render
 * (e.g. firing a callback returned by a hook) so `useEffect` and state flushes
 * settle before the next assertion.
 *
 * Supports both sync and async callbacks — when an async callback is passed,
 * `act` returns a thenable that must be awaited.
 */
export { act };

export default { renderHook, act };
