// Pulsar live preview: embeds a Figma prototype and plays the bound "audio
// haptics" when the user taps a node that the plugin associated with a preset.
//
// The plugin opens this app with a base64'd payload in the URL hash:
//   #data=<base64( JSON { fileKey, nodeId, bindings } )>
// where `bindings` maps a Figma node id -> PresetData. We listen for the embed's
// MOUSE_PRESS_OR_RELEASE event, normalise the clicked node id, look it up in the
// binding map and play it via the same WebAudio engine the plugin uses.
import { playPreset, stopAll } from './audioPattern.js';

// OAuth client id for the Figma Embed API (provided by the file owner). The host
// running this app must also be registered as an embed origin on that OAuth app.
const CLIENT_ID = '2EUn8wVWgJHsMsjlcRB9nQ';

// Origins the embed posts events from. We accept www + embed subdomains.
const FIGMA_ORIGINS = ['https://www.figma.com', 'https://embed.figma.com'];

const els = {
  frameWrap: document.getElementById('frame-wrap'),
  empty: document.getElementById('empty'),
  status: document.getElementById('status'),
  count: document.getElementById('binding-count'),
  log: document.getElementById('log')
};

// Figma node ids appear as "123:456" in plugin data but "123-456" in embed URLs
// and (sometimes) in events. Canonicalise everything to the dash form.
const normalizeId = (id) => (id == null ? '' : String(id).replace(/:/g, '-'));

function log(message, kind = 'info') {
  const row = document.createElement('div');
  row.className = `log-row log-${kind}`;
  const time = document.createElement('span');
  time.className = 'time';
  time.textContent = new Date().toLocaleTimeString();
  row.append(time, document.createTextNode('  ' + message));
  els.log.prepend(row);
}

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
    log(`Failed to parse payload: ${e.message}`, 'error');
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

// Debounce per node: MOUSE_PRESS_OR_RELEASE fires on both press and release, so a
// single tap arrives twice. Suppress repeats within a short window.
const lastPlayed = new Map();
function shouldPlay(normId) {
  const now = Date.now();
  const prev = lastPlayed.get(normId) ?? 0;
  if (now - prev < 250) return false;
  lastPlayed.set(normId, now);
  return true;
}

function start() {
  const payload = readPayload();
  if (!payload || !payload.fileKey) {
    setStatus('Waiting for a design — open one from the Pulsar plugin ("Show in live preview").');
    return;
  }

  // Map of normalised node id -> PresetData.
  const bindings = new Map();
  for (const [nodeId, data] of Object.entries(payload.bindings || {})) {
    bindings.set(normalizeId(nodeId), data);
  }
  els.count.textContent = String(bindings.size);

  const iframe = document.createElement('iframe');
  iframe.src = buildEmbedSrc(payload.fileKey, payload.nodeId);
  iframe.allow = 'fullscreen';
  iframe.setAttribute('allowfullscreen', 'true');
  els.empty.style.display = 'none';
  els.frameWrap.appendChild(iframe);
  setStatus('Loading prototype…');
  log(`Embedding file ${payload.fileKey} (${bindings.size} bound node(s)).`);

  window.addEventListener('message', (event) => {
    if (!FIGMA_ORIGINS.includes(event.origin)) return;
    const msg = event.data || {};
    switch (msg.type) {
      case 'INITIAL_LOAD':
        setStatus('Prototype loaded — tap bound elements to feel the haptics.');
        log('Prototype loaded.', 'ok');
        break;
      case 'PRESENTED_NODE_CHANGED':
        log(`Presented node → ${msg.data?.presentedNodeId ?? '?'}`);
        break;
      case 'LOGIN_SCREEN_SHOWN':
        setStatus('This file requires Figma login to embed.');
        log('Login screen shown — file may be private.', 'error');
        break;
      case 'PASSWORD_SCREEN_SHOWN':
        log('Password screen shown.', 'error');
        break;
      case 'MOUSE_PRESS_OR_RELEASE': {
        const normId = normalizeId(msg.data?.targetNodeId);
        if (!normId) return;
        const data = bindings.get(normId);
        if (!data) {
          log(`Tap on ${normId} — no haptic bound.`);
          return;
        }
        if (!shouldPlay(normId)) return;
        log(`Tap on ${normId} → playing "${data.name}".`, 'ok');
        stopAll();
        // Cache the rendered buffer per preset, not per node (many child node ids
        // share the same preset after descendant-mapping).
        playPreset(data.name, data).catch((e) => log(`Playback error: ${e.message}`, 'error'));
        break;
      }
    }
  });
}

window.addEventListener('hashchange', () => location.reload());
start();
