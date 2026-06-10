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
  // Optional manual file-key override, used when figma.fileKey is unavailable
  // (e.g. the plugin is not private / enablePrivatePluginApi is off).
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
}

// Messages: UI -> Main
export type UiToMain =
  | { type: 'ui-ready' }
  | { type: 'bind-preset'; binding: BindingMeta }
  | { type: 'unbind-preset' }
  | { type: 'request-selection' }
  | { type: 'persist-settings'; settings: Settings }
  | { type: 'persist-haptics-token'; token: string | null }
  | { type: 'persist-preview-token'; token: string | null }
  | { type: 'persist-favourites'; favourites: string[] }
  | { type: 'persist-custom-presets'; presets: CatalogEntry[] }
  | { type: 'request-preview-data' }
  | { type: 'request-bound-list' }
  | { type: 'focus-node'; nodeId: string }
  | { type: 'open-external'; url: string }
  | { type: 'notify'; message: string };

// Messages: Main -> UI
export type MainToUi =
  | {
      type: 'init';
      settings: Settings;
      hapticsToken: string | null;
      previewToken: string | null;
      favourites: string[];
      customPresets: CatalogEntry[];
    }
  | { type: 'selection'; node: SelectionInfo | null }
  | { type: 'play-preset'; presetId: string } // emitted when a bound node is clicked in editor
  | { type: 'bound-list'; items: BoundItem[] }
  | {
      type: 'preview-data';
      fileKey: string | null;
      presentNodeId: string | null;
      presentNodeBox: NodeBox | null;
      bindings: PreviewBinding[];
    };

export interface SelectionInfo {
  id: string;
  name: string;
  type: string;
  binding: BindingMeta | null;
}
