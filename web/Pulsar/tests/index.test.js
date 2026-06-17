import test from "node:test";
import assert from "node:assert/strict";

import * as pulsarHaptics from "../src/index.ts";
import Pulsar from "../src/Pulsar.ts";
import { AudioGenerator } from "../src/AudioGenerator.ts";
import { PatternComposer } from "../src/PatternComposer.ts";
import { Preset, Presets } from "../src/Presets.ts";
import { RealtimeComposer } from "../src/RealtimeComposer.ts";
import Settings from "../src/Settings.ts";

// NOTE: TypeScript type re-exports (AudioBufferInfo, HapticContinuousSegment,
// HapticLineSegment, HapticPattern, HapticPulseSegment, HapticValuePoint,
// ParsedPattern, PresetName, PresetPlaybackResult) cannot be asserted at
// runtime — they are erased at compile time. Their presence is covered by
// the project's TypeScript typecheck script, not by this file.

test("default export is the Pulsar class", () => {
  assert.equal(typeof pulsarHaptics.default, "function");
  assert.equal(pulsarHaptics.default, Pulsar);
});

test("default export is identical to the named Pulsar export", () => {
  assert.equal(pulsarHaptics.default, pulsarHaptics.Pulsar);
});

test("named Pulsar export references the Pulsar class", () => {
  assert.equal(typeof pulsarHaptics.Pulsar, "function");
  assert.equal(pulsarHaptics.Pulsar, Pulsar);
});

test("AudioGenerator is exported as a class", () => {
  assert.equal(typeof pulsarHaptics.AudioGenerator, "function");
  assert.equal(pulsarHaptics.AudioGenerator, AudioGenerator);
});

test("PatternComposer is exported as a class", () => {
  assert.equal(typeof pulsarHaptics.PatternComposer, "function");
  assert.equal(pulsarHaptics.PatternComposer, PatternComposer);
});

test("Preset is exported as a class", () => {
  assert.equal(typeof pulsarHaptics.Preset, "function");
  assert.equal(pulsarHaptics.Preset, Preset);
});

test("Presets is exported as the shared singleton instance (not a class)", () => {
  assert.equal(typeof pulsarHaptics.Presets, "object");
  assert.notEqual(pulsarHaptics.Presets, null);
  assert.equal(pulsarHaptics.Presets, Presets);
});

test("RealtimeComposer is exported as a class", () => {
  assert.equal(typeof pulsarHaptics.RealtimeComposer, "function");
  assert.equal(pulsarHaptics.RealtimeComposer, RealtimeComposer);
});

test("Settings is exported as an object (not a class)", () => {
  assert.equal(typeof pulsarHaptics.Settings, "object");
  assert.notEqual(pulsarHaptics.Settings, null);
  assert.equal(pulsarHaptics.Settings, Settings);
});

test("Settings exposes isHapticsEnabled as a function", () => {
  assert.equal(typeof pulsarHaptics.Settings.isHapticsEnabled, "function");
});

test("Settings exposes isSoundEnabled as a function", () => {
  assert.equal(typeof pulsarHaptics.Settings.isSoundEnabled, "function");
});

test("Settings exposes isHapticsAvailable as a function", () => {
  assert.equal(typeof pulsarHaptics.Settings.isHapticsAvailable, "function");
});

test("Settings exposes enableHaptics as a function", () => {
  assert.equal(typeof pulsarHaptics.Settings.enableHaptics, "function");
});

test("Settings exposes enableSound as a function", () => {
  assert.equal(typeof pulsarHaptics.Settings.enableSound, "function");
});

test("Settings exposes stopHaptics as a function", () => {
  assert.equal(typeof pulsarHaptics.Settings.stopHaptics, "function");
});

test("Settings exposes registerStopHapticsHandler as a function", () => {
  assert.equal(typeof pulsarHaptics.Settings.registerStopHapticsHandler, "function");
});

test("public surface enumerates exactly the documented named exports", () => {
  const expected = new Set([
    "default",
    "Pulsar",
    "AudioGenerator",
    "PatternComposer",
    "Preset",
    "Presets",
    "RealtimeComposer",
    "Settings",
  ]);
  const actual = new Set(Object.keys(pulsarHaptics));

  for (const name of expected) {
    assert.ok(actual.has(name), `expected public surface to export "${name}"`);
  }
  for (const name of actual) {
    assert.ok(expected.has(name), `unexpected named export "${name}" on public surface`);
  }
});

test("Pulsar class is constructible from the public surface", () => {
  const instance = new pulsarHaptics.Pulsar();
  assert.ok(instance instanceof Pulsar);
  assert.equal(typeof instance.getPresets, "function");
  assert.equal(typeof instance.getPatternComposer, "function");
  assert.equal(typeof instance.getRealtimeComposer, "function");
  assert.equal(typeof instance.isHapticsSupported, "function");
  assert.equal(typeof instance.enableHaptics, "function");
  assert.equal(typeof instance.enableSound, "function");
  assert.equal(typeof instance.stopHaptics, "function");
});
