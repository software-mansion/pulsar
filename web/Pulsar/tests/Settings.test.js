import test from "node:test";
import assert from "node:assert/strict";

import { RealtimeComposer } from "../src/RealtimeComposer.ts";
import Settings from "../src/Settings.ts";

test("haptics can be enabled and disabled globally", () => {
  Settings.enableHaptics(true);

  try {
    assert.equal(Settings.isHapticsEnabled(), true);

    Settings.enableHaptics(false);

    assert.equal(Settings.isHapticsEnabled(), false);
  } finally {
    Settings.enableHaptics(true);
  }
});

test("sound can be enabled and disabled independently", () => {
  Settings.enableSound(true);

  try {
    assert.equal(Settings.isSoundEnabled(), true);

    Settings.enableSound(false);

    assert.equal(Settings.isSoundEnabled(), false);
  } finally {
    Settings.enableSound(true);
  }
});

test("haptics availability reflects navigator.vibrate support", () => {
  const originalNavigator = globalThis.navigator;

  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: {},
  });

  try {
    assert.equal(Settings.isHapticsAvailable(), false);
  } finally {
    Object.defineProperty(globalThis, "navigator", {
      configurable: true,
      value: originalNavigator,
    });
  }
});

test("stopHaptics cancels browser vibration", () => {
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
    const result = Settings.stopHaptics();

    assert.equal(result, true);
    assert.deepEqual(calls, [0]);
  } finally {
    Object.defineProperty(globalThis, "navigator", {
      configurable: true,
      value: originalNavigator,
    });
  }
});

test("disabling haptics stops an active realtime composer", () => {
  const composer = new RealtimeComposer();
  const vibrateCalls = [];
  const originalNavigator = globalThis.navigator;
  const originalSetTimeout = globalThis.setTimeout;
  const originalClearTimeout = globalThis.clearTimeout;
  const clearedHandles = [];

  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: {
      vibrate: (pattern) => {
        vibrateCalls.push(pattern);
        return true;
      },
    },
  });

  globalThis.setTimeout = (callback, delay) => ({ callback, delay });
  globalThis.clearTimeout = (handle) => {
    clearedHandles.push(handle);
  };

  Settings.enableHaptics(true);

  try {
    composer.set(0.5, 0.5);

    Settings.enableHaptics(false);

    assert.equal(composer.isPlaying(), false);
    assert.deepEqual(vibrateCalls, [110, 0]);
    assert.equal(clearedHandles.length, 1);
  } finally {
    Settings.enableHaptics(true);
    Object.defineProperty(globalThis, "navigator", {
      configurable: true,
      value: originalNavigator,
    });
    globalThis.setTimeout = originalSetTimeout;
    globalThis.clearTimeout = originalClearTimeout;
  }
});
