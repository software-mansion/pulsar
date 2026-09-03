import { router } from 'expo-router';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { usePatternComposer, type Pattern } from 'react-native-pulsar';

import type {
  AudioHapticsBroadcast,
  AnimationHapticsBroadcast,
  PatternHapticsBroadcast,
} from '@/src/connections/serverMessages';
import {
  clipIsOnDisk,
  clipUri,
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
import {
  PLAYS_TO_END_OF_FILE,
  patternDurationMs,
  patternStartingAt,
} from '@/src/haptics/patternSeek';

/** Plays the haptics a producer pushes on its own composer, off its own clock. */

/** Only audio scores the pattern with a sound; everything else plays it alone. */
function patternFor(record: ResourceRecord, clipMissing: boolean): Pattern {
  if (record.kind !== 'audio' || !record.localUri || clipMissing) return record.pattern;
  return {
    ...record.pattern,
    sound: {
      uri: record.localUri,
      volume: record.volume ?? 1,
      offset: record.offset ?? 0,
      start: record.soundStartMs ?? 0,
      duration: record.soundDurationMs ?? PLAYS_TO_END_OF_FILE,
    },
  };
}

type SessionStatus = 'downloading' | 'ready' | 'playing' | 'stopped' | 'error';

export interface MediaSession {
  connectionId: string;
  resourceId: string;
  kind: MediaKind;
  name: string;
  durationMs: number;
  status: SessionStatus;
  /** The haptics being played — drawn as the waveform for a `pattern` session. */
  pattern: Pattern;
  /** `file://` uri of the downloaded clip, once ready. */
  localUri?: string;
  clipMissing?: boolean;
  error?: string;
}

interface MediaSessionContextValue {
  session: MediaSession | null;
  /** 0..1 while `status === 'downloading'`. */
  downloadProgress: number;
  positionMs: number;
  openConnectionId: string | null;
  library: ResourceRecord[];

  startPatternHaptics: (connectionId: string, message: PatternHapticsBroadcast) => void;
  startAudioHaptics: (connectionId: string, message: AudioHapticsBroadcast) => void;
  startAnimationHaptics: (connectionId: string, message: AnimationHapticsBroadcast) => void;

  openLibrary: (connectionId: string) => void;
  /** Takes the id so a screen leaving after a swap cannot clear its successor's library. */
  closeLibrary: (connectionId: string) => void;
  dismissPlayer: () => void;
  playResource: (connectionId: string, resourceId: string) => void;
  playFromPlayhead: () => void;
  seek: (positionMs: number) => void;
  /** Halts playback where it stands, so `playFromPlayhead` resumes from there. */
  pause: () => void;
  /** Halts playback and rewinds to the start. */
  stop: () => void;
  removeResource: (connectionId: string, resourceId: string) => void;
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
  const clipMissingRef = useRef(false);
  const positionRef = useRef(0);
  positionRef.current = positionMs;
  const rafRef = useRef<number | null>(null);
  const isClockRunning = () => rafRef.current != null;

  const stopClock = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  /** The SDK reports no position, so elapsed wall-clock against the known duration is it. */
  const startClock = useCallback(
    (durationMs: number, fromMs = 0) => {
      stopClock();
      const start = Date.now() - fromMs;
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

  const showLibraryScreen = useCallback((connectionId: string) => {
    const alreadyInFront = openRef.current === connectionId;
    if (alreadyInFront) return;
    const target = { pathname: '/mediaLibraryModal' as const, params: { connectionId } };
    const anotherLibraryIsOpen = openRef.current != null;
    if (anotherLibraryIsOpen) router.replace(target);
    else router.push(target);
  }, []);

  const playRecord = useCallback(
    (connectionId: string, record: ResourceRecord, fromMs = 0, clipMissing = false) => {
      currentRecordRef.current = record;
      clipMissingRef.current = clipMissing;
      try {
        composerRef.current.stop();
        composerRef.current.parse(patternStartingAt(patternFor(record, clipMissing), fromMs));
        composerRef.current.play();
      } catch {
        // An unsupported device still gets the media and the clock.
      }
      setSession({
        connectionId,
        resourceId: record.resourceId,
        kind: record.kind,
        name: record.name,
        durationMs: record.durationMs,
        status: 'playing',
        pattern: record.pattern,
        localUri: clipMissing ? undefined : record.localUri,
        clipMissing,
      });
      setPositionMs(fromMs);
      positionRef.current = fromMs;
      startClock(record.durationMs, fromMs);
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
      setDownloadProgress(0);
      setPositionMs(0);
      setSession({
        connectionId,
        resourceId,
        kind,
        name,
        durationMs,
        status: 'downloading',
        pattern,
      });
      showLibraryScreen(connectionId);

      try {
        const ext = extForContentType(media.contentType);
        // downloadClip skips the network when the clip file already exists — so an
        // unchanged resend (same clipId) plays straight from disk.
        const clipPath = await downloadClip(
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
          clipPath,
          localUri: clipUri(clipPath),
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
    [playRecord, refreshLibrary, showLibraryScreen, stopClock],
  );

  /** Haptics only: nothing to download, so it plays on arrival and is filed after. */
  const startPatternHaptics = useCallback(
    (connectionId: string, message: PatternHapticsBroadcast) => {
      const name = message.name ?? 'Haptic preset';
      const record: ResourceRecord = {
        resourceId: message.resourceId ?? `name:${name}`,
        name,
        kind: 'pattern',
        version: message.version ?? '',
        durationMs: patternDurationMs(message.pattern),
        pattern: message.pattern,
        receivedAt: Date.now(),
      };

      stopClock();
      setDownloadProgress(0);
      showLibraryScreen(connectionId);
      playRecord(connectionId, record);

      void upsertResource(connectionId, record).then(() => refreshLibrary(connectionId));
    },
    [playRecord, refreshLibrary, showLibraryScreen, stopClock],
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

  const openLibrary = useCallback(
    (connectionId: string) => {
      setOpenConnectionId(connectionId);
      void refreshLibrary(connectionId);
    },
    [refreshLibrary],
  );

  const pause = useCallback(() => {
    stopClock();
    try {
      composerRef.current.stop();
    } catch {
      // no-op
    }
    setSession((s) => (s ? { ...s, status: 'stopped' } : s));
  }, [stopClock]);

  const stop = useCallback(() => {
    pause();
    setPositionMs(0);
    positionRef.current = 0;
  }, [pause]);

  const closeLibrary = useCallback((connectionId: string) => {
    const stillOwnsTheLibrary = openRef.current === connectionId;
    if (!stillOwnsTheLibrary) return;
    setOpenConnectionId(null);
    setLibrary([]);
  }, []);

  const dismissPlayer = useCallback(() => {
    pause();
    setSession(null);
    setOpenConnectionId(null);
    setLibrary([]);
  }, [pause]);

  const playResource = useCallback(
    async (connectionId: string, resourceId: string) => {
      const record = await getResource(connectionId, resourceId);
      if (!record) return;
      const clipMissing = record.kind !== 'pattern' && !(await clipIsOnDisk(record));
      setOpenConnectionId(connectionId);
      playRecord(connectionId, record, 0, clipMissing);
    },
    [playRecord],
  );

  const playFromPlayhead = useCallback(() => {
    const record = currentRecordRef.current;
    const active = sessionRef.current;
    if (!record || !active) return;
    const hasRunToTheEnd = positionRef.current >= record.durationMs;
    playRecord(
      active.connectionId,
      record,
      hasRunToTheEnd ? 0 : positionRef.current,
      clipMissingRef.current,
    );
  }, [playRecord]);

  const seek = useCallback(
    (toMs: number) => {
      const record = currentRecordRef.current;
      const active = sessionRef.current;
      if (!record || !active) return;
      const target = Math.max(0, Math.min(toMs, record.durationMs));
      // `session.status` is state read back through a ref, so it still reads 'stopped'
      // for the render after a play; the clock handle is written synchronously.
      if (isClockRunning()) {
        playRecord(active.connectionId, record, target, clipMissingRef.current);
      } else {
        setPositionMs(target);
        positionRef.current = target;
      }
    },
    [playRecord],
  );

  const removeResource = useCallback(
    (connectionId: string, resourceId: string) => {
      if (sessionRef.current?.resourceId === resourceId) {
        pause();
        setSession(null);
      }
      void removeResourceFromLibrary(connectionId, resourceId).then(() =>
        refreshLibrary(connectionId),
      );
    },
    [pause, refreshLibrary],
  );

  const handleConnectionRemoved = useCallback(
    (connectionId: string) => {
      if (openRef.current === connectionId) {
        pause();
        setSession(null);
        setOpenConnectionId(null);
        setLibrary([]);
      }
      void purgeConnection(connectionId);
    },
    [pause],
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
        startPatternHaptics,
        startAudioHaptics,
        startAnimationHaptics,
        openLibrary,
        closeLibrary,
        dismissPlayer,
        playResource,
        playFromPlayhead,
        seek,
        pause,
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
