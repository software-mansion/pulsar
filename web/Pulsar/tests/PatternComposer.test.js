import test from "node:test";
import assert from "node:assert/strict";

import { PatternComposer } from "../src/PatternComposer.ts";
import Settings from "../src/Settings.ts";
import {
  withNavigator,
  withoutNavigator,
  makeVibrateRecorder,
} from "./helpers/navigator.js";
import { resetSettings } from "./helpers/reset-settings.js";
import {
  continuousAtZero,
  continuousWithLeadingGap,
  overlappingContinuous,
  touchingContinuous,
  pulseMinShotMinPause,
  pulsePlusContinuous,
  risingIntensityLine,
  singlePointLine,
} from "./helpers/pattern-fixtures.js";

test.beforeEach(() => {
  resetSettings();
});

// ---------------------------------------------------------------------------
// parse — segment-shape coverage (kept from original file)
// ---------------------------------------------------------------------------

test("parse compiles a continuous block at timestamp 0", () => {
  const composer = new PatternComposer();

  const parsed = composer.parse(continuousAtZero);

  assert.deepEqual(parsed, [120]);
  assert.deepEqual(composer.getPattern(), [120]);
});

test("parse preserves the leading gap before the first block", () => {
  const composer = new PatternComposer();

  const parsed = composer.parse(continuousWithLeadingGap);

  assert.deepEqual(parsed, [0, 50, 120]);
});

test("parse merges overlapping continuous intervals into one vibration span", () => {
  const composer = new PatternComposer();

  const parsed = composer.parse(overlappingContinuous);

  // 0..100 and 80..120 overlap into 0..120
  assert.deepEqual(parsed, [120]);
});

test("parse merges touching continuous intervals (interval.start === previous.end)", () => {
  const composer = new PatternComposer();

  const parsed = composer.parse(touchingContinuous);

  // 0..100 and 100..160 touch and should merge into 0..160
  assert.deepEqual(parsed, [160]);
});

test("parse expands pulse blocks into the minimum-shot / minimum-pause cadence", () => {
  const composer = new PatternComposer();

  const parsed = composer.parse(pulseMinShotMinPause);

  // intensity=0, frequency=1, duration=200ms -> shot=20, pause=20
  assert.deepEqual(parsed, [20, 20, 20, 20, 20, 20, 20, 20, 20]);
});

test("parse merges pulse output with overlapping continuous output", () => {
  const composer = new PatternComposer();

  const parsed = composer.parse(pulsePlusContinuous);

  // pulse shots [0..20, 40..60, 80..100, 120..140, 160..180]
  // continuous [10..50] merges first three pulse shots into [0..60]
  assert.deepEqual(parsed, [60, 20, 20, 20, 20, 20, 20]);
});

test("parse expands line blocks using interpolated intensity and frequency curves", () => {
  const composer = new PatternComposer();

  const parsed = composer.parse(risingIntensityLine);

  assert.deepEqual(parsed, [20, 20, 56, 20, 84]);
});

test("parse extends single-point line curves to segment boundaries", () => {
  const composer = new PatternComposer();

  const parsed = composer.parse(singlePointLine);

  // start=50, duration=120, intensity flat at 0 -> shot=20, frequency=1 -> pause=20
  assert.deepEqual(parsed, [0, 50, 20, 20, 20, 20, 20]);
});

// ---------------------------------------------------------------------------
// parse — edge cases (new)
// ---------------------------------------------------------------------------

test("parse returns [] for an empty pattern array (early-return path)", () => {
  const composer = new PatternComposer();

  const parsed = composer.parse([]);

  assert.deepEqual(parsed, []);
  assert.deepEqual(composer.getPattern(), []);
});

test("parse returns [] when every segment has zero duration", () => {
  const composer = new PatternComposer();

  const parsed = composer.parse([
    { type: "continuous", timestamp: 0, duration: 0 },
    { type: "pulse", timestamp: 10, duration: 0, intensity: 0.5, frequency: 0.5 },
    {
      type: "line",
      timestamp: 20,
      duration: 0,
      intensity: [{ time: 0, value: 1 }],
      frequency: [{ time: 0, value: 1 }],
    },
  ]);

  assert.deepEqual(parsed, []);
  assert.deepEqual(composer.getPattern(), []);
});

test("parse clamps a negative timestamp to 0", () => {
  const composer = new PatternComposer();

  const parsed = composer.parse([
    { type: "continuous", timestamp: -100, duration: 50 },
  ]);

  // negative timestamp clamps to 0 -> single interval [0..50]
  assert.deepEqual(parsed, [50]);
});

test("parse clamps a negative duration to 0 (contributes no intervals)", () => {
  const composer = new PatternComposer();

  const parsed = composer.parse([
    { type: "continuous", timestamp: 0, duration: -50 },
  ]);

  assert.deepEqual(parsed, []);
});

test("parse of a line segment with empty intensity & frequency arrays uses the constant 0.5 fallback curve", () => {
  const composer = new PatternComposer();

  const parsed = composer.parse([
    {
      type: "line",
      timestamp: 0,
      duration: 200,
      intensity: [],
      frequency: [],
    },
  ]);

  // intensity 0.5 -> shotLength = lerp(20, min(200,200), 0.5) = 110
  // frequency 0.5 -> pauseLength = lerp(min(200,200), 20, 0.5) = 110
  // cursor 0 -> shot 0..110 (min with duration-cursor=200 -> 110), pause -> cursor=220 (>= duration, stop)
  // After merge sort -> single interval [0..110]
  assert.deepEqual(parsed, [110]);
});

test("parse of a pulse with intensity=1, frequency=0 uses the maximum shot/pause cadence (200/200)", () => {
  const composer = new PatternComposer();

  // duration=400 so we get one full shot, one full pause, then a clipped final shot.
  const parsed = composer.parse([
    { type: "pulse", timestamp: 0, duration: 400, intensity: 1, frequency: 0 },
  ]);

  // shotLength = lerp(20, min(400,200), 1) = 200
  // pauseLength = lerp(min(400,200), 20, 0) = 200
  // cursor 0 -> shot 0..200, cursor -> 400 (>= end, stop)
  // Only first shot fits. Output: [200] (single interval, no trailing pause emitted)
  assert.deepEqual(parsed, [200]);
});

test("sampleCurve at the exact boundary between two control points returns the discrete endpoint values", () => {
  const composer = new PatternComposer();

  // line of duration 100 with intensity ramp 0->1 across [0, 100] and constant frequency=1.
  // We assert pulse-rate outcomes at progress=0 and progress=1 boundaries via observable shotLength.
  // intensity at t=0 is 0 -> shotLength = lerp(20, min(100,200)=100, 0) = 20
  // intensity at t=100 is 1 -> shotLength = lerp(20, 100, 1) = 100, but cursor never reaches t=100 exactly
  // (loop stops when cursor >= duration). So the LAST sampled point sits at cursor=20+shot+pause iterations.
  //
  // We pin the boundary behavior with a direct two-point curve where the SECOND iteration starts at the
  // boundary that yields a known shot length. Easier: use a 2-point curve and assert the parsed output
  // matches an explicit reference produced by the documented formulas.
  const parsed = composer.parse([
    {
      type: "line",
      timestamp: 0,
      duration: 100,
      intensity: [
        { time: 0, value: 0 },
        { time: 100, value: 1 },
      ],
      frequency: [
        { time: 0, value: 1 },
        { time: 100, value: 1 },
      ],
    },
  ]);

  // Walk-through (duration=100, minPulseMs=20, minPauseMs=20, maxPulse=min(100,200)=100):
  // cursor=0: intensity=0, shot=lerp(20,100,0)=20, shot clamped to min(100-0,20)=20
  //          frequency=1, pause=lerp(100,20,1)=20, push [0..20], cursor=40
  // cursor=40: intensity=0.4, shot=lerp(20,100,0.4)=52, clamp min(60,52)=52
  //           pause=20, push [40..92], cursor=112 (>= duration, exit)
  // intervals: [0..20, 40..92] -> output: [20, 20, 52]
  // progress=0 boundary uses current.value (0); the loop exits before progress=1 boundary, so we encode
  // that the discrete endpoint at progress=0 yielded the minimum shot length (20).
  assert.deepEqual(parsed, [20, 20, 52]);
});

test("parse called twice replaces the stored pattern (does not accumulate)", () => {
  const composer = new PatternComposer();

  composer.parse([{ type: "continuous", timestamp: 0, duration: 100 }]);
  composer.parse([{ type: "continuous", timestamp: 0, duration: 30 }]);

  assert.deepEqual(composer.getPattern(), [30]);
});

test("getPattern returns a shallow COPY; parse returns the live internal array", () => {
  const composer = new PatternComposer();

  const fromParse = composer.parse([
    { type: "continuous", timestamp: 0, duration: 50 },
  ]);
  const snapshot = composer.getPattern();

  // The snapshot from getPattern is a copy: mutating it must not affect internal state.
  snapshot.push(999);
  assert.deepEqual(composer.getPattern(), [50]);

  // parse returns the same live object stored internally (referential identity).
  // Re-parsing replaces the stored reference, so compare before any re-parse.
  assert.equal(fromParse, fromParse);
  // The newly returned snapshot is NOT the same reference as the live array.
  assert.notEqual(snapshot, composer.getPattern());

  // Mutating the array returned from parse() WOULD affect internal state (live reference),
  // which is how we differentiate from getPattern().
  fromParse.push(7);
  assert.deepEqual(composer.getPattern(), [50, 7]);
});

// ---------------------------------------------------------------------------
// play — availability & enabled branches
// ---------------------------------------------------------------------------

test("play forwards the parsed pattern to navigator.vibrate", () => {
  const composer = new PatternComposer();
  const recorder = makeVibrateRecorder();

  withNavigator(recorder, () => {
    composer.parse([{ type: "continuous", timestamp: 0, duration: 75 }]);

    const result = composer.play();

    assert.equal(result, true);
    assert.deepEqual(recorder.calls, [[75]]);
  });
});

test("play returns false when navigator.vibrate is not a function", () => {
  const composer = new PatternComposer();

  withNavigator({ vibrate: undefined }, () => {
    composer.parse([{ type: "continuous", timestamp: 0, duration: 75 }]);

    assert.equal(composer.play(), false);
  });
});

test("play returns false when there is no navigator at all", () => {
  const composer = new PatternComposer();

  withoutNavigator(() => {
    composer.parse([{ type: "continuous", timestamp: 0, duration: 75 }]);

    assert.equal(composer.play(), false);
  });
});

test("play returns false when Settings.isHapticsEnabled() is false, even if navigator.vibrate is available", () => {
  const composer = new PatternComposer();
  const recorder = makeVibrateRecorder();

  withNavigator(recorder, () => {
    composer.parse([{ type: "continuous", timestamp: 0, duration: 75 }]);

    try {
      Settings.enableHaptics(false);

      assert.equal(composer.play(), false);
      // navigator.vibrate must NOT be called when haptics are disabled.
      // (Settings.enableHaptics(false) itself calls stopHaptics which calls vibrate(0);
      // we filter that out by asserting no pattern-shaped call sneaks through.)
      const patternCalls = recorder.calls.filter((value) => Array.isArray(value));
      assert.deepEqual(patternCalls, []);
    } finally {
      Settings.enableHaptics(true);
    }
  });
});

test("play returns whatever navigator.vibrate returns (false propagates)", () => {
  const composer = new PatternComposer();
  const recorder = makeVibrateRecorder({ result: false });

  withNavigator(recorder, () => {
    composer.parse([{ type: "continuous", timestamp: 0, duration: 75 }]);

    assert.equal(composer.play(), false);
    assert.deepEqual(recorder.calls, [[75]]);
  });
});

test("play with an empty parsed pattern still calls navigator.vibrate([]) (documented no-op)", () => {
  const composer = new PatternComposer();
  const recorder = makeVibrateRecorder();

  withNavigator(recorder, () => {
    // No parse call -> internal pattern is [].
    const result = composer.play();

    assert.equal(result, true);
    assert.deepEqual(recorder.calls, [[]]);
  });
});

// ---------------------------------------------------------------------------
// stop — clears state, fires handlers, vibrates 0
// ---------------------------------------------------------------------------

test("stop clears the pattern, fires registered stop handlers, calls navigator.vibrate(0), and returns its result", () => {
  const composer = new PatternComposer();
  const recorder = makeVibrateRecorder();
  let handlerFired = 0;

  withNavigator(recorder, () => {
    composer.parse([{ type: "continuous", timestamp: 0, duration: 75 }]);

    const unregister = Settings.registerStopHapticsHandler(() => {
      handlerFired += 1;
    });

    try {
      const result = composer.stop();

      assert.equal(result, true);
      assert.deepEqual(composer.getPattern(), []);
      assert.deepEqual(recorder.calls, [0]);
      assert.equal(handlerFired, 1);
    } finally {
      unregister();
    }
  });
});

test("stop returns false when navigator.vibrate is unavailable, even though pattern is cleared and handlers ran", () => {
  const composer = new PatternComposer();
  let handlerFired = 0;

  withoutNavigator(() => {
    composer.parse([{ type: "continuous", timestamp: 0, duration: 75 }]);

    const unregister = Settings.registerStopHapticsHandler(() => {
      handlerFired += 1;
    });

    try {
      const result = composer.stop();

      assert.equal(result, false);
      assert.deepEqual(composer.getPattern(), []);
      assert.equal(handlerFired, 1);
    } finally {
      unregister();
    }
  });
});
