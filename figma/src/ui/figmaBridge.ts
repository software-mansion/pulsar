import type { MainToUi, UiToMain } from '../shared/types';

export function send(msg: UiToMain) {
  parent.postMessage({ pluginMessage: msg }, '*');
}

type Handler = (m: MainToUi) => void;
const handlers = new Set<Handler>();

window.addEventListener('message', (e) => {
  const m = e.data?.pluginMessage as MainToUi | undefined;
  if (!m) return;
  handlers.forEach((h) => h(m));
});

export function onMessage(h: Handler): () => void {
  handlers.add(h);
  return () => handlers.delete(h);
}
