import test from "node:test";
import assert from "node:assert/strict";

import { AudioGenerator } from "../src/AudioGenerator.ts";
import { Preset } from "../src/Presets.ts";
import Settings from "../src/Settings.ts";

// ---------- local helpers ----------
// Tests reset globals & Settings in their own finally blocks to stay order-independent.
// We avoid relying on shared helper modules so this file is self-contained.

const SIMPLE_PATTERN = [{ type: "continuous", timestamp: 0, duration: 30 }];

function withNavigator(navigatorValue) {
  const original = Object.getOwnPropertyDescriptor(globalThis, "navigator");
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    writable: true,
    value: navigatorValue,
  });

  return () => {
    if (original) {
      Object.defineProperty(globalThis, "navigator", original);
    } else {
      delete globalThis.navigator;
    }
  };
}

function patchAudioGenerator(overrides) {
  const originals = {
    parse: AudioGenerator.prototype.parse,
    play: AudioGenerator.prototype.play,
    stop: AudioGenerator.prototype.stop,
    isPlaying: AudioGenerator.prototype.isPlaying,
  };

  for (const key of Object.keys(overrides)) {
    AudioGenerator.prototype[key] = overrides[key];
  }

  return () => {
    for (const key of Object.keys(originals)) {
      AudioGenerator.prototype[key] = originals[key];
    }
  };
}

function resetSettings() {
  Settings.enableHaptics(true);
  Settings.enableSound(true);
}

// ---------- constructor ----------

test("Preset constructor stores name and pattern and eagerly parses without touching AudioContext", () => {
  const restoreAudio = patchAudioGenerator({
    parse: async () => {
      throw new Error("constructor must not invoke AudioGenerator.parse");
    },
    play: async () => {
      throw new Error("constructor must not invoke AudioGenerator.play");
    },
  });

  // Sanity: there is no AudioContext on globalThis (Node has none by default).
  // Setting one and ensuring the constructor never touches it would only confirm absence;
  // instead we rely on the patched parse/play throwing if the constructor ever called them.
  try {
    const pattern = [{ type: "continuous", timestamp: 0, duration: 50 }];
    const preset = new Preset("eager", pattern);

    assert.equal(preset.name, "eager");
    assert.equal(preset.pattern, pattern, "pattern must be stored by reference");
    // Eagerly-parsed: verify by playing with a navigator that records the call.
    const calls = [];
    const restoreNav = withNavigator({
      vibrate: (parsed) => {
        calls.push(parsed);
        return true;
      },
    });

    try {
      preset.play();
      assert.equal(calls.length, 1, "composer must have parsed at construction so play uses parsed pattern");
      assert.deepEqual(calls[0], [50]);
    } finally {
      restoreNav();
    }
  } finally {
    restoreAudio();
    resetSettings();
  }
});

test("Preset fields are typed as readonly at runtime via direct property access", () => {
  const preset = new Preset("readonly-shape", SIMPLE_PATTERN);

  // Public readable properties (TypeScript-level readonly; runtime values still equal what was passed).
  assert.equal(preset.name, "readonly-shape");
  assert.deepEqual(preset.pattern, SIMPLE_PATTERN);
});

// ---------- play() — haptics-success path ----------

test("play returns haptics-success shape and skips audio even when soundEnabled is true", async () => {
  resetSettings();
  Settings.enableSound(true);

  const restoreNav = withNavigator({
    vibrate: () => true,
  });
  const restoreAudio = patchAudioGenerator({
    parse: async () => {
      throw new Error("audio must not be rendered when haptics succeed");
    },
    play: async () => {
      throw new Error("audio must not play when haptics succeed");
    },
  });

  try {
    const preset = new Preset("hap-ok", SIMPLE_PATTERN);
    const result = await preset.play();

    assert.deepEqual(result, {
      haptics: true,
      audio: false,
      usedAudioFallback: false,
    });
  } finally {
    restoreAudio();
    restoreNav();
    resetSettings();
  }
});

// ---------- play() — fallback to audio ----------

test("play falls back to audio rendering when haptics unavailable and soundEnabled=true", async () => {
  resetSettings();
  Settings.enableSound(true);

  const restoreNav = withNavigator({}); // navigator exists but no vibrate -> haptics unavailable
  let parseCalls = 0;
  let playCalls = 0;
  const fakeBuffer = { fake: "buffer" };
  const restoreAudio = patchAudioGenerator({
    parse: async () => {
      parseCalls += 1;
      return fakeBuffer;
    },
    play: async () => {
      playCalls += 1;
      return true;
    },
  });

  try {
    const preset = new Preset("hap-fail", SIMPLE_PATTERN);
    const result = await preset.play();

    assert.equal(parseCalls, 1, "audio parse must run exactly once on fallback");
    assert.equal(playCalls, 1, "audio play must run when fallback rendered a buffer");
    assert.deepEqual(result, {
      haptics: false,
      audio: true,
      usedAudioFallback: true,
    });
  } finally {
    restoreAudio();
    restoreNav();
    resetSettings();
  }
});

test("play skips audio entirely when haptics unavailable and soundEnabled=false", async () => {
  resetSettings();
  Settings.enableSound(false);

  const restoreNav = withNavigator({});
  const restoreAudio = patchAudioGenerator({
    parse: async () => {
      throw new Error("parse must not run when sound is disabled");
    },
    play: async () => {
      throw new Error("play must not run when sound is disabled");
    },
  });

  try {
    const preset = new Preset("no-sound", SIMPLE_PATTERN);
    const result = await preset.play();

    assert.deepEqual(result, {
      haptics: false,
      audio: false,
      usedAudioFallback: false,
    });
  } finally {
    restoreAudio();
    restoreNav();
    resetSettings();
  }
});

// ---------- play() — navigator.vibrate returns false (rejection) ----------

test("play treats navigator.vibrate returning false as a haptics failure and falls through to audio", async () => {
  // CONTRACT (asserted by this test):
  // composer.play() returns whatever navigator.vibrate() returns. If vibrate() returns
  // false (the browser-side rejection signal), didPlayHaptics is false and Preset
  // proceeds into the audio-fallback branch when soundEnabled is true.
  resetSettings();
  Settings.enableSound(true);

  const restoreNav = withNavigator({
    vibrate: () => false, // browser-side rejection
  });
  let parseCalls = 0;
  let playCalls = 0;
  const restoreAudio = patchAudioGenerator({
    parse: async () => {
      parseCalls += 1;
      return { fake: "buffer" };
    },
    play: async () => {
      playCalls += 1;
      return true;
    },
  });

  try {
    const preset = new Preset("vibrate-rejects", SIMPLE_PATTERN);
    const result = await preset.play();

    // Documented behavior: vibrate()===false propagates as didPlayHaptics=false,
    // which routes through the audio fallback path.
    assert.equal(parseCalls, 1, "audio fallback path runs when navigator.vibrate returns false");
    assert.equal(playCalls, 1);
    assert.deepEqual(result, {
      haptics: false,
      audio: true,
      usedAudioFallback: true,
    });
  } finally {
    restoreAudio();
    restoreNav();
    resetSettings();
  }
});

// ---------- play() — audioPrepared memoization ----------

test("play does not re-call AudioGenerator.parse on a second fallback when audio was already prepared", async () => {
  resetSettings();
  Settings.enableSound(true);

  const restoreNav = withNavigator({}); // haptics unavailable
  let parseCalls = 0;
  let playCalls = 0;
  const restoreAudio = patchAudioGenerator({
    parse: async () => {
      parseCalls += 1;
      return { fake: "buffer" };
    },
    play: async () => {
      playCalls += 1;
      return true;
    },
  });

  try {
    const preset = new Preset("memoized", SIMPLE_PATTERN);

    const first = await preset.play();
    const second = await preset.play();

    assert.equal(parseCalls, 1, "parse must only run on the first fallback");
    assert.equal(playCalls, 2, "play must run on each fallback attempt");
    assert.deepEqual(first, { haptics: false, audio: true, usedAudioFallback: true });
    assert.deepEqual(second, { haptics: false, audio: true, usedAudioFallback: true });
  } finally {
    restoreAudio();
    restoreNav();
    resetSettings();
  }
});

test("play latches audioPrepared even if the first render returned null — usedAudioFallback stays false on later calls", async () => {
  resetSettings();
  Settings.enableSound(true);

  const restoreNav = withNavigator({}); // haptics unavailable
  let parseCalls = 0;
  let playCalls = 0;
  const restoreAudio = patchAudioGenerator({
    parse: async () => {
      parseCalls += 1;
      return null; // simulates "audio unavailable in this env"
    },
    play: async () => {
      playCalls += 1;
      return true;
    },
  });

  try {
    const preset = new Preset("null-buffer", SIMPLE_PATTERN);

    const first = await preset.play();
    const second = await preset.play();
    const third = await preset.play();

    assert.equal(parseCalls, 1, "parse must only run once — audioPrepared latches even when buffer is null");
    assert.equal(playCalls, 0, "play must not run when renderedAudio is null");
    for (const result of [first, second, third]) {
      assert.deepEqual(result, {
        haptics: false,
        audio: false,
        usedAudioFallback: false,
      });
    }
  } finally {
    restoreAudio();
    restoreNav();
    resetSettings();
  }
});

// ---------- play() — stop ordering ----------

test("play stops in-flight audio as its very first action (audio.stop runs before any other audio call)", async () => {
  resetSettings();
  Settings.enableSound(true);

  // Use the haptics-success branch so we can isolate the stop() call without parse()/play()
  // muddying the ordering. The contract under test is "play() calls audioGenerator.stop()
  // before doing anything else".
  const restoreNav = withNavigator({
    vibrate: () => true,
  });

  const order = [];
  const restoreAudio = patchAudioGenerator({
    parse: async function patchedParse(pattern) {
      order.push("parse");
      return { fake: "buffer" };
    },
    play: async function patchedPlay() {
      order.push("play");
      return true;
    },
    stop: function patchedStop() {
      order.push("stop");
      return false;
    },
  });

  try {
    const preset = new Preset("stop-first", SIMPLE_PATTERN);

    // Haptics-succeed path: only stop() should be called on the audio side, and it must be first.
    const hapticResult = await preset.play();
    assert.deepEqual(hapticResult, { haptics: true, audio: false, usedAudioFallback: false });
    assert.deepEqual(order, ["stop"], "audio.stop is the only audio call on the haptics-success path");
  } finally {
    restoreAudio();
    restoreNav();
    resetSettings();
  }
});

test("play calls audio.stop before audio.parse and audio.play on the fallback path", async () => {
  resetSettings();
  Settings.enableSound(true);

  const restoreNav = withNavigator({}); // haptics unavailable -> fallback path

  const order = [];
  const restoreAudio = patchAudioGenerator({
    parse: async function patchedParse() {
      order.push("parse");
      return { fake: "buffer" };
    },
    play: async function patchedPlay() {
      order.push("play");
      return true;
    },
    stop: function patchedStop() {
      order.push("stop");
      return false;
    },
  });

  try {
    const preset = new Preset("stop-order", SIMPLE_PATTERN);
    await preset.play();

    assert.deepEqual(order, ["stop", "parse", "play"], "stop must precede parse and play");
  } finally {
    restoreAudio();
    restoreNav();
    resetSettings();
  }
});

// ---------- stop() ----------

test("stop returns false when no audio is currently playing", () => {
  const preset = new Preset("idle", SIMPLE_PATTERN);

  assert.equal(preset.stop(), false);
});

test("stop returns true when audio is in flight and does NOT call navigator.vibrate(0)", async () => {
  resetSettings();
  Settings.enableSound(true);

  const vibrateCalls = [];
  const restoreNav = withNavigator({
    vibrate: (arg) => {
      vibrateCalls.push(arg);
      // Return false from vibrate so play() falls back to audio.
      return false;
    },
  });

  // Simulate an "audio is currently playing" state by patching stop() to mimic a live source.
  // We park a long-running play() promise so stop() can observe currentSource as set.
  let audioRunning = false;
  let resolvePlay;
  const restoreAudio = patchAudioGenerator({
    parse: async () => ({ fake: "buffer" }),
    play: async function patchedPlay() {
      audioRunning = true;
      // Never resolves — simulates an audio buffer still playing.
      return new Promise((resolve) => {
        resolvePlay = resolve;
      });
    },
    stop: function patchedStop() {
      if (!audioRunning) return false;
      audioRunning = false;
      return true;
    },
    isPlaying: function patchedIsPlaying() {
      return audioRunning;
    },
  });

  try {
    const preset = new Preset("stop-true", SIMPLE_PATTERN);
    // Kick off play but do not await — audio "plays" indefinitely until we stop it.
    const playPromise = preset.play();
    // Yield once to let the audio.play() patched body run and flip audioRunning to true.
    await Promise.resolve();
    await Promise.resolve();

    assert.equal(audioRunning, true, "patched audio.play should have started by now");

    const vibrateCallsBeforeStop = vibrateCalls.length;
    const stopped = preset.stop();

    assert.equal(stopped, true, "stop must return true while audio is in flight");
    assert.equal(
      vibrateCalls.length,
      vibrateCallsBeforeStop,
      "Preset.stop must NOT call navigator.vibrate(0) — that's Presets/Settings's job",
    );

    // Resolve the parked play() promise to avoid leaving a dangling promise.
    if (typeof resolvePlay === "function") {
      resolvePlay(true);
    }
    await playPromise;
  } finally {
    restoreAudio();
    restoreNav();
    resetSettings();
  }
});
