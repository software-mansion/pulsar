# Pulsar Web App

A web clone of the Pulsar mobile app (`/PulsarApp`), shipped alongside the docs
at **/pulsar/web-app/**. It mirrors four of the app's screens — Presets,
Playground, Demos and Games — and drives them all with the real
[`pulsar-haptics`](../../web/Pulsar) web SDK.

## Why it is a separate bundle

The app is a standalone Vite build, deliberately kept out of the Astro bundle:
none of its JavaScript, CSS or waveform images are downloaded by a docs reader
until they open the web app itself. `astro build` only copies the finished
output into `dist/`.

```
docs/web-app/            source
docs/vite.web-app.config.ts   build config (root: web-app, base: /pulsar/web-app/)
docs/public/web-app/     build output — generated, git-ignored
```

## Commands

Run from `docs/`:

| Command                     | What it does                                                              |
| --------------------------- | ------------------------------------------------------------------------- |
| `npm run dev:web-app`       | Vite dev server for the app alone (http://localhost:5173/pulsar/web-app/) |
| `npm run build:web-app`     | Production build into `public/web-app/`                                   |
| `npm run typecheck:web-app` | Type-checks the app                                                       |

`npm run dev` and `npm run build` both run `build:web-app` first, so the docs
site always serves an up-to-date copy.

## Shared data

Presets come from `docs/src/content/docs/assets/webPresets/` — the same
generated JSON + waveform PNGs the docs' web presets playground uses, picked up
with `import.meta.glob` so newly generated presets appear without edits here.
Tag copy is imported from the docs' `PresetsList/Tags.ts`.

## Haptics on the web

Web haptics only exist behind the Vibration API, which desktop browsers and iOS
Safari do not expose. On those, `Preset` renders each pattern to audio instead,
so the rhythm is still perceivable — the app surfaces that as an "audio
fallback" toggle. Android Chrome gets the real thing.

## Games

`src/screens/games/` holds playable demos. Add one by appending to the `GAMES`
array in `screens/games/index.tsx`; routing, the list screen and the back button
follow from there.

### Shape Cascade (`screens/games/shape/`)

A match-3 built to show haptics doing real work — every match, drop, special and
combo is a distinct Pulsar pattern.

A line of three is only the _trigger_: `sweepConnected` then flood-fills the
whole touching blob of that colour, so an L with a stray tail clears as one
lump instead of leaving orphans. Only the cleared set grows — which special a
match earns is still measured on the straight runs, so a sprawling blob cannot
accidentally mint a colour bomb.

| File               | Role                                                                    |
| ------------------ | ----------------------------------------------------------------------- |
| `engine.ts`        | Pure rules: matching, specials, cascades, gravity. No React, no DOM.    |
| `haptics.ts`       | The haptic vocabulary, plus the priority arbiter described below.       |
| `audio.ts`         | Procedural Web Audio synth — every sound is generated, no samples.      |
| `effects.ts`       | Binds haptic + sound + particles together, one function per game event. |
| `particles/`       | TypeGPU/WebGPU particle field, with a Canvas 2D fallback.               |
| `ShapeCascade.tsx` | Playback only: walks the steps the engine returned and fires effects.   |

Three decisions are worth knowing before changing anything here.

**Resolution happens before animation.** `resolveMove` plays a whole move out —
every cascade, every chain reaction — and returns an ordered list of steps. The
component then animates them. That is what lets the celebration know a chain is
five deep _before_ the first shape pops, so the finale can be scheduled instead
of discovered.

**Haptics are arbitrated, not queued.** The Web Vibration API has one global
timeline: starting a pattern cancels whatever was playing. A cascade fires a
dozen events per second, so `playHaptic` takes a priority and refuses to let a
tile-landing tick interrupt a combo finale.

**Banners are typed, not uniform.** `BannerKind` (`bonus` / `cascade` /
`combo` / `super` / `info`) picks the tint, the rim's colour and spin speed, the
title size, how long it stays up, its own entry-and-exit keyframes, and the
sparks `bannerEffect` throws around it — a bonus tip should not arrive like a
wipeout. The shared shell lives on `.shape-banner`; each kind overrides only the
parts that carry meaning. `--banner-top` in the stylesheet must stay in step
with `BANNER_TOP` in `effects.ts`, which is where those sparks are aimed.

**Anything driven by `requestAnimationFrame` needs a backstop.** Browsers stop
rAF for a hidden or throttled page, and this game leans on it in two places: the
particle field (which drops bursts when its loop has gone quiet, rather than
banking a wall of confetti for the first frame back) and the HUD counters (whose
count-up tween is snapped to its target by a timer if the frames never arrive).
Note that embedded and preview surfaces report `document.hidden` while plainly
on screen, so ask the render loop whether it is running — never that flag.

**Sound is synthesised so it can share the haptics' numbers.** Match pitch walks
a pentatonic scale with cascade depth, the same value that raises the pulse
frequency; the finale's riser is built against `FINALE_MS`, the constant the
finale haptic uses. Sound and vibration rise and land together by construction.

### Particles

`particles/index.ts` picks a backend. WebGPU is tried first and TypeGPU is
imported lazily, so browsers without it never download the ~310 kB chunk;
anything that fails — no adapter, a shader a driver rejects — falls back to
Canvas 2D with matching motion constants.

The canvas is portalled into `.shell`, not the board: the board must keep
`overflow: hidden` for the shapes' drop-in, which would slice every spark off
at its border. Effects are still written in board coordinates and the backend
shifts them by `setOrigin`, re-read each frame so scrolling and resizing need no
listeners. `resize` is a no-op when the size is unchanged — it is called from
the frame loop, and assigning `canvas.width` reallocates the backing store.

The WebGPU path keeps both spawning and integration on the GPU. The CPU appends
a _description_ of each burst to a small storage array and dispatches one thread
per particle to be born, so a nine-tile cascade costs one buffer write and one
dispatch. `'use gpu'` function bodies are compiled to WGSL at build time by
`unplugin-typegpu`, wired up in `../vite.web-app.config.ts` — without that
plugin TypeGPU has no AST for them and throws at runtime.
