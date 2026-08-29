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

/** Plays media-backed haptics from Studio on its own composer, off its own clock. */

type EnvelopePoint = { time: number; value: number };
type Sound = NonNullable<Pattern['sound']>;

const PLAYS_TO_END_OF_FILE = 0;

function interpolate(points: EnvelopePoint[], atMs: number): number {
  if (points.length === 0) return 0;
  if (atMs <= points[0].time) return points[0].value;
  const last = points[points.length - 1];
  if (atMs >= last.time) return last.value;
  const nextIndex = points.findIndex((point) => point.time > atMs);
  const before = points[nextIndex - 1];
  const after = points[nextIndex];
  const span = after.time - before.time;
  if (span <= 0) return after.value;
  return before.value + ((after.value - before.value) * (atMs - before.time)) / span;
}

function envelopeStartingAt(points: EnvelopePoint[], fromMs: number): EnvelopePoint[] {
  const remaining = points
    .filter((point) => point.time > fromMs)
    .map((point) => ({ time: point.time - fromMs, value: point.value }));
  if (remaining.length === 0) return [];
  return [{ time: 0, value: interpolate(points, fromMs) }, ...remaining];
}

function soundStartingAt(sound: Sound, fromMs: number): Sound {
  const trimmedWindow = sound.duration;
  return {
    ...sound,
    start: (sound.start ?? 0) + fromMs,
    duration: trimmedWindow ? Math.max(0, trimmedWindow - fromMs) : PLAYS_TO_END_OF_FILE,
  };
}

/** An animation plays the pattern alone; its visual runs off the same clock. */
function patternFor(record: ResourceRecord): Pattern {
  if (record.kind !== 'audio') return record.pattern;
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

/** The composer can only play from zero, so seeking replays a re-anchored pattern. */
function patternStartingAt(pattern: Pattern, fromMs: number): Pattern {
  if (fromMs <= 0) return pattern;
  return {
    discretePattern: pattern.discretePattern
      .filter((point) => point.time >= fromMs)
      .map((point) => ({ ...point, time: point.time - fromMs })),
    continuousPattern: {
      amplitude: envelopeStartingAt(pattern.continuousPattern.amplitude, fromMs),
      frequency: envelopeStartingAt(pattern.continuousPattern.frequency, fromMs),
    },
    ...(pattern.sound ? { sound: soundStartingAt(pattern.sound, fromMs) } : {}),
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
  /** `file://` uri of the downloaded clip, once ready. */
  localUri?: string;
  error?: string;
}

interface MediaSessionContextValue {
  session: MediaSession | null;
  /** 0..1 while `status === 'downloading'`. */
  downloadProgress: number;
  positionMs: number;
  openConnectionId: string | null;
  library: ResourceRecord[];

  startAudioHaptics: (connectionId: string, message: AudioHapticsBroadcast) => void;
  startAnimationHaptics: (connectionId: string, message: AnimationHapticsBroadcast) => void;

  openLibrary: (connectionId: string) => void;
  /** Takes the id so a screen leaving after a swap cannot clear its successor's library. */
  closeLibrary: (connectionId: string) => void;
  dismissPlayer: () => void;
  playResource: (connectionId: string, resourceId: string) => void;
  playFromPlayhead: () => void;
  seek: (positionMs: number) => void;
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
    (connectionId: string, record: ResourceRecord, fromMs = 0) => {
      currentRecordRef.current = record;
      try {
        composerRef.current.stop();
        composerRef.current.parse(patternStartingAt(patternFor(record), fromMs));
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
        localUri: record.localUri,
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
      setSession({ connectionId, resourceId, kind, name, durationMs, status: 'downloading' });
      showLibraryScreen(connectionId);

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

  const stop = useCallback(() => {
    stopClock();
    try {
      composerRef.current.stop();
    } catch {
      // no-op
    }
    setSession((s) => (s ? { ...s, status: 'stopped' } : s));
  }, [stopClock]);

  const closeLibrary = useCallback((connectionId: string) => {
    const stillOwnsTheLibrary = openRef.current === connectionId;
    if (!stillOwnsTheLibrary) return;
    setOpenConnectionId(null);
    setLibrary([]);
  }, []);

  const dismissPlayer = useCallback(() => {
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

  const playFromPlayhead = useCallback(() => {
    const record = currentRecordRef.current;
    const active = sessionRef.current;
    if (!record || !active) return;
    const hasRunToTheEnd = positionRef.current >= record.durationMs;
    playRecord(active.connectionId, record, hasRunToTheEnd ? 0 : positionRef.current);
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
        playRecord(active.connectionId, record, target);
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
        openLibrary,
        closeLibrary,
        dismissPlayer,
        playResource,
        playFromPlayhead,
        seek,
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
