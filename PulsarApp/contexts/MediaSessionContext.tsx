import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { usePatternComposer } from 'react-native-pulsar';

import type {
  AudioHapticsBroadcast,
  AnimationHapticsBroadcast,
} from '@/src/connections/serverMessages';
import {
  downloadClip,
  extForContentType,
  getResource,
  listResources,
  purgeConnection,
  removeResource as removeResourceFromLibrary,
  upsertResource,
  type MediaKind,
  type ResourceRecord,
} from '@/src/connections/mediaLibrary';

/**
 * The device-side player for media-backed haptics (audio, and — phase 2 — Lottie) received
 * from a Studio connection.
 *
 * It owns its OWN pattern composer (separate from the connection's confirmation buzzes),
 * downloads the clip, plays the haptics in sync with the media, and tracks a playback
 * clock manually — the SDK exposes no progress/`onComplete`, so elapsed time against the
 * known duration is the only signal. Cached clips live per-connection (see mediaLibrary),
 * so a resource can be replayed from the phone even when Studio isn't pushing.
 */

type SessionStatus = 'downloading' | 'ready' | 'playing' | 'stopped' | 'error';

export interface MediaSession {
  connectionId: string;
  resourceId: string;
  kind: MediaKind;
  name: string;
  durationMs: number;
  status: SessionStatus;
  /** `file://` uri of the downloaded clip, once ready. */
  localUri?: string;
  error?: string;
}

interface MediaSessionContextValue {
  /** The active player session (download/playback), or null when idle. */
  session: MediaSession | null;
  /** Download fraction 0..1 while `status === 'downloading'`. */
  downloadProgress: number;
  /** Playback position in ms (drives the scrubber). */
  positionMs: number;
  /** Which connection's library sheet is open, or null. */
  openConnectionId: string | null;
  /** Cached resources for `openConnectionId`. */
  library: ResourceRecord[];

  // Called by the connection message handlers on an incoming push.
  startAudioHaptics: (connectionId: string, message: AudioHapticsBroadcast) => void;
  startAnimationHaptics: (connectionId: string, message: AnimationHapticsBroadcast) => void;

  /** Open a connection's library sheet. */
  openConnection: (connectionId: string) => void;
  /** Collapse the expanded library back to the mini-player (playback continues). */
  collapse: () => void;
  /** Hide the sheet and stop playback. */
  closeSheet: () => void;
  /** Play a cached resource from the library. */
  playResource: (connectionId: string, resourceId: string) => void;
  /** Replay the current resource from the top (media + haptics). */
  repeat: () => void;
  /** Stop playback (keeps the sheet open). */
  stop: () => void;
  /** Delete a cached resource (file + record). */
  removeResource: (connectionId: string, resourceId: string) => void;
  /** Purge a removed connection's cache and close the sheet if it was showing it. */
  handleConnectionRemoved: (connectionId: string) => void;
}

const MediaSessionContext = createContext<MediaSessionContextValue | undefined>(undefined);

export function MediaSessionProvider({ children }: { children: ReactNode }) {
  const composer = usePatternComposer(undefined);
  const composerRef = useRef(composer);
  composerRef.current = composer;

  const [session, setSession] = useState<MediaSession | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [positionMs, setPositionMs] = useState(0);
  const [openConnectionId, setOpenConnectionId] = useState<string | null>(null);
  const [library, setLibrary] = useState<ResourceRecord[]>([]);

  const openRef = useRef<string | null>(null);
  openRef.current = openConnectionId;
  const sessionRef = useRef<MediaSession | null>(null);
  sessionRef.current = session;
  const currentRecordRef = useRef<ResourceRecord | null>(null);
  // The active rAF handle for the playback clock. Held in a ref so a newer play() can
  // cancel an older loop before it publishes a stale position.
  const rafRef = useRef<number | null>(null);

  const stopClock = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  // Drive the scrubber off wall-clock elapsed vs the known duration — the SDK gives no
  // position, so this is the authority for "where are we" and "when did it end".
  const startClock = useCallback(
    (durationMs: number) => {
      stopClock();
      const start = Date.now();
      const tick = () => {
        const elapsed = Date.now() - start;
        if (elapsed >= durationMs) {
          setPositionMs(durationMs);
          rafRef.current = null;
          setSession((s) => (s ? { ...s, status: 'stopped' } : s));
          return;
        }
        setPositionMs(elapsed);
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    },
    [stopClock],
  );

  const refreshLibrary = useCallback(async (connectionId: string) => {
    const list = await listResources(connectionId);
    if (openRef.current === connectionId) setLibrary(list);
  }, []);

  // Parse + play one cached record, and start the shared clock. Audio rides on
  // `pattern.sound`; an animation plays the pattern alone (its visual is driven off the
  // same clock in the sheet).
  const playRecord = useCallback(
    (connectionId: string, record: ResourceRecord) => {
      currentRecordRef.current = record;
      try {
        const pattern =
          record.kind === 'audio'
            ? {
                ...record.pattern,
                sound: {
                  uri: record.localUri,
                  volume: record.volume ?? 1,
                  offset: record.offset ?? 0,
                  // The SDK plays only [start, start+duration] of the downloaded file, so a
                  // trimmed design honors the trim without a re-download.
                  start: record.soundStartMs ?? 0,
                  duration: record.soundDurationMs ?? 0,
                },
              }
            : record.pattern;
        composerRef.current.parse(pattern);
        composerRef.current.play();
      } catch {
        // Haptics may fail on an unsupported device; the media/clock still run.
      }
      setSession({
        connectionId,
        resourceId: record.resourceId,
        kind: record.kind,
        name: record.name,
        durationMs: record.durationMs,
        status: 'playing',
        localUri: record.localUri,
      });
      setPositionMs(0);
      startClock(record.durationMs);
    },
    [startClock],
  );

  const startMedia = useCallback(
    async (
      connectionId: string,
      message: AudioHapticsBroadcast | AnimationHapticsBroadcast,
      kind: MediaKind,
    ) => {
      const media = kind === 'audio'
        ? (message as AudioHapticsBroadcast).audio
        : (message as AnimationHapticsBroadcast).animation;
      const { resourceId, name, version, durationMs, pattern } = message;

      stopClock();
      // A push shows the compact mini-player; it doesn't force the full library open —
      // the user expands it by tapping the connection (or the bar).
      setDownloadProgress(0);
      setPositionMs(0);
      setSession({ connectionId, resourceId, kind, name, durationMs, status: 'downloading' });

      try {
        const ext = extForContentType(media.contentType);
        // downloadClip skips the network when the clip file already exists — so an
        // unchanged resend (same clipId) plays straight from disk.
        const localUri = await downloadClip(
          connectionId,
          media.clipId,
          ext,
          media.downloadUrl,
          setDownloadProgress,
        );

        const audioWindow = (message as AudioHapticsBroadcast).window;
        const record: ResourceRecord = {
          resourceId,
          name,
          kind,
          version,
          clipId: media.clipId,
          localUri,
          contentType: media.contentType,
          sizeBytes: media.size,
          durationMs,
          pattern,
          volume: (message as AudioHapticsBroadcast).volume,
          offset: (message as AudioHapticsBroadcast).offsetMs,
          soundStartMs: audioWindow?.startMs,
          soundDurationMs: audioWindow?.durationMs,
          receivedAt: Date.now(),
        };
        await upsertResource(connectionId, record);
        void refreshLibrary(connectionId);

        // The user may have dismissed/replaced this session while the download ran.
        if (sessionRef.current?.resourceId !== resourceId) return;
        playRecord(connectionId, record);
      } catch (error) {
        setSession((s) =>
          s && s.resourceId === resourceId
            ? { ...s, status: 'error', error: error instanceof Error ? error.message : 'Could not load media' }
            : s,
        );
      }
    },
    [playRecord, refreshLibrary, stopClock],
  );

  const startAudioHaptics = useCallback(
    (connectionId: string, message: AudioHapticsBroadcast) => {
      void startMedia(connectionId, message, 'audio');
    },
    [startMedia],
  );

  const startAnimationHaptics = useCallback(
    (connectionId: string, message: AnimationHapticsBroadcast) => {
      void startMedia(connectionId, message, 'animation');
    },
    [startMedia],
  );

  const openConnection = useCallback(
    (connectionId: string) => {
      setOpenConnectionId(connectionId);
      void refreshLibrary(connectionId);
    },
    [refreshLibrary],
  );

  const stop = useCallback(() => {
    stopClock();
    try {
      composerRef.current.stop();
    } catch {
      // no-op
    }
    setSession((s) => (s ? { ...s, status: 'stopped' } : s));
    setPositionMs(0);
  }, [stopClock]);

  const collapse = useCallback(() => {
    setOpenConnectionId(null);
    setLibrary([]);
  }, []);

  const closeSheet = useCallback(() => {
    stop();
    setSession(null);
    setOpenConnectionId(null);
    setLibrary([]);
  }, [stop]);

  const playResource = useCallback(
    async (connectionId: string, resourceId: string) => {
      const record = await getResource(connectionId, resourceId);
      if (!record) return;
      setOpenConnectionId(connectionId);
      playRecord(connectionId, record);
    },
    [playRecord],
  );

  const repeat = useCallback(() => {
    const record = currentRecordRef.current;
    const active = sessionRef.current;
    if (record && active) playRecord(active.connectionId, record);
  }, [playRecord]);

  const removeResource = useCallback(
    (connectionId: string, resourceId: string) => {
      if (sessionRef.current?.resourceId === resourceId) {
        stop();
        setSession(null);
      }
      void removeResourceFromLibrary(connectionId, resourceId).then(() =>
        refreshLibrary(connectionId),
      );
    },
    [refreshLibrary, stop],
  );

  const handleConnectionRemoved = useCallback(
    (connectionId: string) => {
      if (openRef.current === connectionId) {
        stop();
        setSession(null);
        setOpenConnectionId(null);
        setLibrary([]);
      }
      void purgeConnection(connectionId);
    },
    [stop],
  );

  useEffect(() => () => stopClock(), [stopClock]);

  return (
    <MediaSessionContext.Provider
      value={{
        session,
        downloadProgress,
        positionMs,
        openConnectionId,
        library,
        startAudioHaptics,
        startAnimationHaptics,
        openConnection,
        collapse,
        closeSheet,
        playResource,
        repeat,
        stop,
        removeResource,
        handleConnectionRemoved,
      }}
    >
      {children}
    </MediaSessionContext.Provider>
  );
}

export function useMediaSession() {
  const context = useContext(MediaSessionContext);
  if (context === undefined) {
    throw new Error('useMediaSession must be used within a MediaSessionProvider');
  }
  return context;
}
