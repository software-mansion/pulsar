import { describe, it, expect, beforeEach } from '@jest/globals';
import { ConnectionManager } from '../src/connection-manager';
import type { ExtendedWebSocket } from '../src/types';

// Minimal fake socket: records sent frames and close calls, no real network.
class FakeWs {
  readyState = 1; // WebSocket.OPEN
  sent: string[] = [];
  closed = false;
  closeCode?: number;
  metadata?: Record<string, any>;
  constructor(public id: string) {}
  send(data: string) {
    this.sent.push(data);
  }
  close(code?: number) {
    this.closed = true;
    this.closeCode = code;
    this.readyState = 3; // CLOSED
  }
}

const asWs = (w: FakeWs) => w as unknown as ExtendedWebSocket;
const frames = (w: FakeWs) => w.sent.map((s) => JSON.parse(s));
const hasType = (w: FakeWs, type: string) => frames(w).some((m) => m.type === type);
const firstOfType = (w: FakeWs, type: string) => frames(w).find((m) => m.type === type);

describe('ConnectionManager', () => {
  let cm: ConnectionManager;

  beforeEach(() => {
    cm = new ConnectionManager();
  });

  describe('generateToken', () => {
    it('returns 100 chars from the alphanumeric alphabet', () => {
      const t = cm.generateToken();
      expect(t).toMatch(/^[A-Za-z0-9]{100}$/);
      expect(cm.generateToken()).not.toBe(t); // CSPRNG → effectively unique
    });
  });

  describe('getParingCode', () => {
    it('returns a 4-digit code', () => {
      expect(cm.getParingCode()).toMatch(/^\d{4}$/);
    });
  });

  describe('new_connection claims', () => {
    it('returns invalid_code for an unknown code', () => {
      expect(cm.createNewSenderConnection(asWs(new FakeWs('s')), '0000')).toBe('invalid_code');
      expect(cm.createNewReceiverConnection(asWs(new FakeWs('r')), '0000')).toBe('invalid_code');
    });

    it('enforces one-shot slot semantics (second claimant is rejected)', () => {
      const code = cm.getParingCode();
      expect(cm.createNewSenderConnection(asWs(new FakeWs('s1')), code)).toBe('claimed');
      expect(cm.createNewSenderConnection(asWs(new FakeWs('s2')), code)).toBe('slot_taken');
    });

    it('promotes to a strong channel and issues one shared token to both peers', () => {
      const code = cm.getParingCode();
      const sender = new FakeWs('s');
      const receiver = new FakeWs('r');
      cm.createNewSenderConnection(asWs(sender), code);
      cm.createNewReceiverConnection(asWs(receiver), code);

      const st = firstOfType(sender, 'connection_established');
      const rt = firstOfType(receiver, 'connection_established');
      expect(st).toBeDefined();
      expect(rt).toBeDefined();
      expect(st.token).toEqual(rt.token);
      expect(typeof st.token).toBe('string');
    });
  });

  // Pair two fresh sockets and return the issued strong-channel token.
  function pair(senderId = 's', receiverId = 'r') {
    const code = cm.getParingCode();
    const sender = new FakeWs(senderId);
    const receiver = new FakeWs(receiverId);
    cm.createNewSenderConnection(asWs(sender), code);
    cm.createNewReceiverConnection(asWs(receiver), code);
    const token = firstOfType(sender, 'connection_established').token as string;
    return { sender, receiver, token };
  }

  describe('broadcastChannel', () => {
    it('delivers to the OPEN receiver and returns ok', () => {
      const { receiver, token } = pair();
      const before = receiver.sent.length;
      expect(cm.broadcastChannel('{"x":1}', token)).toBe('ok');
      const delivered = frames(receiver).slice(before);
      expect(delivered).toContainEqual({ type: 'broadcast', message: { x: 1 } });
    });

    it('passes a non-JSON payload through as a raw string', () => {
      const { receiver, token } = pair();
      cm.broadcastChannel('hello', token);
      expect(frames(receiver)).toContainEqual({ type: 'broadcast', message: 'hello' });
    });

    it('relays a structured live-preview update object intact', () => {
      const { receiver, token } = pair();
      const before = receiver.sent.length;
      const update = {
        kind: 'preview-haptics-diff',
        previewToken: 'pub-123',
        fromRevision: 4,
        toRevision: 5,
        diff: { bindings: { set: { 'a:1': { name: 'breakingWave' } }, del: ['b:2'] } },
      };
      expect(cm.broadcastChannel(JSON.stringify(update), token)).toBe('ok');
      const delivered = frames(receiver).slice(before);
      expect(delivered).toContainEqual({ type: 'broadcast', message: update });
    });

    it('returns an error string for an unknown token', () => {
      expect(cm.broadcastChannel('hi', 'unknown-token')).toBe(
        'Invalid token or no active connection found',
      );
    });
  });

  describe('unregisterSocket', () => {
    it('notifies the surviving peer with peer_disconnected', () => {
      const { sender, receiver } = pair();
      cm.unregisterSocket(sender.id);
      expect(hasType(receiver, 'peer_disconnected')).toBe(true);
    });

    it('does not let a displaced/stale socket tear down the connection that replaced it', () => {
      const { sender: oldSender, receiver, token } = pair();

      // A reconnect reuses the token, displacing the old sender socket.
      const newSender = new FakeWs('s2');
      cm.reuseSenderConnection(asWs(newSender), token);

      // The displaced socket was closed and forgotten.
      expect(oldSender.closed).toBe(true);

      const receiverFramesBefore = receiver.sent.length;
      // The stale socket's close handler fires late — it must be a no-op.
      cm.unregisterSocket(oldSender.id);

      // Receiver was NOT told its peer disconnected...
      const after = frames(receiver).slice(receiverFramesBefore);
      expect(after.some((m) => m.type === 'peer_disconnected')).toBe(false);
      // ...and the channel still works (new sender holds the slot).
      expect(cm.broadcastChannel('{"y":2}', token)).toBe('ok');
    });
  });

  describe('reuse_connection', () => {
    it('re-establishes a strong channel and notifies both peers (connection_restored)', () => {
      const { token } = pair();
      const newSender = new FakeWs('s2');
      const newReceiver = new FakeWs('r2');
      cm.reuseSenderConnection(asWs(newSender), token);
      cm.reuseReceiverConnection(asWs(newReceiver), token);
      expect(hasType(newSender, 'connection_restored')).toBe(true);
      expect(hasType(newReceiver, 'connection_restored')).toBe(true);
    });
  });

  // Additive producer identity: a sender may advertise a `name`, its
  // `producerType` ('figma' | 'browser'), a Figma `previewToken`, and the Figma
  // `figmaProjectName`; the server relays them to the receiver on (re)establish.
  describe('producer identity relay', () => {
    it('relays the sender name + previewToken to the receiver on establish', () => {
      const code = cm.getParingCode();
      const sender = new FakeWs('s');
      sender.metadata = { name: 'Figma Plugin macOS', previewToken: 'pub-123' };
      const receiver = new FakeWs('r');
      cm.createNewSenderConnection(asWs(sender), code);
      cm.createNewReceiverConnection(asWs(receiver), code);

      const est = firstOfType(receiver, 'connection_established');
      expect(est.name).toBe('Figma Plugin macOS');
      expect(est.previewToken).toBe('pub-123');
      expect(typeof est.token).toBe('string');
    });

    it('relays the Figma producerType + figmaProjectName to the receiver on establish', () => {
      const code = cm.getParingCode();
      const sender = new FakeWs('s');
      sender.metadata = {
        name: 'Figma Plugin macOS',
        previewToken: 'pub-123',
        producerType: 'figma',
        figmaProjectName: 'Checkout Redesign',
      };
      const receiver = new FakeWs('r');
      cm.createNewSenderConnection(asWs(sender), code);
      cm.createNewReceiverConnection(asWs(receiver), code);

      const est = firstOfType(receiver, 'connection_established');
      expect(est.producerType).toBe('figma');
      expect(est.figmaProjectName).toBe('Checkout Redesign');
    });

    it('relays the sender identity again on connection_restored', () => {
      const { token } = pair();
      const newSender = new FakeWs('s2');
      newSender.metadata = { name: 'Google Chrome Windows', producerType: 'browser' };
      const newReceiver = new FakeWs('r2');
      cm.reuseSenderConnection(asWs(newSender), token);
      cm.reuseReceiverConnection(asWs(newReceiver), token);

      const restored = firstOfType(newReceiver, 'connection_restored');
      expect(restored.name).toBe('Google Chrome Windows');
      expect(restored.producerType).toBe('browser');
      // A browser advertises neither a preview token nor a Figma project name.
      expect(restored).not.toHaveProperty('previewToken');
      expect(restored).not.toHaveProperty('figmaProjectName');
    });

    it('omits identity fields entirely for a producer that advertised none (old client)', () => {
      const code = cm.getParingCode();
      const sender = new FakeWs('s'); // no metadata
      const receiver = new FakeWs('r');
      cm.createNewSenderConnection(asWs(sender), code);
      cm.createNewReceiverConnection(asWs(receiver), code);

      const est = firstOfType(receiver, 'connection_established');
      // Byte-for-byte the legacy payload: just type + token.
      expect(Object.keys(est).sort()).toEqual(['token', 'type']);
    });
  });

  // One phone, many producers: each pairing is its own token, so a single
  // receiver-side process holding N tokens gets each producer's broadcasts
  // independently. This is the per-token independence the multi-connection
  // phone client relies on — no shared-state crosstalk between tokens.
  describe('multiple independent connections (N producers : 1 phone)', () => {
    it('routes each producer broadcast only to its own token', () => {
      const a = pair('senderA', 'phoneSockA');
      const b = pair('senderB', 'phoneSockB');
      expect(a.token).not.toBe(b.token);

      const beforeA = a.receiver.sent.length;
      const beforeB = b.receiver.sent.length;
      expect(cm.broadcastChannel('Afterglow', a.token)).toBe('ok');

      expect(frames(a.receiver).slice(beforeA)).toContainEqual({
        type: 'broadcast',
        message: 'Afterglow',
      });
      // The other producer's channel is untouched.
      expect(frames(b.receiver).slice(beforeB)).toHaveLength(0);
    });
  });
});
