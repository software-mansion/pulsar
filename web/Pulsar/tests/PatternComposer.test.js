import test from "node:test";
import assert from "node:assert/strict";

import { PatternComposer } from "../src/PatternComposer.ts";

test("parse compiles a continuous block at timestamp 0", () => {
  const composer = new PatternComposer();

  const parsed = composer.parse([
    { type: "continuous", timestamp: 0, duration: 120 },
  ]);

  assert.deepEqual(parsed, [120]);
  assert.deepEqual(composer.getPattern(), [120]);
});

test("parse preserves the leading gap before the first block", () => {
  const composer = new PatternComposer();

  const parsed = composer.parse([
    { type: "continuous", timestamp: 50, duration: 120 },
  ]);

  assert.deepEqual(parsed, [0, 50, 120]);
});

test("parse merges overlapping and touching intervals into one vibration span", () => {
  const composer = new PatternComposer();

  const parsed = composer.parse([
    { type: "continuous", timestamp: 0, duration: 100 },
    { type: "continuous", timestamp: 80, duration: 20 },
    { type: "continuous", timestamp: 100, duration: 60 },
  ]);

  assert.deepEqual(parsed, [160]);
});

test("parse expands pulse blocks into square-wave shots and pauses", () => {
  const composer = new PatternComposer();

  const parsed = composer.parse([
    { type: "pulse", timestamp: 0, duration: 200, intensity: 0, frequency: 1 },
  ]);

  assert.deepEqual(parsed, [20, 20, 20, 20, 20, 20, 20, 20, 20]);
});

test("parse merges pulse output with overlapping continuous output", () => {
  const composer = new PatternComposer();

  const parsed = composer.parse([
    { type: "pulse", timestamp: 0, duration: 200, intensity: 0, frequency: 1 },
    { type: "continuous", timestamp: 10, duration: 40 },
  ]);

  assert.deepEqual(parsed, [60, 20, 20, 20, 20, 20, 20]);
});

test("parse expands line blocks using interpolated intensity and frequency curves", () => {
  const composer = new PatternComposer();

  const parsed = composer.parse([
    {
      type: "line",
      timestamp: 0,
      duration: 200,
      intensity: [
        { time: 0, value: 0 },
        { time: 200, value: 1 },
      ],
      frequency: [
        { time: 0, value: 1 },
        { time: 200, value: 1 },
      ],
    },
  ]);

  assert.deepEqual(parsed, [20, 20, 56, 20, 84]);
});

test("parse extends line curves to segment boundaries when control points are partial", () => {
  const composer = new PatternComposer();

  const parsed = composer.parse([
    {
      type: "line",
      timestamp: 50,
      duration: 120,
      intensity: [{ time: 30, value: 0 }],
      frequency: [{ time: 30, value: 1 }],
    },
  ]);

  assert.deepEqual(parsed, [0, 50, 20, 20, 20, 20, 20]);
});

test("play forwards the parsed pattern to navigator.vibrate", () => {
  const composer = new PatternComposer();
  const calls = [];
  const originalNavigator = globalThis.navigator;

  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: {
      vibrate: (pattern) => {
        calls.push(pattern);
        return true;
      },
    },
  });

  try {
    composer.parse([{ type: "continuous", timestamp: 0, duration: 75 }]);

    const result = composer.play();

    assert.equal(result, true);
    assert.deepEqual(calls, [[75]]);
  } finally {
    Object.defineProperty(globalThis, "navigator", {
      configurable: true,
      value: originalNavigator,
    });
  }
});

test("stop clears the pattern and cancels the current vibration", () => {
  const composer = new PatternComposer();
  const calls = [];
  const originalNavigator = globalThis.navigator;

  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: {
      vibrate: (pattern) => {
        calls.push(pattern);
        return true;
      },
    },
  });

  try {
    composer.parse([{ type: "continuous", timestamp: 0, duration: 75 }]);

    const result = composer.stop();

    assert.equal(result, true);
    assert.deepEqual(composer.getPattern(), []);
    assert.deepEqual(calls, [0]);
  } finally {
    Object.defineProperty(globalThis, "navigator", {
      configurable: true,
      value: originalNavigator,
    });
  }
});

test("play returns false when vibrate is not supported", () => {
  const composer = new PatternComposer();
  const originalNavigator = globalThis.navigator;

  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: {},
  });

  try {
    assert.equal(composer.play(), false);
  } finally {
    Object.defineProperty(globalThis, "navigator", {
      configurable: true,
      value: originalNavigator,
    });
  }
});
