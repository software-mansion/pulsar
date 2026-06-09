import test from "node:test";
import assert from "node:assert/strict";

import { RealtimeComposer } from "../src/RealtimeComposer.ts";
import Settings from "../src/Settings.ts";
import { withNavigator } from "./helpers/navigator.js";
import { withFakeTimers } from "./helpers/fake-timers.js";
import { resetSettings } from "./helpers/reset-settings.js";

const vibrateNavigator = (vibrateCalls, returnValue = true) => ({
  vibrate: (pattern) => {
    vibrateCalls.push(pattern);
    return typeof returnValue === "function" ? returnValue(pattern) : returnValue;
  },
});

test("set(0, 1) is silence: no vibrate call but a 20ms pause is scheduled", () => {
  resetSettings();
  const composer = new RealtimeComposer();
  const vibrateCalls = [];

  withNavigator(vibrateNavigator(vibrateCalls), () => {
    withFakeTimers((timers) => {
      const result = composer.set(0, 1);

      assert.equal(result, true, "set should return true when haptics is available");
      assert.equal(composer.isPlaying(), true);
      // intensity=0 means silence: vibrate is intentionally skipped to avoid
      // cancelling unrelated in-progress vibrations from outside this loop.
      assert.deepEqual(vibrateCalls, []);
      assert.equal(timers.scheduled.length, 1);
      // shotLength=0, pauseLength=lerp(200,20,1)=20 -> cycleDuration=20
      assert.equal(timers.scheduled[0].delay, 20);

      composer.stop();
    });
  });
});

test("set during playback updates parameters in-place without restarting the loop or scheduling an extra timer", () => {
  resetSettings();
  const composer = new RealtimeComposer();
  const vibrateCalls = [];

  withNavigator(vibrateNavigator(vibrateCalls), () => {
    withFakeTimers((timers) => {
      // First set: silence path, schedules a single pause.
      composer.set(0, 1);

      const result = composer.set(1, 0);

      assert.equal(result, true);
      assert.equal(composer.isPlaying(), true);
      // No vibrate yet (silence), no clearTimeout, no new schedule: the running
      // tick should pick up the new values at the next boundary.
      assert.deepEqual(vibrateCalls, []);
      assert.deepEqual(timers.cleared, []);
      assert.equal(timers.scheduled.length, 1);
      assert.deepEqual(composer.getCurrentValues(), { intensity: 1, frequency: 0 });

      // Fire the originally scheduled tick — it should read the NEW intensity.
      timers.scheduled[0].callback();
      // shotLength=lerp(60,200,1)=200, pauseLength=lerp(200,20,0)=200 -> next delay=400.
      assert.deepEqual(vibrateCalls, [200]);
      assert.equal(timers.scheduled.length, 2);
      assert.equal(timers.scheduled[1].delay, 400);

      composer.stop();
    });
  });
});

test("scheduled ticks keep replaying: set(0.5,0.5) -> vibrate(130) then 240ms delay", () => {
  resetSettings();
  const composer = new RealtimeComposer();
  const vibrateCalls = [];

  withNavigator(vibrateNavigator(vibrateCalls), () => {
    withFakeTimers((timers) => {
      composer.set(0.5, 0.5);

      // shotLength = lerp(60, 200, 0.5) = 130 — first vibrate from initial tick.
      assert.deepEqual(vibrateCalls, [130]);
      assert.equal(timers.scheduled.length, 1);
      // cycleDuration = 130 + lerp(200,20,0.5) = 130 + 110 = 240.
      assert.equal(timers.scheduled[0].delay, 240);

      timers.scheduled[0].callback();
      assert.deepEqual(vibrateCalls, [130, 130]);
      assert.equal(timers.scheduled.length, 2);
      assert.equal(timers.scheduled[1].delay, 240);

      composer.stop();
    });
  });
});

test("stop clears the scheduled loop and emits navigator.vibrate(0)", () => {
  resetSettings();
  const composer = new RealtimeComposer();
  const vibrateCalls = [];

  withNavigator(vibrateNavigator(vibrateCalls), () => {
    withFakeTimers((timers) => {
      composer.set(0.5, 0.5);
      const scheduledHandle = timers.scheduled[0];

      const result = composer.stop();

      assert.equal(result, true);
      assert.equal(composer.isPlaying(), false);
      assert.deepEqual(timers.cleared, [scheduledHandle]);
      // vibrate(0) is the last entry — cancels any active shot.
      assert.deepEqual(vibrateCalls, [130, 0]);
    });
  });
});

test("set returns false when navigator.vibrate is absent", () => {
  resetSettings();
  const composer = new RealtimeComposer();

  withNavigator({}, () => {
    assert.equal(composer.set(0.5, 0.5), false);
    assert.equal(composer.isPlaying(), false);
  });
});

test("set returns false when navigator.vibrate exists but returns false", () => {
  resetSettings();
  const composer = new RealtimeComposer();
  const vibrateCalls = [];

  withNavigator(vibrateNavigator(vibrateCalls, false), () => {
    withFakeTimers((timers) => {
      const result = composer.set(0.5, 0.5);

      assert.equal(result, false);
      assert.equal(composer.isPlaying(), false);
      // The tick attempted to vibrate, got false, and aborted before scheduling.
      assert.deepEqual(vibrateCalls, [130]);
      assert.equal(timers.scheduled.length, 0);
    });
  });
});

test("set(1, 1) produces max shotLength=200 and min pauseLength=20", () => {
  resetSettings();
  const composer = new RealtimeComposer();
  const vibrateCalls = [];

  withNavigator(vibrateNavigator(vibrateCalls), () => {
    withFakeTimers((timers) => {
      composer.set(1, 1);

      assert.deepEqual(vibrateCalls, [200]);
      assert.equal(timers.scheduled.length, 1);
      // shotLength=200 + pauseLength=20 = 220ms cycle.
      assert.equal(timers.scheduled[0].delay, 220);

      composer.stop();
    });
  });
});

test("set(1, 0) produces max shotLength=200 and max pauseLength=200", () => {
  resetSettings();
  const composer = new RealtimeComposer();
  const vibrateCalls = [];

  withNavigator(vibrateNavigator(vibrateCalls), () => {
    withFakeTimers((timers) => {
      composer.set(1, 0);

      assert.deepEqual(vibrateCalls, [200]);
      assert.equal(timers.scheduled.length, 1);
      // shotLength=200 + pauseLength=200 = 400ms cycle.
      assert.equal(timers.scheduled[0].delay, 400);

      composer.stop();
    });
  });
});

test("set with intensity above 1 is clamped to 1", () => {
  resetSettings();
  const composer = new RealtimeComposer();
  const vibrateCalls = [];

  withNavigator(vibrateNavigator(vibrateCalls), () => {
    withFakeTimers(() => {
      composer.set(1.5, 0.5);

      assert.deepEqual(composer.getCurrentValues(), { intensity: 1, frequency: 0.5 });
      composer.stop();
    });
  });
});

test("set with negative intensity is clamped to 0", () => {
  resetSettings();
  const composer = new RealtimeComposer();
  const vibrateCalls = [];

  withNavigator(vibrateNavigator(vibrateCalls), () => {
    withFakeTimers(() => {
      composer.set(-0.5, 0.5);

      assert.deepEqual(composer.getCurrentValues(), { intensity: 0, frequency: 0.5 });
      composer.stop();
    });
  });
});

test("set with NaN propagates NaN through clamp01 (documented current behavior)", () => {
  resetSettings();
  const composer = new RealtimeComposer();

  withNavigator(vibrateNavigator([]), () => {
    withFakeTimers(() => {
      // We don't care about vibrate's behavior here — only that the stored
      // clamped values reflect the documented NaN-propagation in clamp01.
      try {
        composer.set(Number.NaN, Number.NaN);
      } catch {
        // NaN may cause schedule with NaN delay; ignore any side-effect error.
      }

      const { intensity, frequency } = composer.getCurrentValues();
      assert.ok(Number.isNaN(intensity), "intensity should be NaN");
      assert.ok(Number.isNaN(frequency), "frequency should be NaN");

      composer.stop();
    });
  });
});

test("second non-silent set updates intensity for the next tick without re-scheduling", () => {
  resetSettings();
  const composer = new RealtimeComposer();
  const vibrateCalls = [];

  withNavigator(vibrateNavigator(vibrateCalls), () => {
    withFakeTimers((timers) => {
      assert.equal(composer.set(0.5, 0.5), true);
      // First tick vibrates with intensity=0.5 -> shotLength=130.
      assert.deepEqual(vibrateCalls, [130]);
      assert.equal(timers.scheduled.length, 1);
      const firstScheduled = timers.scheduled[0];

      // Update before the next tick fires; must not re-schedule the loop.
      assert.equal(composer.set(1.0, 0.5), true);
      assert.deepEqual(vibrateCalls, [130]);
      assert.equal(timers.scheduled.length, 1);
      assert.equal(timers.scheduled[0], firstScheduled);
      assert.deepEqual(timers.cleared, []);

      // Fire the originally scheduled tick — picks up the NEW intensity (1.0).
      firstScheduled.callback();
      // shotLength=lerp(60,200,1)=200.
      assert.deepEqual(vibrateCalls, [130, 200]);
      assert.equal(timers.scheduled.length, 2);

      composer.stop();
    });
  });
});

test("stop on a fresh composer (never started) is idempotent and returns vibrate(0) result", () => {
  resetSettings();
  const composer = new RealtimeComposer();
  const vibrateCalls = [];

  withNavigator(vibrateNavigator(vibrateCalls), () => {
    assert.equal(composer.isPlaying(), false);

    const result = composer.stop();
    assert.equal(result, true, "stop should return vibrate(0) result when available");
    assert.deepEqual(vibrateCalls, [0]);
    assert.equal(composer.isPlaying(), false);

    // Calling again is still safe — idempotent.
    const secondResult = composer.stop();
    assert.equal(secondResult, true);
    assert.deepEqual(vibrateCalls, [0, 0]);
  });
});

test("stop on a fresh composer returns false when navigator.vibrate is unavailable", () => {
  resetSettings();
  const composer = new RealtimeComposer();

  withNavigator({}, () => {
    assert.equal(composer.stop(), false);
    assert.equal(composer.isPlaying(), false);
  });
});

test("restart-after-stop: set -> stop -> set re-enters playing state with a fresh timer", () => {
  resetSettings();
  const composer = new RealtimeComposer();
  const vibrateCalls = [];

  withNavigator(vibrateNavigator(vibrateCalls), () => {
    withFakeTimers((timers) => {
      composer.set(0.5, 0.5);
      assert.equal(composer.isPlaying(), true);
      assert.equal(timers.scheduled.length, 1);

      composer.stop();
      assert.equal(composer.isPlaying(), false);

      // Re-arm the composer.
      const secondResult = composer.set(0.5, 0.5);
      assert.equal(secondResult, true);
      assert.equal(composer.isPlaying(), true);
      // A new timer is scheduled (separate from the stopped one).
      assert.equal(timers.scheduled.length, 2);

      // The fresh stop handler should be registered: Settings.stopHaptics()
      // tears down playback again.
      Settings.stopHaptics();
      assert.equal(composer.isPlaying(), false);
    });
  });
});

test("getCurrentValues defaults to 0.5/0.5 before any set", () => {
  resetSettings();
  const composer = new RealtimeComposer();

  assert.deepEqual(composer.getCurrentValues(), { intensity: 0.5, frequency: 0.5 });
});

test("getCurrentValues reflects clamped values even when haptics are unavailable", () => {
  resetSettings();
  const composer = new RealtimeComposer();

  withNavigator({}, () => {
    // No vibrate function: set returns false but values still update.
    const result = composer.set(1.5, -0.5);
    assert.equal(result, false);
    assert.deepEqual(composer.getCurrentValues(), { intensity: 1, frequency: 0 });
  });
});

test("isPlaying lifecycle: false at construction, true after set, false after stop", () => {
  resetSettings();
  const composer = new RealtimeComposer();
  const vibrateCalls = [];

  assert.equal(composer.isPlaying(), false);

  withNavigator(vibrateNavigator(vibrateCalls), () => {
    withFakeTimers(() => {
      composer.set(0.5, 0.5);
      assert.equal(composer.isPlaying(), true);

      composer.stop();
      assert.equal(composer.isPlaying(), false);
    });
  });
});

test("isPlaying stays false after a set call when navigator.vibrate is unavailable", () => {
  resetSettings();
  const composer = new RealtimeComposer();

  withNavigator({}, () => {
    composer.set(0.5, 0.5);
    assert.equal(composer.isPlaying(), false);
  });
});

test("Settings.stopHaptics invokes the composer's stop handler after set; not after stop", () => {
  resetSettings();
  const composer = new RealtimeComposer();
  const vibrateCalls = [];

  withNavigator(vibrateNavigator(vibrateCalls), () => {
    withFakeTimers(() => {
      composer.set(0.5, 0.5);
      assert.equal(composer.isPlaying(), true);

      // Settings.stopHaptics fires the registered handler -> composer should stop.
      Settings.stopHaptics();
      assert.equal(composer.isPlaying(), false);

      // After stop, the handler is unregistered. Vibrate calls should remain
      // unchanged from any further Settings.stopHaptics(0) (besides the
      // vibrate(0) Settings itself emits). Tracking via vibrate count:
      const callsBeforeSecondStop = vibrateCalls.length;
      Settings.stopHaptics();
      // Settings.stopHaptics() calls navigator.vibrate(0) directly (one entry),
      // but the composer handler should NOT have run (no extra side effect
      // such as a second vibrate(0) from the composer path).
      assert.equal(
        vibrateCalls.length,
        callsBeforeSecondStop + 1,
        "only Settings.stopHaptics' own vibrate(0) should have run — no composer handler"
      );
      assert.equal(vibrateCalls.at(-1), 0);
      assert.equal(composer.isPlaying(), false);
    });
  });
});

test("set returns false and calls navigator.vibrate(0) when haptics are disabled via Settings", () => {
  resetSettings();
  const composer = new RealtimeComposer();
  const vibrateCalls = [];

  withNavigator(vibrateNavigator(vibrateCalls), () => {
    withFakeTimers((timers) => {
      Settings.enableHaptics(false);
      try {
        const result = composer.set(0.5, 0.5);
        assert.equal(result, false);
        assert.equal(composer.isPlaying(), false);
        // stopInternal(true) is hit, which calls navigator.vibrate(0).
        assert.ok(
          vibrateCalls.includes(0),
          "expected stopInternal(true) to issue navigator.vibrate(0)"
        );
        // No tick was scheduled because the loop never started.
        assert.equal(timers.scheduled.length, 0);
      } finally {
        Settings.enableHaptics(true);
      }
    });
  });
});
