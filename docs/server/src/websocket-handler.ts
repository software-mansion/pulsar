import WebSocket from 'ws';
import http from 'http';
import type { ExtendedWebSocket } from './types';
import { ConnectionManager } from './connection-manager';

type SocketData = {
  type: string | null;
  action: string | null;
  token: string | null;
  code: string | null;
};

export class WebSocketHandler {
  private nextId = 0;
  private heartbeatInterval: NodeJS.Timeout;
  private readonly heartbeatIntervalMs = 30_000;

  constructor(
    wsServer: WebSocket.Server, 
    private connectionManager: ConnectionManager
  ) {
    this.setupHeartbeat(wsServer);
    this.setupWebSocket(wsServer);
  }

  public broadcast(message: string, token: string): string {
    return this.connectionManager.broadcastChannel(message, token);
  }

  private setupWebSocket(wsServer: WebSocket.Server): void {
    wsServer.on('connection', (ws: ExtendedWebSocket, req: http.IncomingMessage) => {
      ws.isAlive = true;
      ws.on('pong', () => {
        ws.isAlive = true;
      });
      this.handleConnection(ws, req);
    });
  }

  private setupHeartbeat(wsServer: WebSocket.Server): void {
    this.heartbeatInterval = setInterval(() => {
      wsServer.clients.forEach((socket) => {
        const client = socket as ExtendedWebSocket;
        if (client.isAlive === false) {
          client.terminate();
          return;
        }
        client.isAlive = false;
        client.ping();
      });
    }, this.heartbeatIntervalMs);
  }

  private handleConnection(ws: ExtendedWebSocket, req: http.IncomingMessage): void {
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const data: SocketData = {
      type: url.searchParams.get('type') || null,
      action: url.searchParams.get('action') || null,
      token: url.searchParams.get('token') || null,
      code: url.searchParams.get('code') || null,
    };
    const { type } = data;
    if (!type || (type !== 'sender' && type !== 'receiver')) {
      ws.close(1008, 'Invalid or missing type parameter: type');
      return;
    }

    ws.id = `${++this.nextId}`;
    ws.type = type as 'sender' | 'receiver';

    if (type === 'sender') {
      this.handleSenderConnection(ws, data);
    } else {
      this.handleReceiverConnection(ws, data);
    }
  }

  private handleSenderConnection(ws: ExtendedWebSocket, data: SocketData): void {
    if (data.action === 'new_connection') {
      if (!data.code) {
        ws.close(1008, 'Missing code for new_connection action');
        return;
      }
      this.connectionManager.createNewSenderConnection(ws, data.code);
      console.log(`WebSocket action [new_connection] for SENDER ${ws.id}`);
    } else if (data.action === 'reuse_connection') {
      if (!data.token) {
        ws.close(1008, 'Missing token for reuse_connection action');
        return;
      }
      this.connectionManager.reuseSenderConnection(ws, data.token);
      console.log(`WebSocket action [reuse_connection] for SENDER ${ws.id}`);
    } else {
      ws.close(1008, 'Invalid or missing action parameter for sender');
      return;
    }

    ws.on('close', () => {
      console.log(`WebSocket closed for SENDER ${ws.id}`);
      this.connectionManager.unregisterSocket(ws.id);
    });

    ws.on('error', (error) => {
      console.log(`WebSocket error for SENDER ${ws.id}:`, error);
      this.connectionManager.unregisterSocket(ws.id);
    });
  }

  private handleReceiverConnection(ws: ExtendedWebSocket, data: SocketData): void {
    if (data.action === 'new_connection') {
      if (!data.code) {
        ws.close(1008, 'Missing code for new_connection action');
        return;
      }
      this.connectionManager.createNewReceiverConnection(ws, data.code);
      console.log(`WebSocket action [new_connection] for RECEIVER ${ws.id}`);
    } else if (data.action === 'reuse_connection') {
      if (!data.token) {
        ws.close(1008, 'Missing token for reuse_connection action');
        return;
      }
      this.connectionManager.reuseReceiverConnection(ws, data.token);
      console.log(`WebSocket action [reuse_connection] for RECEIVER ${ws.id}`);
    } else {
      ws.close(1008, 'Invalid or missing action parameter for receiver');
      return;
    }

    ws.on('close', () => {
      console.log(`WebSocket closed for RECEIVER ${ws.id}`);
      this.connectionManager.unregisterSocket(ws.id);
    });

    ws.on('error', (error) => {
      console.error(`WebSocket error for RECEIVER ${ws.id}:`, error);
      this.connectionManager.unregisterSocket(ws.id);
    });
  }
}
