import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
import { usePostHog } from 'posthog-react-native';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AppState } from 'react-native';
import { Presets } from 'react-native-pulsar';

import { SOCKET_SERVER_URL } from '@/constants/Connection';
import { playPattern } from '@/src/haptics/playPattern';

// Where the list of paired producers is persisted. Replaces the single-token
// `connectionToken` key the pre-multi-connection app used; that legacy key is
// migrated into this list once on first launch (see the load effect).
const STORAGE_KEY = 'connections';
const LEGACY_TOKEN_KEY = 'connectionToken';
const PING_INTERVAL_MS = 25_000;
const CONNECT_TIMEOUT_MS = 15_000;

export type ConnectionStatus =
  | 'connecting' // socket opening, no server ack yet
  | 'waiting' // on the server, producer not present (peer away / not paired yet)
  | 'connected' // paired with the producer — broadcasts will play
  | 'offline' // socket closed cleanly (e.g. backgrounded) — will reconnect
  | 'error'; // connection attempt failed

export interface Connection {
  // Stable local id for the row + persistence; survives socket churn and app
  // restarts (persisted alongside the token).
  id: string;
  // Strong-channel token, known once `connection_established` arrives. Null
  // while a fresh pairing is still in flight.
  token: string | null;
  // Human label shown in the list. Provisional until the server relays the
  // producer's advertised name (e.g. "Figma Plugin macOS").
  name: string;
  status: ConnectionStatus;
  // Figma preview share token relayed by the producer, if any — lets the row
  // offer "Open preview".
  previewToken?: string;
}

interface PersistedConnection {
  id: string;
  token: string;
  name: string;
  previewToken?: string;
}

export interface ReceivedPattern {
  found: boolean;
  name: string;
}

interface ConnectionsContextValue {
  connections: Connection[];
  // Pair a new producer from a 4-digit code (manual entry or a scanned QR).
  addByCode: (code: string, opts?: { name?: string }) => void;
  // Drop a connection: close its socket and forget its token.
  remove: (id: string) => void;
  // Re-open a closed/errored connection from its stored token.
  reconnect: (id: string) => void;
  // Transient "preset received" banner, auto-cleared shortly after the last hit.
  lastReceived: ReceivedPattern | null;
}

const ConnectionsContext = createContext<ConnectionsContextValue | undefined>(undefined);

// One live socket + its timers per connection id, kept out of React state so
// socket churn doesn't trigger re-renders.
interface LiveSocket {
  socket: WebSocket;
  ping: ReturnType<typeof setInterval> | null;
  timeout: ReturnType<typeof setTimeout> | null;
}

export function ConnectionsProvider({ children }: { children: ReactNode }) {
  const posthog = usePostHog();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [lastReceived, setLastReceived] = useState<ReceivedPattern | null>(null);
  // Gate persistence until the initial load runs, so the first (empty) render
  // doesn't clobber the stored list before it's restored.
  const [didLoad, setDidLoad] = useState(false);

  const live = useRef<Map<string, LiveSocket>>(new Map());
  const connectionsRef = useRef<Connection[]>([]);
  const idCounter = useRef(0);
  const appStateRef = useRef(AppState.currentState);
  const notifyTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastUrlRef = useRef<string | null>(null);

  useEffect(() => {
    connectionsRef.current = connections;
  }, [connections]);

  const newId = useCallback(
    () => `conn-${Date.now().toString(36)}-${idCounter.current++}`,
    [],
  );

  const patchConnection = useCallback((id: string, patch: Partial<Connection>) => {
    setConnections((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }, []);

  const notify = useCallback((found: boolean, name: string) => {
    setLastReceived({ found, name });
    if (notifyTimeout.current) clearTimeout(notifyTimeout.current);
    notifyTimeout.current = setTimeout(() => setLastReceived(null), 1200);
  }, []);

  // Close + forget the live socket for an id without letting its handlers patch
  // state (used when replacing a socket or removing a connection).
  const teardownLive = useCallback((id: string) => {
    const entry = live.current.get(id);
    if (!entry) return;
    if (entry.ping) clearInterval(entry.ping);
    if (entry.timeout) clearTimeout(entry.timeout);
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

  // Open a receiver socket for `conn`, either a fresh pairing (`new` + code) or
  // a reconnect (`reuse` + token), and wire up the shared message handling +
  // keepalive. Mirrors the single-connection lifecycle the home screen used to
  // own, but scoped to one row of the list.
  const openSocket = useCallback(
    (conn: Connection, kind: 'new' | 'reuse', value: string) => {
      teardownLive(conn.id);
      const query =
        kind === 'new'
          ? `type=receiver&action=new_connection&code=${encodeURIComponent(value)}`
          : `type=receiver&action=reuse_connection&token=${encodeURIComponent(value)}`;
      const socket = new WebSocket(`${SOCKET_SERVER_URL}?${query}`);
      const entry: LiveSocket = { socket, ping: null, timeout: null };
      live.current.set(conn.id, entry);
      patchConnection(conn.id, { status: 'connecting' });

      entry.timeout = setTimeout(() => {
        if (live.current.get(conn.id)?.socket === socket) {
          socket.close();
          patchConnection(conn.id, { status: 'error' });
        }
      }, CONNECT_TIMEOUT_MS);

      socket.onopen = () => {
        if (entry.timeout) {
          clearTimeout(entry.timeout);
          entry.timeout = null;
        }
        // On the server, but not yet paired with the producer.
        patchConnection(conn.id, { status: 'waiting' });
        entry.ping = setInterval(() => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: 'ping' }));
          }
        }, PING_INTERVAL_MS);
      };

      socket.onmessage = (event) => {
        const payload = typeof event.data === 'string' ? event.data : '';
        let json: { type?: string; token?: string; message?: unknown; name?: string; previewToken?: string };
        try {
          json = JSON.parse(payload);
        } catch {
          return;
        }
        switch (json.type) {
          case 'connection_established':
            if (json.token) {
              patchConnection(conn.id, {
                token: json.token,
                status: 'connected',
                ...(json.name ? { name: json.name } : {}),
                ...(json.previewToken ? { previewToken: json.previewToken } : {}),
              });
              // A short buzz confirms the new pairing to the user.
              Presets.breakingWave();
              posthog?.capture('device_connected', { connection_type: 'new' });
            }
            break;
          case 'connection_restored':
            // Silent (no buzz): this is a background reconnect, not a user action.
            patchConnection(conn.id, {
              status: 'connected',
              ...(json.name ? { name: json.name } : {}),
              ...(json.previewToken ? { previewToken: json.previewToken } : {}),
            });
            posthog?.capture('device_connected', { connection_type: 'restored' });
            break;
          case 'peer_disconnected':
            patchConnection(conn.id, { status: 'waiting' });
            break;
          case 'pong':
            break;
          case 'broadcast':
            // Producers send a preset *name* (a string). Ignore anything else so
            // a malformed/structured payload can never throw here.
            if (typeof json.message === 'string') {
              const found = playPattern(json.message);
              notify(found, json.message);
            }
            break;
        }
      };

      socket.onerror = () => {
        if (live.current.get(conn.id)?.socket !== socket) return;
        patchConnection(conn.id, { status: 'error' });
        posthog?.capture('device_connection_failed', { connection_action: kind });
      };

      socket.onclose = (e) => {
        if (live.current.get(conn.id)?.socket !== socket) return;
        if (entry.ping) clearInterval(entry.ping);
        if (entry.timeout) clearTimeout(entry.timeout);
        live.current.delete(conn.id);
        // Clean close (e.g. backgrounded) → offline and reconnectable; an
        // unclean close means the attempt failed.
        patchConnection(conn.id, { status: e.code === 1000 ? 'offline' : 'error' });
      };
    },
    [teardownLive, patchConnection, notify, posthog],
  );

  const addByCode = useCallback(
    (code: string, opts?: { name?: string }) => {
      const trimmed = code.trim();
      if (!trimmed) return;
      const conn: Connection = {
        id: newId(),
        token: null,
        name: opts?.name?.trim() || 'Unnamed connection',
        status: 'connecting',
      };
      setConnections((prev) => [...prev, conn]);
      openSocket(conn, 'new', trimmed);
      posthog?.capture('device_connection_initiated', { connection_action: 'new_connection' });
    },
    [newId, openSocket, posthog],
  );

  const reconnect = useCallback(
    (id: string) => {
      const conn = connectionsRef.current.find((c) => c.id === id);
      if (!conn?.token) return;
      openSocket(conn, 'reuse', conn.token);
    },
    [openSocket],
  );

  const remove = useCallback(
    (id: string) => {
      teardownLive(id);
      setConnections((prev) => prev.filter((c) => c.id !== id));
      Presets.powerDown();
      posthog?.capture('device_disconnected');
    },
    [teardownLive, posthog],
  );

  // Initial load: restore the persisted list (or migrate the legacy single
  // token) and reconnect each established connection.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      let persisted: PersistedConnection[] = [];
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) persisted = JSON.parse(raw);
      } catch {
        persisted = [];
      }
      if (persisted.length === 0) {
        // One-time migration from the pre-multi-connection single token so an
        // already-paired install keeps working after the update.
        try {
          const legacy = await AsyncStorage.getItem(LEGACY_TOKEN_KEY);
          if (legacy && legacy.length > 0) {
            persisted = [{ id: newId(), token: legacy, name: 'Saved device' }];
          }
        } catch {
          // ignore — nothing to migrate
        }
      }
      if (cancelled) return;
      if (persisted.length > 0) {
        const restored: Connection[] = persisted.map((p) => ({
          id: p.id,
          token: p.token,
          name: p.name,
          previewToken: p.previewToken,
          status: 'connecting',
        }));
        setConnections(restored);
        restored.forEach((c) => c.token && openSocket(c, 'reuse', c.token));
      }
      setDidLoad(true);
    })();
    return () => {
      cancelled = true;
    };
    // openSocket/newId are stable; run once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist the established connections (those with a token) on every change,
  // once the initial load has run.
  useEffect(() => {
    if (!didLoad) return;
    const toPersist: PersistedConnection[] = connections
      .filter((c) => c.token)
      .map((c) => ({
        id: c.id,
        token: c.token as string,
        name: c.name,
        ...(c.previewToken ? { previewToken: c.previewToken } : {}),
      }));
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toPersist)).catch(() => {});
  }, [connections, didLoad]);

  // Reconnect any dropped connection when the app returns to the foreground.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (appStateRef.current.match(/inactive|background/) && next === 'active') {
        for (const c of connectionsRef.current) {
          if (!c.token) continue;
          const entry = live.current.get(c.id);
          const open =
            entry &&
            (entry.socket.readyState === WebSocket.OPEN ||
              entry.socket.readyState === WebSocket.CONNECTING);
          if (!open) openSocket(c, 'reuse', c.token);
        }
      }
      appStateRef.current = next;
    });
    return () => sub.remove();
  }, [openSocket]);

  // Deep links carrying a pairing `code` (`pulsarapp://connect?code=…` or the
  // unified `pulsarapp://figma?token=…&code=…`) add a connection. The `token`
  // for the preview is consumed separately by the Figma route.
  useEffect(() => {
    const handle = (url: string) => {
      if (!url || lastUrlRef.current === url) return;
      lastUrlRef.current = url;
      const parsed = Linking.parse(url);
      const code = parsed.queryParams?.code;
      if (code) {
        const name = parsed.queryParams?.name;
        addByCode(code.toString(), { name: name ? name.toString() : undefined });
        posthog?.capture('deep_link_connection_initiated', { has_code: true });
      }
    };
    const sub = Linking.addEventListener('url', ({ url }) => handle(url));
    Linking.getInitialURL().then((url) => {
      if (url) handle(url);
    });
    return () => sub.remove();
  }, [addByCode, posthog]);

  // Tear everything down on unmount (root provider — rare, but keep it clean).
  useEffect(
    () => () => {
      for (const [, entry] of live.current) {
        if (entry.ping) clearInterval(entry.ping);
        if (entry.timeout) clearTimeout(entry.timeout);
        entry.socket.onclose = null;
        try {
          entry.socket.close();
        } catch {
          // already closing/closed
        }
      }
      live.current.clear();
      if (notifyTimeout.current) clearTimeout(notifyTimeout.current);
    },
    [],
  );

  return (
    <ConnectionsContext.Provider value={{ connections, addByCode, remove, reconnect, lastReceived }}>
      {children}
    </ConnectionsContext.Provider>
  );
}

export function useConnections() {
  const context = useContext(ConnectionsContext);
  if (context === undefined) {
    throw new Error('useConnections must be used within a ConnectionsProvider');
  }
  return context;
}
