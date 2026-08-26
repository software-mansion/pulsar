# Pulsar Web App

A web clone of the Pulsar mobile app (`/PulsarApp`), shipped alongside the docs
at **/pulsar/web-app/**. It mirrors four of the app's screens — Presets,
Playground, Demos and Games (a placeholder for now) — and drives them all with
the real [`pulsar-haptics`](../../web/Pulsar) web SDK.

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
