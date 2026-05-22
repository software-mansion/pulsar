import test from "node:test";
import assert from "node:assert/strict";

import { AudioGenerator } from "../src/AudioGenerator.ts";
import { Presets } from "../src/Presets.ts";
import Settings from "../src/Settings.ts";

test("list returns the builtin preset names", () => {
  const presets = new Presets();

  assert.deepEqual(presets.list(), ["tap", "doubleTap", "success", "warning", "heartbeat"]);
});

test("get returns a cloned pattern for the requested preset", () => {
  const presets = new Presets();

  const first = presets.get("tap");
  const second = presets.get("tap");

  assert.notEqual(first, second);
  assert.notEqual(first[0], second[0]);
  assert.deepEqual(first, [{ type: "continuous", timestamp: 0, duration: 35 }]);
});

test("play uses haptics as the primary path when vibration is available", async () => {
  const presets = new Presets();
  const calls = [];
  const originalNavigator = globalThis.navigator;
  const originalParse = AudioGenerator.prototype.parse;
  const originalPlay = AudioGenerator.prototype.play;

  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: {
      vibrate: (pattern) => {
        calls.push(pattern);
        return true;
      },
    },
  });

  AudioGenerator.prototype.parse = async () => {
    throw new Error("audio fallback should not be generated when haptics succeed");
  };

  AudioGenerator.prototype.play = async () => {
    throw new Error("audio fallback should not play when haptics succeed");
  };

  try {
    const result = await presets.play("doubleTap");

    assert.deepEqual(result, {
      haptics: true,
      audio: false,
      usedAudioFallback: false,
    });
    assert.deepEqual(calls, [[30, 60, 30]]);
  } finally {
    AudioGenerator.prototype.parse = originalParse;
    AudioGenerator.prototype.play = originalPlay;
    Object.defineProperty(globalThis, "navigator", {
      configurable: true,
      value: originalNavigator,
    });
  }
});

test("play falls back to generated audio when haptics cannot start", async () => {
  const presets = new Presets();
  const originalNavigator = globalThis.navigator;
  const originalParse = AudioGenerator.prototype.parse;
  const originalPlay = AudioGenerator.prototype.play;
  const parseCalls = [];
  let playCalls = 0;

  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: {},
  });

  AudioGenerator.prototype.parse = async (pattern) => {
    parseCalls.push(pattern);
    return { fake: true };
  };

  AudioGenerator.prototype.play = async () => {
    playCalls += 1;
    return true;
  };

  try {
    const result = await presets.play("tap");

    assert.deepEqual(result, {
      haptics: false,
      audio: true,
      usedAudioFallback: true,
    });
    assert.equal(parseCalls.length, 1);
    assert.equal(playCalls, 1);
  } finally {
    AudioGenerator.prototype.parse = originalParse;
    AudioGenerator.prototype.play = originalPlay;
    Object.defineProperty(globalThis, "navigator", {
      configurable: true,
      value: originalNavigator,
    });
  }
});

test("play respects the sound setting and does not start audio fallback when sound is disabled", async () => {
  const presets = new Presets();
  const originalNavigator = globalThis.navigator;
  const originalParse = AudioGenerator.prototype.parse;
  const originalPlay = AudioGenerator.prototype.play;

  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: {},
  });

  Settings.enableSound(false);

  AudioGenerator.prototype.parse = async () => {
    throw new Error("audio generation should not start when sound is disabled");
  };

  AudioGenerator.prototype.play = async () => {
    throw new Error("audio playback should not start when sound is disabled");
  };

  try {
    const result = await presets.play("tap");

    assert.deepEqual(result, {
      haptics: false,
      audio: false,
      usedAudioFallback: false,
    });
  } finally {
    Settings.enableSound(true);
    AudioGenerator.prototype.parse = originalParse;
    AudioGenerator.prototype.play = originalPlay;
    Object.defineProperty(globalThis, "navigator", {
      configurable: true,
      value: originalNavigator,
    });
  }
});

test("get throws for unknown preset names", () => {
  const presets = new Presets();

  assert.throws(() => presets.get("missing"), {
    message: "Unknown haptic preset: missing",
  });
});
