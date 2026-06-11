import { FIGMA_SHARED_NAMESPACE } from './config';

// Rebuild the preview payload directly from a Figma file's REST representation,
// reading the haptics the plugin wrote into *shared* plugin data. This replaces
// the DB-stored payload: the file itself is the source of truth.
//
// The output shape mirrors what the plugin's UI used to POST to the server (see
// figma/src/ui/App.tsx buildPayload and figma/preview/src/types.ts
// PreviewPayload) so the preview app consumes it unchanged.

const FRAME_LIKE = new Set(['FRAME', 'COMPONENT', 'COMPONENT_SET', 'INSTANCE']);

// What the plugin stores at sharedPluginData[pulsar][binding]. `preset` is the
// fully-resolved pattern so the server needs no preset catalog of its own.
interface StoredBinding {
  presetId: string;
  presetName: string;
  preset: PresetData;
  isCustom?: boolean;
}

interface PresetData {
  name: string;
  description: string;
  tags: string[];
  duration: number;
  discretePattern: unknown[];
  continuousPattern: unknown;
  [extra: string]: unknown;
}

interface NodeBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface FrameInfo {
  name: string;
  box: NodeBox;
}

interface ElementInfo {
  id: string;
  name: string;
  presetName: string;
  box: NodeBox | null;
  frameId: string | null;
  isCustom?: boolean;
}

export interface PreviewPayload {
  fileKey: string;
  nodeId: string | null;
  frame: NodeBox | null;
  elements: ElementInfo[];
  owner: Record<string, string>;
  bindings: Record<string, PresetData>;
  frames: Record<string, FrameInfo>;
}

// Minimal shape of a node in the REST file response. Only the fields we read.
interface RestNode {
  id: string;
  name: string;
  type: string;
  absoluteBoundingBox?: { x: number; y: number; width: number; height: number } | null;
  children?: RestNode[];
  sharedPluginData?: Record<string, Record<string, string>>;
  pluginData?: Record<string, Record<string, string>>;
}

export interface RestFile {
  document?: RestNode;
}

function boxOf(node: RestNode): NodeBox | null {
  const b = node.absoluteBoundingBox;
  return b ? { x: b.x, y: b.y, w: b.width, h: b.height } : null;
}

function frameInfoOf(node: RestNode): FrameInfo | null {
  const box = boxOf(node);
  return box ? { name: node.name, box } : null;
}

function readStoredBinding(node: RestNode): StoredBinding | null {
  const raw = node.sharedPluginData?.[FIGMA_SHARED_NAMESPACE]?.binding;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<StoredBinding>;
    if (!parsed || typeof parsed.presetId !== 'string' || !parsed.preset) return null;
    return parsed as StoredBinding;
  } catch {
    return null;
  }
}

function collectDescendantIds(node: RestNode, out: string[]): void {
  for (const child of node.children ?? []) {
    out.push(child.id);
    collectDescendantIds(child, out);
  }
}

interface BoundNode {
  node: RestNode;
  binding: StoredBinding;
  // Outermost frame-like ancestor (incl. self), matching the plugin's
  // topLevelFrameAncestor — Figma's PRESENTED_NODE_CHANGED reports that frame.
  frame: RestNode | null;
}

function walk(
  node: RestNode,
  // Frame-like ancestors above `node`, outermost-first.
  frameAncestors: RestNode[],
  bound: BoundNode[],
): void {
  const chain = FRAME_LIKE.has(node.type) ? [...frameAncestors, node] : frameAncestors;
  const binding = readStoredBinding(node);
  if (binding) {
    bound.push({ node, binding, frame: chain.length > 0 ? chain[0] : null });
  }
  for (const child of node.children ?? []) {
    walk(child, chain, bound);
  }
}

// Pick the frame the preview opens on: the first frame-like node on the first
// page, descending into sections. Mirrors the plugin's pickPresentNode (minus
// the selection-aware branch, which has no server-side equivalent).
function pickPresentNode(doc: RestNode): RestNode | null {
  const firstFrameLikeIn = (node: RestNode): RestNode | null => {
    if (FRAME_LIKE.has(node.type)) return node;
    if (node.type === 'SECTION') {
      for (const child of node.children ?? []) {
        const found = firstFrameLikeIn(child);
        if (found) return found;
      }
    }
    return null;
  };
  for (const page of doc.children ?? []) {
    for (const child of page.children ?? []) {
      const found = firstFrameLikeIn(child);
      if (found) return found;
    }
  }
  return null;
}

// Build the preview payload from a REST file response. Returns a payload with
// `elements: []` when the file has no haptic bindings — the preview renders its
// own empty state from that.
export function buildPayloadFromFile(fileKey: string, file: RestFile): PreviewPayload {
  const doc = file.document;
  const bound: BoundNode[] = [];
  if (doc) walk(doc, [], bound);

  const bindings: Record<string, PresetData> = {};
  const owner: Record<string, string> = {};
  const frames: Record<string, FrameInfo> = {};
  const elements: ElementInfo[] = [];

  // Pass 1: descendants inherit their bound ancestor's preset, so a tap on a
  // child layer (text/icon) resolves to the right element.
  for (const b of bound) {
    const descendants: string[] = [];
    collectDescendantIds(b.node, descendants);
    for (const descId of descendants) {
      bindings[descId] = b.binding.preset;
      owner[descId] = b.node.id;
    }
  }
  // Pass 2: explicit node bindings win over inherited ones.
  for (const b of bound) {
    bindings[b.node.id] = b.binding.preset;
    owner[b.node.id] = b.node.id;
    const frameId = b.frame ? b.frame.id : null;
    if (b.frame && !(b.frame.id in frames)) {
      const info = frameInfoOf(b.frame);
      if (info) frames[b.frame.id] = info;
    }
    elements.push({
      id: b.node.id,
      name: b.node.name,
      presetName: b.binding.presetName,
      box: boxOf(b.node),
      frameId,
      isCustom: !!b.binding.isCustom,
    });
  }

  const present = doc ? pickPresentNode(doc) : null;
  return {
    fileKey,
    nodeId: present ? present.id : null,
    frame: present ? boxOf(present) : null,
    elements,
    owner,
    bindings,
    frames,
  };
}

// Fetch a Figma file (with shared plugin data) and rebuild the preview payload.
// `accessToken` is a short-lived OAuth token for a user who can read the file.
const FIGMA_API = 'https://api.figma.com';

export async function fetchPreviewPayload(
  fileKey: string,
  accessToken: string,
): Promise<PreviewPayload | null> {
  // `plugin_data=shared` includes every namespace's sharedPluginData on nodes.
  const url = `${FIGMA_API}/v1/files/${encodeURIComponent(fileKey)}?plugin_data=shared`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return null;
  const file = (await res.json()) as RestFile;
  return buildPayloadFromFile(fileKey, file);
}
