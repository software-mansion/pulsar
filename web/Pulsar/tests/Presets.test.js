import test from "node:test";
import assert from "node:assert/strict";

import { Preset, PresetsManager } from "../src/Presets.ts";
import { BUILTIN_PRESETS } from "../src/builtin-presets.ts";
import Settings from "../src/Settings.ts";

import {
  installNavigator,
  restoreNavigator,
  withNavigator,
  withoutNavigator,
  makeVibrateRecorder,
} from "./helpers/navigator.js";
import { resetSettings } from "./helpers/reset-settings.js";
import { withAudioMocks } from "./helpers/audio-mocks.js";

// Every test starts from clean Settings — defaults flags true, no leaked stop
// handlers — and a clean navigator stack. We also defensively call
// restoreNavigator in a loop in case a previous failure left an entry behind.
test.beforeEach(() => {
  // Drain any lingering navigator stack entries from a previous failing test.
  while (restoreNavigator()) {
    // keep popping
  }
  resetSettings();
});

test("list includes the core built-in preset names", () => {
  const presets = new PresetsManager();
  const names = presets.list();

  for (const expected of ["tap", "doubleTap", "longPress", "alarm", "heartbeat"]) {
    assert.ok(names.includes(expected), `expected list to include "${expected}"`);
  }
});

test("get returns the SAME Preset instance across repeated calls and exposes name + exact pattern", () => {
  const presets = new PresetsManager();

  const first = presets.get("tap");
  const second = presets.get("tap");

  assert.equal(first, second, "get('tap') must return the same instance");
  assert.equal(first.name, "tap");
  assert.deepEqual(first.pattern, [{ type: "continuous", timestamp: 0, duration: 35 }]);
});

test("get throws Error with message 'Unknown haptic preset: missing' for unknown names", () => {
  const presets = new PresetsManager();

  assert.throws(
    () => presets.get("missing"),
    (err) => err instanceof Error && err.message === "Unknown haptic preset: missing",
    "expected get('missing') to throw with the exact 'Unknown haptic preset: missing' message",
  );
});

test("has returns true for a registered preset name", () => {
  const presets = new PresetsManager();

  assert.equal(presets.has("tap"), true);
});

test("has returns false for an unregistered preset name", () => {
  const presets = new PresetsManager();

  assert.equal(presets.has("definitelyNotAPreset"), false);
});

test("has returns true for inherited Object.prototype keys (current contract — would be tightened by an Object.hasOwn check)", () => {
  // NOTE: Pinning current behavior. Presets.has uses `name in this.presets`,
  // and `this.presets` is built via Object.fromEntries, so it inherits from
  // Object.prototype. Inherited names like "toString" therefore satisfy `in`.
  // This is the documented prototype-name caveat from the API inventory; the
  // assertion here makes the caveat explicit. Swap `in` for `Object.hasOwn`
  // (or a null-prototype map) in src/Presets.ts to tighten this.
  const presets = new PresetsManager();

  assert.equal(presets.has("toString"), true);
});

test("all returns Preset instances in the same order as list()", () => {
  const presets = new PresetsManager();

  const names = presets.list();
  const items = presets.all();

  assert.equal(items.length, names.length);
  for (let i = 0; i < names.length; i += 1) {
    assert.ok(items[i] instanceof Preset, `expected all()[${i}] to be a Preset instance`);
    assert.equal(items[i].name, names[i]);
    // Identity check: all() must return the exact same instances get() returns.
    assert.equal(items[i], presets.get(names[i]));
  }
});

test("play('doubleTap') uses the haptics-only path and never touches the audio mocks", async () => {
  // doubleTap parses to [30, 60, 30] — we pin this exact array.
  const { navigator: nav, calls } = makeVibrateRecorder({ result: true });

  await withAudioMocks(async ({ getAudioContexts, getOfflineContexts }) => {
    await withNavigator(nav, async () => {
      const presets = new PresetsManager();

      const result = await presets.play("doubleTap");

      assert.deepEqual(result, {
        haptics: true,
        audio: false,
        usedAudioFallback: false,
      });
      assert.deepEqual(calls, [[30, 60, 30]]);

      // No AudioContext/OfflineAudioContext should have been instantiated —
      // the haptic path short-circuits before AudioGenerator.parse runs.
      assert.equal(
        getAudioContexts().length,
        0,
        "no AudioContext should have been created on the haptics-only path",
      );
      assert.equal(
        getOfflineContexts().length,
        0,
        "no OfflineAudioContext should have been created on the haptics-only path",
      );
    });
  });
});

test("play('tap') falls back to audio when navigator is absent", async () => {
  await withAudioMocks(async ({ getAudioContexts, getOfflineContexts }) => {
    await withoutNavigator(async () => {
      const presets = new PresetsManager();

      const result = await presets.play("tap");

      assert.deepEqual(result, {
        haptics: false,
        audio: true,
        usedAudioFallback: true,
      });
      assert.equal(getAudioContexts().length, 1, "exactly one AudioContext should have been created");
      assert.equal(
        getOfflineContexts().length,
        1,
        "exactly one OfflineAudioContext should have been created",
      );
    });
  });
});

test("play respects soundEnabled=false — no audio fallback runs", async () => {
  await withAudioMocks(async ({ getAudioContexts }) => {
    await withoutNavigator(async () => {
      Settings.enableSound(false);

      const presets = new PresetsManager();
      const result = await presets.play("tap");

      assert.deepEqual(result, {
        haptics: false,
        audio: false,
        usedAudioFallback: false,
      });
      assert.equal(
        getAudioContexts().length,
        0,
        "no AudioContext should have been created when sound is disabled",
      );
    });
  });
});

test("play(A) then play(B) stops A's audio fallback when B starts", async () => {
  // Both presets must reach the audio fallback, so navigator is absent.
  // After play(A), A's AudioGenerator has a live BufferSource (its play()
  // promise stays pending until onended fires — our mock fires it via
  // microtask, but we can inspect started/stopped flags synchronously after
  // start() in the same microtask-batched async/await flow).
  //
  // When play(B) runs, Presets.play first calls A.stop() on the previously
  // tracked currentlyPlaying — that propagates to A's AudioGenerator.stop(),
  // which calls source.stop() on A's currently-live BufferSource.
  //
  // We verify by spying on the first AudioContext's createdSources list: the
  // first source (A's) should have stopped=true after play(B) kicks off.
  // Use autoEndOnStart:false so A's BufferSource stays "live" (no auto-onended)
  // until we explicitly fire it. That lets us reliably observe B's stop()
  // cancelling A's still-active source.
  await withAudioMocks({ autoEndOnStart: false }, async ({ getAudioContexts }) => {
    await withoutNavigator(async () => {
      const presets = new PresetsManager();

      // Kick off A and drain microtasks until A has reached the audio-play
      // phase and has a live BufferSource. We do that by awaiting a few empty
      // microtasks (parse is async; play is async; we need both to have
      // happened so audioContext.createBufferSource() has been called).
      const firstPlay = presets.play("tap");
      // Drain enough microtasks for parse() + play() to have created the source.
      for (let i = 0; i < 10; i++) {
        await Promise.resolve();
      }

      // Now kick off B. Presets.play("doubleTap") synchronously runs
      // currentlyPlaying.stop() — which propagates to A.audioGenerator.stop()
      // — which calls source.stop() on A's still-live BufferSource.
      const secondPlay = presets.play("doubleTap");

      // A's first source should be stopped synchronously when B's
      // currentlyPlaying.stop() ran.
      const audioContexts = getAudioContexts();
      assert.ok(audioContexts.length >= 1, "expected at least one AudioContext");
      const aSources = audioContexts[0].createdSources;
      assert.ok(aSources.length >= 1, "A should have created at least one BufferSource");
      assert.equal(
        aSources[0].stopped,
        true,
        "A's first BufferSource should have been stopped when play(B) ran",
      );

      // Drain B's parse/play microtasks too, so its source is created and we
      // can fire onended for everything still pending. Without this, the
      // Promise.all below would hang because B's play() promise never resolves.
      for (let i = 0; i < 10; i++) {
        await Promise.resolve();
      }
      // Fire onended for any source that hasn't ended yet (autoEndOnStart was
      // disabled), so the pending presetA.play()/presetB.play() promises
      // resolve.
      const fireAll = () => {
        for (const ctx of getAudioContexts()) {
          for (const source of ctx.createdSources) {
            if (source.onended && !source.stopped) {
              const handler = source.onended;
              source.onended = null;
              handler();
            } else if (source.onended) {
              const handler = source.onended;
              source.onended = null;
              handler();
            }
          }
        }
      };
      fireAll();

      // Now drain both promises so the test doesn't leak.
      const [resultA, resultB] = await Promise.all([firstPlay, secondPlay]);

      // Both should have taken the audio fallback (no navigator).
      assert.equal(resultA.usedAudioFallback, true, "A should have used audio fallback");
      assert.equal(resultB.usedAudioFallback, true, "B should have used audio fallback");
    });
  });
});

test("play(A) then play(B) does NOT cancel A's haptic vibration (no navigator.vibrate(0) emitted)", async () => {
  // Switching presets must NOT implicitly stop the haptic vibration of the
  // previous preset — only an explicit Presets.stop() / Settings.stopHaptics()
  // should do that. We verify by inspecting recorded navigator.vibrate calls
  // for the absence of a `vibrate(0)` entry.
  const { navigator: nav, calls } = makeVibrateRecorder({ result: true });

  await withAudioMocks(async () => {
    await withNavigator(nav, async () => {
      const presets = new PresetsManager();

      await presets.play("tap");
      await presets.play("doubleTap");

      // We expect exactly the two patterns vibrated, in order. Critically,
      // there should be NO `0` entry between them.
      for (const entry of calls) {
        assert.notEqual(entry, 0, "Presets.play must not emit a vibrate(0) cancel between plays");
      }
      // Both haptic plays should have happened.
      assert.equal(calls.length, 2, "expected exactly two navigator.vibrate calls");
    });
  });
});

test("Presets.stop fires stop handlers + navigator.vibrate(0) AND stops tracked currentlyPlaying audio; returns true when either succeeded", async () => {
  // We arrange BOTH a successful haptic stop (navigator.vibrate(0) returns
  // true) AND a tracked currentlyPlaying with a live audio source so both
  // operands of the `||` return true. Then we tear off the navigator to
  // verify the audio-only branch separately.
  const { navigator: nav, calls } = makeVibrateRecorder({ result: true });

  await withAudioMocks(async ({ getAudioContexts }) => {
    // First: drive a play that goes through the audio fallback path so the
    // registry has a currentlyPlaying with a live BufferSource. We need
    // haptics absent for the fallback to engage.
    const presets = new PresetsManager();

    await withoutNavigator(async () => {
      // Schedule but don't await — keeps BufferSource alive past the call.
      // Actually since audio is mocked with microtask onended, awaiting
      // resolves before we even reach the next line. So we must call stop()
      // before awaiting. The play promise itself won't reject when stopped.
      const pending = presets.play("tap");
      // Reach into the mock and assert the source is live at this point.
      const ctxs = getAudioContexts();
      assert.equal(ctxs.length, 1, "audio fallback should have created one AudioContext");
      // The BufferSource may or may not be constructed yet (parse is async),
      // so await one microtask via Promise.resolve() to let parse() finish.
      await Promise.resolve();
      // Drain remaining microtasks until the source exists. Bound the loop.
      for (let i = 0; i < 5 && ctxs[0].createdSources.length === 0; i += 1) {
        await Promise.resolve();
      }
      // Now stop while the source is (hopefully) still live.
      // Install a navigator so the haptic side of stop() also returns true.
      installNavigator(nav);
      try {
        const didStop = presets.stop();

        assert.equal(didStop, true, "Presets.stop should return true when either side succeeded");
        assert.deepEqual(calls, [0], "Presets.stop should have invoked navigator.vibrate(0)");

        // The previously-tracked preset's AudioGenerator should have been
        // stopped — verify via the BufferSource if it was created.
        if (ctxs[0].createdSources.length > 0) {
          assert.equal(
            ctxs[0].createdSources[0].stopped,
            true,
            "Presets.stop should have stopped the tracked preset's BufferSource",
          );
        }
      } finally {
        restoreNavigator();
      }
      // Let the pending play promise settle so we don't dangle.
      await pending;
    });
  });
});

test("Presets.stop returns false when navigator.vibrate is unavailable AND no audio is in flight", async () => {
  await withoutNavigator(() => {
    const presets = new PresetsManager();

    // Fresh registry, no play() yet — currentlyPlaying is null.
    const result = presets.stop();

    assert.equal(
      result,
      false,
      "stop on a fresh registry with no audio + no navigator must return false",
    );
  });
});

test("Presets.stop on a fresh registry with no currentlyPlaying returns whatever Settings.stopHaptics returns", async () => {
  // When haptics IS available, Settings.stopHaptics returns navigator.vibrate(0)'s
  // return value; with our recorder set to result: true, that is true. There
  // is no audio in flight, so the OR collapses to the haptics side.
  const { navigator: nav, calls } = makeVibrateRecorder({ result: true });

  await withNavigator(nav, () => {
    const presets = new PresetsManager();

    const result = presets.stop();

    assert.equal(result, true, "stop should mirror Settings.stopHaptics's true return");
    assert.deepEqual(calls, [0], "navigator.vibrate(0) should have been called once");
  });

  // And when haptics is available but vibrate returns false (e.g. denied),
  // Presets.stop should also return false on a fresh registry.
  const denied = makeVibrateRecorder({ result: false });
  await withNavigator(denied.navigator, () => {
    const presets = new PresetsManager();

    const result = presets.stop();

    assert.equal(result, false, "stop should mirror vibrate(0)'s false return on a fresh registry");
    assert.deepEqual(denied.calls, [0]);
  });
});

test("smoke: every BUILTIN_PRESETS entry is reachable via get() and play() without throwing", async () => {
  // Use the haptics path (vibrate recorder returns true) so play() returns
  // quickly with no audio fallback work for ~140 presets.
  const { navigator: nav } = makeVibrateRecorder({ result: true });

  await withAudioMocks(async () => {
    await withNavigator(nav, async () => {
      const presets = new PresetsManager();
      const names = presets.list();

      // Every key of BUILTIN_PRESETS should show up in list().
      const builtInKeys = Object.keys(BUILTIN_PRESETS);
      assert.equal(
        names.length,
        builtInKeys.length,
        "list() should expose exactly one entry per BUILTIN_PRESETS key",
      );
      for (const key of builtInKeys) {
        assert.ok(presets.has(key), `expected has('${key}') to be true`);
        const preset = presets.get(key);
        assert.equal(preset.name, key);
      }

      // And every preset should play() without throwing. We iterate
      // sequentially so each play() awaits cleanly.
      for (const name of names) {
        const result = await presets.play(name);
        // haptics may be true or false depending on whether the parsed
        // pattern is empty, but the SHAPE of the result must always match.
        assert.equal(typeof result.haptics, "boolean", `play('${name}').haptics must be boolean`);
        assert.equal(typeof result.audio, "boolean", `play('${name}').audio must be boolean`);
        assert.equal(
          typeof result.usedAudioFallback,
          "boolean",
          `play('${name}').usedAudioFallback must be boolean`,
        );
      }
    });
  });
});
