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

export class ConnectionManager {
  private weakConnections: Map<string, Connection> = new Map();
  private strongConnections: Map<string, Connection> = new Map();
  private idToSocket: Map<string, SocketData> = new Map();

  public getParingCode(): string {
    let code = Math.floor(1000 + Math.random() * 9000).toString();
    const maxIterations = 100;
    let globalMaxIterations = 1000000;
    let prefix = '';

    while (this.strongConnections.has(code)) {
      let iterations = 0;
      while (this.weakConnections.has(code) && iterations < maxIterations) {
        iterations++;
        globalMaxIterations--;
        if (globalMaxIterations <= 0) {
          return '-1';
        }
        code = prefix + Math.floor(1000 + Math.random() * 9000).toString();
      }
      prefix += Math.floor(Math.random() * 10).toString();
      code = prefix + code;
    }

    this.registerWeakConnection(code);

    return code;
  }

  public generateToken(): string {
    let token = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const tokenLength = 100;

    for (let i = 0; i < tokenLength; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      token += characters.charAt(randomIndex);
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

  public createNewSenderConnection(ws: ExtendedWebSocket, code: string): void {
    const connection = this.weakConnections.get(code);
    if (connection) {
      connection.sender = ws;
      this.idToSocket.set(ws.id, { ws, connectionType: 'weak', mode: 'sender', key: code });
      this.tryPromoteConnection(code);
    }
  }

  public createNewReceiverConnection(ws: ExtendedWebSocket, code: string): void {
    const connection = this.weakConnections.get(code);
    if (connection) {
      connection.receiver = ws;
      this.idToSocket.set(ws.id, { ws, connectionType: 'weak', mode: 'receiver', key: code });
      this.tryPromoteConnection(code);
    } else {
      ws.close(1008, 'Invalid code: no sender connection found for the provided code');
    }
  }

  public reuseSenderConnection(ws: ExtendedWebSocket, token: string): void {
    if (!this.strongConnections.has(token)) {
      this.strongConnections.set(token, { sender: null as any, receiver: null as any });
    }
    const connection = this.strongConnections.get(token);
    console.log(
      'Trying to reuse connection for code:',
      token,
      !!connection.sender,
      !!connection.receiver,
    );
    if (connection) {
      connection.sender = ws;
      this.idToSocket.set(ws.id, { ws, connectionType: 'strong', mode: 'sender', key: token });
      this.tryEstablishStrongConnection(token);
    }
  }
  public reuseReceiverConnection(ws: ExtendedWebSocket, token: string): void {
    if (!this.strongConnections.has(token)) {
      this.strongConnections.set(token, { sender: null as any, receiver: null as any });
    }
    const connection = this.strongConnections.get(token);
    console.log('Trying to reuse connection for code:', !!connection.sender, !!connection.receiver);
    if (connection) {
      connection.receiver = ws;
      this.idToSocket.set(ws.id, { ws, connectionType: 'strong', mode: 'receiver', key: token });
      this.tryEstablishStrongConnection(token);
    }
  }

  public unregisterSocket(wsId: string): void {
    const record = this.idToSocket.get(wsId);
    if (!record) return;

    const { connectionType: connection, mode } = record;
    let toNotify: ExtendedWebSocket | undefined;

    if (connection === 'weak') {
      const conn = this.weakConnections.get(record.key);
      if (conn) {
        if (mode === 'sender') {
          conn.sender = undefined;
          toNotify = conn.receiver;
        } else {
          conn.receiver = undefined;
          toNotify = conn.sender;
        }
        if (!conn.sender && !conn.receiver) {
          this.weakConnections.delete(record.key);
        }
      }
    } else {
      const conn = this.strongConnections.get(record.key);
      if (conn) {
        if (mode === 'sender') {
          conn.sender = undefined;
          toNotify = conn.receiver;
        } else {
          conn.receiver = undefined;
          toNotify = conn.sender;
        }
        if (!conn.sender && !conn.receiver) {
          this.strongConnections.delete(record.key);
        }
      }
    }
    this.idToSocket.delete(wsId);
    console.log(
      'Unregistered socket with id:',
      wsId,
      'Notifying peer:',
      !!toNotify,
      connection,
      mode,
    );
    if (toNotify && toNotify.readyState === WebSocket.OPEN) {
      const data = JSON.stringify({
        type: 'peer_disconnected',
      });
      toNotify.send(data);
    }
  }

  private tryPromoteConnection(code: string): void {
    const connection = this.weakConnections.get(code);
    console.log(
      'Trying to promote connection for code:',
      code,
      !!connection.sender,
      !!connection.receiver,
    );
    if (!connection || !connection.sender || !connection.receiver) {
      return;
    }
    const token = this.generateToken();
    this.strongConnections.set(token, connection);
    this.weakConnections.delete(code);
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

  private tryEstablishStrongConnection(token?: string): void {
    const connection = this.strongConnections.get(token);
    console.log('tryEstablishStrongConnection:', !!connection.sender, !!connection.receiver);
    if (connection && connection.sender && connection.receiver) {
      this.strongConnections.set(token, connection);
      this.weakConnections.delete(token);
      this.sendConnectionRestoredNotification(connection);
    }
  }

  private registerWeakConnection(code: string): void {
    this.weakConnections.set(code, { sender: null as any, receiver: null as any });
    setTimeout(
      () => {
        if (this.weakConnections.has(code)) {
          this.weakConnections.delete(code);
        }
      },
      15 * 60 * 1000,
    ); // 15 minutes
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
    console.log(
      'Sent connection_restored notification',
      !!connection.sender,
      !!connection.receiver,
    );
  }
}
