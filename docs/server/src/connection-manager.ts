import crypto from 'crypto';
import { ExtendedWebSocket } from './types';

type Connection = {
  sender?: ExtendedWebSocket;
  receiver?: ExtendedWebSocket;
};

type SocketData = {
  ws: ExtendedWebSocket;
  connectionType: 'weak' | 'strong';
  mode: 'sender' | 'receiver';
  key: string;
};

// Outcome of a `new_connection` claim against a weak (pending) pairing.
//  - 'claimed'      : the code was valid and this socket took the slot.
//  - 'invalid_code' : no pending channel for this code (a brute-force miss).
//  - 'slot_taken'   : the channel exists but the slot is already occupied —
//                     one-shot semantics, so a later socket cannot hijack it.
export type ClaimResult = 'claimed' | 'invalid_code' | 'slot_taken';

export class ConnectionManager {
  private weakConnections: Map<string, Connection> = new Map();
  private strongConnections: Map<string, Connection> = new Map();
  private idToSocket: Map<string, SocketData> = new Map();
  // Expiry timers for pending weak pairings, keyed by code, so a code that is
  // promoted or torn down early can cancel its timer instead of leaving it to
  // fire (as a no-op) 15 minutes later.
  private weakTimers: Map<string, NodeJS.Timeout> = new Map();

  public getParingCode(): string {
    // crypto.randomInt is a CSPRNG; range is [1000, 10000) → a 4-digit code.
    let code = crypto.randomInt(1000, 10000).toString();
    let globalMaxIterations = 1000000;

    while (this.strongConnections.has(code) || this.weakConnections.has(code)) {
      globalMaxIterations--;
      if (globalMaxIterations <= 0) {
        return '-1';
      }
      code = crypto.randomInt(1000, 10000).toString();
    }

    this.registerWeakConnection(code);

    return code;
  }

  public generateToken(): string {
    // Session token authorizes broadcasting into a paired channel, so it must
    // come from a CSPRNG (not Math.random, whose state is recoverable).
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const tokenLength = 100;
    const bytes = crypto.randomBytes(tokenLength);
    let token = '';
    for (let i = 0; i < tokenLength; i++) {
      token += characters[bytes[i] % characters.length];
    }

    return token;
  }

  public broadcastChannel(message: string, token: string): string {
    let messageData;
    try {
      messageData = JSON.parse(message);
    } catch {
      messageData = message;
    }

    const data = JSON.stringify({
      type: 'broadcast',
      message: messageData,
    });

    const connection = this.strongConnections.get(token);
    if (connection) {
      if (connection.receiver && connection.receiver.readyState === WebSocket.OPEN) {
        connection.receiver.send(data);
      }
    } else {
      return 'Invalid token or no active connection found';
    }
    return 'ok';
  }

  public createNewSenderConnection(ws: ExtendedWebSocket, code: string): ClaimResult {
    const connection = this.weakConnections.get(code);
    if (!connection) {
      return 'invalid_code';
    }
    if (connection.sender && connection.sender.readyState === WebSocket.OPEN) {
      // Slot already claimed — one-shot, so don't let a second sender hijack it.
      return 'slot_taken';
    }
    connection.sender = ws;
    this.idToSocket.set(ws.id, { ws, connectionType: 'weak', mode: 'sender', key: code });
    this.tryPromoteConnection(code);
    return 'claimed';
  }

  public createNewReceiverConnection(ws: ExtendedWebSocket, code: string): ClaimResult {
    const connection = this.weakConnections.get(code);
    if (!connection) {
      return 'invalid_code';
    }
    if (connection.receiver && connection.receiver.readyState === WebSocket.OPEN) {
      // Slot already claimed — one-shot, so don't let a second receiver hijack it.
      return 'slot_taken';
    }
    connection.receiver = ws;
    this.idToSocket.set(ws.id, { ws, connectionType: 'weak', mode: 'receiver', key: code });
    this.tryPromoteConnection(code);
    return 'claimed';
  }

  // Close and forget a socket being displaced from a slot by a newer one, so the
  // old connection doesn't leak open. (Its idToSocket entry is removed first so
  // its later 'close' handler is a no-op.)
  private evictSlot(existing: ExtendedWebSocket | undefined, replacement: ExtendedWebSocket): void {
    if (!existing || existing === replacement) return;
    this.idToSocket.delete(existing.id);
    if (existing.readyState === WebSocket.OPEN) {
      existing.close(1000, 'Replaced by a newer connection');
    }
  }

  public reuseSenderConnection(ws: ExtendedWebSocket, token: string): void {
    if (!this.strongConnections.has(token)) {
      this.strongConnections.set(token, {});
    }
    const connection = this.strongConnections.get(token);
    if (!connection) return;
    this.evictSlot(connection.sender, ws);
    connection.sender = ws;
    this.idToSocket.set(ws.id, { ws, connectionType: 'strong', mode: 'sender', key: token });
    this.tryEstablishStrongConnection(token);
  }

  public reuseReceiverConnection(ws: ExtendedWebSocket, token: string): void {
    if (!this.strongConnections.has(token)) {
      this.strongConnections.set(token, {});
    }
    const connection = this.strongConnections.get(token);
    if (!connection) return;
    this.evictSlot(connection.receiver, ws);
    connection.receiver = ws;
    this.idToSocket.set(ws.id, { ws, connectionType: 'strong', mode: 'receiver', key: token });
    this.tryEstablishStrongConnection(token);
  }

  public unregisterSocket(wsId: string): void {
    const record = this.idToSocket.get(wsId);
    if (!record) return;

    const { connectionType: connection, mode } = record;
    let toNotify: ExtendedWebSocket | undefined;

    const map = connection === 'weak' ? this.weakConnections : this.strongConnections;
    const conn = map.get(record.key);
    if (conn) {
      // Only tear down the slot if THIS socket still occupies it. A later
      // reuse_connection may have replaced sender/receiver with a fresh socket;
      // the stale socket's close must not wipe the new one (or falsely tell the
      // peer it disconnected).
      if (mode === 'sender') {
        if (conn.sender === record.ws) {
          conn.sender = undefined;
          toNotify = conn.receiver;
        }
      } else {
        if (conn.receiver === record.ws) {
          conn.receiver = undefined;
          toNotify = conn.sender;
        }
      }
      if (!conn.sender && !conn.receiver) {
        if (connection === 'weak') {
          this.clearWeakConnection(record.key);
        } else {
          map.delete(record.key);
        }
      }
    }
    this.idToSocket.delete(wsId);
    if (toNotify && toNotify.readyState === WebSocket.OPEN) {
      const data = JSON.stringify({
        type: 'peer_disconnected',
      });
      toNotify.send(data);
    }
  }

  private tryPromoteConnection(code: string): void {
    const connection = this.weakConnections.get(code);
    if (!connection) return;
    if (!connection.sender || !connection.receiver) {
      return;
    }
    const token = this.generateToken();
    this.strongConnections.set(token, connection);
    this.clearWeakConnection(code);
    this.idToSocket.set(connection.sender.id, {
      ws: connection.sender,
      connectionType: 'strong',
      mode: 'sender',
      key: token,
    });
    this.idToSocket.set(connection.receiver.id, {
      ws: connection.receiver,
      connectionType: 'strong',
      mode: 'receiver',
      key: token,
    });
    this.sendTokenNotification(token, connection);
  }

  private tryEstablishStrongConnection(token: string): void {
    const connection = this.strongConnections.get(token);
    if (!connection) return;
    if (connection.sender && connection.receiver) {
      this.sendConnectionRestoredNotification(connection);
    }
  }

  private registerWeakConnection(code: string): void {
    this.weakConnections.set(code, {});
    const expiry = setTimeout(
      () => {
        this.weakTimers.delete(code);
        this.weakConnections.delete(code);
      },
      15 * 60 * 1000,
    ); // 15 minutes
    // The pending-code expiry alone shouldn't keep the process alive.
    expiry.unref?.();
    this.weakTimers.set(code, expiry);
  }

  // Remove a pending weak pairing and cancel its expiry timer. Use this instead
  // of weakConnections.delete(code) so promoted/torn-down codes don't leave a
  // dangling 15-minute timer behind.
  private clearWeakConnection(code: string): void {
    const timer = this.weakTimers.get(code);
    if (timer) {
      clearTimeout(timer);
      this.weakTimers.delete(code);
    }
    this.weakConnections.delete(code);
  }

  private sendTokenNotification(token: string, connection: Connection): void {
    const data = JSON.stringify({
      type: 'connection_established',
      token,
    });

    if (connection.sender && connection.sender.readyState === WebSocket.OPEN) {
      connection.sender.send(data);
    }
    if (connection.receiver && connection.receiver.readyState === WebSocket.OPEN) {
      connection.receiver.send(data);
    }
  }

  private sendConnectionRestoredNotification(connection: Connection): void {
    const data = JSON.stringify({
      type: 'connection_restored',
    });

    if (connection.sender && connection.sender.readyState === WebSocket.OPEN) {
      connection.sender.send(data);
    }
    if (connection.receiver && connection.receiver.readyState === WebSocket.OPEN) {
      connection.receiver.send(data);
    }
  }
}
