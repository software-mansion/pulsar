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
}

// The base64'd payload the plugin puts in the URL hash.
export interface PreviewPayload {
  fileKey: string;
  nodeId: string | null;
  frame: NodeBox | null;
  elements: ElementInfo[];
  owner: Record<string, string>; // any node id -> owning bound-element id
  bindings: Record<string, PresetData>; // node id (incl. descendants) -> preset
  // frame-like-node id → its absolute canvas box, for every frame that contains
  // at least one bound element. Optional for backward compatibility.
  frames?: Record<string, NodeBox>;
}
