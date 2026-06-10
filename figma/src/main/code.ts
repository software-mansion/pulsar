/// <reference types="@figma/plugin-typings" />
// Figma plugin main thread. Runs in the figma sandbox; talks to the UI iframe via postMessage.
import type {
  BindingMeta,
  BoundItem,
  CatalogEntry,
  FrameInfo,
  MainToUi,
  NodeBox,
  PreviewBinding,
  SelectionInfo,
  Settings,
  UiToMain
} from '../shared/types';

const BINDING_KEY = 'pulsar:binding';
// Per-instance opt-out marker. Setting BINDING_KEY to '' on a component
// instance only removes the instance's own override — Figma then falls back
// to the main component's plugin data, so the instance keeps appearing bound.
// We need a way to say "this one instance is unbound" without touching the
// master (which would unbind every sibling instance). Setting this key on
// the instance is per-instance because it has no value on the master, so
// inheritance never overrides it.
const BINDING_NEGATED_KEY = 'pulsar:binding-negated';
const SETTINGS_KEY = 'pulsar:settings';
const TOKEN_KEY = 'pulsar:hapticsToken';
const PREVIEW_TOKEN_KEY = 'pulsar:previewToken';
const FAVOURITES_KEY = 'pulsar:favourites';
const CUSTOM_PRESETS_KEY = 'pulsar:customPresets';
const WINDOW_SIZE_KEY = 'pulsar:windowSize';

const DEFAULT_SIZE = { width: 380, height: 640 };
// Clamp the persisted size so a stored value can't shrink the UI below a
// usable size or blow it up past the host window.
const MIN_SIZE = { width: 320, height: 460 };
const MAX_SIZE = { width: 1200, height: 1200 };

function clampSize(width: number, height: number) {
  return {
    width: Math.max(MIN_SIZE.width, Math.min(MAX_SIZE.width, Math.round(width))),
    height: Math.max(MIN_SIZE.height, Math.min(MAX_SIZE.height, Math.round(height)))
  };
}

const DEFAULT_SETTINGS: Settings = {
  soundInEdit: true,
  compactLayout: false,
  fileKeyOverride: '',
  previewBaseUrlOverride: ''
};

figma.showUI(__html__, { ...DEFAULT_SIZE, themeColors: true });

// Restore the last-used window size (figma.showUI must run synchronously with a
// literal size, so we resize once clientStorage resolves).
figma.clientStorage.getAsync(WINDOW_SIZE_KEY).then((raw) => {
  if (raw && typeof raw.width === 'number' && typeof raw.height === 'number') {
    const { width, height } = clampSize(raw.width, raw.height);
    figma.ui.resize(width, height);
  }
});

function postToUi(msg: MainToUi) {
  figma.ui.postMessage(msg);
}

async function loadSettings(): Promise<Settings> {
  const raw = await figma.clientStorage.getAsync(SETTINGS_KEY);
  return { ...DEFAULT_SETTINGS, ...(raw || {}) };
}

async function loadToken(): Promise<string | null> {
  return (await figma.clientStorage.getAsync(TOKEN_KEY)) ?? null;
}

async function loadPreviewToken(): Promise<string | null> {
  return (await figma.clientStorage.getAsync(PREVIEW_TOKEN_KEY)) ?? null;
}

async function loadFavourites(): Promise<string[]> {
  const raw = await figma.clientStorage.getAsync(FAVOURITES_KEY);
  return Array.isArray(raw) ? raw : [];
}

async function loadCustomPresets(): Promise<CatalogEntry[]> {
  const raw = await figma.clientStorage.getAsync(CUSTOM_PRESETS_KEY);
  return Array.isArray(raw) ? (raw as CatalogEntry[]) : [];
}

function readBinding(node: BaseNode): BindingMeta | null {
  // Honour the per-instance opt-out flag before reading the binding. An
  // instance with this flag set keeps inheriting BINDING_KEY from its
  // component master via Figma's plugin-data inheritance, but should be
  // treated as unbound for the purposes of our lists and overlays.
  if (node.getPluginData(BINDING_NEGATED_KEY)) return null;
  const raw = node.getPluginData(BINDING_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<BindingMeta>;
    // Reject anything that's not a real binding — empty objects, half-written
    // payloads, or data left behind by an older plugin version. Without this
    // the bound-list could show ghost entries with undefined preset names.
    if (!parsed || typeof parsed.presetId !== 'string' || parsed.presetId.length === 0) {
      return null;
    }
    return parsed as BindingMeta;
  } catch {
    return null;
  }
}

function boxOf(node: BaseNode): NodeBox | null {
  const b = (node as SceneNode).absoluteBoundingBox;
  return b ? { x: b.x, y: b.y, w: b.width, h: b.height } : null;
}

// Collect every node on the current page that has a Pulsar binding, so the
// standalone preview app can map embed click events (by node id) to a preset.
// Also returns a `frames` map (frameId → absolute box) covering every distinct
// frame-like ancestor of those bound nodes, so the preview can reposition its
// highlight overlay after Figma navigates between frames.
async function collectPreviewBindings(): Promise<{
  bindings: PreviewBinding[];
  frames: Record<string, FrameInfo>;
}> {
  await figma.currentPage.loadAsync();
  // Match by the specific binding key, not just "has any plugin data". When
  // BINDING_KEY is cleared (unbind), Figma drops the node from this result
  // immediately, so an unbound node can't leak into the bound list even if
  // some other transient state lingers.
  const nodes = figma.currentPage.findAllWithCriteria({ pluginData: { keys: [BINDING_KEY] } });
  const out: PreviewBinding[] = [];
  const frames: Record<string, FrameInfo> = {};
  for (const node of nodes) {
    const binding = readBinding(node);
    if (!binding) continue;
    const descendantIds =
      'findAll' in node ? (node as ChildrenMixin & BaseNode).findAll(() => true).map((d) => d.id) : [];
    const frame = topLevelFrameAncestor(node);
    const frameId = frame ? frame.id : null;
    if (frame && !(frame.id in frames)) {
      const box = boxOf(frame);
      if (box) frames[frame.id] = { name: frame.name, box };
    }
    out.push({
      nodeId: node.id,
      nodeName: node.name,
      presetId: binding.presetId,
      presetName: binding.presetName,
      customPattern: binding.customPattern,
      box: boxOf(node),
      frameId,
      descendantIds
    });
  }
  return { bindings: out, frames };
}

// Light list of bound components for the "Bound" tab (no boxes/descendants).
// Each item carries its top-level frame id + name so the UI can group entries
// by screen, mirroring the preview's "Haptic elements" sidebar.
async function collectBoundItems(): Promise<BoundItem[]> {
  await figma.currentPage.loadAsync();
  // Match by the specific binding key, not just "has any plugin data". When
  // BINDING_KEY is cleared (unbind), Figma drops the node from this result
  // immediately, so an unbound node can't leak into the bound list even if
  // some other transient state lingers.
  const nodes = figma.currentPage.findAllWithCriteria({ pluginData: { keys: [BINDING_KEY] } });
  const out: BoundItem[] = [];
  for (const node of nodes) {
    const binding = readBinding(node);
    if (!binding) continue;
    const frame = topLevelFrameAncestor(node);
    out.push({
      nodeId: node.id,
      nodeName: node.name,
      nodeType: node.type,
      presetId: binding.presetId,
      presetName: binding.presetName,
      frameId: frame ? frame.id : null,
      frameName: frame ? frame.name : null
    });
  }
  return out;
}

// Select a bound node, bring it into view and flash a selection so the user can
// see which component the preset is attached to.
async function focusNode(nodeId: string) {
  const node = await figma.getNodeByIdAsync(nodeId);
  if (!node || node.type === 'PAGE' || node.type === 'DOCUMENT' || node.removed) {
    figma.notify('That component no longer exists.');
    return;
  }
  // Make sure its page is current (documents can have multiple pages).
  let p: BaseNode | null = node.parent;
  while (p && p.type !== 'PAGE') p = p.parent;
  if (p && p.type === 'PAGE' && p.id !== figma.currentPage.id) {
    await figma.setCurrentPageAsync(p as PageNode);
  }
  const scene = node as SceneNode;
  figma.currentPage.selection = [scene];
  figma.viewport.scrollAndZoomIntoView([scene]);
}

// Node types Figma can embed as a top-level prototype frame.
const FRAME_LIKE_TYPES: ReadonlyArray<NodeType> = [
  'FRAME',
  'COMPONENT',
  'COMPONENT_SET',
  'INSTANCE'
];

function isFrameLike(node: BaseNode | null): node is SceneNode {
  return !!node && (FRAME_LIKE_TYPES as ReadonlyArray<string>).includes(node.type);
}

// Walk up from `node` to the nearest frame-like ancestor. Sections, groups,
// and other wrappers are skipped so a frame inside a SECTION still resolves
// to the frame itself rather than the section.
function nearestFrameLikeAncestor(node: BaseNode): SceneNode | null {
  let n: BaseNode | null = node;
  while (n && n.type !== 'PAGE') {
    if (isFrameLike(n)) return n;
    n = n.parent;
  }
  return null;
}

// Walk all the way up and return the OUTERMOST frame-like ancestor — the one
// whose parent is the page (or a section). Figma's PRESENTED_NODE_CHANGED event
// always reports the top-level prototype frame, so matching bound elements to
// their owning frame by the outermost frame id keeps the preview's
// per-frame highlight filter accurate even when the button sits inside a
// nested frame.
function topLevelFrameAncestor(node: BaseNode): SceneNode | null {
  let n: BaseNode | null = node;
  let topmost: SceneNode | null = null;
  while (n && n.type !== 'PAGE') {
    if (isFrameLike(n)) topmost = n;
    n = n.parent;
  }
  return topmost;
}

// Recursively look for a frame-like node, descending into SECTIONs (which can
// nest). Anything else is treated as a leaf for our purposes.
function firstFrameLikeIn(node: SceneNode): SceneNode | null {
  const type: NodeType = node.type;
  if ((FRAME_LIKE_TYPES as ReadonlyArray<string>).includes(type)) return node;
  if (type === 'SECTION') {
    for (const child of (node as SectionNode).children) {
      const found = firstFrameLikeIn(child);
      if (found) return found;
    }
  }
  return null;
}

// The frame the preview should open on. Priority:
//   1. Nearest frame-like ancestor of the current selection — so when there
//      are several frames in the file, the one the user is working in wins.
//   2. First frame-like node on the page, descending into SECTIONs.
// Figma's embed API only takes one node id, so we must pick one here; the
// editor can't defer this to itself.
function pickPresentNode(): SceneNode | null {
  const sel = figma.currentPage.selection[0];
  if (sel) {
    const fromSelection = nearestFrameLikeAncestor(sel);
    if (fromSelection) return fromSelection;
  }
  for (const child of figma.currentPage.children) {
    const found = firstFrameLikeIn(child as SceneNode);
    if (found) return found;
  }
  return null;
}

function describeSelection(): SelectionInfo | null {
  const sel = figma.currentPage.selection;
  if (sel.length !== 1) return null;
  const node = sel[0];
  return {
    id: node.id,
    name: node.name,
    type: node.type,
    binding: readBinding(node)
  };
}

function pushSelection() {
  postToUi({ type: 'selection', node: describeSelection() });
}

function bindToSelection(binding: BindingMeta) {
  const sel = figma.currentPage.selection;
  if (sel.length !== 1) {
    figma.notify('Select exactly one node to bind a preset.');
    return;
  }
  const node = sel[0];
  // Drop any prior negation flag — without this, re-binding a previously
  // opted-out instance silently does nothing because readBinding still
  // returns null.
  node.setPluginData(BINDING_NEGATED_KEY, '');
  node.setPluginData(BINDING_KEY, JSON.stringify(binding));
  node.setRelaunchData({ play: `Pulsar: ${binding.presetName}` });
  figma.notify(`Bound "${binding.presetName}" to ${node.name}`);
  pushSelection();
}

function unbindSelection() {
  const sel = figma.currentPage.selection;
  if (sel.length !== 1) return;
  const node = sel[0];

  // Find the nearest enclosing instance (the selected node itself counts).
  // Two cases:
  //   - inside an instance → the binding might live on the master, and
  //     instances inherit it via Figma's plugin-data inheritance. Clearing
  //     BINDING_KEY on the instance just drops its own override and
  //     re-exposes the master's value, so we use a per-instance opt-out
  //     marker instead. The master and every sibling instance are left
  //     alone, which is what users expect when unbinding "this one copy".
  //   - everything else (plain frame, component master, group, …) → no
  //     inheritance to fight, so clearing BINDING_KEY on the node itself is
  //     enough. For a master, this propagates and unbinds every instance,
  //     which is also what users expect for "unbind the template".
  let instance: InstanceNode | null = null;
  let n: BaseNode | null = node;
  while (n && n.type !== 'PAGE') {
    if (n.type === 'INSTANCE') {
      instance = n as InstanceNode;
      break;
    }
    n = n.parent;
  }

  if (instance) {
    instance.setPluginData(BINDING_NEGATED_KEY, '1');
    // Also drop any direct binding override the instance may carry, so a
    // future re-bind on it starts from the inherited state.
    instance.setPluginData(BINDING_KEY, '');
    instance.setRelaunchData({});
  } else {
    // Belt-and-suspenders: wipe every plugin-data key on the node so older
    // keys (from earlier plugin versions) don't keep the node alive in
    // findAllWithCriteria result sets.
    for (const key of node.getPluginDataKeys()) {
      node.setPluginData(key, '');
    }
    node.setPluginData(BINDING_KEY, '');
    node.setRelaunchData({});
  }
  figma.notify('Preset unbound.');
  pushSelection();
}

figma.on('selectionchange', () => {
  pushSelection();

  // Edit-mode "click to play": when the user single-clicks a bound node, we forward
  // a play event to the UI which plays via WebAudio. (No native click event in
  // editor mode, so selectionchange is the closest proxy.)
  const sel = figma.currentPage.selection;
  if (sel.length === 1) {
    const b = readBinding(sel[0]);
    if (b) postToUi({ type: 'play-preset', presetId: b.presetId });
  }
});

figma.ui.onmessage = async (msg: UiToMain) => {
  switch (msg.type) {
    case 'ui-ready': {
      const [settings, hapticsToken, previewToken, favourites, customPresets] = await Promise.all([
        loadSettings(),
        loadToken(),
        loadPreviewToken(),
        loadFavourites(),
        loadCustomPresets()
      ]);
      postToUi({ type: 'init', settings, hapticsToken, previewToken, favourites, customPresets });
      pushSelection();
      break;
    }
    case 'request-selection':
      pushSelection();
      break;
    case 'bind-preset':
      bindToSelection(msg.binding);
      break;
    case 'unbind-preset':
      unbindSelection();
      break;
    case 'persist-settings':
      await figma.clientStorage.setAsync(SETTINGS_KEY, msg.settings);
      break;
    case 'persist-haptics-token':
      await figma.clientStorage.setAsync(TOKEN_KEY, msg.token);
      break;
    case 'persist-preview-token':
      await figma.clientStorage.setAsync(PREVIEW_TOKEN_KEY, msg.token);
      break;
    case 'persist-favourites':
      await figma.clientStorage.setAsync(FAVOURITES_KEY, msg.favourites);
      break;
    case 'persist-custom-presets':
      await figma.clientStorage.setAsync(CUSTOM_PRESETS_KEY, msg.presets);
      break;
    case 'request-preview-data': {
      const { bindings, frames } = await collectPreviewBindings();
      const present = pickPresentNode();
      postToUi({
        type: 'preview-data',
        fileKey: figma.fileKey ?? null,
        presentNodeId: present ? present.id : null,
        presentNodeBox: present ? boxOf(present) : null,
        bindings,
        frames
      });
      break;
    }
    case 'request-bound-list': {
      const items = await collectBoundItems();
      postToUi({ type: 'bound-list', items });
      break;
    }
    case 'focus-node':
      await focusNode(msg.nodeId);
      break;
    case 'open-external':
      figma.openExternal(msg.url);
      break;
    case 'resize': {
      const { width, height } = clampSize(msg.width, msg.height);
      figma.ui.resize(width, height);
      // Only persist on commit (pointer-up) — persisting on every drag frame
      // would flood clientStorage with dozens of writes per second.
      if (msg.commit) {
        await figma.clientStorage.setAsync(WINDOW_SIZE_KEY, { width, height });
      }
      break;
    }
    case 'notify':
      figma.notify(msg.message);
      break;
  }
};
