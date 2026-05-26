// Pulsar live preview: embeds a Figma prototype and plays the bound "audio
// haptics" when the user taps a node that the plugin associated with a preset.
//
// The plugin opens this app with a base64'd payload in the URL hash:
//   #data=<base64( JSON { fileKey, nodeId, frame, elements, bindings } )>
// where:
//   - bindings: { figmaNodeId -> PresetData }  (incl. descendants, for tap playback)
//   - elements: [{ id, name, presetName, box }] (one per bound node, for the panel
//     list + on-canvas highlights)
//   - frame:    bounding box of the presented frame (to map node boxes onto the embed)
import { playPreset, stopAll } from './audioPattern.js';

// OAuth client id for the Figma Embed API (provided by the file owner). The host
// running this app must also be registered as an embed origin on that OAuth app.
const CLIENT_ID = '2EUn8wVWgJHsMsjlcRB9nQ';

// Origins the embed posts events from. We accept www + embed subdomains.
const FIGMA_ORIGINS = ['https://www.figma.com', 'https://embed.figma.com'];

const els = {
  frameWrap: document.getElementById('frame-wrap'),
  overlay: document.getElementById('overlay'),
  empty: document.getElementById('empty'),
  status: document.getElementById('status'),
  count: document.getElementById('binding-count'),
  list: document.getElementById('list'),
  hlToggle: document.getElementById('hl-toggle')
};

// Figma node ids appear as "123:456" in plugin data but "123-456" in embed URLs
// and (sometimes) in events. Canonicalise everything to the dash form.
const normalizeId = (id) => (id == null ? '' : String(id).replace(/:/g, '-'));

function setStatus(text) {
  els.status.textContent = text;
}

function readPayload() {
  const hash = location.hash.replace(/^#/, '');
  const m = hash.match(/(?:^|&)data=([^&]+)/);
  if (!m) return null;
  try {
    const json = decodeURIComponent(escape(atob(decodeURIComponent(m[1]))));
    return JSON.parse(json);
  } catch (e) {
    setStatus(`Failed to parse payload: ${e.message}`);
    return null;
  }
}

function buildEmbedSrc(fileKey, nodeId) {
  const params = new URLSearchParams({
    'embed-host': location.hostname || 'localhost',
    'client-id': CLIENT_ID,
    'hide-ui': '1',
    scaling: 'contain'
  });
  if (nodeId) params.set('node-id', normalizeId(nodeId));
  return `https://embed.figma.com/proto/${fileKey}/preview?${params.toString()}`;
}

// ---- App state ---------------------------------------------------------------

const state = {
  frame: null, // presented frame box { x, y, w, h }
  presentedId: '', // normalised id of the originally presented frame
  currentNodeId: '', // normalised id currently presented in the embed
  bindings: new Map(), // normId -> PresetData (incl. descendants)
  owner: new Map(), // normId (any node) -> owning bound-element normId
  elements: [], // [{ normId, name, presetName, box }]
  rows: new Map(), // normId -> row element
  boxes: new Map(), // normId -> highlight element
  highlightsOn: true
};

// Debounce per node: MOUSE_PRESS_OR_RELEASE fires on both press and release, so a
// single tap arrives twice. Suppress repeats within a short window.
const lastPlayed = new Map();
function shouldPlay(normId) {
  const now = Date.now();
  if (now - (lastPlayed.get(normId) ?? 0) < 250) return false;
  lastPlayed.set(normId, now);
  return true;
}

function play(normId) {
  const data = state.bindings.get(normId);
  if (!data) return false;
  stopAll();
  // Cache the rendered buffer per preset, not per node (many child node ids
  // share the same preset after descendant-mapping).
  playPreset(data.name, data).catch(() => {});
  return true;
}

let activeTimer = null;
function setActive(normId, { transient = false } = {}) {
  for (const [id, row] of state.rows) row.classList.toggle('active', id === normId);
  for (const [id, box] of state.boxes) box.classList.toggle('active', id === normId);
  if (activeTimer) clearTimeout(activeTimer);
  if (normId && transient) {
    const row = state.rows.get(normId);
    if (row) row.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    activeTimer = setTimeout(() => setActive(''), 900);
  }
}

// ---- Rendering ---------------------------------------------------------------

function renderList() {
  els.list.innerHTML = '';
  state.rows.clear();
  if (state.elements.length === 0) {
    const note = document.createElement('div');
    note.className = 'empty-note';
    note.textContent = 'No elements have haptics bound on this page.';
    els.list.appendChild(note);
    return;
  }
  for (const el of state.elements) {
    const row = document.createElement('div');
    row.className = 'el-row';
    row.dataset.id = el.normId;

    const haptic = document.createElement('div');
    haptic.className = 'el-haptic';
    haptic.textContent = el.presetName;

    const name = document.createElement('div');
    name.className = 'el-name';
    name.textContent = el.name;

    row.append(haptic, name);
    row.addEventListener('mouseenter', () => setActive(el.normId));
    row.addEventListener('mouseleave', () => setActive(''));
    row.addEventListener('click', () => {
      play(el.normId);
      setActive(el.normId, { transient: true });
    });
    els.list.appendChild(row);
    state.rows.set(el.normId, row);
  }
}

function buildOverlay() {
  els.overlay.innerHTML = '';
  state.boxes.clear();
  for (const el of state.elements) {
    if (!el.box) continue;
    const box = document.createElement('div');
    box.className = 'hl';
    box.dataset.id = el.normId;
    const label = document.createElement('span');
    label.className = 'hl-label';
    label.textContent = el.presetName;
    box.appendChild(label);
    els.overlay.appendChild(box);
    state.boxes.set(el.normId, box);
  }
  positionHighlights();
}

// Map absolute Figma boxes onto the embed, assuming the presented frame is shown
// "contain"-scaled and centred inside the iframe (matches scaling=contain + hide-ui).
function positionHighlights() {
  const frame = state.frame;
  const show =
    state.highlightsOn && !!frame && state.currentNodeId === state.presentedId;
  els.overlay.style.display = show ? 'block' : 'none';
  if (!show) return;

  const viewW = els.frameWrap.clientWidth;
  const viewH = els.frameWrap.clientHeight;
  const scale = Math.min(viewW / frame.w, viewH / frame.h);
  const offX = (viewW - frame.w * scale) / 2;
  const offY = (viewH - frame.h * scale) / 2;

  for (const el of state.elements) {
    const box = state.boxes.get(el.normId);
    if (!box || !el.box) continue;
    box.style.left = `${offX + (el.box.x - frame.x) * scale}px`;
    box.style.top = `${offY + (el.box.y - frame.y) * scale}px`;
    box.style.width = `${el.box.w * scale}px`;
    box.style.height = `${el.box.h * scale}px`;
  }
}

// ---- Boot --------------------------------------------------------------------

function start() {
  const payload = readPayload();
  if (!payload || !payload.fileKey) {
    setStatus('Waiting for a design — open one from the Pulsar plugin ("Show in live preview").');
    return;
  }

  state.frame = payload.frame || null;
  state.presentedId = normalizeId(payload.nodeId);
  state.currentNodeId = state.presentedId;

  for (const [nodeId, data] of Object.entries(payload.bindings || {})) {
    state.bindings.set(normalizeId(nodeId), data);
  }
  for (const [nodeId, ownerId] of Object.entries(payload.owner || {})) {
    state.owner.set(normalizeId(nodeId), normalizeId(ownerId));
  }
  state.elements = (payload.elements || []).map((e) => ({
    normId: normalizeId(e.id),
    name: e.name,
    presetName: e.presetName,
    box: e.box || null
  }));
  els.count.textContent = String(state.elements.length);

  renderList();
  buildOverlay();

  const iframe = document.createElement('iframe');
  iframe.src = buildEmbedSrc(payload.fileKey, payload.nodeId);
  iframe.allow = 'fullscreen';
  iframe.setAttribute('allowfullscreen', 'true');
  els.empty.style.display = 'none';
  els.frameWrap.appendChild(iframe);
  setStatus('Loading prototype…');

  els.hlToggle.addEventListener('change', () => {
    state.highlightsOn = els.hlToggle.checked;
    positionHighlights();
  });
  new ResizeObserver(() => positionHighlights()).observe(els.frameWrap);
  window.addEventListener('resize', positionHighlights);
  // Reposition once the initial layout has settled (clientWidth may be 0 on the
  // first synchronous pass).
  requestAnimationFrame(positionHighlights);

  window.addEventListener('message', (event) => {
    if (!FIGMA_ORIGINS.includes(event.origin)) return;
    const msg = event.data || {};
    switch (msg.type) {
      case 'INITIAL_LOAD':
        setStatus('Tap a highlighted element to feel its haptic.');
        positionHighlights();
        break;
      case 'PRESENTED_NODE_CHANGED':
        state.currentNodeId = normalizeId(msg.data?.presentedNodeId);
        // Boxes only line up on the originally presented frame.
        positionHighlights();
        break;
      case 'LOGIN_SCREEN_SHOWN':
        setStatus('This file requires Figma login to embed.');
        break;
      case 'MOUSE_PRESS_OR_RELEASE': {
        const normId = normalizeId(msg.data?.targetNodeId);
        if (!normId || !state.bindings.has(normId)) return;
        if (!shouldPlay(normId)) return;
        // The tap may land on a descendant; resolve to the bound element.
        const ownerId = state.owner.get(normId) ?? normId;
        play(ownerId);
        setActive(ownerId, { transient: true });
        break;
      }
    }
  });
}

window.addEventListener('hashchange', () => location.reload());
start();
