import test from "node:test";
import assert from "node:assert/strict";

import { RealtimeComposer } from "../src/RealtimeComposer.ts";

test("set starts a realtime PWM loop with the expected pattern", () => {
  const composer = new RealtimeComposer();
  const vibrateCalls = [];
  const originalNavigator = globalThis.navigator;
  const originalSetTimeout = globalThis.setTimeout;
  const originalClearTimeout = globalThis.clearTimeout;
  const scheduled = [];

  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: {
      vibrate: (pattern) => {
        vibrateCalls.push(pattern);
        return true;
      },
    },
  });

  globalThis.setTimeout = (callback, delay) => {
    const handle = { callback, delay };
    scheduled.push(handle);
    return handle;
  };

  globalThis.clearTimeout = () => {};

  try {
    // intensity 0 is silence: vibrate() must NOT be called (vibrate(0) would
    // cancel an unrelated in-progress vibration), but the cycle still runs
    // and waits out the pause so the next tick can pick up new values.
    const result = composer.set(0, 1);

    assert.equal(result, true);
    assert.equal(composer.isPlaying(), true);
    assert.deepEqual(vibrateCalls, []);
    assert.equal(scheduled.length, 1);
    assert.equal(scheduled[0].delay, 20);
  } finally {
    Object.defineProperty(globalThis, "navigator", {
      configurable: true,
      value: originalNavigator,
    });
    globalThis.setTimeout = originalSetTimeout;
    globalThis.clearTimeout = originalClearTimeout;
  }
});

test("set during playback updates parameters in-place without restarting the loop", () => {
  // The realtime composer is designed to be called at high frequency (e.g. on
  // every pointermove). Restarting the PWM cycle on each call would clear the
  // pending pause and immediately trigger another vibrate(), starving the loop
  // so that only shot length is ever perceived. Instead, set() should update
  // the stored values and let the running tick read them on the next cycle.
  const composer = new RealtimeComposer();
  const vibrateCalls = [];
  const clearedHandles = [];
  const originalNavigator = globalThis.navigator;
  const originalSetTimeout = globalThis.setTimeout;
  const originalClearTimeout = globalThis.clearTimeout;
  const scheduled = [];

  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: {
      vibrate: (pattern) => {
        vibrateCalls.push(pattern);
        return true;
      },
    },
  });

  globalThis.setTimeout = (callback, delay) => {
    const handle = { callback, delay };
    scheduled.push(handle);
    return handle;
  };

  globalThis.clearTimeout = (handle) => {
    clearedHandles.push(handle);
  };

  try {
    // intensity 0 = silence: first set() schedules a pause-only cycle.
    composer.set(0, 1);

    const result = composer.set(1, 0);

    assert.equal(result, true);
    assert.equal(composer.isPlaying(), true);
    // First set() was silence (no vibrate); the second set() does not restart
    // the loop, so still no vibrate calls and no extra timeouts scheduled.
    assert.deepEqual(vibrateCalls, []);
    assert.deepEqual(clearedHandles, []);
    assert.equal(scheduled.length, 1);
    assert.deepEqual(composer.getCurrentValues(), { intensity: 1, frequency: 0 });

    // When the originally scheduled tick fires, it picks up the latest values.
    scheduled[0].callback();
    assert.deepEqual(vibrateCalls, [200]);
    assert.equal(scheduled.length, 2);
    assert.equal(scheduled[1].delay, 400);
  } finally {
    Object.defineProperty(globalThis, "navigator", {
      configurable: true,
      value: originalNavigator,
    });
    globalThis.setTimeout = originalSetTimeout;
    globalThis.clearTimeout = originalClearTimeout;
  }
});

test("scheduled ticks keep replaying while realtime playback is active", () => {
  const composer = new RealtimeComposer();
  const vibrateCalls = [];
  const originalNavigator = globalThis.navigator;
  const originalSetTimeout = globalThis.setTimeout;
  const originalClearTimeout = globalThis.clearTimeout;
  const scheduled = [];

  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: {
      vibrate: (pattern) => {
        vibrateCalls.push(pattern);
        return true;
      },
    },
  });

  globalThis.setTimeout = (callback, delay) => {
    const handle = { callback, delay };
    scheduled.push(handle);
    return handle;
  };

  globalThis.clearTimeout = () => {};

  try {
    composer.set(0.5, 0.5);

    const firstScheduledTick = scheduled[0];
    firstScheduledTick.callback();

    // shotLength = lerp(60, 200, 0.5) = 130, pauseLength = lerp(200, 20, 0.5) = 110
    assert.deepEqual(vibrateCalls, [130, 130]);
    assert.equal(scheduled.length, 2);
    assert.equal(scheduled[1].delay, 240);
  } finally {
    Object.defineProperty(globalThis, "navigator", {
      configurable: true,
      value: originalNavigator,
    });
    globalThis.setTimeout = originalSetTimeout;
    globalThis.clearTimeout = originalClearTimeout;
  }
});

test("stop clears the scheduled loop and cancels the active vibration", () => {
  const composer = new RealtimeComposer();
  const vibrateCalls = [];
  const clearedHandles = [];
  const originalNavigator = globalThis.navigator;
  const originalSetTimeout = globalThis.setTimeout;
  const originalClearTimeout = globalThis.clearTimeout;
  const scheduled = [];

  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: {
      vibrate: (pattern) => {
        vibrateCalls.push(pattern);
        return true;
      },
    },
  });

  globalThis.setTimeout = (callback, delay) => {
    const handle = { callback, delay };
    scheduled.push(handle);
    return handle;
  };

  globalThis.clearTimeout = (handle) => {
    clearedHandles.push(handle);
  };

  try {
    composer.set(0.5, 0.5);
    const scheduledHandle = scheduled[0];

    const result = composer.stop();

    assert.equal(result, true);
    assert.equal(composer.isPlaying(), false);
    assert.deepEqual(clearedHandles, [scheduledHandle]);
    assert.deepEqual(vibrateCalls, [130, 0]);
  } finally {
    Object.defineProperty(globalThis, "navigator", {
      configurable: true,
      value: originalNavigator,
    });
    globalThis.setTimeout = originalSetTimeout;
    globalThis.clearTimeout = originalClearTimeout;
  }
});

test("set returns false and stops playback when vibrate is unsupported", () => {
  const composer = new RealtimeComposer();
  const originalNavigator = globalThis.navigator;

  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: {},
  });

  try {
    assert.equal(composer.set(0.5, 0.5), false);
    assert.equal(composer.isPlaying(), false);
  } finally {
    Object.defineProperty(globalThis, "navigator", {
      configurable: true,
      value: originalNavigator,
    });
  }
});

test("set returns false and stops playback when vibrate rejects the pattern", () => {
  const composer = new RealtimeComposer();
  const originalNavigator = globalThis.navigator;
  const originalSetTimeout = globalThis.setTimeout;
  const originalClearTimeout = globalThis.clearTimeout;

  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: {
      vibrate: () => false,
    },
  });

  globalThis.setTimeout = () => {
    throw new Error("setTimeout should not be called when vibrate fails");
  };

  globalThis.clearTimeout = () => {};

  try {
    assert.equal(composer.set(0.5, 0.5), false);
    assert.equal(composer.isPlaying(), false);
  } finally {
    Object.defineProperty(globalThis, "navigator", {
      configurable: true,
      value: originalNavigator,
    });
    globalThis.setTimeout = originalSetTimeout;
    globalThis.clearTimeout = originalClearTimeout;
  }
});
