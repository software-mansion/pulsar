import test from "node:test";
import assert from "node:assert/strict";

import { Pulsar } from "../src/Pulsar.ts";
import { AudioGenerator } from "../src/AudioGenerator.ts";
import Settings from "../src/Settings.ts";
import {
  withNavigator,
  withoutNavigator,
  makeVibrateRecorder,
} from "./helpers/navigator.js";
import { withAudioMocks } from "./helpers/audio-mocks.js";
import { resetSettings, trackStopHandlers } from "./helpers/reset-settings.js";
import { withFakeTimers } from "./helpers/fake-timers.js";

test.beforeEach(() => {
  resetSettings();
});

test("Pulsar.getPresets().play('tap') dispatches the parsed pattern through navigator.vibrate", async () => {
  const { navigator, calls } = makeVibrateRecorder();

  await withNavigator(navigator, async () => {
    const pulsar = new Pulsar();
    const result = await pulsar.getPresets().play("tap");

    // Built-in "tap" preset is a single continuous 30ms segment.
    assert.deepEqual(calls, [[30]]);
    assert.deepEqual(result, {
      haptics: true,
      audio: false,
      usedAudioFallback: false,
    });
  });
});

test("Pulsar.getPresets().play('tap') falls back to AudioGenerator when navigator.vibrate is unavailable", async () => {
  const originalParse = AudioGenerator.prototype.parse;
  const originalPlay = AudioGenerator.prototype.play;
  const parseCalls = [];
  let playCalls = 0;

  AudioGenerator.prototype.parse = async function patched(pattern) {
    parseCalls.push(pattern);
    return { fake: true };
  };
  AudioGenerator.prototype.play = async function patched() {
    playCalls += 1;
    return true;
  };

  try {
    await withNavigator({}, async () => {
      const pulsar = new Pulsar();
      const result = await pulsar.getPresets().play("tap");

      assert.deepEqual(result, {
        haptics: false,
        audio: true,
        usedAudioFallback: true,
      });
      assert.equal(parseCalls.length, 1);
      assert.equal(playCalls, 1);
      // The parsed pattern passed to AudioGenerator is the original HapticPattern,
      // i.e. the built-in tap definition (a continuous 30ms segment at t=0).
      assert.deepEqual(parseCalls[0], [
        { type: "continuous", timestamp: 0, duration: 30 },
      ]);
    });
  } finally {
    AudioGenerator.prototype.parse = originalParse;
    AudioGenerator.prototype.play = originalPlay;
  }
});

test("Settings.enableHaptics(false) stops an active RealtimeComposer via the registered stop handler", async () => {
  const { navigator } = makeVibrateRecorder();

  await withNavigator(navigator, async () => {
    await withFakeTimers(async () => {
      const pulsar = new Pulsar();
      const realtime = pulsar.getRealtimeComposer();

      const started = realtime.set(0.5, 0.5);
      assert.equal(started, true);
      assert.equal(realtime.isPlaying(), true);

      // Disabling haptics globally must fire the stop handler that
      // RealtimeComposer registered with Settings, which flips playing→false.
      Settings.enableHaptics(false);

      assert.equal(realtime.isPlaying(), false);
    });
  });
});

test("PatternComposer.stop() invokes externally-registered stop handlers via Settings.stopHaptics()", async () => {
  const { navigator } = makeVibrateRecorder();
  const tracker = trackStopHandlers();
  let handlerCalls = 0;

  try {
    await withNavigator(navigator, async () => {
      tracker.register(() => {
        handlerCalls += 1;
      });

      const pulsar = new Pulsar();
      const composer = pulsar.getPatternComposer();
      composer.parse([{ type: "continuous", timestamp: 0, duration: 30 }]);

      composer.stop();
      assert.equal(handlerCalls, 1);
    });
  } finally {
    tracker.unregisterAll();
  }
});

test("Pulsar.stopHaptics() fires every registered handler and returns navigator.vibrate(0)'s result", async () => {
  const { navigator, calls } = makeVibrateRecorder({ result: true });
  const tracker = trackStopHandlers();
  let manualHandlerCalls = 0;

  try {
    await withNavigator(navigator, async () => {
      await withFakeTimers(async () => {
        const pulsar = new Pulsar();
        const realtime = pulsar.getRealtimeComposer();

        // Activate the RealtimeComposer so its own stop handler is registered.
        realtime.set(0.7, 0.3);
        assert.equal(realtime.isPlaying(), true);

        // Register a separate manual handler.
        tracker.register(() => {
          manualHandlerCalls += 1;
        });

        const result = pulsar.stopHaptics();

        // Manual handler ran.
        assert.equal(manualHandlerCalls, 1);
        // RealtimeComposer stop handler ran — loop is no longer playing.
        assert.equal(realtime.isPlaying(), false);
        // Last navigator.vibrate call must be vibrate(0) (the cancel call).
        assert.equal(calls[calls.length - 1], 0);
        // Return value reflects navigator.vibrate(0)'s result (true here).
        assert.equal(result, true);
      });
    });
  } finally {
    tracker.unregisterAll();
  }
});

test("SSR safety: Pulsar can be constructed and queried with no navigator and no AudioContext", async () => {
  await withoutNavigator(async () => {
    // No audio mocks installed at all — neither AudioContext nor OfflineAudioContext.
    // This is the true SSR (Node-like) environment.
    let pulsar;
    assert.doesNotThrow(() => {
      pulsar = new Pulsar();
    });

    let presets;
    assert.doesNotThrow(() => {
      presets = pulsar.getPresets();
    });
    assert.ok(presets, "getPresets() must return a registry instance in SSR");

    let realtime;
    assert.doesNotThrow(() => {
      realtime = pulsar.getRealtimeComposer();
    });
    assert.ok(realtime, "getRealtimeComposer() must return an instance in SSR");

    assert.equal(pulsar.isHapticsSupported(), false);
  });
});
