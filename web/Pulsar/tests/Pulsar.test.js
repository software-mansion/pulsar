import test from "node:test";
import assert from "node:assert/strict";

import Pulsar from "../src/Pulsar.ts";
import Settings from "../src/Settings.ts";

test("getPresets returns the shared presets instance", () => {
  const pulsar = new Pulsar();

  assert.equal(pulsar.getPresets(), pulsar.getPresets());
});

test("getPatternComposer returns a fresh composer on each call", () => {
  const pulsar = new Pulsar();

  assert.notEqual(pulsar.getPatternComposer(), pulsar.getPatternComposer());
});

test("getRealtimeComposer returns the shared realtime composer instance", () => {
  const pulsar = new Pulsar();

  assert.equal(pulsar.getRealtimeComposer(), pulsar.getRealtimeComposer());
});

test("isHapticsSupported reflects browser vibration availability", () => {
  const pulsar = new Pulsar();
  const originalNavigator = globalThis.navigator;

  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: {},
  });

  try {
    assert.equal(pulsar.isHapticsSupported(), false);
  } finally {
    Object.defineProperty(globalThis, "navigator", {
      configurable: true,
      value: originalNavigator,
    });
  }
});

test("enableHaptics delegates to the global settings state", () => {
  const pulsar = new Pulsar();
  Settings.enableHaptics(true);

  try {
    pulsar.enableHaptics(false);
    assert.equal(Settings.isHapticsEnabled(), false);

    pulsar.enableHaptics(true);
    assert.equal(Settings.isHapticsEnabled(), true);
  } finally {
    Settings.enableHaptics(true);
  }
});

test("enableSound delegates to the global settings state", () => {
  const pulsar = new Pulsar();
  Settings.enableSound(true);

  try {
    pulsar.enableSound(false);
    assert.equal(Settings.isSoundEnabled(), false);

    pulsar.enableSound(true);
    assert.equal(Settings.isSoundEnabled(), true);
  } finally {
    Settings.enableSound(true);
  }
});

test("stopHaptics delegates to settings and cancels browser vibration", () => {
  const pulsar = new Pulsar();
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
    const result = pulsar.stopHaptics();

    assert.equal(result, true);
    assert.deepEqual(calls, [0]);
  } finally {
    Object.defineProperty(globalThis, "navigator", {
      configurable: true,
      value: originalNavigator,
    });
  }
});
