// Figma plugin main thread. Runs in the figma sandbox; talks to the UI iframe via postMessage.
import type {
  BindingMeta,
  MainToUi,
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
  soundInPreview: true,
  compactLayout: false,
  // Sample MP4 with sound from Google's public test bucket — used as a stand-in
  // until per-preset videos are generated.
  videoPreviewUrl:
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
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

// Preview-mode video fill: when a preset is bound to a node that supports fills
// (rectangles, frames, shapes), we attach a video fill so the prototype/preview
// player can produce sound on tap. Figma exposes createVideoAsync for this.
async function applyVideoFill(node: SceneNode, url: string) {
  if (!('fills' in node)) return;
  try {
    const res = await fetch(url);
    const buf = new Uint8Array(await res.arrayBuffer());
    const video = await figma.createVideoAsync(buf);
    const fills: Paint[] = [
      { type: 'VIDEO', scaleMode: 'FILL', videoHash: video.hash } as unknown as Paint
    ];
    (node as any).fills = fills;
  } catch (e) {
    figma.notify(`Could not attach video fill: ${(e as Error).message}`);
  }
}

function clearVideoFill(node: SceneNode) {
  if (!('fills' in node)) return;
  const fills = (node as any).fills as readonly Paint[];
  if (!Array.isArray(fills)) return;
  const next = fills.filter((f) => f.type !== 'VIDEO');
  (node as any).fills = next;
}

async function bindToSelection(binding: BindingMeta, settings: Settings) {
  const sel = figma.currentPage.selection;
  if (sel.length !== 1) {
    figma.notify('Select exactly one node to bind a preset.');
    return;
  }
  const node = sel[0];
  node.setPluginData(BINDING_KEY, JSON.stringify(binding));
  node.setRelaunchData({ play: `Pulsar: ${binding.presetName}` });
  if (settings.soundInPreview) {
    await applyVideoFill(node as SceneNode, settings.videoPreviewUrl);
  }
  figma.notify(`Bound "${binding.presetName}" to ${node.name}`);
  pushSelection();
}

function unbindSelection() {
  const sel = figma.currentPage.selection;
  if (sel.length !== 1) return;
  const node = sel[0];
  node.setPluginData(BINDING_KEY, '');
  node.setRelaunchData({});
  clearVideoFill(node as SceneNode);
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
    case 'bind-preset': {
      const settings = await loadSettings();
      await bindToSelection(msg.binding, settings);
      break;
    }
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
    case 'notify':
      figma.notify(msg.message);
      break;
  }
};
