#!/usr/bin/env node
/**
 * Generates one JSON file per built-in web haptic preset into `web/Pulsar/presets/`.
 *
 * `src/builtin-presets.ts` (BUILTIN_PRESETS) is the single source of truth for the
 * pattern data. This script pairs each pattern with curated metadata — an evocative
 * name, a description, and tags — and writes `<Name>.json`.
 *
 * The metadata lives here (not in the library source) so the runtime stays lean.
 * Preset keys are renamed to follow the haptic naming rules: names evoke what the
 * pattern *feels* like, in PascalCase, and the file name always matches the `name`.
 * Descriptions lead with the emotion and intention of the haptic, not the shape of
 * the signal.
 *
 * Usage: node --experimental-strip-types scripts/generate-presets.ts [--clean]
 *   --clean  Remove stray *.json in the output dir that no longer map to a preset.
 */

import { fileURLToPath } from "node:url";
import fs from "node:fs";
import path from "node:path";

import { BUILTIN_PRESETS } from "../src/builtin-presets.ts";
import type { HapticPattern } from "../src/types.ts";

type PresetKey = keyof typeof BUILTIN_PRESETS;

type Meta = {
  /** Evocative PascalCase name; also the output file name. */
  name: string;
  description: string;
  tags: [weight: string, texture: string, structure: string, length: string];
};

/**
 * Curated metadata for every built-in preset.
 *
 * Tags follow the same four-axis vocabulary as the verified mobile presets:
 *   weight:    Bold | Substantial | Soft | Gentle
 *   texture:   Rigid | Flexible | Solid
 *   structure: Impulse | Impulses | Pattern | Ramp | Bumps | Peak | Saw
 *   length:    Short | Long | Extended
 * A "Web" tag is appended to every preset at write time.
 */
const META: Record<PresetKey, Meta> = {
  tap: {
    name: "Tap",
    description: "Clean and immediate, ideal for confirming a selection or a basic button press.",
    tags: ["Substantial", "Rigid", "Impulse", "Short"],
  },
  softTap1: {
    name: "Feather",
    description: "Barely-there and delicate, suited for subtle confirmations that should never intrude.",
    tags: ["Gentle", "Soft", "Impulse", "Short"],
  },
  doubleTap: {
    name: "Knock",
    description: "Insistent and intentional, suited for toggles or acknowledging a deliberate action.",
    tags: ["Substantial", "Rigid", "Impulses", "Short"],
  },
  tripleTap: {
    name: "Patter",
    description: "Light and playful, suited for multi-step confirmations or lighthearted feedback.",
    tags: ["Substantial", "Rigid", "Impulses", "Short"],
  },
  sneeze: {
    name: "Sneeze",
    description: "Pent-up then suddenly released, suited for a surprising, expressive moment.",
    tags: ["Bold", "Flexible", "Pattern", "Short"],
  },
  pulseHeavySlow: {
    name: "Rumble",
    description: "Heavy and ominous, ideal for powerful impacts or sustained tension.",
    tags: ["Bold", "Soft", "Impulse", "Long"],
  },
  pulseMidPlateau: {
    name: "Drone",
    description: "Calm and constant, ideal for ongoing states or loading feedback.",
    tags: ["Substantial", "Soft", "Impulse", "Long"],
  },
  longPress: {
    name: "Hold",
    description: "Steady and reassuring, ideal for long-press gestures or held-button feedback.",
    tags: ["Substantial", "Rigid", "Impulse", "Short"],
  },
  birdInCage: {
    name: "Flutter",
    description: "Delicate and airy, suited for gentle, fluttering notifications.",
    tags: ["Gentle", "Flexible", "Impulses", "Extended"],
  },
  lullaby: {
    name: "Sway",
    description: "Soothing and unhurried, suited for calm, restful or ambient feedback.",
    tags: ["Gentle", "Soft", "Impulses", "Extended"],
  },
  ringingPhone: {
    name: "Trill",
    description: "Bright and inviting, ideal for incoming calls or attention-grabbing alerts.",
    tags: ["Bold", "Soft", "Impulses", "Extended"],
  },
  emergency: {
    name: "Alert",
    description: "Urgent and insistent, ideal for warnings that demand immediate attention.",
    tags: ["Bold", "Soft", "Impulses", "Extended"],
  },
  tickingOverHum: {
    name: "Pendulum",
    description: "Patient and measured, suited for countdowns or background timing cues.",
    tags: ["Substantial", "Flexible", "Pattern", "Extended"],
  },
  error: {
    name: "Reject",
    description: "Blunt and disapproving, ideal for errors, denials or invalid actions.",
    tags: ["Bold", "Rigid", "Impulses", "Short"],
  },
  criticalAlert: {
    name: "Alarm",
    description: "Tense and demanding, ideal for critical or escalating warnings.",
    tags: ["Bold", "Rigid", "Pattern", "Extended"],
  },
  heartbeat: {
    name: "Heartbeat",
    description: "Alive and anticipatory, suited for organic, tension-building feedback.",
    tags: ["Substantial", "Flexible", "Impulses", "Extended"],
  },
  waltz: {
    name: "Waltz",
    description: "Graceful and lilting, suited for elegant, rhythmic or musical feedback.",
    tags: ["Substantial", "Flexible", "Pattern", "Extended"],
  },
  tribalDrum: {
    name: "WarDrum",
    description: "Solemn and commanding, suited for dramatic or ceremonial moments.",
    tags: ["Bold", "Flexible", "Pattern", "Extended"],
  },
  frogCroak: {
    name: "Croak",
    description: "Goofy and rough-edged, suited for quirky or comedic feedback.",
    tags: ["Substantial", "Soft", "Impulses", "Short"],
  },
  rollingThunder: {
    name: "Thunder",
    description: "Brooding and powerful, ideal for ominous or climactic moments.",
    tags: ["Bold", "Soft", "Impulses", "Long"],
  },
  fireworksFinale: {
    name: "Finale",
    description: "Triumphant and exhilarating, ideal for celebrations and grand reveals.",
    tags: ["Bold", "Flexible", "Pattern", "Extended"],
  },
  drumrollReveal: {
    name: "Drumroll",
    description: "Suspenseful and building, ideal for anticipation and reveals.",
    tags: ["Substantial", "Flexible", "Pattern", "Extended"],
  },
  gameOver: {
    name: "Deflate",
    description: "Disappointed and fading, suited for failure, loss or winding-down moments.",
    tags: ["Substantial", "Flexible", "Pattern", "Extended"],
  },
  comboFinisher: {
    name: "Knockout",
    description: "Punchy and decisive, ideal for combos or finishing actions.",
    tags: ["Bold", "Flexible", "Pattern", "Short"],
  },
  amusementPark: {
    name: "Crescendo",
    description: "Building and exhilarating, suited for rising excitement or progress.",
    tags: ["Substantial", "Flexible", "Ramp", "Extended"],
  },
  respawn: {
    name: "Surface",
    description: "Emergent and refreshing, suited for spawning, appearing or surfacing feedback.",
    tags: ["Substantial", "Flexible", "Ramp", "Extended"],
  },
  anger: {
    name: "Fury",
    description: "Agitated and seething, suited for tension, frustration or aggression.",
    tags: ["Bold", "Flexible", "Pattern", "Extended"],
  },
  clockTick: {
    name: "Clockwork",
    description: "Precise and dependable, ideal for timers, metronomes or steady pacing.",
    tags: ["Substantial", "Rigid", "Impulses", "Extended"],
  },
  binaryBeep: {
    name: "Morse",
    description: "Deliberate and coded, suited for signaling or distinct notifications.",
    tags: ["Substantial", "Rigid", "Pattern", "Short"],
  },
  trainClickClack: {
    name: "Clatter",
    description: "Restless and mechanical, suited for industrial or transit-themed feedback.",
    tags: ["Substantial", "Rigid", "Impulses", "Extended"],
  },
  carCrash: {
    name: "Smash",
    description: "Violent and jarring, ideal for collisions or destructive events.",
    tags: ["Bold", "Flexible", "Pattern", "Extended"],
  },
  popcorn: {
    name: "Popcorn",
    description: "Playful and unpredictable, suited for lively, bursty or random feedback.",
    tags: ["Gentle", "Flexible", "Impulses", "Extended"],
  },
  kettleWhistle: {
    name: "Foghorn",
    description: "Grave and insistent, ideal for steady, attention-holding signaling.",
    tags: ["Substantial", "Rigid", "Impulses", "Extended"],
  },
  burp: {
    name: "Burp",
    description: "Cheeky and casual, suited for comedic or lighthearted feedback.",
    tags: ["Substantial", "Soft", "Impulse", "Short"],
  },
  glassBreak: {
    name: "Shatter",
    description: "Brittle and startling, ideal for breaking, cracking or fracture effects.",
    tags: ["Bold", "Flexible", "Pattern", "Extended"],
  },
  coinDrop: {
    name: "Bounce",
    description: "Light and settling, suited for drops, coins or landing feedback.",
    tags: ["Substantial", "Flexible", "Impulses", "Short"],
  },
  intervalEnd: {
    name: "Timeout",
    description: "Conclusive and clear, ideal for ending intervals or session boundaries.",
    tags: ["Substantial", "Rigid", "Pattern", "Extended"],
  },
  hopscotch: {
    name: "Skip",
    description: "Bouncy and carefree, suited for playful stepping or progress feedback.",
    tags: ["Substantial", "Flexible", "Pattern", "Extended"],
  },
  fibonacciTaps: {
    name: "Unwind",
    description: "Relaxing and decelerating, suited for slowing, releasing or settling feedback.",
    tags: ["Substantial", "Flexible", "Ramp", "Extended"],
  },
  fibonacciTapsReverse: {
    name: "Windup",
    description: "Tightening and energizing, ideal for charging, accelerating or building tension.",
    tags: ["Substantial", "Flexible", "Ramp", "Extended"],
  },
  siren: {
    name: "Siren",
    description: "Alarming and sweeping, ideal for emergencies or urgent alerts.",
    tags: ["Bold", "Flexible", "Pattern", "Extended"],
  },
  tremoloHeavy: {
    name: "Shudder",
    description: "Unsettled and trembling, suited for shivering, straining or unstable feedback.",
    tags: ["Bold", "Soft", "Pattern", "Extended"],
  },
  phoneRingPickup: {
    name: "Connect",
    description: "Welcoming and resolved, suited for connecting, answering or linking feedback.",
    tags: ["Bold", "Flexible", "Pattern", "Extended"],
  },
  fractalCascade: {
    name: "Ripple",
    description: "Flowing and expansive, suited for cascading or rippling feedback.",
    tags: ["Substantial", "Flexible", "Pattern", "Extended"],
  },
  twoToneBuzzer: {
    name: "Warble",
    description: "Quirky and distinctive, ideal for attention-catching two-tone alerts.",
    tags: ["Bold", "Soft", "Pattern", "Extended"],
  },
};

/** Total length of a pattern, in milliseconds (latest segment end). */
function patternDuration(pattern: HapticPattern): number {
  return pattern.reduce(
    (max, segment) => Math.max(max, segment.timestamp + segment.duration),
    0,
  );
}

const here = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(here, "../../../docs/src/content/docs/assets/webPresets");

const keys = Object.keys(BUILTIN_PRESETS) as PresetKey[];

// Fail loudly if metadata and source ever drift apart.
const missing = keys.filter((key) => !META[key]);
if (missing.length > 0) {
  console.error(`Missing metadata for preset(s): ${missing.join(", ")}`);
  process.exit(1);
}

const names = new Map<string, PresetKey>();
for (const key of keys) {
  const { name } = META[key];
  if (!/^[A-Z][A-Za-z]*$/.test(name)) {
    console.error(`Invalid name "${name}" for "${key}" — must be PascalCase, letters only.`);
    process.exit(1);
  }
  const clash = names.get(name);
  if (clash) {
    console.error(`Duplicate name "${name}" used by "${clash}" and "${key}".`);
    process.exit(1);
  }
  names.set(name, key);
}

fs.mkdirSync(outDir, { recursive: true });

const expectedFiles = new Set<string>();
const sortedNames: string[] = [];
for (const key of keys) {
  const { name, description, tags } = META[key];
  const pattern = BUILTIN_PRESETS[key] as HapticPattern;
  const json = {
    name,
    description,
    tags: [...tags, "Web"],
    duration: patternDuration(pattern),
    pattern,
  };
  const file = path.join(outDir, `${name}.json`);
  fs.writeFileSync(file, `${JSON.stringify(json, null, 2)}\n`);
  expectedFiles.add(`${name}.json`);
  sortedNames.push(name);
}
sortedNames.sort((a, b) => a.localeCompare(b));

// Wire every preset JSON + its PNG into the docs config the same way the mobile
// codegen does: fill the CODEGEN marker blocks of a committed WebPresetsConfig.ts
// rather than overwriting the hand-maintained wrapper.
const configImports = sortedNames
  .map(
    (name) =>
      `import ${name}Preset from './${name}.json';\nimport ${name}Image from './${name}.png';`,
  )
  .join("\n");
const configEntries = sortedNames
  .map((name) => `  { data: ${name}Preset, image: ${name}Image },`)
  .join("\n");

const configPath = path.join(outDir, "WebPresetsConfig.ts");
const CONFIG_SCAFFOLD = `import type { WebPresetConfig } from '../../components/WebPreset/types';

// CODEGEN_BEGIN_{imports}
// CODEGEN_END_{imports}

export const WebPresetsConfig: Array<WebPresetConfig> = [
// CODEGEN_BEGIN_{presets}
// CODEGEN_END_{presets}
];
`;

if (!fs.existsSync(configPath)) {
  fs.writeFileSync(configPath, CONFIG_SCAFFOLD);
}

/** Replace the content between CODEGEN_BEGIN_{section} … CODEGEN_END_{section}. */
function updateSection(filePath: string, section: string, body: string): void {
  const begin = `// CODEGEN_BEGIN_{${section}}`;
  const end = `// CODEGEN_END_{${section}}`;
  const content = fs.readFileSync(filePath, "utf8");
  const beginIdx = content.indexOf(begin);
  const endIdx = content.indexOf(end, beginIdx + begin.length);
  if (beginIdx === -1 || endIdx === -1) {
    console.error(`Missing ${begin} / ${end} markers in ${filePath}`);
    process.exit(1);
  }
  const before = content.slice(0, beginIdx + begin.length);
  const after = content.slice(endIdx);
  fs.writeFileSync(filePath, `${before}\n${body}\n${after}`);
}

updateSection(configPath, "imports", configImports);
updateSection(configPath, "presets", configEntries);

// Generate the typed preset map that powers `pulsar.getPresets().<name>()`.
const methodOf = (name: string) => `${name.charAt(0).toLowerCase()}${name.slice(1)}`;
const presetMethods = keys
  .map((key) => ({ key, name: META[key].name }))
  .sort((a, b) => a.name.localeCompare(b.name))
  .map(
    ({ key, name }) =>
      `  ${methodOf(name)}: { name: ${JSON.stringify(name)}, pattern: BUILTIN_PRESETS.${key} },`,
  )
  .join("\n");
const generatedApi = `// AUTO-GENERATED by web/Pulsar/scripts/generate-presets.ts — do not edit by hand.
import { BUILTIN_PRESETS } from "./builtin-presets.ts";
import type { HapticPattern } from "./types.ts";

export const PRESETS = {
${presetMethods}
} as const satisfies Record<string, { name: string; pattern: HapticPattern }>;

export type PresetMethodName = keyof typeof PRESETS;
`;
fs.writeFileSync(path.resolve(here, "../src/generated-presets.ts"), generatedApi);

if (process.argv.includes("--clean")) {
  for (const entry of fs.readdirSync(outDir)) {
    if (entry.endsWith(".json") && !expectedFiles.has(entry)) {
      fs.rmSync(path.join(outDir, entry));
      console.log(`  removed stale ${entry}`);
    }
  }
}

console.log(`Generated ${keys.length} preset JSON file(s) in ${path.relative(process.cwd(), outDir)}`);
