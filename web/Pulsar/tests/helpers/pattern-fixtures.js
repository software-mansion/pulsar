/**
 * Shared HapticPattern fixtures and their expected ParsedPattern outputs.
 *
 * These fixtures cover the representative shapes consumed by PatternComposer.parse
 * (and indirectly by AudioGenerator.parse, since AudioGenerator delegates to a
 * PatternComposer internally).
 *
 * All expected ParsedPattern values below are hand-derived from the engine constants
 * documented in src/Engine.ts and the parsing rules in src/PatternComposer.ts:
 *
 *   Engine timing capabilities:
 *     minPulseMs = 20
 *     maxPulseMs = 200
 *     minPauseMs = 20
 *     maxPauseMs = 200
 *
 *   For a pulse segment with duration d, intensity i in [0,1], frequency f in [0,1]:
 *     shotLength  = lerp(minPulseMs, max(minPulseMs, min(d, maxPulseMs)), i)
 *                 = lerp(20, max(20, min(d, 200)), i)
 *     pauseLength = lerp(max(minPauseMs, min(d, maxPauseMs)), minPauseMs, f)
 *                 = lerp(max(20, min(d, 200)), 20, f)
 *
 *   ParsedPattern emission:
 *     If the first merged interval starts after t=0, the array begins with [0, leadingSilence, ...]
 *     to signal that the Web Vibration API should wait before vibrating.
 *     Otherwise it begins with the first vibration duration.
 *     Subsequent entries alternate [..., pauseMs, vibrateMs, pauseMs, ...].
 */

/** @typedef {import("../../src/types.ts").HapticPattern} HapticPattern */
/** @typedef {import("../../src/types.ts").ParsedPattern} ParsedPattern */

/**
 * Single continuous block beginning at t=0.
 * One interval [0, 120], no leading silence.
 * @type {HapticPattern}
 */
export const continuousAt0 = [
  { type: "continuous", timestamp: 0, duration: 120 },
];

/**
 * Single continuous block starting after a delay.
 * One interval [50, 170]. Since start (50) > cursor (0), emit a leading 0
 * marker followed by the silence (50ms), then the vibration (120ms).
 * @type {HapticPattern}
 */
export const continuousDelayed = [
  { type: "continuous", timestamp: 50, duration: 120 },
];

/**
 * "Max frequency" PWM case — intensity=0, frequency=1 with d=100.
 * intensity=0  -> shotLength  = lerp(20, max(20, min(100, 200)), 0) = lerp(20, 100, 0) = 20
 * frequency=1  -> pauseLength = lerp(max(20, min(100, 200)), 20, 1) = lerp(100, 20, 1) = 20
 * Shots emitted by the pulse loop (start=0, end=100):
 *   cursor=0  -> [0, 20]   then cursor = 20 + 20 = 40
 *   cursor=40 -> [40, 60]  then cursor = 60 + 20 = 80
 *   cursor=80 -> [80, 100] then cursor = 100 + 20 = 120 (>= end, exit)
 * Merged: 3 non-overlapping intervals.
 * ParsedPattern: [20, gap=20, 20, gap=20, 20] = [20, 20, 20, 20, 20].
 * @type {HapticPattern}
 */
export const pulseMaxFrequency = [
  { type: "pulse", timestamp: 0, duration: 100, intensity: 0, frequency: 1 },
];

/**
 * "Max intensity" / "minimum frequency" case — intensity=1, frequency=0 with d=600.
 * intensity=1  -> shotLength  = lerp(20, max(20, min(600, 200)), 1) = lerp(20, 200, 1) = 200
 * frequency=0  -> pauseLength = lerp(max(20, min(600, 200)), 20, 0) = lerp(200, 20, 0) = 200
 * Shots emitted by the pulse loop (start=0, end=600):
 *   cursor=0   -> [0, 200]   then cursor = 200 + 200 = 400
 *   cursor=400 -> [400, 600] then cursor = 600 + 200 = 800 (>= end, exit)
 * Merged: 2 non-overlapping intervals separated by a 200ms gap.
 * ParsedPattern: [200, gap=200, 200].
 * @type {HapticPattern}
 */
export const pulseMaxIntensity = [
  { type: "pulse", timestamp: 0, duration: 600, intensity: 1, frequency: 0 },
];

/**
 * Line segment with a rising intensity curve and a flat (constant 0.5) frequency curve.
 * duration=100, intensity points = [(0,0), (100,1)], frequency points = [(0,0.5), (100,0.5)].
 *
 * Sampling the line loop (cursor steps through duration):
 *   cursor=0:
 *     intensity = sample at t=0 = 0
 *     frequency = sample at t=0 = 0.5
 *     shotLength  = min(100 - 0, lerp(20, max(20, min(100, 200)), 0)) = min(100, 20) = 20
 *     pauseLength = lerp(max(20, min(100, 200)), 20, 0.5) = lerp(100, 20, 0.5) = 60
 *     interval pushed: [0, 20]
 *     cursor = 0 + 20 + 60 = 80
 *   cursor=80:
 *     intensity = sample at t=80 = lerp(0, 1, 80/100) = 0.8
 *     frequency = sample at t=80 = 0.5
 *     shotLength  = min(100 - 80, lerp(20, 100, 0.8)) = min(20, 84) = 20
 *     pauseLength = 60 (same as above)
 *     interval pushed: [80, 100]
 *     cursor = 80 + 20 + 60 = 160 (>= duration, exit)
 * Merged: 2 intervals separated by a 60ms gap.
 * ParsedPattern: [20, gap=60, 20].
 * @type {HapticPattern}
 */
export const lineRising = [
  {
    type: "line",
    timestamp: 0,
    duration: 100,
    intensity: [
      { time: 0, value: 0 },
      { time: 100, value: 1 },
    ],
    frequency: [
      { time: 0, value: 0.5 },
      { time: 100, value: 0.5 },
    ],
  },
];

/**
 * Line segment with a single control point per curve — the "pad-to-bounds" case.
 * duration=100, intensity=[(50,1)], frequency=[(50,1)].
 *
 * normalizeCurve pads both ends: [(0,1), (50,1), (100,1)] for both curves -> effectively constants of 1.
 * Sampling the line loop:
 *   cursor=0:
 *     intensity = 1, frequency = 1
 *     shotLength  = min(100 - 0, lerp(20, max(20, min(100, 200)), 1)) = min(100, 100) = 100
 *     pauseLength = lerp(max(20, min(100, 200)), 20, 1) = lerp(100, 20, 1) = 20
 *     interval pushed: [0, 100]
 *     cursor = 0 + 100 + 20 = 120 (>= duration, exit)
 * Merged: single interval [0, 100], no leading silence.
 * ParsedPattern: [100].
 * @type {HapticPattern}
 */
export const lineSinglePoint = [
  {
    type: "line",
    timestamp: 0,
    duration: 100,
    intensity: [{ time: 50, value: 1 }],
    frequency: [{ time: 50, value: 1 }],
  },
];

/**
 * Continuous segment overlapping a pulse segment — verifies cross-type merging.
 *
 * Continuous block: [0, 100].
 * Pulse block (t=50, d=100, intensity=0, frequency=1):
 *   shotLength = 20, pauseLength = 20 (same derivation as pulseMaxFrequency at d=100)
 *   Shots (start=50, end=150):
 *     cursor=50  -> [50, 70]   then cursor = 90
 *     cursor=90  -> [90, 110]  then cursor = 130
 *     cursor=130 -> [130, 150] then cursor = 170 (>= end, exit)
 *
 * Sorted intervals: [0,100], [50,70], [90,110], [130,150].
 * Merge step-by-step (interval.start <= previous.end means absorb):
 *   start with [0,100]
 *   [50,70]:   50  <= 100 -> [0, max(100, 70)]  = [0, 100]
 *   [90,110]:  90  <= 100 -> [0, max(100, 110)] = [0, 110]
 *   [130,150]: 130 >  110 -> new interval, merged becomes [0,110],[130,150]
 *
 * ParsedPattern emission (cursor=0, no leading silence since first start=0):
 *   push 110 (length of [0,110]), cursor=110
 *   gap 130-110=20, push 20, push 150-130=20.
 * Result: [110, 20, 20].
 * @type {HapticPattern}
 */
export const mixedOverlapping = [
  { type: "continuous", timestamp: 0, duration: 100 },
  { type: "pulse", timestamp: 50, duration: 100, intensity: 0, frequency: 1 },
];

/**
 * Empty pattern — flatMap yields no intervals, mergeIntervals returns [].
 * Internal state is set to [] and parse returns []. No leading 0 emitted.
 * @type {HapticPattern}
 */
export const emptyPattern = [];

/**
 * Single entry with duration=0 — toIntervals returns [] (the duration===0 guard
 * short-circuits before pushing any interval). mergeIntervals receives [] and
 * returns []. Final ParsedPattern is [].
 * @type {HapticPattern}
 */
export const allZeroDuration = [
  { type: "continuous", timestamp: 0, duration: 0 },
];

/**
 * Single entry with both timestamp and duration negative.
 * toIntervals clamps: start=max(0, -50)=0, duration=max(0, -10)=0.
 * Duration is then 0, so the entry contributes no intervals.
 * Final ParsedPattern is [].
 * @type {HapticPattern}
 */
export const negativeTimestampAndDuration = [
  { type: "continuous", timestamp: -50, duration: -10 },
];

/**
 * Expected ParsedPattern output for each named fixture above.
 *
 * Each value was derived from the engine constants documented at the top of this
 * file. Inline numeric comments next to each entry trace back to the constants
 * (20 / 200) and the lerp formula so refactors of PatternComposer can confirm
 * intent without re-running the engine in their head.
 *
 * @type {Record<string, ParsedPattern>}
 */
export const parsedPatternExpectations = {
  // Single continuous block starting at 0: no leading silence, one vibration of 120ms.
  continuousAt0: [120],

  // Continuous block delayed by 50ms: leading 0 marker + 50ms silence + 120ms vibration.
  continuousDelayed: [0, 50, 120],

  // intensity=0 -> shotLength = minPulseMs = 20.
  // frequency=1 -> pauseLength = minPauseMs = 20.
  // d=100 yields 3 shots: [0,20],[40,60],[80,100] with 20ms gaps.
  pulseMaxFrequency: [
    20, // shotLength: minPulseMs
    20, // gap: minPauseMs
    20, // shotLength: minPulseMs
    20, // gap: minPauseMs
    20, // shotLength: minPulseMs
  ],

  // intensity=1 -> shotLength = min(d, maxPulseMs) = 200 (since d=600 > maxPulseMs).
  // frequency=0 -> pauseLength = min(d, maxPauseMs) = 200 (since d=600 > maxPauseMs).
  // d=600 yields 2 shots: [0,200],[400,600] with one 200ms gap.
  pulseMaxIntensity: [
    200, // shotLength: maxPulseMs
    200, // gap: maxPauseMs
    200, // shotLength: maxPulseMs
  ],

  // Rising intensity from 0 to 1 over d=100, frequency flat at 0.5.
  // At cursor=0: intensity=0  -> shotLength=20, pauseLength=lerp(100,20,0.5)=60.
  // At cursor=80: intensity=0.8 -> shotLength clamped by remaining duration to 20.
  lineRising: [
    20, // shotLength: minPulseMs (intensity sampled at start = 0)
    60, // pauseLength: lerp(min(d, maxPauseMs), minPauseMs, 0.5) = lerp(100, 20, 0.5)
    20, // shotLength: clamped to remaining duration (100 - 80)
  ],

  // Single point at t=50 with value=1 pads to a constant-1 curve on both ends.
  // shotLength = lerp(20, min(d, 200), 1) = min(d, 200) = 100. Single shot spans the segment.
  lineSinglePoint: [100],

  // Continuous [0,100] absorbs pulse shots [50,70] and [90,110] into [0,110];
  // the pulse shot [130,150] stays separate. Gap is 130 - 110 = 20.
  mixedOverlapping: [
    110, // merged length of continuous [0,100] + pulse shots up to t=110
    20, // gap between merged block end (110) and last pulse shot start (130)
    20, // last pulse shot length: minPulseMs
  ],

  // Pattern with no entries collapses to an empty ParsedPattern.
  emptyPattern: [],

  // duration=0 entry is skipped inside toIntervals; no intervals -> empty output.
  allZeroDuration: [],

  // Negative timestamp and duration both clamp to 0; resulting duration=0 is skipped.
  negativeTimestampAndDuration: [],
};

// ---------------------------------------------------------------------------
// Additional named fixtures consumed by tests/PatternComposer.test.js
//
// Each fixture's expected ParsedPattern shape is documented inline. These names
// describe the *behavior* under test (overlap, touch, line shape, etc.) rather
// than the literal segment count, which keeps the test names self-documenting.
// ---------------------------------------------------------------------------

/**
 * Alias for continuousAt0: a single continuous block at t=0, duration 120.
 * Expected parsed output: [120].
 * @type {HapticPattern}
 */
export const continuousAtZero = continuousAt0;

/**
 * Alias for continuousDelayed: a single continuous block at t=50, duration 120.
 * Expected parsed output: [0, 50, 120].
 * @type {HapticPattern}
 */
export const continuousWithLeadingGap = continuousDelayed;

/**
 * Two overlapping continuous intervals that merge into a single [0..120] span.
 * Expected parsed output: [120].
 * @type {HapticPattern}
 */
export const overlappingContinuous = [
  { type: "continuous", timestamp: 0, duration: 100 },
  { type: "continuous", timestamp: 80, duration: 40 },
];

/**
 * Two touching continuous intervals (end of A == start of B) that merge into
 * a single [0..160] span.
 * Expected parsed output: [160].
 * @type {HapticPattern}
 */
export const touchingContinuous = [
  { type: "continuous", timestamp: 0, duration: 100 },
  { type: "continuous", timestamp: 100, duration: 60 },
];

/**
 * Pulse with intensity=0 (min shot length) and frequency=1 (min pause length)
 * over a 200ms span. Yields 5 shots of 20ms each separated by 20ms gaps.
 * Expected parsed output: [20, 20, 20, 20, 20, 20, 20, 20, 20].
 * @type {HapticPattern}
 */
export const pulseMinShotMinPause = [
  { type: "pulse", timestamp: 0, duration: 200, intensity: 0, frequency: 1 },
];

/**
 * Cross-type merge: pulse (intensity=0, frequency=1, d=200) plus a continuous
 * [10..50] block. The continuous block absorbs the first three pulse shots
 * (which sit at 0..20, 40..60, 80..100) into a single [0..60] span. The
 * remaining pulse shots stay separate.
 *
 * pulse shots:      [0..20], [40..60], [80..100], [120..140], [160..180]
 * continuous:       [10..50]
 * Sorted by start:  [0..20], [10..50], [40..60], [80..100], [120..140], [160..180]
 * Merge:
 *   [0..20]
 *   [10..50]    -> 10 <= 20 -> [0..50]
 *   [40..60]    -> 40 <= 50 -> [0..60]
 *   [80..100]   -> 80 > 60  -> new
 *   [120..140]  -> 120 > 100 -> new
 *   [160..180]  -> 160 > 140 -> new
 * Output:
 *   push 60, gap 80-60=20, push 100-80=20, gap 120-100=20, push 140-120=20,
 *   gap 160-140=20, push 180-160=20.
 * Result: [60, 20, 20, 20, 20, 20, 20].
 * @type {HapticPattern}
 */
export const pulsePlusContinuous = [
  { type: "pulse", timestamp: 0, duration: 200, intensity: 0, frequency: 1 },
  { type: "continuous", timestamp: 10, duration: 40 },
];

/**
 * Line with rising intensity 0->1 across a 200ms span and constant frequency=1.
 *
 * At cursor c, intensity = c/200; shotLength = lerp(20, min(200,200), c/200);
 * pauseLength = lerp(min(200,200), 20, 1) = 20.
 *
 * c=0:   i=0,    shot=20,  push [0..20],   cursor = 0 + 20 + 20 = 40.
 * c=40:  i=0.2,  shot=56,  push [40..96],  cursor = 40 + 56 + 20 = 116.
 * c=116: i=0.58, shot=min(200-116,124.4)=84, push [116..200], cursor = 220 (exit).
 *
 * Output: [20, gap=20, 56, gap=20, 84] = [20, 20, 56, 20, 84].
 * @type {HapticPattern}
 */
export const risingIntensityLine = [
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
];

/**
 * Line with a single control point per curve — exercises normalizeCurve's
 * pad-to-bounds logic. Intensity flat at 0 (-> shot length always 20),
 * frequency flat at 1 (-> pause length always 20). timestamp=50, duration=120.
 *
 * Shot loop (start=50, duration=120):
 *   cursor=0:  shot=min(120,20)=20, push [50..70],   cursor=40.
 *   cursor=40: shot=min(80,20)=20,  push [90..110],  cursor=80.
 *   cursor=80: shot=min(40,20)=20,  push [130..150], cursor=120 (exit).
 *
 * Three intervals starting at t=50 -> output emits [0, 50, 20, 20, 20, 20, 20].
 * @type {HapticPattern}
 */
export const singlePointLine = [
  {
    type: "line",
    timestamp: 50,
    duration: 120,
    intensity: [{ time: 0, value: 0 }],
    frequency: [{ time: 0, value: 1 }],
  },
];
