import test from "node:test";
import assert from "node:assert/strict";

import { Pulsar } from "../src/Pulsar.ts";
import { Presets } from "../src/Presets.ts";
import { PatternComposer } from "../src/PatternComposer.ts";
import { RealtimeComposer } from "../src/RealtimeComposer.ts";
import { AudioGenerator } from "../src/AudioGenerator.ts";
import Settings from "../src/Settings.ts";

import {
  useHaptics,
  usePresets,
  usePreset,
  useHapticsSupport,
  usePatternComposer,
  useRealtimeComposer,
  useAudioGenerator,
} from "../src/react/index.ts";

import { renderHook, act } from "./helpers/react-test-utils.js";
import {
  withNavigator,
  withoutNavigator,
  installNavigator,
  restoreNavigator,
  makeVibrateRecorder,
} from "./helpers/navigator.js";
import { withFakeTimers } from "./helpers/fake-timers.js";
import { withAudioMocks } from "./helpers/audio-mocks.js";
import { resetSettings } from "./helpers/reset-settings.js";

// ---------------------------------------------------------------------------
// useHaptics
// ---------------------------------------------------------------------------

test("useHaptics returns a Pulsar instance", () => {
  resetSettings();
  const { result, unmount } = renderHook(() => useHaptics());
  try {
    assert.ok(result.current instanceof Pulsar, "expected Pulsar instance");
  } finally {
    unmount();
  }
});

test("useHaptics identity is stable across re-renders of the same component", () => {
  resetSettings();
  const { result, rerender, unmount } = renderHook(() => useHaptics());
  try {
    const first = result.current;
    rerender();
    const second = result.current;
    rerender();
    const third = result.current;
    assert.equal(first, second);
    assert.equal(second, third);
  } finally {
    unmount();
  }
});

test("useHaptics identity is stable across different components in the same process", () => {
  resetSettings();
  const a = renderHook(() => useHaptics());
  const b = renderHook(() => useHaptics());
  try {
    assert.equal(a.result.current, b.result.current);
  } finally {
    a.unmount();
    b.unmount();
  }
});

test("useHaptics during render does not touch navigator (SSR-safe)", async () => {
  resetSettings();
  // No navigator at all: if render-time code tried to feature-detect via
  // typeof navigator.vibrate it would throw. The hook should still produce
  // a Pulsar instance without contacting navigator.
  await withoutNavigator(async () => {
    const { result, unmount } = renderHook(() => useHaptics());
    try {
      assert.ok(result.current instanceof Pulsar);
    } finally {
      unmount();
    }
  });
});

// ---------------------------------------------------------------------------
// usePresets
// ---------------------------------------------------------------------------

test("usePresets returns the same Presets registry as useHaptics().getPresets()", () => {
  resetSettings();
  const { result, unmount } = renderHook(() => ({
    presets: usePresets(),
    haptics: useHaptics(),
  }));
  try {
    assert.ok(result.current.presets instanceof Presets);
    assert.equal(result.current.presets, result.current.haptics.getPresets());
  } finally {
    unmount();
  }
});

test("usePresets identity is stable across renders", () => {
  resetSettings();
  const { result, rerender, unmount } = renderHook(() => usePresets());
  try {
    const first = result.current;
    rerender();
    assert.equal(result.current, first);
  } finally {
    unmount();
  }
});

// ---------------------------------------------------------------------------
// usePreset
// ---------------------------------------------------------------------------

test("usePreset returns a stable callback identity across re-renders with same name", () => {
  resetSettings();
  const { result, rerender, unmount } = renderHook(({ name }) => usePreset(name), {
    initialProps: { name: "tap" },
  });
  try {
    const first = result.current;
    rerender({ name: "tap" });
    assert.equal(result.current, first, "callback identity should be stable for same name");
  } finally {
    unmount();
  }
});

test("usePreset returns a NEW callback identity when name changes", () => {
  resetSettings();
  const { result, rerender, unmount } = renderHook(({ name }) => usePreset(name), {
    initialProps: { name: "tap" },
  });
  try {
    const first = result.current;
    rerender({ name: "doubleTap" });
    assert.notEqual(result.current, first, "callback identity should change when name changes");
  } finally {
    unmount();
  }
});

test("usePreset callback calls Presets.play(name) and resolves with PresetPlaybackResult", async () => {
  resetSettings();
  const { navigator: nav, calls } = makeVibrateRecorder({ result: true });
  await withNavigator(nav, async () => {
    const { result, unmount } = renderHook(() => usePreset("tap"));
    try {
      const cb = result.current;
      const outcome = await cb();
      assert.deepEqual(outcome, { haptics: true, audio: false, usedAudioFallback: false });
      assert.ok(calls.length >= 1, "expected navigator.vibrate to be invoked at least once");
    } finally {
      unmount();
    }
  });
});

test("usePreset with unknown name does not throw at hook-call time; callback throws on invoke", async () => {
  resetSettings();
  // Render-time should NOT throw — only the invocation should.
  const { result, unmount } = renderHook(() => usePreset(/** @type any */ ("definitely-not-a-preset")));
  try {
    assert.equal(typeof result.current, "function", "callback should be returned even for unknown name");
    // presets.play() is async, so the synchronous throw inside `this.get(name)`
    // is captured by the async wrapper as a rejected promise. Assert rejection.
    await assert.rejects(() => result.current(), {
      message: "Unknown haptic preset: definitely-not-a-preset",
    });
  } finally {
    unmount();
  }
});

// ---------------------------------------------------------------------------
// useHapticsSupport
// ---------------------------------------------------------------------------

test("useHapticsSupport returns false on initial render even on supported envs", () => {
  resetSettings();
  // Install a navigator BEFORE render so isHapticsAvailable() would return true
  // if the hook were to poll synchronously. The contract is the initial render
  // value is always false. We need to read the value pre-effect-flush, but
  // renderHook uses act() which flushes effects. So we capture initial state
  // by using a counter and checking the renders observed.
  const { navigator: nav } = makeVibrateRecorder({ result: true });
  installNavigator(nav);
  try {
    const seenValues = [];
    const Capture = () => {
      const value = useHapticsSupport();
      seenValues.push(value);
      return null;
    };
    const { unmount } = renderHook(() => Capture());
    try {
      // First entry was rendered before effect ran — must be false.
      assert.equal(seenValues[0], false, "initial render value must always be false");
    } finally {
      unmount();
    }
  } finally {
    restoreNavigator();
  }
});

test("useHapticsSupport flips to Settings.isHapticsAvailable() after effect flushes", () => {
  resetSettings();
  const { navigator: nav } = makeVibrateRecorder({ result: true });
  installNavigator(nav);
  try {
    const { result, unmount } = renderHook(() => useHapticsSupport());
    try {
      // act() inside renderHook flushed effects; value should reflect availability.
      assert.equal(result.current, true);
      assert.equal(result.current, Settings.isHapticsAvailable());
    } finally {
      unmount();
    }
  } finally {
    restoreNavigator();
  }
});

test("useHapticsSupport does not re-poll on subsequent re-renders", () => {
  resetSettings();
  const { navigator: nav } = makeVibrateRecorder({ result: true });
  installNavigator(nav);
  try {
    const { result, rerender, unmount } = renderHook(() => useHapticsSupport());
    try {
      assert.equal(result.current, true);
      // Mutate the navigator so vibrate is no longer a function. If the hook
      // re-polled on render, the value would flip to false.
      nav.vibrate = undefined;
      rerender();
      // Settings.isHapticsAvailable() would now return false, but the hook's
      // useEffect with [] deps does not re-run, so the value must stay true.
      assert.equal(Settings.isHapticsAvailable(), false, "sanity: nav.vibrate is no longer a function");
      assert.equal(result.current, true, "value must not re-poll on re-render");
    } finally {
      unmount();
    }
  } finally {
    restoreNavigator();
  }
});

test("useHapticsSupport returns false on unsupported envs after effect flush", async () => {
  resetSettings();
  await withoutNavigator(async () => {
    const { result, unmount } = renderHook(() => useHapticsSupport());
    try {
      assert.equal(result.current, false);
    } finally {
      unmount();
    }
  });
});

// ---------------------------------------------------------------------------
// usePatternComposer
// ---------------------------------------------------------------------------

const TRIVIAL_PATTERN = [
  { type: "continuous", timestamp: 0, duration: 30 },
];

const SECOND_PATTERN = [
  { type: "continuous", timestamp: 0, duration: 60 },
];

test("usePatternComposer lazy-constructs and reuses the same composer across re-renders", () => {
  resetSettings();
  const { result, rerender, unmount } = renderHook(() => usePatternComposer());
  try {
    const initialGetPattern = result.current.getPattern;
    // Parse via the hook
    result.current.parse(TRIVIAL_PATTERN);
    const patternA = result.current.getPattern();
    assert.ok(patternA.length > 0, "expected non-empty parsed pattern");
    rerender();
    // Same composer — parsed state persists across renders
    const patternB = result.current.getPattern();
    assert.deepEqual(patternB, patternA);
    // The getPattern callback identity is stable too (memoized on composer).
    assert.equal(result.current.getPattern, initialGetPattern);
  } finally {
    unmount();
  }
});

test("usePatternComposer creates a new composer per mount (not shared across components)", () => {
  resetSettings();
  const a = renderHook(() => usePatternComposer());
  const b = renderHook(() => usePatternComposer());
  try {
    a.result.current.parse(TRIVIAL_PATTERN);
    // b never parsed — must be empty if it's a different composer
    assert.deepEqual(b.result.current.getPattern(), []);
    assert.ok(a.result.current.getPattern().length > 0);
  } finally {
    a.unmount();
    b.unmount();
  }
});

test("usePatternComposer(pattern) auto-parses on mount", () => {
  resetSettings();
  const { result, unmount } = renderHook(() => usePatternComposer(TRIVIAL_PATTERN));
  try {
    assert.equal(result.current.isParsed(), true);
    const parsed = result.current.getPattern();
    assert.ok(parsed.length > 0, "expected auto-parsed non-empty pattern");
  } finally {
    unmount();
  }
});

test("usePatternComposer re-parses only when pattern reference changes", () => {
  resetSettings();
  // Spy on PatternComposer.prototype.parse to count invocations.
  const originalParse = PatternComposer.prototype.parse;
  let parseCount = 0;
  PatternComposer.prototype.parse = function (pattern) {
    parseCount += 1;
    return originalParse.call(this, pattern);
  };
  try {
    const { rerender, unmount } = renderHook(
      ({ pattern }) => usePatternComposer(pattern),
      { initialProps: { pattern: TRIVIAL_PATTERN } },
    );
    try {
      const initialCount = parseCount;
      assert.ok(initialCount >= 1, "expected an initial parse on mount");

      // Re-render with SAME reference: should not re-parse.
      rerender({ pattern: TRIVIAL_PATTERN });
      assert.equal(parseCount, initialCount, "no re-parse on same reference");

      // Re-render with a NEW reference: should re-parse.
      rerender({ pattern: SECOND_PATTERN });
      assert.ok(parseCount > initialCount, "expected re-parse on new pattern reference");
    } finally {
      unmount();
    }
  } finally {
    PatternComposer.prototype.parse = originalParse;
  }
});

test("usePatternComposer unmount calls composer.stop() (getPattern is [] after unmount)", () => {
  resetSettings();
  const { result, unmount } = renderHook(() => usePatternComposer(TRIVIAL_PATTERN));
  // Capture handle before unmount so we can still call getPattern after.
  const handle = result.current;
  assert.ok(handle.getPattern().length > 0);
  unmount();
  // composer.stop() resets the parsed pattern to []
  assert.deepEqual(handle.getPattern(), []);
});

test("usePatternComposer isParsed flips true via hook's parse wrapper but not when bypassing the hook", () => {
  resetSettings();
  // The contract: hook.parse() sets parsedRef.current = true. Calling
  // composer.parse() directly cannot be observed here because the hook does
  // not expose the underlying composer. What we CAN verify is that without
  // calling hook.parse() (and without supplying a pattern arg), isParsed()
  // remains false.
  const { result, unmount } = renderHook(() => usePatternComposer());
  try {
    assert.equal(result.current.isParsed(), false, "isParsed should be false before any parse");
    // Now call the hook's parse wrapper — should flip true.
    result.current.parse(TRIVIAL_PATTERN);
    assert.equal(result.current.isParsed(), true);
  } finally {
    unmount();
  }
});

test("usePatternComposer cleanup still stops composer when pattern was later cleared", () => {
  resetSettings();
  const { result, rerender, unmount } = renderHook(
    ({ pattern }) => usePatternComposer(pattern),
    { initialProps: { pattern: TRIVIAL_PATTERN } },
  );
  const handle = result.current;
  assert.ok(handle.getPattern().length > 0);
  // Clear the pattern: re-render with undefined.
  rerender({ pattern: undefined });
  // The composer should still hold the parsed pattern (the effect skips
  // the parse branch but does not stop on pattern-cleared, only on unmount).
  // What matters: unmount stops it.
  unmount();
  assert.deepEqual(handle.getPattern(), [], "composer.stop() must have run on unmount");
});

// ---------------------------------------------------------------------------
// useRealtimeComposer
// ---------------------------------------------------------------------------

test("useRealtimeComposer creates a NEW composer per component (not shared with useHaptics)", async () => {
  resetSettings();
  // Two component mounts of useRealtimeComposer must have independent
  // composers. We can prove independence by setting one to playing and
  // verifying the other is not playing.
  await withFakeTimers(async (_scheduler) => {
    const { navigator: nav } = makeVibrateRecorder({ result: true });
    await withNavigator(nav, async () => {
      const a = renderHook(() => useRealtimeComposer());
      const b = renderHook(() => useRealtimeComposer());
      try {
        await act(async () => {
          a.result.current.set(0.5, 0.5);
        });
        // a should be playing, b should NOT be — proving they are different.
        assert.equal(a.result.current.isPlaying(), true);
        assert.equal(b.result.current.isPlaying(), false);

        // Also verify per-component handle is different from the shared
        // realtime composer reachable via useHaptics().getRealtimeComposer().
        const haptics = renderHook(() => useHaptics());
        try {
          const sharedRC = haptics.result.current.getRealtimeComposer();
          assert.ok(sharedRC instanceof RealtimeComposer);
          // The shared one should not be playing — a.set() did not touch it.
          assert.equal(sharedRC.isPlaying(), false);
        } finally {
          haptics.unmount();
        }
      } finally {
        a.unmount();
        b.unmount();
      }
    });
  });
});

test("useRealtimeComposer unmount calls composer.stop() and clears the scheduled timeout", async () => {
  resetSettings();
  await withFakeTimers(async (scheduler) => {
    const { navigator: nav } = makeVibrateRecorder({ result: true });
    await withNavigator(nav, async () => {
      const { result, unmount } = renderHook(() => useRealtimeComposer());
      await act(async () => {
        result.current.set(0.5, 0.5);
      });
      // A timeout should have been scheduled by the first tick.
      const scheduledBeforeUnmount = scheduler.calls.filter((c) => !c.cancelled).length;
      assert.ok(scheduledBeforeUnmount >= 1, "expected a scheduled tick before unmount");

      const cancelledBefore = scheduler.cancelled.length;
      unmount();
      // unmount triggers composer.stop() which clears the scheduled timeout.
      assert.ok(
        scheduler.cancelled.length > cancelledBefore,
        "expected clearTimeout to be called on unmount",
      );
      assert.equal(result.current.isPlaying(), false);
    });
  });
});

test("useRealtimeComposer.set: clamped values flow through", async () => {
  resetSettings();
  await withFakeTimers(async () => {
    const { navigator: nav } = makeVibrateRecorder({ result: true });
    await withNavigator(nav, async () => {
      const { result, unmount } = renderHook(() => useRealtimeComposer());
      try {
        await act(async () => {
          result.current.set(2.5, -1);
        });
        const values = result.current.getCurrentValues();
        assert.equal(values.intensity, 1, "intensity must be clamped to 1");
        assert.equal(values.frequency, 0, "frequency must be clamped to 0");
      } finally {
        unmount();
      }
    });
  });
});

test("useRealtimeComposer.set returns false on haptics-unavailable env", async () => {
  resetSettings();
  await withoutNavigator(async () => {
    const { result, unmount } = renderHook(() => useRealtimeComposer());
    try {
      let returned;
      await act(async () => {
        returned = result.current.set(0.5, 0.5);
      });
      assert.equal(returned, false);
      assert.equal(result.current.isPlaying(), false);
    } finally {
      unmount();
    }
  });
});

// ---------------------------------------------------------------------------
// useAudioGenerator
// ---------------------------------------------------------------------------

test("useAudioGenerator lazy-constructs and reuses the same generator across renders", () => {
  resetSettings();
  const { result, rerender, unmount } = renderHook(() => useAudioGenerator());
  try {
    const initialStop = result.current.stop;
    const initialPlay = result.current.play;
    rerender();
    // Stable callback identities prove the underlying generator is the same.
    assert.equal(result.current.stop, initialStop);
    assert.equal(result.current.play, initialPlay);
  } finally {
    unmount();
  }
});

test("useAudioGenerator creates a new generator per component (per-component)", () => {
  resetSettings();
  const a = renderHook(() => useAudioGenerator());
  const b = renderHook(() => useAudioGenerator());
  try {
    // Different components: their callback identities should differ because
    // they close over different generator instances.
    assert.notEqual(a.result.current.stop, b.result.current.stop);
    assert.notEqual(a.result.current.play, b.result.current.play);
  } finally {
    a.unmount();
    b.unmount();
  }
});

test("useAudioGenerator(pattern) auto-parses on mount and re-parses on pattern reference change", async () => {
  resetSettings();
  const originalParse = AudioGenerator.prototype.parse;
  const parseCalls = [];
  AudioGenerator.prototype.parse = async function (pattern) {
    parseCalls.push(pattern);
    return originalParse.call(this, pattern);
  };
  try {
    await withAudioMocks(async () => {
      const { rerender, unmount } = renderHook(
        ({ pattern }) => useAudioGenerator(pattern),
        { initialProps: { pattern: TRIVIAL_PATTERN } },
      );
      try {
        // Wait for the fire-and-forget parse to settle.
        await act(async () => {
          await Promise.resolve();
          await Promise.resolve();
        });
        const afterMount = parseCalls.length;
        assert.ok(afterMount >= 1, "expected parse to fire on mount");

        // Re-render with same reference: no re-parse.
        rerender({ pattern: TRIVIAL_PATTERN });
        await act(async () => {
          await Promise.resolve();
        });
        assert.equal(parseCalls.length, afterMount, "no re-parse on same reference");

        // Re-render with a new reference: re-parse.
        rerender({ pattern: SECOND_PATTERN });
        await act(async () => {
          await Promise.resolve();
          await Promise.resolve();
        });
        assert.ok(parseCalls.length > afterMount, "expected re-parse on new reference");
      } finally {
        unmount();
      }
    });
  } finally {
    AudioGenerator.prototype.parse = originalParse;
  }
});

test("useAudioGenerator unmount calls generator.stop()", async () => {
  resetSettings();
  const originalStop = AudioGenerator.prototype.stop;
  let stopCalls = 0;
  AudioGenerator.prototype.stop = function () {
    stopCalls += 1;
    return originalStop.call(this);
  };
  try {
    const { unmount } = renderHook(() => useAudioGenerator());
    const before = stopCalls;
    unmount();
    assert.ok(stopCalls > before, "expected generator.stop() to be invoked on unmount");
  } finally {
    AudioGenerator.prototype.stop = originalStop;
  }
});

test("useAudioGenerator.play resolves false when no parse has succeeded yet", async () => {
  resetSettings();
  // No pattern passed, no audio mocks installed: play() must short-circuit
  // to false because there is no AudioContext / no renderedBuffer.
  const { result, unmount } = renderHook(() => useAudioGenerator());
  try {
    const outcome = await result.current.play();
    assert.equal(outcome, false);
  } finally {
    unmount();
  }
});

test("useAudioGenerator.play resolves false when sound is disabled", async () => {
  resetSettings();
  Settings.enableSound(false);
  try {
    await withAudioMocks(async () => {
      const { result, unmount } = renderHook(() => useAudioGenerator(TRIVIAL_PATTERN));
      try {
        await act(async () => {
          await Promise.resolve();
          await Promise.resolve();
        });
        const outcome = await result.current.play();
        assert.equal(outcome, false, "play must resolve false when sound is disabled");
      } finally {
        unmount();
      }
    });
  } finally {
    Settings.enableSound(true);
  }
});

test("useAudioGenerator.play resolves false when no AudioContext exists", async () => {
  resetSettings();
  // No audio mocks installed at all → no AudioContext → parse renderedBuffer=null.
  const { result, unmount } = renderHook(() => useAudioGenerator(TRIVIAL_PATTERN));
  try {
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    const outcome = await result.current.play();
    assert.equal(outcome, false);
  } finally {
    unmount();
  }
});

test("useAudioGenerator.getBufferInfo returns null until parse completes; non-null after", async () => {
  resetSettings();
  await withAudioMocks(async () => {
    const { result, unmount } = renderHook(() => useAudioGenerator(TRIVIAL_PATTERN));
    try {
      // Immediately after render the fire-and-forget parse is still in flight.
      assert.equal(result.current.getBufferInfo(), null, "buffer info should be null pre-parse");

      // Flush the parse promise.
      await act(async () => {
        await Promise.resolve();
        await Promise.resolve();
        await Promise.resolve();
      });
      const info = result.current.getBufferInfo();
      assert.ok(info !== null, "buffer info should be populated after parse settles");
      assert.equal(typeof info.duration, "number");
      assert.equal(typeof info.sampleRate, "number");
      assert.equal(typeof info.length, "number");
      assert.equal(typeof info.channels, "number");
    } finally {
      unmount();
    }
  });
});
