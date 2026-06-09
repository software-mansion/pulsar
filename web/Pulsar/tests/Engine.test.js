import test from "node:test";
import assert from "node:assert/strict";

import { getHapticTimingCapabilities } from "../src/Engine.ts";

// NOTE: tests/helpers/pattern-fixtures.js derives its expected pulse/pause
// numbers from these same constants (minPulseMs/maxPulseMs/minPauseMs/maxPauseMs).
// If this contract test starts failing, update pattern-fixtures.js to match —
// silently shifting the numbers would invalidate the magic constants other
// tests use to assert clamping and lerp behavior.

test("getHapticTimingCapabilities returns the documented min/max pulse and pause constants", () => {
  const caps = getHapticTimingCapabilities();

  assert.deepEqual(caps, {
    minPulseMs: 20,
    maxPulseMs: 200,
    minPauseMs: 20,
    maxPauseMs: 200,
  });
});

test("getHapticTimingCapabilities exposes each constant as an own enumerable number property", () => {
  const caps = getHapticTimingCapabilities();

  for (const key of ["minPulseMs", "maxPulseMs", "minPauseMs", "maxPauseMs"]) {
    assert.ok(
      Object.prototype.hasOwnProperty.call(caps, key),
      `expected "${key}" to be an own property`,
    );
    assert.equal(typeof caps[key], "number", `expected "${key}" to be a number`);
  }
});

test("getHapticTimingCapabilities returns a fresh object on every call", () => {
  // The implementation builds and returns a new object literal each call,
  // so identity must differ even though values are equal.
  const a = getHapticTimingCapabilities();
  const b = getHapticTimingCapabilities();

  assert.notEqual(a, b, "expected each call to allocate a fresh object");
  assert.deepEqual(a, b, "expected each fresh object to carry the same values");
});

test("mutating one returned capabilities object does not leak into subsequent calls", () => {
  // Guards against a future refactor that memoizes the result without freezing
  // or cloning — callers must not be able to corrupt the canonical values.
  const first = getHapticTimingCapabilities();
  first.minPulseMs = 9999;
  first.maxPulseMs = 9999;
  first.minPauseMs = 9999;
  first.maxPauseMs = 9999;

  const second = getHapticTimingCapabilities();

  assert.deepEqual(second, {
    minPulseMs: 20,
    maxPulseMs: 200,
    minPauseMs: 20,
    maxPauseMs: 200,
  });
});

test("min values are strictly less than max values for both pulse and pause ranges", () => {
  // Sanity invariant: lerp(min, max, t) assumes min <= max — pin it explicitly
  // so a future edit that flips them is caught at the contract layer, not via
  // a downstream PatternComposer test failure that's harder to diagnose.
  const caps = getHapticTimingCapabilities();

  assert.ok(
    caps.minPulseMs < caps.maxPulseMs,
    `expected minPulseMs (${caps.minPulseMs}) < maxPulseMs (${caps.maxPulseMs})`,
  );
  assert.ok(
    caps.minPauseMs < caps.maxPauseMs,
    `expected minPauseMs (${caps.minPauseMs}) < maxPauseMs (${caps.maxPauseMs})`,
  );
});
