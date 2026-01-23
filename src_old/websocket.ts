import WebSocket from 'ws';
import http from 'http';
import { ExtendedWebSocket } from './types';
import { WebSocketHandlers } from './websocket-handlers';
import { PORT } from './constants';

export function setupWebSocket(server: http.Server, wsHandlers: WebSocketHandlers): WebSocket.Server {
  const wss = new WebSocket.Server({ server });

  wss.on('connection', (ws: ExtendedWebSocket, req: http.IncomingMessage) => {
    const isStatusConnection = isStatusRequest(req.url);

    if (isStatusConnection) {
      wsHandlers.handleStatusConnection(ws, req);
    } else {
      wsHandlers.handleDataConnection(ws, req);
    }
  });

  return wss;
}

function isStatusRequest(url: string | undefined): boolean {
  try {
    const parsedUrl = new URL(url || '', `http://localhost:${PORT}`);
    return parsedUrl.searchParams.get('status') === 'true';
  } catch {
    return false;
  }
}
