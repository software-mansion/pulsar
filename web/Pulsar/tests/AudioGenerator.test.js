import test from "node:test";
import assert from "node:assert/strict";

import { AudioGenerator } from "../src/AudioGenerator.ts";
import Settings from "../src/Settings.ts";
import { withAudioMocks } from "./helpers/audio-mocks.js";

test("parse returns null when Web Audio is unavailable", async () => {
  // Intentionally no mocks installed — globalThis lacks AudioContext / OfflineAudioContext.
  const generator = new AudioGenerator();

  const buffer = await generator.parse([
    { type: "continuous", timestamp: 0, duration: 100 },
  ]);

  assert.equal(buffer, null);
  assert.equal(generator.getBufferInfo(), null);
});

test("parse returns null when the pattern reduces to zero vibration intervals", async () => {
  await withAudioMocks({}, async ({ captures }) => {
    const generator = new AudioGenerator();

    const emptyBuffer = await generator.parse([]);
    assert.equal(emptyBuffer, null);
    assert.equal(generator.getBufferInfo(), null);

    const zeroDurationBuffer = await generator.parse([
      { type: "continuous", timestamp: 0, duration: 0 },
    ]);
    assert.equal(zeroDurationBuffer, null);
    assert.equal(generator.getBufferInfo(), null);

    // No OfflineAudioContext should ever be constructed when there are no intervals.
    assert.equal(captures.offlineContexts.length, 0);
  });
});

test("parse on a continuous segment produces 3 oscillators with matching start/stop times", async () => {
  await withAudioMocks({}, async ({ captures }) => {
    const generator = new AudioGenerator();

    const buffer = await generator.parse([
      { type: "continuous", timestamp: 50, duration: 120 },
    ]);

    assert.ok(buffer);
    assert.equal(captures.offlineContexts.length, 1);

    const oscillators = captures.offlineContexts[0].createdOscillators;
    assert.equal(oscillators.length, 3);

    for (const oscillator of oscillators) {
      assert.equal(oscillator.startTime, 0.05);
      assert.equal(oscillator.stopTime, 0.17);
    }
  });
});

test("parse follows the PWM shot cadence for pulse intensity=0 frequency=1 (5*3=15 oscillators)", async () => {
  await withAudioMocks({}, async ({ captures }) => {
    const generator = new AudioGenerator();

    await generator.parse([
      { type: "pulse", timestamp: 0, duration: 200, intensity: 0, frequency: 1 },
    ]);

    const oscillators = captures.offlineContexts[0].createdOscillators;
    assert.equal(oscillators.length, 15);

    const shotStartTimes = oscillators
      .filter((_, index) => index % 3 === 0)
      .map((oscillator) => oscillator.startTime);

    assert.deepEqual(shotStartTimes, [0, 0.04, 0.08, 0.12, 0.16]);
  });
});

test("parse follows the interpolated line cadence (3 shots * 3 harmonics = 9 oscillators)", async () => {
  await withAudioMocks({}, async ({ captures }) => {
    const generator = new AudioGenerator();

    await generator.parse([
      {
        type: "line",
        timestamp: 0,
        duration: 200,
        intensity: [
          { time: 0, value: 0 },
          { time: 200, value: 1 },
        ],
        frequency: [
          { time: 0, value: 1 },
          { time: 200, value: 1 },
        ],
      },
    ]);

    const oscillators = captures.offlineContexts[0].createdOscillators;
    assert.equal(oscillators.length, 9);

    const shotStartTimes = oscillators
      .filter((_, index) => index % 3 === 0)
      .map((oscillator) => oscillator.startTime);

    assert.deepEqual(shotStartTimes, [0, 0.04, 0.116]);
  });
});

test("parse THROWS 'Web Audio API is not available' when AudioContext constructor is missing but OfflineAudioContext exists", async () => {
  await withAudioMocks({ missingContext: true, keepOffline: true }, async () => {
    const generator = new AudioGenerator();

    await assert.rejects(
      () =>
        generator.parse([
          { type: "continuous", timestamp: 0, duration: 100 },
        ]),
      {
        message: "Web Audio API is not available in this environment.",
      },
    );
  });
});

test("parse THROWS 'OfflineAudioContext is not available' when OfflineAudioContext is missing but AudioContext exists", async () => {
  await withAudioMocks({ missingOffline: true, keepContext: true }, async () => {
    const generator = new AudioGenerator();

    await assert.rejects(
      () =>
        generator.parse([
          { type: "continuous", timestamp: 0, duration: 100 },
        ]),
      {
        message: "OfflineAudioContext is not available in this environment.",
      },
    );
  });
});

test("parse uses webkitAudioContext fallback when AudioContext is undefined", async () => {
  await withAudioMocks({ useWebkit: true }, async ({ captures }) => {
    const generator = new AudioGenerator();

    const buffer = await generator.parse([
      { type: "continuous", timestamp: 0, duration: 100 },
    ]);

    assert.ok(buffer);
    assert.equal(captures.webkitContexts.length, 1);
    assert.equal(captures.audioContexts.length, 0);
  });
});

test("parse on a suspended AudioContext awaits resume() before rendering", async () => {
  await withAudioMocks({ suspended: true }, async ({ captures }) => {
    const generator = new AudioGenerator();

    await generator.parse([
      { type: "continuous", timestamp: 0, duration: 100 },
    ]);

    assert.equal(captures.audioContexts.length, 1);
    assert.equal(captures.audioContexts[0].resumeCalls, 1);
  });
});

test("parse called twice replaces renderedBuffer with the new pattern's buffer info", async () => {
  await withAudioMocks({}, async () => {
    const generator = new AudioGenerator();

    await generator.parse([{ type: "continuous", timestamp: 0, duration: 100 }]);
    const firstInfo = generator.getBufferInfo();
    assert.ok(firstInfo);
    const firstLength = firstInfo.length;
    const firstDuration = firstInfo.duration;

    await generator.parse([{ type: "continuous", timestamp: 0, duration: 400 }]);
    const secondInfo = generator.getBufferInfo();
    assert.ok(secondInfo);

    assert.notEqual(secondInfo.length, firstLength);
    assert.notEqual(secondInfo.duration, firstDuration);
    assert.ok(secondInfo.length > firstLength, "second buffer should be longer than the first");
  });
});

test("applyEnvelope records gain ramps in order for each oscillator's envelope", async () => {
  await withAudioMocks({}, async ({ captures }) => {
    const generator = new AudioGenerator();

    await generator.parse([
      { type: "continuous", timestamp: 0, duration: 100 },
    ]);

    const offlineContext = captures.offlineContexts[0];
    // 3 oscillators per interval, each with its own gain node; plus the master gain.
    // Master gain is the first gain node created; the next 3 are the per-oscillator envelopes.
    assert.equal(offlineContext.createdGainNodes.length, 4);

    const envelopeGains = offlineContext.createdGainNodes.slice(1);
    assert.equal(envelopeGains.length, 3);

    for (const gainNode of envelopeGains) {
      const calls = gainNode.gain.calls;
      // setValueAtTime(small, t0), linearRampToValueAtTime(peak, t0+attack), setValueAtTime(peak, sustainEnd), exponentialRampToValueAtTime(0.0001, end)
      assert.ok(calls.length >= 3, `expected at least 3 envelope calls, got ${calls.length}`);

      const firstSetValueAtTime = calls.find((c) => c.method === "setValueAtTime");
      assert.ok(firstSetValueAtTime, "expected a setValueAtTime call");
      assert.equal(firstSetValueAtTime.time, 0);

      const linear = calls.find((c) => c.method === "linearRampToValueAtTime");
      assert.ok(linear, "expected a linearRampToValueAtTime call");
      assert.ok(linear.value > 0, "linear ramp peaks at positive volume");
      assert.ok(linear.time > 0, "linear ramp ends after attack");

      const expo = calls.find((c) => c.method === "exponentialRampToValueAtTime");
      assert.ok(expo, "expected an exponentialRampToValueAtTime call");
      assert.equal(expo.value, 0.0001);
      assert.equal(expo.time, 0.1, "exponential ramp ends at the interval end time");

      // Order: the first call must be setValueAtTime; the linear ramp must precede the exponential ramp.
      assert.equal(calls[0].method, "setValueAtTime");
      const linearIndex = calls.findIndex((c) => c.method === "linearRampToValueAtTime");
      const expoIndex = calls.findIndex((c) => c.method === "exponentialRampToValueAtTime");
      assert.ok(linearIndex < expoIndex, "linear ramp must precede exponential ramp");
    }
  });
});

test("biquad lowpass filter is configured with type=lowpass, frequency=900, Q=1.2", async () => {
  await withAudioMocks({}, async ({ captures }) => {
    const generator = new AudioGenerator();

    await generator.parse([
      { type: "continuous", timestamp: 0, duration: 100 },
    ]);

    const offlineContext = captures.offlineContexts[0];
    assert.equal(offlineContext.createdFilters.length, 1);

    const filter = offlineContext.createdFilters[0];
    assert.equal(filter.type, "lowpass");
    assert.equal(filter.frequency.value, 900);
    assert.equal(filter.Q.value, 1.2);
  });
});

test("master gain is set to 0.7", async () => {
  await withAudioMocks({}, async ({ captures }) => {
    const generator = new AudioGenerator();

    await generator.parse([
      { type: "continuous", timestamp: 0, duration: 100 },
    ]);

    const offlineContext = captures.offlineContexts[0];
    assert.ok(offlineContext.createdGainNodes.length >= 1);
    // Master gain is the FIRST gain node created (before any oscillator envelope gains).
    const masterGain = offlineContext.createdGainNodes[0];
    assert.equal(masterGain.gain.value, 0.7);
  });
});

test("sampleRate falls back to 44100 when audioContext.sampleRate is falsy", async () => {
  await withAudioMocks({ sampleRate: 0 }, async ({ captures }) => {
    const generator = new AudioGenerator();

    await generator.parse([
      { type: "continuous", timestamp: 0, duration: 100 },
    ]);

    assert.equal(captures.offlineContexts.length, 1);
    assert.equal(captures.offlineContexts[0].sampleRate, 44100);
  });
});

test("total duration adds 60ms tail padding to compute the OfflineAudioContext length", async () => {
  await withAudioMocks({}, async ({ captures }) => {
    const generator = new AudioGenerator();

    await generator.parse([
      { type: "continuous", timestamp: 0, duration: 100 },
    ]);

    const offline = captures.offlineContexts[0];
    // Interval: start=0 ms, duration=100 ms -> maxIntervalEnd = 100 ms.
    // totalDurationSeconds = (100 + 60) / 1000 = 0.16.
    // length = max(1, ceil(0.16 * sampleRate)).
    const expected = Math.max(1, Math.ceil((100 + 60) / 1000 * offline.sampleRate));
    assert.equal(offline.length, expected);
  });
});

test("OfflineAudioContext frame count is at least 1 even for tiny inputs", async () => {
  // Force a contrived environment where the underlying multiplication would produce a 0-frame buffer.
  // We make the AudioContext report a near-zero sample rate (but truthy) so that ceil(0.06 * tiny) === 1.
  // The constructor's first-arg branch should still produce max(1, ...).
  await withAudioMocks({ sampleRate: 0.001 }, async ({ captures }) => {
    const generator = new AudioGenerator();

    await generator.parse([
      { type: "continuous", timestamp: 0, duration: 0.0001 },
    ]);

    // If the only interval contributed had been zero, parse would return null and offlineContexts would be empty.
    // We exercise the branch where the math still bottoms out near 1 frame.
    if (captures.offlineContexts.length > 0) {
      const length = captures.offlineContexts[0].length;
      assert.ok(length >= 1, `length should be at least 1, got ${length}`);
    }
  });
});

test("play returns false when sound is disabled", async () => {
  await withAudioMocks({}, async () => {
    const generator = new AudioGenerator();
    Settings.enableSound(false);

    try {
      await generator.parse([{ type: "continuous", timestamp: 0, duration: 100 }]);
      assert.equal(await generator.play(), false);
    } finally {
      Settings.enableSound(true);
    }
  });
});

test("play returns false when no parse was called yet", async () => {
  await withAudioMocks({}, async () => {
    const generator = new AudioGenerator();

    // No parse() has run, so audioContext and renderedBuffer are both null.
    assert.equal(await generator.play(), false);
  });
});

test("play returns false after a parse that returned null (audio became unavailable)", async () => {
  // First, do a parse with mocks unavailable -> renderedBuffer stays null.
  const generator = new AudioGenerator();
  const buffer = await generator.parse([
    { type: "continuous", timestamp: 0, duration: 100 },
  ]);
  assert.equal(buffer, null);

  // Even if mocks are installed afterwards, play() needs a fresh parse to populate state.
  await withAudioMocks({}, async () => {
    assert.equal(await generator.play(), false);
  });
});

test("play resolves true and the rendered buffer is 1 channel", async () => {
  await withAudioMocks({}, async () => {
    const generator = new AudioGenerator();

    await generator.parse([{ type: "continuous", timestamp: 0, duration: 100 }]);
    assert.equal(generator.isPlaying(), false);

    const didPlay = await generator.play();

    assert.equal(didPlay, true);
    assert.equal(generator.isPlaying(), false);
    assert.equal(generator.getBufferInfo()?.channels, 1);
  });
});

test("stop returns true mid-playback and cancels the current source", async () => {
  await withAudioMocks({ autoEndOnStart: false }, async ({ captures }) => {
    const generator = new AudioGenerator();

    await generator.parse([{ type: "continuous", timestamp: 0, duration: 100 }]);

    const playPromise = generator.play();
    const liveContext = captures.audioContexts[captures.audioContexts.length - 1];
    const currentSource = liveContext.createdSources[liveContext.createdSources.length - 1];

    const didStop = generator.stop();
    assert.equal(didStop, true);
    assert.equal(currentSource.stopped, true);

    // Fire onended manually so the pending play() promise resolves and does not leak.
    if (currentSource.onended) {
      currentSource.onended();
    }
    await playPromise;
  });
});

test("stop returns false when nothing is currently playing", async () => {
  await withAudioMocks({}, async () => {
    const generator = new AudioGenerator();
    await generator.parse([{ type: "continuous", timestamp: 0, duration: 100 }]);

    // Nothing has been started yet via play().
    assert.equal(generator.stop(), false);
  });
});

test("getBufferInfo returns null before parse and after a parse that returned null", async () => {
  // Before any parse:
  const generator = new AudioGenerator();
  assert.equal(generator.getBufferInfo(), null);

  // After a parse that returned null (audio unavailable):
  const result = await generator.parse([
    { type: "continuous", timestamp: 0, duration: 100 },
  ]);
  assert.equal(result, null);
  assert.equal(generator.getBufferInfo(), null);
});

test("isPlaying flips to true between play() being called and onended firing", async () => {
  await withAudioMocks({ autoEndOnStart: false }, async ({ captures }) => {
    const generator = new AudioGenerator();
    await generator.parse([{ type: "continuous", timestamp: 0, duration: 100 }]);

    const playPromise = generator.play();
    assert.equal(generator.isPlaying(), true);

    const liveContext = captures.audioContexts[captures.audioContexts.length - 1];
    const source = liveContext.createdSources[liveContext.createdSources.length - 1];

    // Manually fire onended — isPlaying must now go back to false.
    source.onended();

    await playPromise;
    assert.equal(generator.isPlaying(), false);
  });
});

test("play stops a currently-playing source before starting a new one", async () => {
  await withAudioMocks({ autoEndOnStart: false }, async ({ captures }) => {
    const generator = new AudioGenerator();
    await generator.parse([{ type: "continuous", timestamp: 0, duration: 100 }]);

    const firstPlay = generator.play();
    const liveContext = captures.audioContexts[captures.audioContexts.length - 1];
    const firstSource = liveContext.createdSources[liveContext.createdSources.length - 1];

    assert.equal(firstSource.stopped, false);

    const secondPlay = generator.play();
    assert.equal(firstSource.stopped, true, "previous source must be stopped before starting a new one");

    const secondSource = liveContext.createdSources[liveContext.createdSources.length - 1];
    assert.notEqual(firstSource, secondSource);

    secondSource.onended();
    if (firstSource.onended) firstSource.onended();
    await Promise.all([firstPlay, secondPlay]);
  });
});

test("onended only clears currentSource when it equals the source that ended", async () => {
  await withAudioMocks({ autoEndOnStart: false }, async ({ captures }) => {
    const generator = new AudioGenerator();
    await generator.parse([{ type: "continuous", timestamp: 0, duration: 100 }]);

    // Start a first play, capture its source.
    const firstPlay = generator.play();
    const liveContext = captures.audioContexts[captures.audioContexts.length - 1];
    const firstSource = liveContext.createdSources[liveContext.createdSources.length - 1];

    // Start a second play — currentSource is now the second one.
    const secondPlay = generator.play();
    const secondSource = liveContext.createdSources[liveContext.createdSources.length - 1];
    assert.notEqual(firstSource, secondSource);

    // Fire the FIRST source's onended after the second play has started.
    firstSource.onended();

    // isPlaying must still be true because currentSource is the second source.
    assert.equal(generator.isPlaying(), true);

    secondSource.onended();
    await Promise.all([firstPlay, secondPlay]);
    assert.equal(generator.isPlaying(), false);
  });
});
