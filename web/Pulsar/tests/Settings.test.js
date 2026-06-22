import test from "node:test";
import assert from "node:assert/strict";

import Settings from "../src/Settings.ts";
import {
  withNavigator,
  deleteNavigator,
  restoreNavigator,
} from "./helpers/navigator.js";
import { withWindow, withoutWindow, makeWindow } from "./helpers/window.js";
import { resetSettings } from "./helpers/reset-settings.js";

test.beforeEach(() => {
  resetSettings();
});

test("isHapticsEnabled defaults to true at module load (after resetSettings)", () => {
  assert.equal(Settings.isHapticsEnabled(), true);
});

test("enableHaptics(false) flips isHapticsEnabled() to false", () => {
  Settings.enableHaptics(false);
  assert.equal(Settings.isHapticsEnabled(), false);
});

test("enableHaptics(true) flips isHapticsEnabled() back to true", () => {
  Settings.enableHaptics(false);
  assert.equal(Settings.isHapticsEnabled(), false);

  Settings.enableHaptics(true);
  assert.equal(Settings.isHapticsEnabled(), true);
});

test("isSoundEnabled defaults to true at module load (after resetSettings)", () => {
  assert.equal(Settings.isSoundEnabled(), true);
});

test("enableSound(false) flips isSoundEnabled() to false", () => {
  Settings.enableSound(false);
  assert.equal(Settings.isSoundEnabled(), false);
});

test("enableSound(true) flips isSoundEnabled() back to true", () => {
  Settings.enableSound(false);
  assert.equal(Settings.isSoundEnabled(), false);

  Settings.enableSound(true);
  assert.equal(Settings.isSoundEnabled(), true);
});

test("isHapticsAvailable() returns false when navigator is entirely undefined", () => {
  const restore = deleteNavigator();
  try {
    assert.equal(typeof globalThis.navigator, "undefined");
    assert.equal(Settings.isHapticsAvailable(), false);
  } finally {
    restore();
  }
});

test("isHapticsAvailable() returns false when navigator exists but vibrate is undefined", () => {
  withNavigator({}, () => {
    assert.equal(Settings.isHapticsAvailable(), false);
  });
});

test("isHapticsAvailable() returns false when navigator.vibrate is not a function", () => {
  withNavigator({ vibrate: 42 }, () => {
    assert.equal(Settings.isHapticsAvailable(), false);
  });
});

test("isHapticsAvailable() returns true when navigator.vibrate is a function", () => {
  withNavigator({ vibrate: () => true }, () => {
    assert.equal(Settings.isHapticsAvailable(), true);
  });
});

// Coarse-pointer (non-touch device) gate: canActuallyVibrate() reads
// window.matchMedia at call time. The tests above all hit the
// `window === undefined → true` branch; these pin the rest.

test("isHapticsAvailable() bypasses the coarse-pointer gate when window is undefined (Node/SSR)", () => {
  withNavigator({ vibrate: () => true }, () => {
    withoutWindow(() => {
      assert.equal(typeof globalThis.window, "undefined");
      assert.equal(Settings.isHapticsAvailable(), true);
    });
  });
});

test("isHapticsAvailable() bypasses the coarse-pointer gate when window has no matchMedia", () => {
  const { window } = makeWindow({ matchMedia: null });
  withNavigator({ vibrate: () => true }, () => {
    withWindow(window, () => {
      assert.equal(typeof globalThis.window.matchMedia, "undefined");
      assert.equal(Settings.isHapticsAvailable(), true);
    });
  });
});

test("isHapticsAvailable() returns true on a coarse-pointer (touch) device", () => {
  const { window } = makeWindow({ matches: true });
  withNavigator({ vibrate: () => true }, () => {
    withWindow(window, () => {
      assert.equal(Settings.isHapticsAvailable(), true);
    });
  });
});

test("isHapticsAvailable() returns false on a fine-pointer (non-touch) device even when navigator.vibrate exists", () => {
  const { window } = makeWindow({ matches: false });
  withNavigator({ vibrate: () => true }, () => {
    withWindow(window, () => {
      assert.equal(Settings.isHapticsAvailable(), false);
    });
  });
});

test("isHapticsAvailable() queries matchMedia with exactly '(pointer: coarse)'", () => {
  const { window, queries } = makeWindow({ matches: true });
  withNavigator({ vibrate: () => true }, () => {
    withWindow(window, () => {
      Settings.isHapticsAvailable();
      assert.deepEqual(queries, ["(pointer: coarse)"]);
    });
  });
});

test("isHapticsAvailable() short-circuits before matchMedia when navigator.vibrate is missing", () => {
  const { window, queries } = makeWindow({ matches: true });
  withNavigator({}, () => {
    withWindow(window, () => {
      assert.equal(Settings.isHapticsAvailable(), false);
      assert.deepEqual(queries, [], "matchMedia must not be consulted when vibrate is unavailable");
    });
  });
});

test("stopHaptics() returns the result of navigator.vibrate(0) and calls it with 0", () => {
  const calls = [];
  withNavigator(
    {
      vibrate: (pattern) => {
        calls.push(pattern);
        return true;
      },
    },
    () => {
      const result = Settings.stopHaptics();
      assert.equal(result, true);
      assert.deepEqual(calls, [0]);
    }
  );
});

test("stopHaptics() returns false when navigator.vibrate is unavailable", () => {
  withNavigator({}, () => {
    const result = Settings.stopHaptics();
    assert.equal(result, false);
  });
});

test("registerStopHapticsHandler invokes a registered handler exactly once per stopHaptics()", () => {
  let count = 0;
  const unregister = Settings.registerStopHapticsHandler(() => {
    count += 1;
  });

  try {
    withNavigator({ vibrate: () => true }, () => {
      Settings.stopHaptics();
    });
    assert.equal(count, 1);
  } finally {
    unregister();
  }
});

test("registerStopHapticsHandler with the SAME function twice still fires once (Set semantics)", () => {
  let count = 0;
  const handler = () => {
    count += 1;
  };

  const unregister1 = Settings.registerStopHapticsHandler(handler);
  const unregister2 = Settings.registerStopHapticsHandler(handler);

  try {
    withNavigator({ vibrate: () => true }, () => {
      Settings.stopHaptics();
    });
    assert.equal(count, 1);
  } finally {
    unregister1();
    unregister2();
  }
});

test("registerStopHapticsHandler returned unregister actually removes the handler", () => {
  let count = 0;
  const unregister = Settings.registerStopHapticsHandler(() => {
    count += 1;
  });

  unregister();

  withNavigator({ vibrate: () => true }, () => {
    Settings.stopHaptics();
  });

  assert.equal(count, 0);
});

test("registerStopHapticsHandler unregister is idempotent — calling it twice is safe", () => {
  let count = 0;
  const unregister = Settings.registerStopHapticsHandler(() => {
    count += 1;
  });

  unregister();
  assert.doesNotThrow(() => unregister());

  withNavigator({ vibrate: () => true }, () => {
    Settings.stopHaptics();
  });

  assert.equal(count, 0);
});

test("multiple handlers all fire on stopHaptics() in insertion order", () => {
  const order = [];
  const unregisterA = Settings.registerStopHapticsHandler(() => order.push("a"));
  const unregisterB = Settings.registerStopHapticsHandler(() => order.push("b"));
  const unregisterC = Settings.registerStopHapticsHandler(() => order.push("c"));

  try {
    withNavigator({ vibrate: () => true }, () => {
      Settings.stopHaptics();
    });
    assert.deepEqual(order, ["a", "b", "c"]);
  } finally {
    unregisterA();
    unregisterB();
    unregisterC();
  }
});

test("stopHaptics() handler exception aborts iteration and skips navigator.vibrate(0)", () => {
  const fired = [];
  let vibrateCalled = false;

  const unregisterA = Settings.registerStopHapticsHandler(() => {
    fired.push("a");
  });
  const unregisterB = Settings.registerStopHapticsHandler(() => {
    fired.push("b");
    throw new Error("boom");
  });
  const unregisterC = Settings.registerStopHapticsHandler(() => {
    fired.push("c");
  });

  try {
    withNavigator(
      {
        vibrate: () => {
          vibrateCalled = true;
          return true;
        },
      },
      () => {
        assert.throws(() => Settings.stopHaptics(), { message: "boom" });
      }
    );

    assert.deepEqual(fired, ["a", "b"]);
    assert.equal(vibrateCalled, false);
  } finally {
    unregisterA();
    unregisterB();
    unregisterC();
  }
});

test("enableHaptics(false) fires all registered stop handlers (implicit stopHaptics)", () => {
  let countA = 0;
  let countB = 0;
  const unregisterA = Settings.registerStopHapticsHandler(() => {
    countA += 1;
  });
  const unregisterB = Settings.registerStopHapticsHandler(() => {
    countB += 1;
  });

  try {
    withNavigator({ vibrate: () => true }, () => {
      Settings.enableHaptics(false);
    });

    assert.equal(countA, 1);
    assert.equal(countB, 1);
    assert.equal(Settings.isHapticsEnabled(), false);
  } finally {
    unregisterA();
    unregisterB();
  }
});
