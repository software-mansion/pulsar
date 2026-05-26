# Pulsar Live Preview

A standalone **Vite + React + TypeScript** app that embeds a Figma prototype (via
the [Figma Embed API](https://developers.figma.com/docs/embeds/embed-api/)),
highlights every element that has a haptic bound, lists those haptics in a side
panel, and plays the **audio haptics** on tap — the same WebAudio engine the
plugin uses in edit mode.

## How it works

1. In the Figma plugin, open the **Preview** tab → **Show in live preview**.
2. The plugin collects every node on the current page that has a Pulsar binding,
   resolves each to its preset pattern, and opens this app with the data in the
   URL hash: `#data=<base64( PreviewPayload )>` (file key, presented frame box,
   per-element name/box, descendant→element map, and node→preset patterns).
3. This app builds the embed iframe and listens for the embed's
   `MOUSE_PRESS_OR_RELEASE` events. When the clicked `targetNodeId` matches a
   bound node, it plays that preset's audio and highlights the element.

On-canvas highlight boxes are positioned by mapping each node's absolute box onto
the embed using `contain` scaling. They line up on the initially-presented frame
and hide automatically after the prototype navigates to a different frame.

Node ids are normalised (`:` → `-`) so plugin node ids and embed node ids match.

## Project structure

```
preview/
  package.json            Own dependencies (deployed independently of the plugin)
  vite.config.ts          base: './', dev server on :5173
  index.html              Vite entry (mounts #root)
  src/
    main.tsx              React bootstrap
    App.tsx               State + embed event wiring
    types.ts              PresetData, NodeBox, ElementInfo, PreviewPayload
    styles.css            Pulsar docs-inspired theme
    lib/
      ids.ts              normalizeId
      payload.ts          readPayload (decode URL hash)
      embed.ts            CLIENT_ID, origins, buildEmbedSrc, event types
      useFigmaMessages.ts postMessage subscription hook
      useElementSize.ts   ResizeObserver size hook
    audio/
      AudioPatternUtility.ts  WebAudio render engine (TS port)
      player.ts               playPreset / stopAll cache
    components/
      Header.tsx
      PrototypeView.tsx   iframe + highlight overlay
      HighlightOverlay.tsx
      HapticList.tsx
```

This is a **self-contained package** with its own `package.json` and
`node_modules`, deployed independently of the Figma plugin.

## Requirements

- **OAuth client id** — set in [`src/lib/embed.ts`](src/lib/embed.ts) as
  `CLIENT_ID` (the project's id `2EUn8wVWgJHsMsjlcRB9nQ`).
- **Embed origin** — the host serving this app must be registered as an *embed
  origin* on that OAuth app, or the embed will refuse to send events. The app
  sends the current `location.hostname` as `embed-host`. Register
  `docs.swmansion.com` for production (and `localhost` for local dev) in your
  Figma OAuth app settings.

## Commands (run from `figma/preview/`)

```bash
npm install        # first time only
npm run dev        # Vite dev server on http://localhost:5173
npm run build      # typecheck + production build → dist/ (base: './')
npm run preview    # serve the production build locally
```

`build` uses a relative asset base, so the contents of `dist/` can be hosted
under any subpath (e.g. `https://docs.swmansion.com/figma-preview/`, the plugin's
default preview base URL).

For local dev, set the plugin's **Preview → Preview app URL** to
`http://localhost:5173/` and click **Show in live preview**.

> A first tap may be needed to satisfy the browser's audio autoplay policy; the
> WebAudio context resumes on the first user gesture.
