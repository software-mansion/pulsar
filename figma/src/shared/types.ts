// Shared types between the Figma main thread (code.ts) and the UI iframe.

export type DiscretePoint = { time: number; amplitude: number; frequency: number };
export type ContinuousPattern = {
  amplitude: { time: number; value: number }[];
  frequency: { time: number; value: number }[];
};

export interface PresetData {
  name: string;
  description: string;
  tags: string[];
  duration: number;
  discretePattern: DiscretePoint[];
  continuousPattern: ContinuousPattern;
  emoji?: string;
  [extra: string]: unknown;
}

export interface CatalogEntry {
  id: string;
  category: 'user' | 'system' | 'custom';
  platform: 'ios' | 'android' | null;
  data: PresetData;
}

// Tag applied to user-supplied custom presets so they can be filtered.
export const CUSTOM_TAG = 'Custom';

export interface BindingMeta {
  presetId: string;
  presetName: string;
  // Optional inlined custom JSON (when the user pastes a custom pattern).
  customPattern?: PresetData;
}

export type Settings = {
  soundInEdit: boolean;
  compactLayout: boolean;
  // Optional manual file-key override. Secondary fallback only consulted when the
  // main thread's minted key is absent; also allows manual cross-file pairing.
  fileKeyOverride: string;
  // Optional override for the live-preview app base URL. Empty string uses the
  // built-in default (vite-dev → localhost:5173, prod → docs.swmansion.com).
  // Useful for pointing a production-built plugin at a locally-hosted preview.
  previewBaseUrlOverride: string;
};

// One bound node, as forwarded from the main thread to the UI when building the
// live-preview payload. The UI resolves presetId -> full PresetData before launch.
// Axis-aligned bounding box in absolute canvas coordinates.
export interface NodeBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface PreviewBinding {
  nodeId: string;
  nodeName: string;
  presetId: string;
  presetName: string;
  customPattern?: PresetData;
  // Absolute bounding box, used to position on-canvas highlights in the preview.
  box: NodeBox | null;
  // Id of the nearest frame-like ancestor (FRAME / COMPONENT / COMPONENT_SET /
  // INSTANCE). Lets the preview keep showing this highlight when Figma navigates
  // into the owning frame via a prototype interaction, instead of hiding every
  // overlay because the originally-presented frame is no longer current.
  frameId: string | null;
  // Ids of every descendant of the bound node. A tap in the embed usually lands
  // on a child layer (text/icon), so we map those to the same preset too.
  descendantIds: string[];
}

// A bound component, for the "Bound" tab list.
export interface BoundItem {
  nodeId: string;
  nodeName: string;
  nodeType: string;
  presetId: string;
  presetName: string;
  // Id + name of the top-level frame the bound node sits under. Used to
  // group entries by screen in the Bound panel. Both null when the node
  // isn't nested inside a frame-like ancestor (rare - usually means the
  // user bound a top-level frame itself).
  frameId: string | null;
  frameName: string | null;
}

// Why the UI asked the main thread to rebuild the preview payload. The main
// thread echoes it back on the `preview-data` reply so the UI's single handler
// knows whether to open a browser, copy a link/token, render a QR, or just run
// a (silent) server sync - without a shared mutable ref that auto-sync and
// user actions could race on.
//   - 'open' / 'copy' / 'copy-token' / 'qr': explicit user share actions.
//   - 'sync': manual "Sync now" - publishes (creating a token if needed).
//   - 'autosync': debounced background save - only updates an *existing*
//     project; never creates a token on its own (avoids spamming the backend
//     for files the user never chose to share).
// 'pair' resolves the file's share (public) token for the phone-pairing QR:
//   publishes if needed (so the unified QR can carry the preview token), then
//   hands the public token back to the caller via ensureShared(). Like 'qr'/'copy'
//   it is an explicit share action, so it re-opens the link to the public.
export type PreviewPurpose =
  | 'open'
  | 'copy'
  | 'copy-token'
  | 'qr'
  | 'sync'
  | 'autosync'
  | 'pair';

// Severity of an in-plugin toast. Drives its accent colour, icon, and default
// auto-dismiss timeout (see the UI's Toast component).
export type ToastLevel = 'info' | 'success' | 'warning' | 'error';

// Messages: UI -> Main
export type UiToMain =
  | { type: 'ui-ready' }
  | { type: 'bind-preset'; binding: BindingMeta }
  | { type: 'unbind-preset' }
  | { type: 'request-selection' }
  | { type: 'persist-settings'; settings: Settings }
  | { type: 'persist-haptics-token'; token: string | null }
  | { type: 'persist-favourites'; favourites: string[] }
  | { type: 'persist-custom-presets'; presets: CatalogEntry[] }
  // Mark the first-run onboarding tour as seen so it doesn't auto-open again.
  // Stored per-user in clientStorage (not per-file), so the tour shows once.
  | { type: 'persist-onboarding-seen'; seen: boolean }
  // Per-file project state. The server token and cached config are keyed by
  // fileKey so opening the plugin in another design file gets its own token
  // instead of clobbering the first file's shared preview.
  | { type: 'get-project'; fileKey: string }
  // Persist this file's tokens: secret edit `token` + read-only `publicToken`.
  | { type: 'persist-project-token'; fileKey: string; token: string; publicToken: string }
  | { type: 'persist-project-cache'; fileKey: string; config: unknown; baseRevision: number | null }
  // Persist just the share-link visibility for a file (the public/private
  // toggle), without rewriting the cached config. Keyed by fileKey like the
  // rest of the per-file project state.
  | { type: 'persist-project-visibility'; fileKey: string; isPublic: boolean }
  | { type: 'request-preview-data'; purpose: PreviewPurpose }
  | { type: 'request-bound-list' }
  | { type: 'focus-node'; nodeId: string }
  | { type: 'open-external'; url: string }
  // Persist the user-entered real Figma file key (or share URL) for this
  // document into root pluginData (per-file, shared with collaborators).
  | { type: 'persist-file-key'; figmaFileKey: string }
  | { type: 'resize'; width: number; height: number; commit?: boolean };

// Messages: Main -> UI
export type MainToUi =
  | {
      type: 'init';
      settings: Settings;
      hapticsToken: string | null;
      // The Figma document name (`figma.root.name`), shown as the connection's
      // label on the paired phone. Advertised on the pairing handshake.
      documentName: string;
      // Stable per-document key minted by the main thread (root pluginData).
      fileKey: string | null;
      // The real Figma file key (or share URL) the user saved for this document,
      // used to build the live-preview embed. Empty until entered. Stored in root
      // pluginData, so it's per-file and shared with collaborators.
      figmaFileKey: string;
      favourites: string[];
      customPresets: CatalogEntry[];
      // Whether the first-run onboarding tour has already been shown. False
      // (the default) makes the UI auto-open the tour on first launch.
      onboardingSeen: boolean;
    }
  | { type: 'selection'; node: SelectionInfo | null }
  | { type: 'play-preset'; presetId: string } // emitted when a bound node is clicked in editor
  | { type: 'bound-list'; items: BoundItem[] }
  // Reply to `get-project`: this file's persisted token + last cached config
  // (and the server revision that cache was synced at). Either may be null.
  | {
      type: 'project';
      fileKey: string;
      // Secret edit token, or null when the file has never been shared.
      token: string | null;
      // Read-only share token, or null when unknown (never shared, or a legacy
      // share the cold-start reconcile hasn't recovered yet).
      publicToken: string | null;
      config: unknown | null;
      baseRevision: number | null;
      // Last-known share-link visibility for this file. Defaults to true (public)
      // for files shared before this field existed. The server is the source of
      // truth; this is the cached value used to seed the toggle on cold start.
      isPublic: boolean;
    }
  // The Figma document changed. The UI debounces this into a background
  // auto-sync so the server snapshot stays fresh as the designer edits.
  | { type: 'doc-changed' }
  // Ask the UI to surface an in-plugin toast. Used for plugin-originated
  // feedback (bind/unbind results, missing-node errors) that previously went to
  // the easy-to-miss figma.notify(). `duration` overrides the per-level default
  // (ms); 0 keeps the toast until the user dismisses it.
  | { type: 'toast'; message: string; level?: ToastLevel; duration?: number }
  | {
      type: 'preview-data';
      // Echoed back from the originating request so the handler knows what to do.
      purpose: PreviewPurpose;
      fileKey: string | null;
      presentNodeId: string | null;
      presentNodeBox: NodeBox | null;
      bindings: PreviewBinding[];
      // frame-like-node id → { human-readable name, absolute canvas box } for
      // every frame that contains at least one bound element. Used by the
      // preview to (a) reposition the highlight overlay after a prototype
      // navigation, and (b) group the "Haptic elements" list under a screen
      // header that the user can read.
      frames: Record<string, FrameInfo>;
    };

export interface FrameInfo {
  name: string;
  box: NodeBox;
}

export interface SelectionInfo {
  id: string;
  name: string;
  type: string;
  binding: BindingMeta | null;
}
