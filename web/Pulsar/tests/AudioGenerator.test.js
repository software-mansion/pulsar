import test from "node:test";
import assert from "node:assert/strict";

import { AudioGenerator } from "../src/AudioGenerator.ts";
import Settings from "../src/Settings.ts";

const originalAudioContext = globalThis.AudioContext;
const originalOfflineAudioContext = globalThis.OfflineAudioContext;
const originalWebkitAudioContext = globalThis.webkitAudioContext;

const createdOfflineContexts = [];

class MockAudioBufferSourceNode {
  constructor() {
    this.buffer = null;
    this.onended = null;
    this.connectedTo = null;
    this.started = false;
    this.stopped = false;
  }

  connect(node) {
    this.connectedTo = node;
  }

  start() {
    this.started = true;
    queueMicrotask(() => {
      if (this.onended) {
        this.onended();
      }
    });
  }

  stop() {
    this.stopped = true;
  }
}

class MockAudioContext {
  constructor() {
    this.destination = { name: "destination" };
    this.state = "running";
    this.sampleRate = 44100;
    this.createdSources = [];
  }

  async resume() {}

  createBufferSource() {
    const source = new MockAudioBufferSourceNode();
    this.createdSources.push(source);
    return source;
  }
}

class MockAudioParam {
  constructor() {
    this.calls = [];
    this.value = 0;
  }

  setValueAtTime(value, time) {
    this.calls.push({ method: "setValueAtTime", value, time });
    this.value = value;
  }

  linearRampToValueAtTime(value, time) {
    this.calls.push({ method: "linearRampToValueAtTime", value, time });
    this.value = value;
  }

  exponentialRampToValueAtTime(value, time) {
    this.calls.push({ method: "exponentialRampToValueAtTime", value, time });
    this.value = value;
  }
}

class MockGainNode {
  constructor() {
    this.gain = new MockAudioParam();
    this.connectedTo = null;
  }

  connect(node) {
    this.connectedTo = node;
  }
}

class MockBiquadFilterNode {
  constructor() {
    this.type = "lowpass";
    this.frequency = new MockAudioParam();
    this.Q = new MockAudioParam();
    this.connectedTo = null;
  }

  connect(node) {
    this.connectedTo = node;
  }
}

class MockOscillatorNode {
  constructor() {
    this.type = "sine";
    this.frequency = new MockAudioParam();
    this.connectedTo = null;
    this.startTime = null;
    this.stopTime = null;
  }

  connect(node) {
    this.connectedTo = node;
  }

  start(time) {
    this.startTime = time;
  }

  stop(time) {
    this.stopTime = time;
  }
}

class MockOfflineAudioContext {
  constructor(numberOfChannels, length, sampleRate) {
    this.numberOfChannels = numberOfChannels;
    this.length = length;
    this.sampleRate = sampleRate;
    this.currentTime = 0;
    this.destination = { name: "offline-destination" };
    this.createdOscillators = [];
    this.renderedBuffer = {
      duration: length / sampleRate,
      sampleRate,
      length,
      numberOfChannels,
    };

    createdOfflineContexts.push(this);
  }

  createGain() {
    return new MockGainNode();
  }

  createBiquadFilter() {
    return new MockBiquadFilterNode();
  }

  createOscillator() {
    const oscillator = new MockOscillatorNode();
    this.createdOscillators.push(oscillator);
    return oscillator;
  }

  async startRendering() {
    return this.renderedBuffer;
  }
}

const installAudioMocks = () => {
  createdOfflineContexts.length = 0;
  globalThis.AudioContext = MockAudioContext;
  globalThis.webkitAudioContext = undefined;
  globalThis.OfflineAudioContext = MockOfflineAudioContext;
};

const restoreAudioMocks = () => {
  globalThis.AudioContext = originalAudioContext;
  globalThis.webkitAudioContext = originalWebkitAudioContext;
  globalThis.OfflineAudioContext = originalOfflineAudioContext;
};

test("parse returns null when Web Audio is unavailable", async () => {
  restoreAudioMocks();
  const generator = new AudioGenerator();

  const buffer = await generator.parse([
    { type: "continuous", timestamp: 0, duration: 100 },
  ]);

  assert.equal(buffer, null);
  assert.equal(generator.getBufferInfo(), null);
});

test("parse renders audio intervals that match continuous haptics timing", async () => {
  installAudioMocks();
  const generator = new AudioGenerator();

  const buffer = await generator.parse([
    { type: "continuous", timestamp: 50, duration: 120 },
  ]);

  try {
    assert.ok(buffer);
    assert.equal(createdOfflineContexts.length, 1);

    const oscillators = createdOfflineContexts[0].createdOscillators;
    assert.equal(oscillators.length, 3);

    for (const oscillator of oscillators) {
      assert.equal(oscillator.startTime, 0.05);
      assert.equal(oscillator.stopTime, 0.17);
    }
  } finally {
    restoreAudioMocks();
  }
});

test("parse follows the same PWM shot cadence as pulse haptics", async () => {
  installAudioMocks();
  const generator = new AudioGenerator();

  await generator.parse([
    { type: "pulse", timestamp: 0, duration: 200, intensity: 0, frequency: 1 },
  ]);

  try {
    const oscillators = createdOfflineContexts[0].createdOscillators;
    assert.equal(oscillators.length, 15);

    const shotStartTimes = oscillators
      .filter((_, index) => index % 3 === 0)
      .map((oscillator) => oscillator.startTime);

    assert.deepEqual(shotStartTimes, [0, 0.04, 0.08, 0.12, 0.16]);
  } finally {
    restoreAudioMocks();
  }
});

test("play respects the global sound setting", async () => {
  installAudioMocks();
  const generator = new AudioGenerator();
  Settings.enableSound(false);

  try {
    await generator.parse([{ type: "continuous", timestamp: 0, duration: 100 }]);

    assert.equal(await generator.play(), false);
  } finally {
    Settings.enableSound(true);
    restoreAudioMocks();
  }
});

test("play starts audio playback from the rendered buffer", async () => {
  installAudioMocks();
  const generator = new AudioGenerator();

  try {
    await generator.parse([{ type: "continuous", timestamp: 0, duration: 100 }]);
    assert.equal(generator.isPlaying(), false);

    const didPlay = await generator.play();

    assert.equal(didPlay, true);
    assert.equal(generator.isPlaying(), false);
    assert.equal(generator.getBufferInfo()?.channels, 1);
  } finally {
    restoreAudioMocks();
  }
});

test("stop cancels the current source when audio is playing", async () => {
  installAudioMocks();
  const generator = new AudioGenerator();

  try {
    await generator.parse([{ type: "continuous", timestamp: 0, duration: 100 }]);

    const playPromise = generator.play();
    const currentSource = generator.audioContext?.createdSources?.[0];
    const didStop = generator.stop();

    assert.equal(didStop, true);
    assert.equal(currentSource?.stopped, true);

    await playPromise;
  } finally {
    restoreAudioMocks();
  }
});
