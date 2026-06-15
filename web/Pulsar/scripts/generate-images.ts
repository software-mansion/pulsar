#!/usr/bin/env node
/**
 * Generates a PNG visualization for every preset JSON in `web/Pulsar/presets/`
 * and writes it next to the JSON (same base name). Idempotent.
 *
 * The chart shows the *real* signal that is played: each preset is run through the
 * library's PatternComposer to get the actual `navigator.vibrate()` on/off timeline,
 * and every ON interval is drawn as a block. A sustained `continuous` segment is one
 * solid block; a `pulse` segment decomposes into the comb of shots it really emits.
 * All blocks share the same height and color — only the shape carries the signal.
 *
 * The visual skin (white background, light-blue grid, rounded stroked bars) matches
 * the docs preset images. Run `generate-presets.ts` first so the JSON files exist.
 *
 * Usage: node --experimental-strip-types scripts/generate-images.ts [--dir <path>]
 */

import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import path from "node:path";

import { PatternComposer } from "../src/PatternComposer.ts";
import type { HapticPattern } from "../src/types.ts";

const require = createRequire(import.meta.url);
// @napi-rs/canvas is vendored with the playground visualizer, like the docs generator.
const { createCanvas } = require(
  path.resolve(
    fileURLToPath(import.meta.url),
    "../../../../playground/preset-visualizer/node_modules/@napi-rs/canvas",
  ),
);

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const dirIdx = args.indexOf("--dir");
const presetsDir = dirIdx !== -1
  ? path.resolve(args[dirIdx + 1])
  : path.resolve(here, "../../../docs/src/content/docs/assets/webPresets");

const HEIGHT = 100;
const PX_PER_MS = 0.5; // denser than 1px=1ms so longer presets stay compact
const MIN_WIDTH = 1000; // wide enough that the grid fills the scroll box (bars stay natural)
const MARGIN_TOP = 6;
const PAD_X = 14;
const BLOCK_AMPLITUDE = 1; // uniform height for every ON block

const COLORS = {
  background: "#ffffff",
  grid: "#E1F3FA",
  axis: "#4a5568",
  block: "#b5e1f1", // uniform color for every ON block
};

const composer = new PatternComposer();

/**
 * Resolve a pattern to its absolute ON intervals (in ms) — the real played signal.
 *
 * `parse` returns the vibration timeline as alternating durations
 * [on, off, on, off, …]; even indices are ON. We accumulate a cursor to recover the
 * absolute start of each ON block.
 */
function onIntervals(pattern: HapticPattern): Array<{ start: number; end: number }> {
  const timeline = composer.parse(pattern);
  const intervals: Array<{ start: number; end: number }> = [];
  let cursor = 0;
  for (let i = 0; i < timeline.length; i++) {
    const ms = timeline[i] ?? 0;
    if (i % 2 === 0 && ms > 0) {
      intervals.push({ start: cursor, end: cursor + ms });
    }
    cursor += ms;
  }
  return intervals;
}

function render(canvas: any, intervals: Array<{ start: number; end: number }>) {
  const ctx = canvas.getContext("2d");
  const W = canvas.width;
  const plotH = HEIGHT - MARGIN_TOP;
  const baseline = HEIGHT; // amplitude 0 sits flush on the bottom edge (matches docs)

  const scaleX = (t: number) => PAD_X + t * PX_PER_MS;
  const topY = MARGIN_TOP + (1 - BLOCK_AMPLITUDE) * plotH;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, W, HEIGHT);
  ctx.fillStyle = COLORS.background;
  ctx.fillRect(0, 0, W, HEIGHT);

  // Grid — same cell metric and color as the docs renderer.
  ctx.strokeStyle = COLORS.grid;
  ctx.lineWidth = 2;
  const cell = plotH / 10;
  for (let x = 0; x <= W; x += cell) {
    ctx.beginPath();
    ctx.moveTo(x, MARGIN_TOP);
    ctx.lineTo(x, HEIGHT);
    ctx.stroke();
  }
  for (let i = 0; i <= 10; i++) {
    const y = MARGIN_TOP + (i / 10) * plotH;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  for (const { start, end } of intervals) {
    const x0 = scaleX(start);
    const w = Math.max(3, scaleX(end) - x0);
    const h = baseline - topY;
    const r = Math.min(3, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x0 + r, topY);
    ctx.lineTo(x0 + w - r, topY);
    ctx.quadraticCurveTo(x0 + w, topY, x0 + w, topY + r);
    ctx.lineTo(x0 + w, baseline);
    ctx.lineTo(x0, baseline);
    ctx.lineTo(x0, topY + r);
    ctx.quadraticCurveTo(x0, topY, x0 + r, topY);
    ctx.closePath();
    ctx.fillStyle = COLORS.block;
    ctx.fill();
    ctx.strokeStyle = COLORS.axis;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

if (!fs.existsSync(presetsDir)) {
  console.error(`Directory not found: ${presetsDir}`);
  process.exit(1);
}

const files = fs.readdirSync(presetsDir).filter((f) => f.endsWith(".json"));
let ok = 0;
let fail = 0;

for (const file of files) {
  const jsonPath = path.join(presetsDir, file);
  try {
    const preset = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
    const pattern: HapticPattern = preset.pattern ?? [];
    const intervals = onIntervals(pattern);
    const span = intervals.reduce((m, iv) => Math.max(m, iv.end), preset.duration ?? 0);
    const width = Math.max(MIN_WIDTH, Math.round(span * PX_PER_MS) + PAD_X * 2);
    const canvas = createCanvas(width, HEIGHT);
    render(canvas, intervals);
    fs.writeFileSync(jsonPath.replace(/\.json$/, ".png"), canvas.toBuffer("image/png"));
    ok++;
  } catch (err) {
    console.error(`  FAIL  ${file}: ${(err as Error).message}`);
    fail++;
  }
}

console.log(`Done: ${ok} image(s) generated${fail ? `, ${fail} failed` : ""} in ${path.relative(process.cwd(), presetsDir)}`);
