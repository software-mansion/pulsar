import { describe, it, expect, afterEach } from '@jest/globals';
import WebSocket from 'ws';
import request from 'supertest';
import type { Server } from 'http';
import { createApp } from '../src/app';

// Integration tests for the WebSocket pairing protocol end-to-end (real ws
// client against a real listening server). Complements pairing-security.test.ts
// (invalid-code / one-shot / rate-limit) and rate-limiter.test.ts (unit).

interface Running {
  server: Server;
  app: import('express').Express;
  wsUrl: string;
  close: () => Promise<void>;
}

function startServer(): Promise<Running> {
  return new Promise((resolve) => {
    const { app, server } = createApp({ rateLimiter: { sweepIntervalMs: 0 } });
    server.listen(0, () => {
      const addr = server.address();
      const port = typeof addr === 'object' && addr ? addr.port : 0;
      resolve({
        server,
        app,
        wsUrl: `ws://localhost:${port}`,
        close: () => new Promise<void>((res) => server.close(() => res())),
      });
    });
  });
}

// Buffers every frame from a socket and lets a test await the first one
// matching a predicate (checking already-received frames first).
class Frames {
  private msgs: any[] = [];
  private waiters: { pred: (m: any) => boolean; resolve: (m: any) => void }[] = [];
  constructor(ws: WebSocket) {
    ws.on('message', (data) => {
      let m: any;
      try {
        m = JSON.parse(data.toString());
      } catch {
        return;
      }
      this.msgs.push(m);
      this.waiters = this.waiters.filter((w) => {
        if (w.pred(m)) {
          w.resolve(m);
          return false;
        }
        return true;
      });
    });
  }
  await(pred: (m: any) => boolean): Promise<any> {
    const found = this.msgs.find(pred);
    if (found) return Promise.resolve(found);
    return new Promise((resolve) => this.waiters.push({ pred, resolve }));
  }
  has(type: string): boolean {
    return this.msgs.some((m) => m.type === type);
  }
}

const type = (t: string) => (m: any) => m.type === t;
const awaitClose = (ws: WebSocket) =>
  new Promise<{ code: number; reason: string }>((resolve) =>
    ws.on('close', (code, reason) => resolve({ code, reason: reason.toString() })),
  );

describe('WebSocket pairing protocol', () => {
  let running: Running;
  const sockets: WebSocket[] = [];

  function connect(query: string): WebSocket {
    const ws = new WebSocket(`${running.wsUrl}/?${query}`);
    // Fire-and-forget sender sockets are never awaited. Closing one in afterEach
    // while its handshake is still in flight makes ws emit an 'error'
    // ("WebSocket was closed before the connection was established"); with no
    // listener Node rethrows it as an unhandled error and fails whichever test
    // just ran (nondeterministically, by handshake timing). A no-op handler
    // keeps these expected teardown aborts benign. Tests that need to observe
    // connection errors attach their own 'error' listener on top of this.
    ws.on('error', () => {});
    sockets.push(ws);
    return ws;
  }

  afterEach(async () => {
    sockets.splice(0).forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) ws.close();
    });
    if (running) await running.close();
  });

  describe('handshake validation', () => {
    it('closes a socket with no type param (1008)', async () => {
      running = await startServer();
      const { code } = await awaitClose(connect('action=new_connection&code=1234'));
      expect(code).toBe(1008);
    });

    it('closes a sender with new_connection but no code (1008)', async () => {
      running = await startServer();
      const { code, reason } = await awaitClose(connect('type=sender&action=new_connection'));
      expect(code).toBe(1008);
      expect(reason).toMatch(/code/i);
    });

    it('closes a sender with reuse_connection but no token (1008)', async () => {
      running = await startServer();
      const { code, reason } = await awaitClose(connect('type=sender&action=reuse_connection'));
      expect(code).toBe(1008);
      expect(reason).toMatch(/token/i);
    });
  });

  describe('liveness', () => {
    it('replies to an app-level ping with a pong', async () => {
      running = await startServer();
      // A receiver on a valid pending code stays open (no sender yet).
      const code = (await request(running.app).get('/create-channel')).body.code;
      const ws = connect(`type=receiver&action=new_connection&code=${code}`);
      const frames = new Frames(ws);
      await new Promise<void>((res, rej) => {
        ws.on('open', () => res());
        ws.on('error', rej);
      });
      ws.send(JSON.stringify({ type: 'ping' }));
      expect(await frames.await(type('pong'))).toEqual({ type: 'pong' });
    });
  });

  describe('full pairing', () => {
    async function pair() {
      const code = (await request(running.app).get('/create-channel')).body.code as string;
      const sender = connect(`type=sender&action=new_connection&code=${code}`);
      const receiver = connect(`type=receiver&action=new_connection&code=${code}`);
      const sf = new Frames(sender);
      const rf = new Frames(receiver);
      const st = await sf.await(type('connection_established'));
      const rt = await rf.await(type('connection_established'));
      return { code, sender, receiver, sf, rf, token: st.token as string, senderToken: st.token, receiverToken: rt.token };
    }

    it('issues one identical token to both peers once paired', async () => {
      running = await startServer();
      const { senderToken, receiverToken } = await pair();
      expect(typeof senderToken).toBe('string');
      expect(senderToken).toBe(receiverToken);
    });

    it('notifies the surviving peer with peer_disconnected when one closes', async () => {
      running = await startServer();
      const { sender, rf } = await pair();
      sender.close();
      expect(await rf.await(type('peer_disconnected'))).toEqual({ type: 'peer_disconnected' });
    });

    it('delivers an HTTP /broadcast to the paired receiver only', async () => {
      running = await startServer();
      const { rf, sf, token } = await pair();
      const res = await request(running.app)
        .post('/broadcast')
        .send({ message: JSON.stringify({ hello: 'phone' }), token });
      expect(res.body.message).toBe('ok');

      const got = await rf.await(type('broadcast'));
      expect(got.message).toEqual({ hello: 'phone' });
      // The sender must NOT receive the broadcast.
      expect(sf.has('broadcast')).toBe(false);
    });
  });

  describe('reconnection (reuse_connection)', () => {
    it('re-establishes the strong channel and emits connection_restored to both', async () => {
      running = await startServer();
      const code = (await request(running.app).get('/create-channel')).body.code as string;
      const s1 = connect(`type=sender&action=new_connection&code=${code}`);
      const r1 = connect(`type=receiver&action=new_connection&code=${code}`);
      // Attach both listeners up front — connection_established fires on both at
      // once, so a listener attached after awaiting the first would miss the other.
      const s1f = new Frames(s1);
      const r1f = new Frames(r1);
      const token = (await s1f.await(type('connection_established'))).token as string;
      await r1f.await(type('connection_established'));

      // Reconnect both sides with the issued token.
      const s2 = connect(`type=sender&action=reuse_connection&token=${token}`);
      const r2 = connect(`type=receiver&action=reuse_connection&token=${token}`);
      const s2f = new Frames(s2);
      const r2f = new Frames(r2);
      expect((await s2f.await(type('connection_restored'))).type).toBe('connection_restored');
      expect((await r2f.await(type('connection_restored'))).type).toBe('connection_restored');
    });
  });

  describe('producer identity relay', () => {
    it('relays sender name + previewToken to the receiver on connection_established', async () => {
      running = await startServer();
      const code = (await request(running.app).get('/create-channel')).body.code as string;
      connect(
        `type=sender&action=new_connection&code=${code}` +
          `&name=${encodeURIComponent('Figma Plugin macOS')}&previewToken=pub-xyz`,
      );
      const receiver = connect(`type=receiver&action=new_connection&code=${code}`);
      const rf = new Frames(receiver);
      const est = await rf.await(type('connection_established'));
      expect(est.name).toBe('Figma Plugin macOS');
      expect(est.previewToken).toBe('pub-xyz');
    });

    it('omits identity fields when the producer advertises none (old client)', async () => {
      running = await startServer();
      const code = (await request(running.app).get('/create-channel')).body.code as string;
      connect(`type=sender&action=new_connection&code=${code}`);
      const receiver = connect(`type=receiver&action=new_connection&code=${code}`);
      const rf = new Frames(receiver);
      const est = await rf.await(type('connection_established'));
      expect(Object.keys(est).sort()).toEqual(['token', 'type']);
    });
  });

  // The phone holds two pairings at once (two receiver sockets, two tokens) and
  // each producer's broadcast lands only on its own socket — the end-to-end
  // proof behind the multi-connection phone client.
  describe('multiple producers, one phone', () => {
    it('delivers each producer broadcast to its own receiver socket', async () => {
      running = await startServer();
      const codeA = (await request(running.app).get('/create-channel')).body.code as string;
      connect(`type=sender&action=new_connection&code=${codeA}&name=PluginA`);
      const phoneA = connect(`type=receiver&action=new_connection&code=${codeA}`);
      const phoneAf = new Frames(phoneA);
      const tokenA = (await phoneAf.await(type('connection_established'))).token as string;

      const codeB = (await request(running.app).get('/create-channel')).body.code as string;
      connect(`type=sender&action=new_connection&code=${codeB}&name=BrowserB`);
      const phoneB = connect(`type=receiver&action=new_connection&code=${codeB}`);
      const phoneBf = new Frames(phoneB);
      const tokenB = (await phoneBf.await(type('connection_established'))).token as string;

      expect(tokenA).not.toBe(tokenB);

      await request(running.app).post('/broadcast').send({ message: 'fromA', token: tokenA });
      await request(running.app).post('/broadcast').send({ message: 'fromB', token: tokenB });

      expect((await phoneAf.await(type('broadcast'))).message).toBe('fromA');
      expect((await phoneBf.await(type('broadcast'))).message).toBe('fromB');
    });
  });
});
