import WebSocket from 'ws';

export interface ExtendedWebSocket extends WebSocket {
  id?: string;
  type?: 'sender' | 'receiver';
  metadata?: Record<string, any>;
  isAlive?: boolean;
}
