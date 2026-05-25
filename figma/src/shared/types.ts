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
  category: 'user' | 'system';
  platform: 'ios' | 'android' | null;
  data: PresetData;
}

export interface BindingMeta {
  presetId: string;
  presetName: string;
  // Optional inlined custom JSON (when the user pastes a custom pattern).
  customPattern?: PresetData;
}

export type Settings = {
  soundInEdit: boolean;
  compactLayout: boolean;
  previewBaseUrl: string; // base url of the standalone live-preview web app
  // Optional manual file-key override, used when figma.fileKey is unavailable
  // (e.g. the plugin is not private / enablePrivatePluginApi is off).
  fileKeyOverride: string;
};

// One bound node, as forwarded from the main thread to the UI when building the
// live-preview payload. The UI resolves presetId -> full PresetData before launch.
export interface PreviewBinding {
  nodeId: string;
  presetId: string;
  presetName: string;
  customPattern?: PresetData;
  // Ids of every descendant of the bound node. A tap in the embed usually lands
  // on a child layer (text/icon), so we map those to the same preset too.
  descendantIds: string[];
}

// Messages: UI -> Main
export type UiToMain =
  | { type: 'ui-ready' }
  | { type: 'bind-preset'; binding: BindingMeta }
  | { type: 'unbind-preset' }
  | { type: 'request-selection' }
  | { type: 'persist-settings'; settings: Settings }
  | { type: 'persist-haptics-token'; token: string | null }
  | { type: 'persist-favourites'; favourites: string[] }
  | { type: 'request-preview-data' }
  | { type: 'open-external'; url: string }
  | { type: 'notify'; message: string };

// Messages: Main -> UI
export type MainToUi =
  | { type: 'init'; settings: Settings; hapticsToken: string | null; favourites: string[] }
  | { type: 'selection'; node: SelectionInfo | null }
  | { type: 'play-preset'; presetId: string } // emitted when a bound node is clicked in editor
  | {
      type: 'preview-data';
      fileKey: string | null;
      presentNodeId: string | null;
      bindings: PreviewBinding[];
    };

export interface SelectionInfo {
  id: string;
  name: string;
  type: string;
  binding: BindingMeta | null;
}
