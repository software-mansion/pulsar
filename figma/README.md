# Pulsar Haptics — Figma plugin

Browse the Pulsar haptic preset catalogue, bind a preset to any Figma node, and
hear it both while editing and inside a prototype preview. Optionally pair a
phone to feel real haptics on the device.

## Features

- **206 presets** indexed from the Pulsar repo (151 user, 9 iOS, 47 Android system).
- **Filter & search** by name, tag, category, platform.
- **Full or compact layout** — toggle anywhere or in Settings.
- **Detail view** with SVG pattern visualization, raw JSON, and copy-pastable Swift / Kotlin / React Native / Flutter snippets.
- **Bind to selection** — preset metadata is stored as plugin data on the node, with a relaunch button.
- **Edit-mode playback** — selecting a bound node renders the preset to a WebAudio buffer (port of the docs `audio-player.ts`).
- **Preview-mode playback** — binding attaches a video fill to the node so the prototype player produces sound on tap. Sample MP4 URL until per-preset videos exist.
- **Phone pairing** — same `pulsar-server.swmansion.com` relay used by the docs site (QR + WebSocket, persistent token).
- **Settings** — disable sound in edit / preview independently, change the preview video URL.
- **Theme** — colors, radii, and the signature offset drop-shadow taken from the Pulsar docs CSS.

## Getting started

```bash
# 1. Clone the Pulsar source next to this repo (../pulsar)
git clone --depth 1 https://github.com/software-mansion/pulsar.git ../pulsar

# 2. Install + generate the bundled preset index
npm install
node scripts/build-preset-index.mjs

# 3. Build
npm run build

# In Figma desktop: Plugins → Development → Import plugin from manifest…
# Pick this folder's manifest.json.
```

`npm run dev` rebuilds both bundles on save.

## Project layout

```
manifest.json           Figma plugin manifest (UI + main entries)
vite.config.ts          UI bundle (React, single-file inlined HTML)
vite.main.config.ts     Main-thread bundle (figma sandbox)
scripts/                Preset-index generator (reads ../pulsar)
src/
  shared/types.ts       Messages + data types shared across both bundles
  main/code.ts          Plugin main thread: storage, bindings, video fill
  ui/
    App.tsx             Tabs, selection, dispatch
    figmaBridge.ts      postMessage helpers
    audio/              Ported AudioPatternUtility
    components/         PresetCard, PresetDetail, Filters, Settings, PhonePanel
    presets-data/       Generated preset bundle (gitignored)
    styles/theme.css    Pulsar docs-inspired tokens
```

## Playback per Figma mode

| Mode      | Mechanism                                                                                                        |
| --------- | ---------------------------------------------------------------------------------------------------------------- |
| Edit      | Selecting a bound node fires `selectionchange` → main posts `play-preset` to the UI iframe → WebAudio render.    |
| Prototype | The bound node has a video fill (`createVideoAsync`). Figma's prototype player plays the video (with sound) on tap. |
| Phone     | If paired, the UI POSTs `/broadcast` with the preset name; the relay forwards via WebSocket to the Pulsar app.   |

Each can be turned off independently in Settings.

## Notes / limitations

- Figma's plugin API has no direct "click in editor" hook — we proxy that with `selectionchange`.
- Per-preset video files don't exist yet; a single sample MP4 from `commondatastorage.googleapis.com` is the placeholder. Override via Settings.
- The pairing flow mirrors the docs site exactly. `manifest.json` whitelists the two hosts.
