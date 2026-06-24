import type { FrameInfo, NodeBox, PresetData } from '../../shared/types';
import { stableStringify } from './stableStringify';

// The full preview payload the plugin publishes to the server and the live
// preview renders. Mirrors figma/preview/src/types.ts `PreviewPayload`; kept
// here so the diff helper is typed against exactly what `usePreviewSync` builds.
export interface PreviewElement {
  id: string;
  name: string;
  presetName: string;
  box: NodeBox | null;
  frameId?: string | null;
  isCustom?: boolean;
}

export interface PreviewPayload {
  fileKey: string;
  nodeId: string | null;
  frame: NodeBox | null;
  elements: PreviewElement[];
  owner: Record<string, string>;
  bindings: Record<string, PresetData>;
  frames?: Record<string, FrameInfo | NodeBox>;
}

// A minimal delta over the parts of the payload that affect what the preview
// renders: the haptic bindings, the tap→owner map, the per-element list, and
// the per-frame highlight boxes. Top-level `nodeId`/`frame` are deliberately
// excluded — the app's Figma iframe drives its own presented-node state, so a
// diff must never move it. A `fileKey` change can't be expressed as a delta
// (it's a different prototype) and forces a refetch instead (see emitUpdate).
export interface HapticsDiff {
  bindings?: { set: Record<string, PresetData>; del: string[] };
  owner?: { set: Record<string, string>; del: string[] };
  // `set` carries the full (added or changed) element objects, keyed off their
  // id when applied; `del` lists removed element ids.
  elements?: { set: PreviewElement[]; del: string[] };
  frames?: { set: Record<string, FrameInfo | NodeBox>; del: string[] };
}

// The structured message relayed over the paired socket to an open preview.
// `previewToken` lets the app match the diff to the right open WebView.
export type PreviewUpdateMessage =
  | {
      kind: 'preview-haptics-diff';
      previewToken?: string;
      fromRevision: number;
      toRevision: number;
      diff: HapticsDiff;
    }
  | {
      kind: 'preview-haptics-refetch';
      previewToken?: string;
      toRevision: number;
    };

// Diff two record maps by stable value-equality. Returns `{ set, del }` or
// undefined when nothing changed, so the caller can omit empty sections.
function diffRecord<T>(
  prev: Record<string, T>,
  next: Record<string, T>,
): { set: Record<string, T>; del: string[] } | undefined {
  const set: Record<string, T> = {};
  const del: string[] = [];
  for (const [k, v] of Object.entries(next)) {
    const before = prev[k];
    if (before === undefined || stableStringify(before) !== stableStringify(v)) set[k] = v;
  }
  for (const k of Object.keys(prev)) {
    if (!(k in next)) del.push(k);
  }
  if (Object.keys(set).length === 0 && del.length === 0) return undefined;
  return { set, del };
}

// Compute the delta between the previously-published payload and the new one.
// Only the render-relevant sections are diffed (see HapticsDiff).
export function diffPayloads(prev: PreviewPayload, next: PreviewPayload): HapticsDiff {
  const diff: HapticsDiff = {};

  const bindings = diffRecord(prev.bindings ?? {}, next.bindings ?? {});
  if (bindings) diff.bindings = bindings;

  const owner = diffRecord(prev.owner ?? {}, next.owner ?? {});
  if (owner) diff.owner = owner;

  const frames = diffRecord(prev.frames ?? {}, next.frames ?? {});
  if (frames) diff.frames = frames;

  // Elements are an array; diff them by id with stable value-equality.
  const prevById = new Map((prev.elements ?? []).map((e) => [e.id, e]));
  const nextById = new Map((next.elements ?? []).map((e) => [e.id, e]));
  const set: PreviewElement[] = [];
  const del: string[] = [];
  for (const [id, e] of nextById) {
    const before = prevById.get(id);
    if (!before || stableStringify(before) !== stableStringify(e)) set.push(e);
  }
  for (const id of prevById.keys()) {
    if (!nextById.has(id)) del.push(id);
  }
  if (set.length > 0 || del.length > 0) diff.elements = { set, del };

  return diff;
}

export function isEmptyDiff(diff: HapticsDiff): boolean {
  return !diff.bindings && !diff.owner && !diff.frames && !diff.elements;
}
