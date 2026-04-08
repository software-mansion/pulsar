import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import WebSocket from 'ws';
import { createApp } from '../src/app';
import { Server } from 'http';

describe('WebSocket', () => {
  let server: Server;
  let port: number;
  let wsUrl: string;

  beforeAll((done) => {
    const setup = createApp();
    server = setup.server;

    server.listen(0, () => {
      const address = server.address();
      if (address && typeof address === 'object') {
        port = address.port;
        wsUrl = `ws://localhost:${port}`;
      }
      done();
    });
  });

  afterAll((done) => {
    // Give a small delay to allow pending disconnections to complete
    setTimeout(() => {
      server.close(done);
    }, 100);
  });

  describe('Connection', () => {
    it('should connect and receive welcome message', (done) => {
      const ws = new WebSocket(wsUrl);
      let timeout: NodeJS.Timeout;

      ws.on('open', () => {
        expect(ws.readyState).toBe(WebSocket.OPEN);
      });

      ws.on('message', (data: WebSocket.RawData) => {
        clearTimeout(timeout);
        const message = JSON.parse(data.toString());
        expect(message).toHaveProperty('type', 'connection');
        expect(message).toHaveProperty('message', 'Connected to WebSocket server');
        expect(message).toHaveProperty('clientId');
        expect(message).toHaveProperty('timestamp');
        ws.close();
        done();
      });

      ws.on('error', (error) => {
        clearTimeout(timeout);
        done(error);
      });

      timeout = setTimeout(() => {
        done(new Error('Connection timeout'));
      }, 5000);
    });

    it('should handle multiple concurrent connections', (done) => {
      const clients: WebSocket[] = [];
      let connectedCount = 0;
      const totalClients = 3;
      let timeout: NodeJS.Timeout;

      for (let i = 0; i < totalClients; i++) {
        const ws = new WebSocket(wsUrl);
        clients.push(ws);

        ws.on('message', () => {
          connectedCount++;
          if (connectedCount === totalClients) {
            clearTimeout(timeout);
            // Close all clients and wait for disconnection
            clients.forEach((client) => client.close());
            // Give time for all disconnections to process
            setTimeout(done, 100);
          }
        });

        ws.on('error', (error) => {
          clearTimeout(timeout);
          done(error);
        });
      }

      timeout = setTimeout(() => {
        done(new Error('Connections timeout'));
      }, 5000);
    });
  });

  describe('Messaging', () => {
    it('should echo message back to sender', (done) => {
      const ws = new WebSocket(wsUrl);
      let messageCount = 0;
      let timeout: NodeJS.Timeout;

      ws.on('open', () => {
        ws.send(JSON.stringify({ message: 'test echo', data: 'some data' }));
      });

      ws.on('message', (data: WebSocket.RawData) => {
        messageCount++;
        const message = JSON.parse(data.toString());

        // First message is welcome, second is echo
        if (messageCount === 2) {
          clearTimeout(timeout);
          expect(message).toHaveProperty('type', 'echo');
          expect(message.data).toHaveProperty('message', 'test echo');
          ws.close();
          done();
        }
      });

      ws.on('error', (error) => {
        clearTimeout(timeout);
        done(error);
      });

      timeout = setTimeout(() => {
        done(new Error('Echo message timeout'));
      }, 5000);
    });

    it('should broadcast message to other clients', (done) => {
      const ws1 = new WebSocket(wsUrl);
      const ws2 = new WebSocket(wsUrl);

      let ws1Connected = false;
      let ws2Connected = false;
      let timeout: NodeJS.Timeout;

      const cleanup = () => {
        clearTimeout(timeout);
        ws1.close();
        ws2.close();
        done();
      };

      ws1.on('message', (data: WebSocket.RawData) => {
        const message = JSON.parse(data.toString());
        if (message.type === 'connection') {
          ws1Connected = true;
          if (ws1Connected && ws2Connected) {
            // Send broadcast from ws1
            ws1.send(JSON.stringify({ message: 'broadcast test', broadcast: true }));
          }
        }
      });

      ws2.on('message', (data: WebSocket.RawData) => {
        const message = JSON.parse(data.toString());

        if (message.type === 'connection') {
          ws2Connected = true;
          if (ws1Connected && ws2Connected) {
            // Send broadcast from ws1
            ws1.send(JSON.stringify({ message: 'broadcast test', broadcast: true }));
          }
        } else if (message.type === 'broadcast') {
          expect(message.message).toHaveProperty('message', 'broadcast test');
          cleanup();
        }
      });

      ws1.on('error', (error) => {
        clearTimeout(timeout);
        done(error);
      });

      ws2.on('error', (error) => {
        clearTimeout(timeout);
        done(error);
      });

      timeout = setTimeout(() => {
        done(new Error('Broadcast message timeout'));
      }, 5000);
    });

    it('should handle invalid JSON gracefully', (done) => {
      const ws = new WebSocket(wsUrl);
      let messageCount = 0;
      let timeout: NodeJS.Timeout;

      ws.on('open', () => {
        ws.send('invalid json{');
      });

      ws.on('message', (data: WebSocket.RawData) => {
        messageCount++;
        const message = JSON.parse(data.toString());

        // First message is welcome, second is error
        if (messageCount === 2) {
          clearTimeout(timeout);
          expect(message).toHaveProperty('type', 'error');
          expect(message).toHaveProperty('message', 'Invalid JSON format');
          ws.close();
          done();
        }
      });

      ws.on('error', (error) => {
        clearTimeout(timeout);
        done(error);
      });

      timeout = setTimeout(() => {
        done(new Error('Invalid JSON handling timeout'));
      }, 5000);
    });
  });

  describe('Disconnection', () => {
    it('should handle client disconnection', (done) => {
      const ws = new WebSocket(wsUrl);
      let timeout: NodeJS.Timeout;

      ws.on('open', () => {
        ws.close();
      });

      ws.on('close', () => {
        clearTimeout(timeout);
        expect(ws.readyState).toBe(WebSocket.CLOSED);
        done();
      });

      ws.on('error', (error) => {
        clearTimeout(timeout);
        done(error);
      });

      timeout = setTimeout(() => {
        done(new Error('Disconnection timeout'));
      }, 5000);
    });
  });
});
