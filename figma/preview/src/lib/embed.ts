import { normalizeId } from './ids';

// OAuth client id for the Figma Embed API (provided by the file owner). The host
// running this app must also be registered as an embed origin on that OAuth app.
export const CLIENT_ID = '2EUn8wVWgJHsMsjlcRB9nQ';

// Origins the embed posts events from. We accept www + embed subdomains.
export const FIGMA_ORIGINS = ['https://www.figma.com', 'https://embed.figma.com'];

export function buildEmbedSrc(fileKey: string, nodeId: string | null): string {
  const params = new URLSearchParams({
    'embed-host': location.hostname || 'localhost',
    'client-id': CLIENT_ID,
    'hide-ui': '1',
    scaling: 'contain'
  });
  if (nodeId) params.set('node-id', normalizeId(nodeId));
  return `https://embed.figma.com/proto/${fileKey}/preview?${params.toString()}`;
}

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
