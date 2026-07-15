// Types shared across the preview app. Mirrors the relevant parts of the
// plugin's src/shared/types.ts (kept local so the preview is self-contained).

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
  [extra: string]: unknown;
}

export interface NodeBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

// One bound node, used for the panel list + on-canvas highlight.
export interface ElementInfo {
  id: string;
  name: string;
  presetName: string;
  box: NodeBox | null;
  // Id of the bound element's nearest frame-like ancestor. Optional for
  // backward compatibility with payloads created before this field existed.
  frameId?: string | null;
  // True when the bound preset is a user-defined custom pattern (binding had
  // customPattern set OR the preset's tags include "Custom"). The Haptic
  // elements list shows a "Custom" pill for these.
  isCustom?: boolean;
}

export interface FrameInfo {
  name: string;
  box: NodeBox;
}

// The design payload the plugin publishes to the server; the preview fetches it
// by the `?token=` share token (see lib/payload.ts).
export interface PreviewPayload {
  fileKey: string;
  nodeId: string | null;
  frame: NodeBox | null;
  elements: ElementInfo[];
  owner: Record<string, string>; // any node id -> owning bound-element id
  bindings: Record<string, PresetData>; // node id (incl. descendants) -> preset
  // frame-like-node id → { human name, absolute canvas box } for every frame
  // that contains at least one bound element. Optional for backward
  // compatibility - older payloads stored just NodeBox; the loader normalises
  // those to FrameInfo with a synthetic name.
  frames?: Record<string, FrameInfo | NodeBox>;
}
