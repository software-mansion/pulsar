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
import { Presets, usePatternComposer, type Pattern } from 'react-native-pulsar';

import { handleServerMessage, type ServerMessageHandlers } from '@/src/connections/serverMessages';
import { loadPersistedConnections, persistConnections } from '@/src/connections/storage';
import { useDeepLinkPairing } from '@/src/connections/useDeepLinkPairing';
import { useForegroundReconnect } from '@/src/connections/useForegroundReconnect';
import { useLiveSockets } from '@/src/connections/useLiveSockets';
import { useReceivedNotice } from '@/src/connections/useReceivedNotice';

import type {
  AddByCodeOptions,
  Connection,
  PreviewUpdate,
  ReceivedPattern,
  Track,
} from '@/src/connections/types';

export { connectionDisplayName, connectionType } from '@/src/connections/types';
export type {
  Connection,
  ConnectionStatus,
  PreviewUpdate,
  ProducerType,
  ReceivedPattern,
} from '@/src/connections/types';

interface ConnectionsContextValue {
  connections: Connection[];
  // Pair a new producer from a 4-digit code (manual entry or a scanned QR). A
  // Figma QR also carries the preview token + type up front, so the row is
  // tagged Figma and can reopen the preview without waiting on the server relay.
  addByCode: (code: string, opts?: AddByCodeOptions) => void;
  // Drop a connection: close its socket and forget its token.
  remove: (id: string) => void;
  // Re-open a closed/errored connection from its stored token.
  reconnect: (id: string) => void;
  // Set a user-chosen label for a connection (blank clears it).
  rename: (id: string, name: string) => void;
  // Transient "preset received" banner, auto-cleared shortly after the last hit.
  lastReceived: ReceivedPattern | null;
  // Most recent live haptics-config update relayed by a producer, for an open
  // live preview to apply. Null until the first update arrives.
  lastPreviewUpdate: PreviewUpdate | null;
}

const ConnectionsContext = createContext<ConnectionsContextValue | undefined>(undefined);

export function ConnectionsProvider({ children }: { children: ReactNode }) {
  const posthog = usePostHog();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [lastPreviewUpdate, setLastPreviewUpdate] = useState<PreviewUpdate | null>(null);
  // Gate persistence until the initial load runs, so the first (empty) render
  // doesn't clobber the stored list before it's restored.
  const [didLoad, setDidLoad] = useState(false);

  const { lastReceived, notify } = useReceivedNotice();

  const connectionsRef = useRef<Connection[]>([]);
  connectionsRef.current = connections;
  const idCounter = useRef(0);
  // Monotonic counter so two identical preview updates still re-trigger the
  // preview consumer (e.g. a binding toggled back and forth).
  const previewNonce = useRef(0);

  // The message handler closes over the composer, so read it through a ref that
  // every render keeps current rather than closing over the first one.
  const composer = usePatternComposer(undefined);
  const composerRef = useRef(composer);
  composerRef.current = composer;

  const newId = useCallback(() => `conn-${Date.now().toString(36)}-${idCounter.current++}`, []);

  const patchConnection = useCallback((id: string, patch: Partial<Connection>) => {
    setConnections((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }, []);

  const track = useCallback<Track>(
    (event, properties) => posthog?.capture(event, properties),
    [posthog],
  );

  const messageHandlers: ServerMessageHandlers = {
    patchConnection,
    notify,
    playPreset: (pattern: Pattern) => {
      try {
        composerRef.current.parse(pattern);
        composerRef.current.play();
        return true;
      } catch {
        return false;
      }
    },
    emitPreviewUpdate: (id, update) => {
      // Match on the producer-supplied previewToken, falling back to the one
      // this connection advertised at pairing time.
      const fallback = connectionsRef.current.find((c) => c.id === id)?.previewToken;
      setLastPreviewUpdate({
        ...update,
        previewToken: update.previewToken ?? fallback,
        nonce: ++previewNonce.current,
      });
    },
    track,
  };

  const sockets = useLiveSockets({
    onStatus: (id, status) => patchConnection(id, { status }),
    onMessage: (id, raw) => handleServerMessage(id, raw, messageHandlers),
    onFailed: (id, kind) => track('device_connection_failed', { connection_action: kind }),
  });

  const addByCode = useCallback(
    (code: string, opts?: AddByCodeOptions) => {
      const trimmed = code.trim();
      if (!trimmed) return;
      const conn: Connection = {
        id: newId(),
        token: null,
        name: opts?.name?.trim() || 'Unnamed connection',
        status: 'connecting',
        createdAt: Date.now(),
        // Seed Figma identity from the QR so the row is tagged + openable right
        // away; the server relay confirms (and adds the project name) later.
        ...(opts?.previewToken ? { previewToken: opts.previewToken } : {}),
        ...(opts?.producerType ? { producerType: opts.producerType } : {}),
      };
      setConnections((prev) => [...prev, conn]);
      // Keep the ref authoritative before the re-render lands, so a broadcast
      // that beats it can still resolve this connection (e.g. its previewToken).
      connectionsRef.current = [...connectionsRef.current, conn];
      sockets.open(conn.id, 'new', trimmed);
      track('device_connection_initiated', { connection_action: 'new_connection' });
    },
    [newId, sockets, track],
  );

  const reconnect = useCallback(
    (id: string) => {
      const token = connectionsRef.current.find((c) => c.id === id)?.token;
      if (token) sockets.open(id, 'reuse', token);
    },
    [sockets],
  );

  const remove = useCallback(
    (id: string) => {
      sockets.teardown(id);
      setConnections((prev) => prev.filter((c) => c.id !== id));
      Presets.powerDown();
      track('device_disconnected');
    },
    [sockets, track],
  );

  // Stored as `customName` so a rename survives the producer-relayed name on the
  // next reconnect.
  const rename = useCallback(
    (id: string, name: string) => {
      patchConnection(id, { customName: name.trim() || undefined });
      track('connection_renamed');
    },
    [patchConnection, track],
  );

  useEffect(() => {
    let cancelled = false;
    loadPersistedConnections(newId).then((restored) => {
      if (cancelled) return;
      if (restored.length > 0) {
        setConnections(restored);
        restored.forEach((c) => c.token && sockets.open(c.id, 'reuse', c.token));
      }
      setDidLoad(true);
    });
    return () => {
      cancelled = true;
    };
    // sockets.open/newId are stable; run once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (didLoad) persistConnections(connections);
  }, [connections, didLoad]);

  useForegroundReconnect(
    useCallback(() => {
      for (const c of connectionsRef.current) {
        if (c.token && !sockets.isOpen(c.id)) sockets.open(c.id, 'reuse', c.token);
      }
    }, [sockets]),
  );

  useDeepLinkPairing(addByCode, track);

  return (
    <ConnectionsContext.Provider
      value={{ connections, addByCode, remove, reconnect, rename, lastReceived, lastPreviewUpdate }}
    >
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
