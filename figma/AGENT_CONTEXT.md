# Figma plugin + live-preview — agent context

Hard-won notes for future agents working under `figma/`. Skim before touching
anything; many of these have non-obvious failure modes that cost real turns to
diagnose.

The folder ships two related-but-separate apps plus one shared spec:

```
figma/
├── src/                  → plugin source (sandbox runtime + React iframe UI)
│   ├── main/code.ts      → runs in Figma's plugin sandbox (TurboModule-style API)
│   ├── ui/               → React app rendered in the plugin iframe
│   │   ├── App.tsx, components/, audio/, styles/theme.css, assets/
│   │   ├── figmaBridge.ts ← postMessage glue (parent.postMessage + window 'message')
│   │   └── presets-data/  ← bundled preset catalogue
│   └── shared/types.ts   → wire types: BindingMeta, PreviewBinding, FrameInfo, Settings,
│                            UiToMain | MainToUi, BoundItem, …
├── preview/              → standalone Vite + React app (figma/preview)
│   ├── src/App.tsx, components/, lib/, assets/
│   ├── vite.config.ts        ← regular multi-file build (deployed standalone)
│   └── vite.config.embed.ts  ← single-file build for docs embed
├── manifest.json         → Figma plugin manifest (networkAccess, ui path, main path)
├── package.json          → builds the *plugin* (preview has its own package.json)
└── dist/                 → built plugin (code.js + ui.html). DO NOT hand-edit.
```

The plugin and preview are **separate Vite projects** with independent
`node_modules`/`tsconfig.json`. Anything shared is duplicated (e.g. SDK
snippet generators) — see "Cross-project duplication" below.

---

## Build / verify cycle

### Plugin (`figma/`)

```bash
cd figma
npm run typecheck    # tsc --noEmit on both tsconfig.json (UI) and tsconfig.main.json (sandbox)
npm run build        # builds dist/code.js + dist/ui.html (single-file via vite-plugin-singlefile)
```

`vite.config.ts` sets `assetsInlineLimit: 100_000_000` so **every asset
import is inlined as a data URI** in `dist/ui.html`. Don't fight this — it's
what keeps the plugin shippable as one HTML file the Figma sandbox can load.

**Verification path**: There's no preview server. After `npm run build`, point a
browser at `file:///…/figma/dist/ui.html` to render the bundle outside Figma.
That's how every plugin change in this codebase has been verified — the
chrome-devtools MCP tools were the convention.

To exercise paths that depend on `figma.ui.postMessage` (bound list, selection,
preview-data), synthesize the message manually:

```js
window.dispatchEvent(new MessageEvent('message', { data: { pluginMessage: { type: 'bound-list', items: [...] } } }))
```

See `src/ui/figmaBridge.ts` — it listens on `window 'message'` for
`e.data.pluginMessage`.

### Preview (`figma/preview/`)

```bash
cd figma/preview
npm run dev          # Vite dev server on :5173 (strictPort)
npm run build        # multi-file output → dist/ (standalone deploy target)
npm run build:embed  # single-file output → dist-embed/index.html (docs embed only)
```

The standalone preview is deployed at `https://docs.swmansion.com/figma-preview/`.
The embed build is consumed by docs/scripts/build-figma-preview.mjs — see
"Docs embed pipeline" below.

**Verification path**: HMR is live on :5173. The preview reads `?token=` from
its URL and fetches from `pulsar-server.swmansion.com`. To test without a real
share, navigate to `http://localhost:5173/?token=<real-token>` (any
share-link token from a recent "Show in live preview" click works).

---

## Figma plugin sandbox traps

These are the bugs that have actually shipped and been fixed; do not
reintroduce them.

### Plugin-data inheritance on component instances

`node.getPluginData(key)` on an Instance **falls back to the master component
if the instance has no own value**. The plugin uses two keys:

- `BINDING_KEY = 'pulsar:binding'` — the serialized binding JSON.
- `BINDING_NEGATED_KEY = 'pulsar:binding-negated'` — per-instance opt-out marker.

Setting `BINDING_KEY = ''` on an instance just removes the instance's
override; reads then re-inherit from master. To unbind **a single instance**
without unbinding every sibling, set `BINDING_NEGATED_KEY = '1'` on it
instead. `readBinding()` honours that flag.

If you ever add a new per-node plugin data field, audit it for the same
inheritance gotcha.

### `findAllWithCriteria` — be specific

`figma.currentPage.findAllWithCriteria({ pluginData: {} })` returns nodes
with **any** plugin data set by this plugin. We use
`{ keys: [BINDING_KEY] }` so unbound nodes (whose BINDING_KEY is empty)
drop out of the result set immediately — important for the Bound tab list
not to show ghost entries.

### Dynamic-page mode

`manifest.json` has `documentAccess: "dynamic-page"`. Consequences:

- Many sync APIs are async: `instance.mainComponent` → `await instance.getMainComponentAsync()`.
- `figma.currentPage.loadAsync()` must be awaited before walking the page.
- `figma.fileKey` may be `null` if `enablePrivatePluginApi` is false.

### Network access

The manifest only allows `pulsar-server.swmansion.com` (http + ws). Google Fonts
won't load inside the plugin iframe; rely on Figma's bundled UI font. The
preview is a separate origin so it can use any CDN.

### Window resize

The plugin has a `ResizeHandle` component (bottom-right grip) that posts a
`{ type: 'resize', width, height }` message; the sandbox calls
`figma.ui.resize(...)` and persists the size via `clientStorage` under
`WINDOW_SIZE_KEY`. On restart the size is restored asynchronously after the
initial `figma.showUI({ width: 380, height: 640 })`.

### Modal dialog gotcha — `flex-shrink`

`.modal-body` is a flex column with `overflow-y: auto`. The flex algorithm
shrinks children before scroll kicks in, which silently collapsed the haptic
`Visualization` SVG from 80 px to 10 px. There's a safety rule in
`theme.css`:

```css
.modal-body > * { flex-shrink: 0; }
```

Anything you drop into the modal body keeps its intrinsic height now.
If you replace this rule, audit every modal child.

---

## Preview ↔ host bridges

### Standalone preview ↔ Figma embed iframe

The preview opens Figma's prototype embed in an iframe and listens for
postMessage events from it. See `src/lib/useFigmaMessages.ts` +
`src/lib/embed.ts`. Origins are whitelisted; messages without a known origin
are ignored.

Key events:
- `INITIAL_LOAD` — Figma finished loading the prototype.
- `PRESENTED_NODE_CHANGED` — user navigated to another frame in the prototype.
- `MOUSE_PRESS_OR_RELEASE` — user tapped a node (`data.targetNodeId`).

### Preview ↔ React Native host (PulsarApp)

When the preview is embedded inside PulsarApp's WebView, the runtime injects
`window.ReactNativeWebView`. That single check is authoritative — no URL flag
needed. Detection in `src/App.tsx`:

```ts
const isAppHost = typeof (window as any).ReactNativeWebView !== 'undefined';
```

When `isAppHost` is true, taps post:

```json
{ "type": "play-preset", "presetName": "Zipper", "pattern": { "discretePattern": [...], "continuousPattern": {...} } }
```

`pattern` is always sent (it's structurally identical to react-native-pulsar's
`Pattern` type), so the host can fall back to `PatternComposer.parse() +
.play()` for custom (user-defined) presets whose names don't match anything
in `Presets`.

### Preview ↔ docs `/figma-preview` page (srcdoc iframe)

Docs at `docs/src/components/preview/Preview.astro` embeds the
single-file preview build via `<iframe srcdoc>`. About:srcdoc iframes always
read `location.search === ''`, so `getTokenFromUrl()` in
`src/lib/payload.ts` falls back to `window.parent.location.search`
(same-origin only; `SecurityError` from cross-origin parents yields `null`).
This is what makes `/figma-preview?token=…` forward the token transparently.

---

## Docs embed pipeline

End-to-end flow when someone runs `npm run build` in `docs/`:

```
docs $ npm run build
  ├─ prebuild → node scripts/build-figma-preview.mjs
  │    ├─ npm --prefix ../figma/preview run build:embed   (vite-plugin-singlefile)
  │    └─ copy figma/preview/dist-embed/index.html → docs/src/components/preview/embed.html
  └─ astro build
       └─ Preview.astro imports embed.html?raw → <iframe srcdoc={embedHtml}>
```

- `embed.html` is gitignored (regenerated on every build).
- `astro dev` does **not** run `prebuild`. Iterate the preview via
  `figma/preview`'s own dev server, not through docs.
- The standalone deploy of `figma/preview` (multi-file build) is untouched —
  the embed is a separate target.

---

## Wire types & payload schema

`figma/src/shared/types.ts` is the single source of truth for plugin
↔ UI messages and for the share-link payload. Skim it before touching
anything that crosses the boundary; bumps almost always require changes in
4 places:

1. `shared/types.ts` (type)
2. `src/main/code.ts` (producer)
3. `src/ui/App.tsx` (forwarder into the server payload)
4. `figma/preview/src/types.ts` (consumer, separate project — type widening
   must be repeated here)

### `PreviewPayload`

```ts
interface PreviewPayload {
  fileKey: string;
  nodeId: string | null;            // originally-presented top-level frame
  frame: NodeBox | null;             // its absolute canvas box (legacy fallback)
  elements: ElementInfo[];           // bound nodes with absolute boxes + frameId
  owner: Record<string, string>;     // any node id → owning bound-element id (for taps on descendants)
  bindings: Record<string, PresetData>; // node id (incl. descendants) → preset
  frames?: Record<string, FrameInfo>; // { name, box } per top-level frame containing bindings
}
```

`elements[].frameId` and `frames[id].name` are the post-2026-Jun fields. Older
payloads have `frames` typed as `Record<string, NodeBox>` (no name); the
preview's loader normalises them with a synthetic `'Screen'` name.

### `BoundItem`

Has `frameId` + `frameName` so the Bound tab can group rows by screen.

### `topLevelFrameAncestor()`

In `src/main/code.ts`. **Use this**, not `nearestFrameLikeAncestor()`, when
attributing a bound node to a frame for `PRESENTED_NODE_CHANGED` matching.
Figma reports top-level prototype frames; matching by the *outermost*
frame-like ancestor is the only correct attribution. The nearest variant
returns nested frames and breaks per-frame filtering when a button sits in
a sub-frame.

---

## Audio playback

### Plugin (`src/ui/audio/AudioPatternUtility.ts`)

Hand-rolled WebAudio renderer that consumes `PresetData` directly. Sound is
gated by `Settings.soundInEdit`. Keep it — it's tuned for the iOS Core
Haptics shape.

### Preview (`src/audio/player.ts`)

Uses **`pulsar-haptics`** from `web/Pulsar`. Wired via `file:../../web/Pulsar`
in `package.json`. The `pulsar-haptics` `HapticPattern` is segment-based, not
the iOS shape, so there's an adapter `toHapticPattern(data)` that converts:

- each `discretePattern` point → short (30 ms) "continuous" segment.
- continuous envelope → one "line" segment spanning the duration.

Lossy by design. If you want bit-identical audio to the plugin, push the
discrete/continuous shape into `web/Pulsar` and drop the adapter.

`presets.has(data.name)` shortcuts the adapter when a figma binding name
happens to match a built-in pulsar-haptics preset (rare — different
namespaces).

---

## SDK snippet generators

Two copies that must stay in sync:

- Plugin: `figma/src/ui/components/sdkSnippets.ts` — exports `LANGS`,
  `builtInSnippet(lang, name)`, `customSnippet(lang, data)`.
- Preview: `figma/preview/src/components/PresetDetailsModal.tsx` — same
  functions inlined (kept inline because the preview is a smaller surface
  and there's no `shared/` for it).

Source of truth for the content is `docs/src/content/docs/sdk/*.mdx`. If you
fix a snippet here, fix it there too. Six SDKs covered: Swift, Android, KMP,
React Native, Flutter, Web.

Important: the Web SDK uses a different (segment-based) pattern shape; the
`customWeb` snippet does the conversion. Don't paste the discrete/continuous
JSON into a Web example as-is.

---

## Design system

Mirrors `docs/src/styles/index.css`. Tokens in both
`figma/src/ui/styles/theme.css` and `figma/preview/src/styles.css`:

```
--color-primary  #001a72   navy text + most icon strokes
--color-blue-10  #e1f3fa   surfaces, code blocks, QR codebox
--color-blue-20  #b5e1f1   borders, tag pills, accent fills
--color-blue-50  #38acdd   primary accent (button border, offset shadow)
--color-blue-60  #2b85ab   muted strong text
--color-yellow-60 #ffe780  active hover/highlight accent
```

### Signature button animation

Used everywhere "important" buttons live:

```css
button {
  border: 2px solid var(--color-blue-50);
  box-shadow: -3px 3px 0 var(--color-blue-50);
  transition: transform 120ms, box-shadow 120ms;
}
button:hover  { box-shadow: -4px 4px 0 var(--color-blue-50); transform: translate(1px, -1px); }
button:active { box-shadow: none;                            transform: translate(-3px, 3px); }
```

The plugin's `button` base in `theme.css` already does this. The preview has
the same pattern under `.docs-btn` / `.preview-qr-close` etc. New buttons
should opt into this motion or look like outliers.

### Lucide icons

Convention: fetch from CDN, bake the color in (currentColor doesn't survive
`<img>` rendering), drop into `assets/`. Pattern that has been used:

```bash
curl -sLf "https://unpkg.com/lucide-static@latest/icons/<name>.svg" \
  | sed 's/currentColor/#001A72/g' \
  > <plugin-or-preview>/src/assets/icon-<name>.svg
```

Strokes are baked to `#001A72` (navy) by default; `#38ACDD` (blue-50) for
icons on blue-tinted surfaces (e.g. `icon-arrow-up.svg` for the scroll-to-top).
Two icons stay hand-rolled because the Lucide equivalents don't quite fit:
- `figma/src/ui/assets/icon-resize-grip.svg` (two diagonal lines)
- `figma/src/ui/components/PulsarLogo.tsx` + `pulsar-logo.svg` (brand mark)

### Visualization waveform

`Visualization.tsx` (plugin only) draws a parametric SVG from
discrete + continuous arrays. It's not an icon — never replace it with an
`<img>`. Lives in the modal between tags and description.

---

## Backend (docs/server)

Express + PostgreSQL. Two routes that matter here: `POST /figma-project`,
`PUT /figma-project/:token`, `GET /figma-project/:token`. Schema:

```sql
CREATE TABLE figma_projects (
  token TEXT PRIMARY KEY,
  config TEXT NOT NULL,         -- JSON-serialized PreviewPayload
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### TTL / GC

`createFigmaProject()` triggers a throttled (1×/hour, in-process) purge:

```sql
DELETE FROM figma_projects WHERE updated_at < NOW() - INTERVAL '90 days'
```

Reaps by `updated_at`, so actively-reshared tokens stay alive. Errors reset
the throttle (`lastPurgeAt = 0`) and never propagate to the caller.

### SSL

Opt-in via `DATABASE_SSL` env var (`1`/`true`/`require`/`yes`). Off by
default so self-hosted Postgres without TLS works out of the box. Managed
providers (Neon, RDS) need it on.

---

## PulsarApp tab

`PulsarApp/app/(tabs)/figma.tsx` is the RN screen behind
`pulsarapp://figma?token=<token>`. Two modes:

- With token: renders the preview in a WebView, bridges
  `play-preset` postMessages to native haptics via
  `usePlayPatternFromHost()` (tries `Presets[name]` first, falls back to
  `PatternComposer.parse() + play()` for custom patterns).
- Without token: renders an explainer card.

The host also responds to `{ type: 'set-tab-bar-hidden', hidden }` to give
the preview "true fullscreen" — the user's modification added this.

---

## Common pitfalls — quick checklist

1. **Re-share the plugin** after any change to `src/main/code.ts` that affects
   the payload schema. Cached server tokens won't have new fields.
2. **Reimport the plugin in Figma** after `npm run build`. Figma caches the
   manifest; the dev menu has a "Reimport" action.
3. When grouping by frame in any UI, use `topLevelFrameAncestor()`, not the
   nearest variant.
4. When a button or affordance needs to react to clicks, give it
   `button` base styles, not `<div onClick>`. The press motion is the
   product's main feedback signal.
5. When sending payload to `pulsar-server`, payloads are persisted
   server-side. Sensitive content (figma file structure, preset names,
   custom JSON) is visible to anyone who has the token. Treat tokens like
   secrets.
6. Lucide icons with `currentColor` will render as black inside `<img>`.
   Always `sed 's/currentColor/<hex>/g'` before saving.
7. SVG children of flex columns shrink before scrollbars appear. Wrap in
   `<div>` with explicit height, or add `flex-shrink: 0` (the modal-body
   safety rule already handles this).
8. Modal `<iframe srcdoc>` reads `location.search === ''`. Read query
   params off `window.parent.location.search` instead (same-origin only).
