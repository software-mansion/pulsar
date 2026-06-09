// Shared Web Audio mocks for tests that exercise AudioGenerator (and any code
// that transitively constructs one).
//
// The library targets the browser (AudioContext / OfflineAudioContext) but the
// Node test runner has neither. These mocks install just enough surface area
// on globalThis to make AudioGenerator.parse / play / stop run end-to-end, and
// expose the captured state (oscillators created, AudioParam calls, biquad
// filter type / frequency / Q, etc.) so tests can assert against the actual
// audio graph the source builds.

const AUDIO_GLOBALS = ["AudioContext", "webkitAudioContext", "OfflineAudioContext"];

// One module-level array of every OfflineAudioContext constructed since the
// last installAudioMocks(). Tests read from it to inspect the offline graph.
export const createdOfflineContexts = [];

export class MockAudioParam {
  constructor() {
    // Recorded in order so tests can assert ramp sequences such as
    // applyEnvelope's attack -> sustain -> exponential decay to 0.0001.
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

export class MockAudioBufferSourceNode {
  constructor(options = {}) {
    this.buffer = null;
    this.onended = null;
    this.connectedTo = null;
    this.started = false;
    this.stopped = false;
    // When false, start() does NOT auto-fire onended; the test is expected to
    // fire onended manually. Lets stop()/mid-playback tests observe state.
    this._autoEndOnStart = options.autoEndOnStart !== false;
  }

  connect(node) {
    this.connectedTo = node;
  }

  start() {
    this.started = true;
    if (!this._autoEndOnStart) {
      return;
    }
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

export class MockGainNode {
  constructor() {
    this.gain = new MockAudioParam();
    this.connectedTo = null;
  }

  connect(node) {
    this.connectedTo = node;
  }
}

export class MockBiquadFilterNode {
  constructor() {
    // AudioGenerator sets these three properties directly on the node.
    // Tests can read .type / .frequency.value / .Q.value to assert the
    // 900 Hz lowpass / Q 1.2 contract.
    this.type = "lowpass";
    this.frequency = new MockAudioParam();
    this.Q = new MockAudioParam();
    this.connectedTo = null;
  }

  connect(node) {
    this.connectedTo = node;
  }
}

export class MockOscillatorNode {
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

const makeAudioContextClass = (options = {}) => {
  const { suspended = false, sampleRate, autoEndOnStart = true } = options;
  return class MockAudioContextImpl {
    constructor() {
      this.destination = { name: "destination" };
      this.state = suspended ? "suspended" : "running";
      // Allow tests to coerce sampleRate to 0 to exercise the DEFAULT_SAMPLE_RATE fallback.
      this.sampleRate = sampleRate !== undefined ? sampleRate : 44100;
      this.createdSources = [];
      this.resumeCalls = 0;
      this._autoEndOnStart = autoEndOnStart;
    }

    async resume() {
      this.resumeCalls += 1;
      this.state = "running";
    }

    createBufferSource() {
      const source = new MockAudioBufferSourceNode({ autoEndOnStart: this._autoEndOnStart });
      this.createdSources.push(source);
      return source;
    }
  };
};

// Kept as a stable export for code that may import it directly.
export class MockAudioContext {
  constructor(options = {}) {
    this.destination = { name: "destination" };
    this.state = options.state ?? "running";
    this.sampleRate = options.sampleRate ?? 44100;
    this.createdSources = [];
    this.resumeCalls = 0;
  }

  async resume() {
    this.resumeCalls += 1;
    this.state = "running";
  }

  createBufferSource() {
    const source = new MockAudioBufferSourceNode();
    this.createdSources.push(source);
    return source;
  }
}

export class MockOfflineAudioContext {
  constructor(numberOfChannels, length, sampleRate) {
    this.numberOfChannels = numberOfChannels;
    this.length = length;
    this.sampleRate = sampleRate;
    this.currentTime = 0;
    this.destination = { name: "offline-destination" };
    this.createdOscillators = [];
    this.createdGains = [];
    this.createdFilters = [];
    this.renderedBuffer = {
      duration: length / sampleRate,
      sampleRate,
      length,
      numberOfChannels,
    };

    createdOfflineContexts.push(this);
  }

  // Alias for tests that look for `createdGainNodes`.
  get createdGainNodes() {
    return this.createdGains;
  }

  createGain() {
    const gain = new MockGainNode();
    this.createdGains.push(gain);
    return gain;
  }

  createBiquadFilter() {
    const filter = new MockBiquadFilterNode();
    this.createdFilters.push(filter);
    return filter;
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

// Constructor that always throws — used to simulate "global is defined but
// instantiation fails" branches in AudioGenerator (e.g. the unguarded throw
// paths inside initAudioContext / renderBuffer).
class ThrowingAudioContext {
  constructor() {
    throw new Error("Mock AudioContext constructor refused to instantiate.");
  }
}

class ThrowingOfflineAudioContext {
  constructor() {
    throw new Error("Mock OfflineAudioContext constructor refused to instantiate.");
  }
}

const HAS_OWN = Object.prototype.hasOwnProperty;

const snapshotGlobals = () => {
  const snapshot = {};
  for (const key of AUDIO_GLOBALS) {
    snapshot[key] = {
      had: HAS_OWN.call(globalThis, key),
      value: globalThis[key],
    };
  }
  return snapshot;
};

const restoreFromSnapshot = (snapshot) => {
  for (const key of AUDIO_GLOBALS) {
    const entry = snapshot[key];
    if (entry.had) {
      globalThis[key] = entry.value;
    } else {
      delete globalThis[key];
    }
  }
};

/**
 * Install Web Audio mocks on globalThis.
 *
 * Options:
 *   - useWebkit (alias: withWebkitFallback): drop AudioContext but set
 *       webkitAudioContext (Safari).
 *   - suspended: AudioContext.state starts as "suspended" so AudioGenerator
 *       must await resume() before rendering.
 *   - missingOffline: leave AudioContext available but make OfflineAudioContext
 *       throw on instantiation (exercises the unguarded throw path).
 *       Pair with `keepContext: true` to keep a working AudioContext alongside
 *       the broken OfflineAudioContext.
 *   - missingContext: leave OfflineAudioContext available but make
 *       AudioContext throw on instantiation. Pair with `keepOffline: true`.
 *   - sampleRate: override the mock AudioContext.sampleRate (e.g. 0 to test the
 *       DEFAULT_SAMPLE_RATE fallback inside initAudioContext).
 *   - autoEndOnStart: when false, BufferSource.start() does NOT auto-fire
 *       onended via microtask — tests can stop/observe the source mid-playback
 *       and fire onended manually to resolve the play() promise.
 *
 * Returns an object describing the captured state, with a `restore()` method.
 *
 *   const handle = installAudioMocks({ suspended: true });
 *   // ... use globals ...
 *   handle.restore();
 *
 * The `captures` object exposes:
 *   - audioContexts: every MockAudioContext constructed (each has resumeCalls, createdSources).
 *   - offlineContexts: every MockOfflineAudioContext constructed.
 *   - webkitContexts: every webkitAudioContext constructed (when useWebkit is on).
 */
export const installAudioMocks = (options = {}) => {
  const {
    useWebkit = false,
    withWebkitFallback = false,
    suspended = false,
    missingOffline = false,
    missingContext = false,
    keepContext = false,
    keepOffline = false,
    sampleRate,
    autoEndOnStart = true,
  } = options;

  const snapshot = snapshotGlobals();
  createdOfflineContexts.length = 0;

  const captures = {
    audioContexts: [],
    offlineContexts: [],
    webkitContexts: [],
  };

  // Build a context-class that tracks instances into the appropriate captures bucket.
  const buildTrackedContextClass = (bucketKey) => {
    const Base = makeAudioContextClass({ suspended, sampleRate, autoEndOnStart });
    return class TrackedContext extends Base {
      constructor(...args) {
        super(...args);
        captures[bucketKey].push(this);
      }
    };
  };

  const TrackedAudioContext = buildTrackedContextClass("audioContexts");
  const TrackedWebkitContext = buildTrackedContextClass("webkitContexts");

  const useWebkitNow = useWebkit || withWebkitFallback;

  if (missingContext) {
    // Set the global to a defined-but-null value so:
    //   - isAudioAvailable() returns true (typeof null !== "undefined")
    //   - initAudioContext's `webAudioGlobal.AudioContext ?? webAudioGlobal.webkitAudioContext`
    //     evaluates to null/undefined and triggers the "Web Audio API is not available"
    //     throw inside AudioGenerator.
    globalThis.AudioContext = null;
    delete globalThis.webkitAudioContext;
  } else if (useWebkitNow) {
    delete globalThis.AudioContext;
    globalThis.webkitAudioContext = TrackedWebkitContext;
  } else {
    globalThis.AudioContext = TrackedAudioContext;
    delete globalThis.webkitAudioContext;
  }

  if (missingOffline) {
    // Same null-trick: isAudioAvailable sees a defined value (so it returns true)
    // but renderBuffer's truthiness check fails, surfacing the documented
    // "OfflineAudioContext is not available" throw.
    globalThis.OfflineAudioContext = null;
  } else {
    // Wrap so we can capture every instance into captures.offlineContexts.
    const Base = MockOfflineAudioContext;
    class TrackedOffline extends Base {
      constructor(...args) {
        super(...args);
        captures.offlineContexts.push(this);
      }
    }
    globalThis.OfflineAudioContext = TrackedOffline;
  }

  let restored = false;
  const restore = () => {
    if (restored) return;
    restored = true;
    restoreFromSnapshot(snapshot);
  };

  return {
    captures,
    getAudioContexts: () => captures.audioContexts,
    getOfflineContexts: () => captures.offlineContexts,
    getWebkitContexts: () => captures.webkitContexts,
    restore,
  };
};

/**
 * Convenience wrapper that installs mocks for the duration of `fn` and
 * ALWAYS restores them in a finally block — even when fn throws. The
 * controller object is passed to fn and exposes:
 *
 *   - captures: { audioContexts, offlineContexts, webkitContexts }
 *   - getAudioContexts() / getOfflineContexts() / getWebkitContexts()
 *
 * Usage:
 *   await withAudioMocks({ suspended: true }, async ({ captures }) => {
 *     const gen = new AudioGenerator();
 *     await gen.parse(pattern);
 *     // ... assertions ...
 *   });
 */
export const withAudioMocks = async (opts, fn) => {
  // Support withAudioMocks(fn) shorthand when no options are needed.
  if (typeof opts === "function") {
    fn = opts;
    opts = {};
  }
  const handle = installAudioMocks(opts);
  try {
    return await fn(handle);
  } finally {
    handle.restore();
  }
};

/**
 * Standalone restore helper for tests that need to drop the audio globals
 * BEFORE constructing an AudioGenerator (e.g. asserting the
 * "no AudioContext available" branch). Pairs with a finally block that
 * re-installs whatever globals the test originally found.
 */
export const clearAudioGlobals = () => {
  const snapshot = snapshotGlobals();
  for (const key of AUDIO_GLOBALS) {
    delete globalThis[key];
  }
  let restored = false;
  return function restore() {
    if (restored) return;
    restored = true;
    restoreFromSnapshot(snapshot);
  };
};
