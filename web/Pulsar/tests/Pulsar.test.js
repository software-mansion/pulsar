import test from "node:test";
import assert from "node:assert/strict";

import Default, { Pulsar } from "../src/index.ts";
import Settings from "../src/Settings.ts";
import {
  withNavigator,
  withoutNavigator,
  installNavigator,
  restoreNavigator,
  makeVibrateRecorder,
} from "./helpers/navigator.js";
import { resetSettings } from "./helpers/reset-settings.js";

test.beforeEach(() => {
  resetSettings();
});

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

test("isHapticsSupported returns false when navigator.vibrate is not a function", () => {
  const pulsar = new Pulsar();

  withNavigator({}, () => {
    assert.equal(pulsar.isHapticsSupported(), false);
  });
});

test("isHapticsSupported returns true when navigator.vibrate is a function", () => {
  const pulsar = new Pulsar();

  withNavigator({ vibrate: () => true }, () => {
    assert.equal(pulsar.isHapticsSupported(), true);
  });
});

test("enableHaptics delegates to the global settings state", () => {
  const pulsar = new Pulsar();

  pulsar.enableHaptics(false);
  assert.equal(Settings.isHapticsEnabled(), false);

  pulsar.enableHaptics(true);
  assert.equal(Settings.isHapticsEnabled(), true);
});

test("enableHaptics(false) fires registered stop handlers via Settings", () => {
  const pulsar = new Pulsar();
  let fired = 0;
  const unregister = Settings.registerStopHapticsHandler(() => {
    fired += 1;
  });

  try {
    withNavigator({ vibrate: () => true }, () => {
      pulsar.enableHaptics(false);
    });

    assert.equal(fired, 1);
    assert.equal(Settings.isHapticsEnabled(), false);
  } finally {
    unregister();
  }
});

test("enableHaptics(true) does NOT auto-resume — it only flips the flag and does not fire stop handlers", () => {
  const pulsar = new Pulsar();
  let fired = 0;
  const unregister = Settings.registerStopHapticsHandler(() => {
    fired += 1;
  });

  try {
    // Start from disabled state.
    withNavigator({ vibrate: () => true }, () => {
      pulsar.enableHaptics(false);
    });
    assert.equal(fired, 1, "stop handler should have fired on disable");

    // Re-enabling must not fire stop handlers and must not call vibrate.
    const { navigator, calls } = makeVibrateRecorder();
    installNavigator(navigator);
    try {
      pulsar.enableHaptics(true);
    } finally {
      restoreNavigator();
    }

    assert.equal(fired, 1, "stop handler must NOT fire when re-enabling haptics");
    assert.deepEqual(calls, [], "navigator.vibrate must not be called by enableHaptics(true)");
    assert.equal(Settings.isHapticsEnabled(), true);
  } finally {
    unregister();
  }
});

test("enableSound delegates to the global settings state", () => {
  const pulsar = new Pulsar();

  pulsar.enableSound(false);
  assert.equal(Settings.isSoundEnabled(), false);

  pulsar.enableSound(true);
  assert.equal(Settings.isSoundEnabled(), true);
});

test("stopHaptics returns true and forwards a vibrate(0) call when haptics is available", () => {
  const pulsar = new Pulsar();
  const { navigator, calls } = makeVibrateRecorder({ result: true });

  withNavigator(navigator, () => {
    const result = pulsar.stopHaptics();

    assert.equal(result, true);
    assert.deepEqual(calls, [0]);
  });
});

test("stopHaptics returns false when navigator.vibrate is unavailable", () => {
  const pulsar = new Pulsar();

  withNavigator({}, () => {
    const result = pulsar.stopHaptics();
    assert.equal(result, false);
  });
});

test("default export of src/index.ts is the same class reference as the named Pulsar export", () => {
  assert.equal(Default, Pulsar);
  assert.equal(new Default() instanceof Pulsar, true);
});

test("smoke: pulsar.getPresets().play('tap') forwards the parsed pattern to navigator.vibrate", async () => {
  const pulsar = new Pulsar();
  const { navigator, calls } = makeVibrateRecorder({ result: true });

  await withNavigator(navigator, async () => {
    const result = await pulsar.getPresets().play("tap");

    // tap is [{ type: "continuous", timestamp: 0, duration: 30 }] → parsed [30].
    assert.deepEqual(calls, [[30]]);
    assert.equal(result.haptics, true);
    assert.equal(result.usedAudioFallback, false);
  });
});

test("constructor is SSR-safe with no navigator and no AudioContext globals", () => {
  const originalAudioContext = globalThis.AudioContext;
  const originalWebkitAudioContext = globalThis.webkitAudioContext;
  const originalOfflineAudioContext = globalThis.OfflineAudioContext;

  // Strip audio globals — Pulsar must not touch them at construction time.
  delete globalThis.AudioContext;
  delete globalThis.webkitAudioContext;
  delete globalThis.OfflineAudioContext;

  try {
    withoutNavigator(() => {
      let pulsar;
      assert.doesNotThrow(() => {
        pulsar = new Pulsar();
      });

      assert.notEqual(pulsar.getPresets(), undefined);
      assert.notEqual(pulsar.getRealtimeComposer(), undefined);
      assert.notEqual(pulsar.getPatternComposer(), undefined);
    });
  } finally {
    if (originalAudioContext !== undefined) {
      globalThis.AudioContext = originalAudioContext;
    }
    if (originalWebkitAudioContext !== undefined) {
      globalThis.webkitAudioContext = originalWebkitAudioContext;
    }
    if (originalOfflineAudioContext !== undefined) {
      globalThis.OfflineAudioContext = originalOfflineAudioContext;
    }
  }
});
