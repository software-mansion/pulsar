import type { ElementInfo, FrameInfo, NodeBox, PresetData, PreviewPayload } from '../types';

// Delta over the render-relevant parts of a PreviewPayload. Mirrors the
// plugin's figma/src/ui/lib/diffPayload.ts `HapticsDiff` - the two are
// hand-kept in sync (same convention as the rest of the preview/plugin type
// mirror). `set` upserts entries; `del` lists removed keys/ids.
export interface HapticsDiff {
  bindings?: { set: Record<string, PresetData>; del: string[] };
  owner?: { set: Record<string, string>; del: string[] };
  elements?: { set: ElementInfo[]; del: string[] };
  frames?: { set: Record<string, FrameInfo | NodeBox>; del: string[] };
}

function patchRecord<T>(
  base: Record<string, T> | undefined,
  delta: { set: Record<string, T>; del: string[] } | undefined,
): Record<string, T> {
  const out: Record<string, T> = { ...(base ?? {}) };
  if (!delta) return out;
  for (const id of delta.del) delete out[id];
  for (const [id, v] of Object.entries(delta.set)) out[id] = v;
  return out;
}

// Apply a diff to a payload immutably, returning a new payload. `fileKey`,
// `nodeId`, and `frame` are preserved untouched - a diff never moves the
// presented node (the app's Figma iframe owns that) or changes the prototype.
export function applyDiff(payload: PreviewPayload, diff: HapticsDiff): PreviewPayload {
  const next: PreviewPayload = {
    ...payload,
    bindings: patchRecord(payload.bindings, diff.bindings),
    owner: patchRecord(payload.owner, diff.owner),
  };

  if (diff.frames) {
    next.frames = patchRecord(payload.frames, diff.frames);
  }

  if (diff.elements) {
    const del = new Set(diff.elements.del);
    const setById = new Map(diff.elements.set.map((e) => [e.id, e]));
    // Keep existing order, replacing changed entries and dropping removed ones,
    // then append any genuinely new elements.
    const kept = (payload.elements ?? [])
      .filter((e) => !del.has(e.id))
      .map((e) => setById.get(e.id) ?? e);
    const existingIds = new Set(kept.map((e) => e.id));
    const added = diff.elements.set.filter((e) => !existingIds.has(e.id));
    next.elements = [...kept, ...added];
  }

  return next;
}
