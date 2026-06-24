import WebSocket from 'ws';
import http from 'http';
import type { ExtendedWebSocket } from './types';
import { ConnectionManager } from './connection-manager';
import { PairingRateLimiter, RateLimiterOptions } from './rate-limiter';

type SocketData = {
  type: string | null;
  action: string | null;
  token: string | null;
  code: string | null;
};

// Best-effort client IP. Behind a proxy the real peer is in X-Forwarded-For
// (first hop); otherwise fall back to the socket's remote address.
function getClientIp(req: http.IncomingMessage): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }
  if (Array.isArray(forwarded) && forwarded.length > 0) {
    return forwarded[0].trim();
  }
  return req.socket.remoteAddress || 'unknown';
}

export class WebSocketHandler {
  private nextId = 0;
  private heartbeatInterval: NodeJS.Timeout;
  private readonly heartbeatIntervalMs = 30_000;
  private readonly rateLimiter: PairingRateLimiter;

  constructor(
    wsServer: WebSocket.Server,
    private connectionManager: ConnectionManager,
    rateLimiterOptions?: RateLimiterOptions,
  ) {
    this.rateLimiter = new PairingRateLimiter(rateLimiterOptions);
    this.setupHeartbeat(wsServer);
    this.setupWebSocket(wsServer);
    wsServer.on('close', () => this.rateLimiter.dispose());
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
      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          if (message.type === 'ping') {
            // App-level ping also counts as liveness, so a client that pings at
            // the app level but ignores protocol ping frames isn't reaped by the
            // heartbeat sweep.
            ws.isAlive = true;
            ws.send(JSON.stringify({ type: 'pong' }));
          }
        } catch {
          // ignore non-JSON messages
        }
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
    // Don't let the heartbeat alone keep the process alive, and stop it when the
    // server closes so the interval (and its closure) doesn't leak.
    this.heartbeatInterval.unref?.();
    wsServer.on('close', () => clearInterval(this.heartbeatInterval));
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
    // Optional, additive producer identity. A producer may advertise a human
    // name (e.g. "Figma Plugin macOS") and a Figma preview token to hand to the
    // phone; the server relays these to the receiver on (re)establish. Older
    // producers omit them and older receivers ignore them — kept off the socket
    // entirely when absent so the relayed messages stay byte-for-byte unchanged.
    const name = url.searchParams.get('name');
    const previewToken = url.searchParams.get('previewToken');
    if (name || previewToken) {
      ws.metadata = {
        ...(name ? { name } : {}),
        ...(previewToken ? { previewToken } : {}),
      };
    }
    const ip = getClientIp(req);

    if (type === 'sender') {
      this.handleSenderConnection(ws, data, ip);
    } else {
      this.handleReceiverConnection(ws, data, ip);
    }
  }

  // Guard a `new_connection` claim against brute-force: reject when the IP is
  // locked out or the code has been burned, and feed failed claims back to the
  // limiter. Returns true if the connection should be torn down by the caller.
  private rejectThrottledClaim(
    ws: ExtendedWebSocket,
    ip: string,
    code: string,
    claim: (code: string) => import('./connection-manager').ClaimResult,
  ): boolean {
    const decision = this.rateLimiter.checkAttempt(ip, code);
    if (!decision.allowed) {
      const seconds = Math.ceil((decision.retryAfterMs ?? 0) / 1000);
      ws.close(1008, `Too many pairing attempts. Try again in ${seconds}s.`);
      return true;
    }

    const result = claim(code);
    if (result === 'claimed') {
      this.rateLimiter.recordSuccess(ip, code);
      return false;
    }

    this.rateLimiter.recordFailure(ip, code);
    if (result === 'slot_taken') {
      ws.close(1008, 'Pairing code already in use');
    } else {
      ws.close(1008, 'Invalid code: no sender connection found for the provided code');
    }
    return true;
  }

  private handleSenderConnection(ws: ExtendedWebSocket, data: SocketData, ip: string): void {
    if (data.action === 'new_connection') {
      if (!data.code) {
        ws.close(1008, 'Missing code for new_connection action');
        return;
      }
      if (
        this.rejectThrottledClaim(ws, ip, data.code, (code) =>
          this.connectionManager.createNewSenderConnection(ws, code),
        )
      ) {
        return;
      }
    } else if (data.action === 'reuse_connection') {
      if (!data.token) {
        ws.close(1008, 'Missing token for reuse_connection action');
        return;
      }
      this.connectionManager.reuseSenderConnection(ws, data.token);
    } else {
      ws.close(1008, 'Invalid or missing action parameter for sender');
      return;
    }

    ws.on('close', () => {
      this.connectionManager.unregisterSocket(ws.id);
    });

    ws.on('error', (error) => {
      console.error(`WebSocket error for SENDER ${ws.id}:`, error);
      this.connectionManager.unregisterSocket(ws.id);
    });
  }

  private handleReceiverConnection(ws: ExtendedWebSocket, data: SocketData, ip: string): void {
    if (data.action === 'new_connection') {
      if (!data.code) {
        ws.close(1008, 'Missing code for new_connection action');
        return;
      }
      if (
        this.rejectThrottledClaim(ws, ip, data.code, (code) =>
          this.connectionManager.createNewReceiverConnection(ws, code),
        )
      ) {
        return;
      }
    } else if (data.action === 'reuse_connection') {
      if (!data.token) {
        ws.close(1008, 'Missing token for reuse_connection action');
        return;
      }
      this.connectionManager.reuseReceiverConnection(ws, data.token);
    } else {
      ws.close(1008, 'Invalid or missing action parameter for receiver');
      return;
    }

    ws.on('close', () => {
      this.connectionManager.unregisterSocket(ws.id);
    });

    ws.on('error', (error) => {
      console.error(`WebSocket error for RECEIVER ${ws.id}:`, error);
      this.connectionManager.unregisterSocket(ws.id);
    });
  }
}
