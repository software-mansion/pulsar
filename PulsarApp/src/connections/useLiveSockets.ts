import { useCallback, useEffect, useMemo, useRef } from 'react';

import { SOCKET_SERVER_URL } from '@/constants/Connection';

import { localDeviceName } from './deviceName';
import type { ConnectionStatus } from './types';

const PING_INTERVAL_MS = 25_000;
const CONNECT_TIMEOUT_MS = 15_000;

export type OpenKind = 'new' | 'reuse';

// One live socket + its timers per connection id, kept out of React state so
// socket churn doesn't trigger re-renders.
interface LiveSocket {
  socket: WebSocket;
  ping: ReturnType<typeof setInterval> | null;
  timeout: ReturnType<typeof setTimeout> | null;
}

interface Callbacks {
  onStatus: (id: string, status: ConnectionStatus) => void;
  onMessage: (id: string, raw: string) => void;
  onFailed: (id: string, kind: OpenKind) => void;
}

function clearTimers(entry: LiveSocket) {
  if (entry.ping) clearInterval(entry.ping);
  if (entry.timeout) clearTimeout(entry.timeout);
}

export function useLiveSockets({ onStatus, onMessage, onFailed }: Callbacks) {
  const live = useRef<Map<string, LiveSocket>>(new Map());

  // Read callbacks through a ref so a re-created callback never forces
  // `openSocket` to change identity (and with it every effect that depends on it).
  const cbRef = useRef<Callbacks>({ onStatus, onMessage, onFailed });
  cbRef.current = { onStatus, onMessage, onFailed };

  const teardown = useCallback((id: string) => {
    const entry = live.current.get(id);
    if (!entry) return;
    clearTimers(entry);
    entry.socket.onopen = null;
    entry.socket.onmessage = null;
    entry.socket.onerror = null;
    entry.socket.onclose = null;
    try {
      entry.socket.close(1000);
    } catch {
      // already closing/closed
    }
    live.current.delete(id);
  }, []);

  const open = useCallback(
    (id: string, kind: OpenKind, value: string) => {
      teardown(id);
      const query =
        kind === 'new'
          ? `type=receiver&action=new_connection&code=${encodeURIComponent(value)}`
          : `type=receiver&action=reuse_connection&token=${encodeURIComponent(value)}`;
      // Advertise this phone's model so the producer can label it. It MUST go on both
      // paths: the relay reads identity off the socket at notification time, so a
      // reconnect that omitted it would silently drop the name on every restore.
      const identity = `&name=${encodeURIComponent(localDeviceName())}`;
      const socket = new WebSocket(`${SOCKET_SERVER_URL}?${query}${identity}`);
      const entry: LiveSocket = { socket, ping: null, timeout: null };
      live.current.set(id, entry);
      cbRef.current.onStatus(id, 'connecting');

      // Ignore handlers from a socket that has already been replaced.
      const isCurrent = () => live.current.get(id)?.socket === socket;

      entry.timeout = setTimeout(() => {
        if (!isCurrent()) return;
        socket.close();
        cbRef.current.onStatus(id, 'error');
      }, CONNECT_TIMEOUT_MS);

      socket.onopen = () => {
        if (entry.timeout) {
          clearTimeout(entry.timeout);
          entry.timeout = null;
        }
        cbRef.current.onStatus(id, 'waiting');
        entry.ping = setInterval(() => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: 'ping' }));
          }
        }, PING_INTERVAL_MS);
      };

      socket.onmessage = (event) => {
        if (typeof event.data === 'string') cbRef.current.onMessage(id, event.data);
      };

      socket.onerror = () => {
        if (!isCurrent()) return;
        cbRef.current.onStatus(id, 'error');
        cbRef.current.onFailed(id, kind);
      };

      socket.onclose = (e) => {
        if (!isCurrent()) return;
        clearTimers(entry);
        live.current.delete(id);
        // Clean close (e.g. backgrounded) → offline and reconnectable; an
        // unclean close means the attempt failed.
        cbRef.current.onStatus(id, e.code === 1000 ? 'offline' : 'error');
      };
    },
    [teardown],
  );

  const isOpen = useCallback((id: string) => {
    const entry = live.current.get(id);
    return (
      !!entry &&
      (entry.socket.readyState === WebSocket.OPEN ||
        entry.socket.readyState === WebSocket.CONNECTING)
    );
  }, []);

  const sockets = live;
  useEffect(
    () => () => {
      for (const [, entry] of sockets.current) {
        clearTimers(entry);
        entry.socket.onclose = null;
        try {
          entry.socket.close();
        } catch {
          // already closing/closed
        }
      }
      sockets.current.clear();
    },
    [sockets],
  );

  return useMemo(() => ({ open, teardown, isOpen }), [open, teardown, isOpen]);
}
