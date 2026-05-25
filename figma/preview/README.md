# Pulsar Live Preview

A standalone, build-free web app that embeds a Figma prototype (via the
[Figma Embed API](https://developers.figma.com/docs/embeds/embed-api/)) and plays
the **audio haptics** bound to a node when you tap it — the same WebAudio engine
the plugin uses in edit mode.

## How it works

1. In the Figma plugin, open **Settings → Show in live preview**.
2. The plugin collects every node on the current page that has a Pulsar binding,
   resolves each to its preset pattern, and opens this app with the data in the
   URL hash: `#data=<base64( { fileKey, nodeId, bindings } )>`.
3. This app builds the embed iframe and listens for the embed's
   `MOUSE_PRESS_OR_RELEASE` events. When the clicked `targetNodeId` matches a
   bound node, it plays that preset's audio.

Node ids are normalised (`:` → `-`) so plugin node ids and embed node ids match.

## Requirements

- **OAuth client id** — set in [`app.js`](app.js) as `CLIENT_ID`. Already set to
  the project's id (`2EUn8wVWgJHsMsjlcRB9nQ`).
- **Embed origin** — the host serving this app must be registered as an *embed
  origin* on that OAuth app, or the embed will refuse to send events. The app
  sends the current `location.hostname` as `embed-host`. Register
  `docs.swmansion.com` for production (and `localhost` / `127.0.0.1` for local
  dev) in your Figma OAuth app settings.

## Hosting

Deployed at `https://docs.swmansion.com/figma-preview/` (the plugin's default
preview base URL). Serve the contents of this folder (`index.html`, `app.js`,
`audioPattern.js`) under that path; no build step is required.

## Running locally

Any static server works (the app is a single HTML file + two ES modules):

```bash
cd figma/preview
npx serve -l 5173      # or: python3 -m http.server 5173
```

Then in the plugin's **Settings → Live preview**, set the base URL to match
(default `http://localhost:5173/`) and click **Show in live preview**.

> A first tap may be needed to satisfy the browser's audio autoplay policy; the
> WebAudio context resumes on the first user gesture.
