import { normalizeId } from './ids';

// OAuth client id for the Figma Embed API (provided by the file owner). The host
// running this app must also be registered as an embed origin on that OAuth app.
export const CLIENT_ID = '2EUn8wVWgJHsMsjlcRB9nQ';

// Origins the embed posts events from. We accept www + embed subdomains.
export const FIGMA_ORIGINS = ['https://www.figma.com', 'https://embed.figma.com'];

export function buildEmbedSrc(
  fileKey: string,
  nodeId: string | null,
  deviceFrame: boolean
): string {
  const params = new URLSearchParams({
    'embed-host': location.hostname || 'localhost',
    'client-id': CLIENT_ID,
    'hide-ui': '1',
    // contain: fit the whole frame inside the iframe (letterboxed), so nothing is
    // cropped. The iframe itself fills the container; the overlay maps using the
    // same fit-and-center rule (see HighlightOverlay.boxStyle).
    scaling: 'contain',
    // Device bezel on desktop; bare frame on mobile.
    'device-frame': deviceFrame ? 'true' : 'false'
  });
  if (nodeId) params.set('node-id', normalizeId(nodeId));
  return `https://embed.figma.com/proto/${fileKey}/preview?${params.toString()}`;
}

// NOTE: The Figma Embed API documents inbound control messages
// (NAVIGATE_TO_FRAME_AND_CLOSE_OVERLAYS, NAVIGATE_FORWARD, …) posted to the
// iframe's contentWindow. We tried these to switch frames without reloading, but
// they're a no-op in practice for these embeds - even Figma's own example's
// forward button doesn't move the prototype via postMessage. So a frame change
// goes through the iframe's node-id (a reload) instead; see PrototypeView.

// Events the embedded prototype posts to the parent window.
export interface FigmaEmbedEvent {
  type:
    | 'INITIAL_LOAD'
    | 'PRESENTED_NODE_CHANGED'
    | 'MOUSE_PRESS_OR_RELEASE'
    | 'NEW_STATE'
    | 'REQUEST_CLOSE'
    | 'LOGIN_SCREEN_SHOWN'
    | 'PASSWORD_SCREEN_SHOWN';
  data?: {
    presentedNodeId?: string;
    targetNodeId?: string;
    [k: string]: unknown;
  };
}
