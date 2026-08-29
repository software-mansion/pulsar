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

/**
 * Seeking, given an SDK with no seek.
 *
 * `PatternComposer` exposes only parse/play/stop — there is no way to move the playhead of
 * something already playing. So a seek re-anchors the pattern itself: drop everything before
 * `fromMs`, shift the rest back to a new zero, and move the audio's trim window forward by
 * the same amount. Parsing and playing that is indistinguishable from having seeked.
 *
 * All pattern times are milliseconds from pattern start, the same unit as `sound.start` and
 * the record's `durationMs`.
 */

/** The envelope's value at `atMs`, linearly interpolated between the surrounding points. */
function valueAt(points: { time: number; value: number }[], atMs: number): number {
  if (points.length === 0) return 0;
  if (atMs <= points[0].time) return points[0].value;
  const last = points[points.length - 1];
  if (atMs >= last.time) return last.value;
  const next = points.findIndex((p) => p.time > atMs);
  const before = points[next - 1];
  const after = points[next];
  const span = after.time - before.time;
  if (span <= 0) return after.value;
  return before.value + ((after.value - before.value) * (atMs - before.time)) / span;
}

/**
 * Re-anchor one envelope at `fromMs`. The interpolated value at the seek point is prepended
 * as the new time-zero, so a seek into the middle of a ramp resumes mid-ramp instead of
 * restarting the envelope from whatever the next authored point happens to be.
 */
function sliceEnvelope(points: { time: number; value: number }[], fromMs: number) {
  const after = points
    .filter((p) => p.time > fromMs)
    .map((p) => ({ time: p.time - fromMs, value: p.value }));
  if (after.length === 0) return [];
  return [{ time: 0, value: valueAt(points, fromMs) }, ...after];
}

/** Re-anchor a whole pattern (haptics + audio window) so playback starts at `fromMs`. */
function sliceFrom(pattern: Pattern, fromMs: number): Pattern {
  if (fromMs <= 0) return pattern;
  return {
    discretePattern: pattern.discretePattern
      .filter((p) => p.time >= fromMs)
      .map((p) => ({ ...p, time: p.time - fromMs })),
    continuousPattern: {
      amplitude: sliceEnvelope(pattern.continuousPattern.amplitude, fromMs),
      frequency: sliceEnvelope(pattern.continuousPattern.frequency, fromMs),
    },
    ...(pattern.sound
      ? {
          sound: {
            ...pattern.sound,
            start: (pattern.sound.start ?? 0) + fromMs,
            // `duration: 0` means "to the end of the file" — keep that open-ended, and
            // shorten a real trim window by however much we skipped.
            duration: pattern.sound.duration
              ? Math.max(0, pattern.sound.duration - fromMs)
              : 0,
          },
        }
      : {}),
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
  /** The active player session (download/playback), or null when idle. */
  session: MediaSession | null;
  /** Download fraction 0..1 while `status === 'downloading'`. */
  downloadProgress: number;
  /** Playback position in ms (drives the scrubber). */
  positionMs: number;
  /** Which connection's library screen is open, or null. */
  openConnectionId: string | null;
  /** Cached resources for `openConnectionId`. */
  library: ResourceRecord[];

  // Called by the connection message handlers on an incoming push.
  startAudioHaptics: (connectionId: string, message: AudioHapticsBroadcast) => void;
  startAnimationHaptics: (connectionId: string, message: AnimationHapticsBroadcast) => void;

  /** Load a connection's cached library (the `/mediaLibraryModal` screen calls this on mount). */
  openLibrary: (connectionId: string) => void;
  /**
   * Drop the loaded library when that screen goes away; playback continues. Takes the
   * connection the leaving screen was showing: an incoming push can swap the screen to a
   * different connection, and the departing one must not clear its successor's state.
   */
  closeLibrary: (connectionId: string) => void;
  /** Hide the mini-player and stop playback. */
  dismissPlayer: () => void;
  /** Play a cached resource from the library. */
  playResource: (connectionId: string, resourceId: string) => void;
  /**
   * Play the current resource from wherever the playhead sits — from the top once it has
   * run to the end, so the button still reads as "play again" after a finished clip.
   */
  play: () => void;
  /** Move the playhead, restarting playback there when something is playing. */
  seek: (positionMs: number) => void;
  /** Stop playback, leaving the playhead where it stopped. */
  stop: () => void;
  /** Delete a cached resource (file + record). */
  removeResource: (connectionId: string, resourceId: string) => void;
  /** Purge a removed connection's cache and clear the player if it was showing it. */
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
  // The playhead, read by play()/seek() without making them depend on a value the clock
  // rewrites every frame.
  const positionRef = useRef(0);
  positionRef.current = positionMs;
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
    (durationMs: number, fromMs = 0) => {
      stopClock();
      // Back-date the origin so elapsed time reads from the seek point, not from zero.
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

  /**
   * Put the player on screen for an incoming push. Without this the arrival is announced
   * only by the mini-player, and the user has to find and tap it to reach the controls.
   */
  const showLibraryScreen = useCallback((connectionId: string) => {
    if (openRef.current === connectionId) return; // already the screen in front
    const target = { pathname: '/mediaLibraryModal' as const, params: { connectionId } };
    // Swap rather than stack when a different connection's library is already open.
    if (openRef.current) router.replace(target);
    else router.push(target);
  }, []);

  // Parse + play one cached record, and start the shared clock. Audio rides on
  // `pattern.sound`; an animation plays the pattern alone (its visual is driven off the
  // same clock on the library screen).
  const playRecord = useCallback(
    (connectionId: string, record: ResourceRecord, fromMs = 0) => {
      currentRecordRef.current = record;
      try {
        // Whatever is playing must end before the next parse, or a seek (and a play from
        // the library while something else runs) would layer two patterns and two sounds.
        composerRef.current.stop();
        const base =
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
        composerRef.current.parse(sliceFrom(base, fromMs));
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
      // Bring the player up with the download already running, so the progress and the
      // controls are where the user is looking.
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
    // The playhead stays put — it is what the scrubber shows and what play() resumes from.
  }, [stopClock]);

  const closeLibrary = useCallback((connectionId: string) => {
    // A push may have already swapped the screen to another connection; only the screen
    // that still owns the state may tear it down.
    if (openRef.current !== connectionId) return;
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

  const play = useCallback(() => {
    const record = currentRecordRef.current;
    const active = sessionRef.current;
    if (!record || !active) return;
    // A playhead parked at the end means the clip finished; start it over rather than
    // playing zero milliseconds of it.
    const from = positionRef.current >= record.durationMs ? 0 : positionRef.current;
    playRecord(active.connectionId, record, from);
  }, [playRecord]);

  const seek = useCallback(
    (toMs: number) => {
      const record = currentRecordRef.current;
      const active = sessionRef.current;
      if (!record || !active) return;
      const clamped = Math.max(0, Math.min(toMs, record.durationMs));
      // Whether playback is live is the clock's business, not the session status's.
      // `status` is React state read back through a ref, so a seek arriving before the
      // render that follows play() sees a stale 'stopped' and silently kills the clock it
      // should have re-anchored. The rAF handle is written synchronously and can't lie.
      if (rafRef.current != null) {
        // Re-anchor and play on: the audio and haptics restart from the new point.
        playRecord(active.connectionId, record, clamped);
      } else {
        // Nothing is running — just park the playhead for the next play().
        setPositionMs(clamped);
        positionRef.current = clamped;
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
        play,
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
