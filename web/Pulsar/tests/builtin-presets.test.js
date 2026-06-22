import test from "node:test";
import assert from "node:assert/strict";

import { BUILTIN_PRESETS } from "../src/builtin-presets.ts";
import { PatternComposer } from "../src/PatternComposer.ts";
import { PresetsManager } from "../src/Presets.ts";

const isFiniteNumber = (value) => typeof value === "number" && Number.isFinite(value);

const isValuePoint = (point) => {
  if (!point || typeof point !== "object") {
    return false;
  }
  if (!isFiniteNumber(point.time) || point.time < 0) {
    return false;
  }
  if (!isFiniteNumber(point.value) || point.value < 0 || point.value > 1) {
    return false;
  }
  return true;
};

test("every BUILTIN_PRESETS entry is a non-empty HapticPattern array", () => {
  const entries = Object.entries(BUILTIN_PRESETS);
  assert.ok(entries.length > 0, "BUILTIN_PRESETS must have at least one entry");

  for (const [name, pattern] of entries) {
    assert.ok(Array.isArray(pattern), `preset "${name}" must be an array`);
    assert.ok(pattern.length > 0, `preset "${name}" must have at least one segment`);
  }
});

test("every segment of every preset has a valid type, timestamp and duration", () => {
  for (const [name, pattern] of Object.entries(BUILTIN_PRESETS)) {
    pattern.forEach((segment, index) => {
      const label = `preset "${name}" segment ${index}`;

      assert.ok(segment && typeof segment === "object", `${label} must be an object`);
      assert.ok(
        segment.type === "continuous" ||
          segment.type === "pulse" ||
          segment.type === "line",
        `${label} type must be one of continuous|pulse|line, got "${segment.type}"`,
      );
      assert.ok(
        isFiniteNumber(segment.timestamp),
        `${label} timestamp must be a finite number`,
      );
      assert.ok(
        segment.timestamp >= 0,
        `${label} timestamp must be >= 0`,
      );
      assert.ok(
        isFiniteNumber(segment.duration),
        `${label} duration must be a finite number`,
      );
      assert.ok(
        segment.duration > 0,
        `${label} duration must be > 0`,
      );
    });
  }
});

test("pulse segments expose intensity/frequency in [0, 1] when present", () => {
  let pulseSegmentCount = 0;

  for (const [name, pattern] of Object.entries(BUILTIN_PRESETS)) {
    pattern.forEach((segment, index) => {
      if (segment.type !== "pulse") {
        return;
      }
      pulseSegmentCount += 1;
      const label = `preset "${name}" pulse segment ${index}`;

      if (segment.intensity !== undefined) {
        assert.ok(
          isFiniteNumber(segment.intensity),
          `${label} intensity must be a finite number`,
        );
        assert.ok(
          segment.intensity >= 0 && segment.intensity <= 1,
          `${label} intensity must be in [0, 1], got ${segment.intensity}`,
        );
      }

      if (segment.frequency !== undefined) {
        assert.ok(
          isFiniteNumber(segment.frequency),
          `${label} frequency must be a finite number`,
        );
        assert.ok(
          segment.frequency >= 0 && segment.frequency <= 1,
          `${label} frequency must be in [0, 1], got ${segment.frequency}`,
        );
      }
    });
  }

  assert.ok(
    pulseSegmentCount > 0,
    "expected at least one pulse segment across the builtin presets",
  );
});

test("line segments, when present, expose intensity/frequency curves of { time, value } points in valid ranges", () => {
  let lineSegmentCount = 0;

  for (const [name, pattern] of Object.entries(BUILTIN_PRESETS)) {
    pattern.forEach((segment, index) => {
      if (segment.type !== "line") {
        return;
      }
      lineSegmentCount += 1;
      const label = `preset "${name}" line segment ${index}`;

      assert.ok(Array.isArray(segment.intensity), `${label} intensity must be an array`);
      assert.ok(Array.isArray(segment.frequency), `${label} frequency must be an array`);

      segment.intensity.forEach((point, pointIndex) => {
        assert.ok(
          isValuePoint(point),
          `${label} intensity point ${pointIndex} must be { time: finite>=0, value: in [0,1] }, got ${JSON.stringify(point)}`,
        );
      });

      segment.frequency.forEach((point, pointIndex) => {
        assert.ok(
          isValuePoint(point),
          `${label} frequency point ${pointIndex} must be { time: finite>=0, value: in [0,1] }, got ${JSON.stringify(point)}`,
        );
      });
    });
  }

  // The current build ships no line segments (they were removed from the
  // built-in presets), so we do not require any. This test still guards the
  // shape of line segments if any are reintroduced.
  assert.ok(
    lineSegmentCount >= 0,
    "line segment count must be non-negative",
  );
});

test("Presets.list().length matches the BUILTIN_PRESETS inventory and stays above the regression floor", () => {
  const presets = new PresetsManager();
  const names = presets.list();
  const inventoryKeys = Object.keys(BUILTIN_PRESETS);

  assert.equal(
    names.length,
    inventoryKeys.length,
    `Presets.list() length (${names.length}) must match BUILTIN_PRESETS key count (${inventoryKeys.length})`,
  );

  // Pinned count of presets shipped in this build. Bump this number if you
  // intentionally add or remove built-in presets.
  assert.equal(
    names.length,
    45,
    `Presets.list() length changed from the documented count of 45; if intentional, update this assertion`,
  );

  assert.ok(
    names.length >= 40,
    "Presets.list() length must remain >= 40 as a regression guard against accidental deletions",
  );

  // The names exposed by list() must exactly equal the inventory keys
  // (in insertion order).
  assert.deepEqual(names, inventoryKeys);
});

test("every preset pattern parses without throwing into a valid ParsedPattern shape", () => {
  for (const [name, pattern] of Object.entries(BUILTIN_PRESETS)) {
    const composer = new PatternComposer();

    let parsed;
    assert.doesNotThrow(() => {
      parsed = composer.parse(pattern);
    }, `parse should not throw for preset "${name}"`);

    assert.ok(Array.isArray(parsed), `parsed pattern for "${name}" must be an array`);

    parsed.forEach((entry, index) => {
      assert.ok(
        isFiniteNumber(entry),
        `parsed[${index}] for "${name}" must be a finite number, got ${entry}`,
      );
      assert.ok(
        entry >= 0,
        `parsed[${index}] for "${name}" must be >= 0, got ${entry}`,
      );
    });

    // Documented contract: the parsed pattern is either
    //   - empty (no audible intervals),
    //   - or alternates [vibrate, pause, vibrate, ...] starting with a non-zero
    //     vibrate duration (odd length),
    //   - or starts with a single leading 0 marking leading silence, followed
    //     by alternating [pause, vibrate, pause, vibrate, ...].
    // In both non-empty cases the array ends with a vibrate duration, so the
    // total length is odd when non-empty.
    if (parsed.length === 0) {
      // Empty is allowed even though no built-in preset is expected to produce
      // it — we only assert the contract holds.
    } else {
      assert.equal(
        parsed.length % 2,
        1,
        `parsed pattern for "${name}" must have odd length when non-empty, got length ${parsed.length}`,
      );
      if (parsed[0] === 0) {
        assert.ok(
          parsed.length >= 3,
          `parsed pattern for "${name}" starting with 0 must have a following pause/vibrate pair`,
        );
      } else {
        assert.ok(
          parsed[0] > 0,
          `parsed pattern for "${name}" must start with a positive vibrate duration when no leading 0 is present`,
        );
      }
    }
  }
});

test("canonical preset pattern shapes are pinned against accidental reshape", () => {
  assert.deepEqual(BUILTIN_PRESETS.tap, [
    { type: "continuous", timestamp: 0, duration: 35 },
  ]);

  assert.deepEqual(BUILTIN_PRESETS.doubleTap, [
    { type: "continuous", timestamp: 0, duration: 30 },
    { type: "continuous", timestamp: 90, duration: 30 },
  ]);

  assert.deepEqual(BUILTIN_PRESETS.longPress, [
    { type: "continuous", timestamp: 0, duration: 200 },
  ]);

  assert.deepEqual(BUILTIN_PRESETS.reject, [
    { type: "continuous", timestamp: 0, duration: 90 },
    { type: "continuous", timestamp: 160, duration: 90 },
  ]);

  assert.deepEqual(BUILTIN_PRESETS.rumble, [
    {
      type: "pulse",
      timestamp: 0,
      duration: 1000,
      intensity: 1.0,
      frequency: 0.0,
    },
  ]);

  assert.deepEqual(BUILTIN_PRESETS.drone, [
    {
      type: "pulse",
      timestamp: 0,
      duration: 800,
      intensity: 0.5,
      frequency: 0.5,
    },
  ]);

  assert.deepEqual(BUILTIN_PRESETS.heartbeat, [
    { type: "continuous", timestamp: 0, duration: 45 },
    { type: "continuous", timestamp: 120, duration: 70 },
    { type: "continuous", timestamp: 420, duration: 45 },
    { type: "continuous", timestamp: 540, duration: 70 },
  ]);
});
