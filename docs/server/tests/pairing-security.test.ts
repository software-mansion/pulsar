import { describe, it, expect, beforeAll, afterEach } from '@jest/globals';
import WebSocket from 'ws';
import type { Server } from 'http';

// app.ts -> routes -> figma-projects -> config reads DATABASE_URL at import time.
// The pg pool is lazy (it never connects unless a query runs, and these tests
// never hit the DB), so a dummy URL is enough to load the module.
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgres://test:test@localhost:5432/test';

// Deferred require so the env var above is set before config.ts evaluates.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { createApp } = require('../src/app') as typeof import('../src/app');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const request = require('supertest') as typeof import('supertest');

interface RunningServer {
  server: Server;
  app: import('express').Express;
  wsUrl: string;
  close: () => Promise<void>;
}

function startServer(rateLimiter?: Record<string, unknown>): Promise<RunningServer> {
  return new Promise((resolve) => {
    const { app, server } = createApp({ rateLimiter });
    server.listen(0, () => {
      const address = server.address();
      const port = typeof address === 'object' && address ? address.port : 0;
      resolve({
        server,
        app,
        wsUrl: `ws://localhost:${port}`,
        close: () =>
          new Promise<void>((res) => {
            server.close(() => res());
          }),
      });
    });
  });
}

// Resolve when the socket is closed by the server: { code, reason }.
function awaitClose(ws: WebSocket): Promise<{ code: number; reason: string }> {
  return new Promise((resolve) => {
    ws.on('close', (code, reason) => resolve({ code, reason: reason.toString() }));
  });
}

// Resolve once the socket is open (a successful, still-pending claim).
function awaitOpen(ws: WebSocket): Promise<void> {
  return new Promise((resolve, reject) => {
    ws.on('open', () => resolve());
    ws.on('error', reject);
  });
}

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

describe('Pairing brute-force mitigation', () => {
  let running: RunningServer;
  const sockets: WebSocket[] = [];

  function connect(query: string): WebSocket {
    const ws = new WebSocket(`${running.wsUrl}/?${query}`);
    sockets.push(ws);
    return ws;
  }

  afterEach(async () => {
    sockets.splice(0).forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    });
    if (running) await running.close();
  });

  describe('invalid codes', () => {
    beforeAll(() => {});

    it('closes a receiver that presents an unknown code', async () => {
      running = await startServer({ sweepIntervalMs: 0 });
      const ws = connect('type=receiver&action=new_connection&code=9999');
      const { code, reason } = await awaitClose(ws);
      expect(code).toBe(1008);
      expect(reason).toMatch(/Invalid code/i);
    });
  });

  describe('one-shot slot semantics', () => {
    it('rejects a second receiver that targets an already-claimed code', async () => {
      running = await startServer({ sweepIntervalMs: 0 });

      // Register a pending channel and grab its code.
      const res = await request(running.app).get('/create-channel');
      expect(res.body.success).toBe(true);
      const code: string = res.body.code;

      // First receiver claims the receiver slot (stays pending: no sender yet).
      const receiver1 = connect(`type=receiver&action=new_connection&code=${code}`);
      await awaitOpen(receiver1);
      await delay(50);
      expect(receiver1.readyState).toBe(WebSocket.OPEN);

      // Second receiver with the same code must be turned away, not allowed to
      // hijack the pending pairing.
      const receiver2 = connect(`type=receiver&action=new_connection&code=${code}`);
      const { code: closeCode, reason } = await awaitClose(receiver2);
      expect(closeCode).toBe(1008);
      expect(reason).toMatch(/already in use/i);
    });
  });

  describe('per-IP rate limiting', () => {
    it('locks out the source after repeated invalid attempts', async () => {
      // Small cap so the test trips it quickly; lockout long enough to observe.
      running = await startServer({
        maxAttemptsPerIp: 3,
        ipLockoutMs: 60_000,
        sweepIntervalMs: 0,
      });

      // Three invalid attempts (each a distinct wrong code) exhaust the budget.
      for (let i = 0; i < 3; i++) {
        const ws = connect(`type=receiver&action=new_connection&code=${1000 + i}`);
        const { reason } = await awaitClose(ws);
        expect(reason).toMatch(/Invalid code/i);
      }

      // The next attempt is rejected by the limiter before reaching pairing.
      const blocked = connect('type=receiver&action=new_connection&code=2222');
      const { code, reason } = await awaitClose(blocked);
      expect(code).toBe(1008);
      expect(reason).toMatch(/Too many pairing attempts/i);
    });
  });
});
