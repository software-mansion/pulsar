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
    const result = composer.set(0, 1);

    assert.equal(result, true);
    assert.equal(composer.isPlaying(), true);
    assert.deepEqual(vibrateCalls, [20]);
    assert.equal(scheduled.length, 1);
    assert.equal(scheduled[0].delay, 40);
  } finally {
    Object.defineProperty(globalThis, "navigator", {
      configurable: true,
      value: originalNavigator,
    });
    globalThis.setTimeout = originalSetTimeout;
    globalThis.clearTimeout = originalClearTimeout;
  }
});

test("set during playback restarts the loop with the new parameters", () => {
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
    composer.set(0, 1);
    const firstHandle = scheduled[0];

    const result = composer.set(1, 0);

    assert.equal(result, true);
    assert.equal(composer.isPlaying(), true);
    assert.deepEqual(vibrateCalls, [20, 200]);
    assert.deepEqual(clearedHandles, [firstHandle]);
    assert.equal(scheduled.length, 2);
    assert.equal(scheduled[1].delay, 400);
    assert.deepEqual(composer.getCurrentValues(), { intensity: 1, frequency: 0 });
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

    assert.deepEqual(vibrateCalls, [110, 110]);
    assert.equal(scheduled.length, 2);
    assert.equal(scheduled[1].delay, 220);
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
    assert.deepEqual(vibrateCalls, [110, 0]);
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
