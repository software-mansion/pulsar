// Figma plugin main thread. Runs in the figma sandbox; talks to the UI iframe via postMessage.
import type {
  BindingMeta,
  BoundItem,
  MainToUi,
  NodeBox,
  PreviewBinding,
  SelectionInfo,
  Settings,
  UiToMain
} from '../shared/types';

const BINDING_KEY = 'pulsar:binding';
const SETTINGS_KEY = 'pulsar:settings';
const TOKEN_KEY = 'pulsar:hapticsToken';
const FAVOURITES_KEY = 'pulsar:favourites';

const DEFAULT_SETTINGS: Settings = {
  soundInEdit: true,
  compactLayout: false,
  // Base URL of the standalone live-preview web app (figma/preview). Override in
  // Settings to point at wherever you host/serve it.
  previewBaseUrl: 'https://docs.swmansion.com/figma-preview/',
  fileKeyOverride: ''
};

figma.showUI(__html__, { width: 380, height: 640, themeColors: true });

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

async function loadFavourites(): Promise<string[]> {
  const raw = await figma.clientStorage.getAsync(FAVOURITES_KEY);
  return Array.isArray(raw) ? raw : [];
}

function readBinding(node: BaseNode): BindingMeta | null {
  const raw = node.getPluginData(BINDING_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as BindingMeta;
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
async function collectPreviewBindings(): Promise<PreviewBinding[]> {
  await figma.currentPage.loadAsync();
  const nodes = figma.currentPage.findAllWithCriteria({ pluginData: {} });
  const out: PreviewBinding[] = [];
  for (const node of nodes) {
    const binding = readBinding(node);
    if (!binding) continue;
    const descendantIds =
      'findAll' in node ? (node as ChildrenMixin & BaseNode).findAll(() => true).map((d) => d.id) : [];
    out.push({
      nodeId: node.id,
      nodeName: node.name,
      presetId: binding.presetId,
      presetName: binding.presetName,
      customPattern: binding.customPattern,
      box: boxOf(node),
      descendantIds
    });
  }
  return out;
}

// Light list of bound components for the "Bound" tab (no boxes/descendants).
async function collectBoundItems(): Promise<BoundItem[]> {
  await figma.currentPage.loadAsync();
  const nodes = figma.currentPage.findAllWithCriteria({ pluginData: {} });
  const out: BoundItem[] = [];
  for (const node of nodes) {
    const binding = readBinding(node);
    if (!binding) continue;
    out.push({
      nodeId: node.id,
      nodeName: node.name,
      nodeType: node.type,
      presetId: binding.presetId,
      presetName: binding.presetName
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

// The frame the preview should open on: the top-level frame ancestor of the
// current selection, else the first top-level frame on the page.
function pickPresentNode(): SceneNode | null {
  const sel = figma.currentPage.selection[0];
  if (sel) {
    let n: BaseNode | null = sel;
    while (n && n.parent && n.parent.type !== 'PAGE') n = n.parent;
    if (n && n.type === 'FRAME') return n as SceneNode;
  }
  const topFrame = figma.currentPage.children.find((c) => c.type === 'FRAME');
  return (topFrame as SceneNode) ?? null;
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
  node.setPluginData(BINDING_KEY, JSON.stringify(binding));
  node.setRelaunchData({ play: `Pulsar: ${binding.presetName}` });
  figma.notify(`Bound "${binding.presetName}" to ${node.name}`);
  pushSelection();
}

function unbindSelection() {
  const sel = figma.currentPage.selection;
  if (sel.length !== 1) return;
  const node = sel[0];
  node.setPluginData(BINDING_KEY, '');
  node.setRelaunchData({});
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
      const [settings, hapticsToken, favourites] = await Promise.all([
        loadSettings(),
        loadToken(),
        loadFavourites()
      ]);
      postToUi({ type: 'init', settings, hapticsToken, favourites });
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
    case 'persist-favourites':
      await figma.clientStorage.setAsync(FAVOURITES_KEY, msg.favourites);
      break;
    case 'request-preview-data': {
      const bindings = await collectPreviewBindings();
      const present = pickPresentNode();
      postToUi({
        type: 'preview-data',
        fileKey: figma.fileKey ?? null,
        presentNodeId: present ? present.id : null,
        presentNodeBox: present ? boxOf(present) : null,
        bindings
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
    case 'notify':
      figma.notify(msg.message);
      break;
  }
};
