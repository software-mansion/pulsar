import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import type { HapticPattern } from 'pulsar-haptics';
import { DownloadIcon, PlayIcon, RecordIcon, StopIcon } from '../components/Icons';
import { playCue, playPattern, realtimeComposer, stopPattern, toTimeline } from '../haptics';

const MAX_RECORDING_MS = 10_000;
/** Pointer travel, in px, before a press stops being a tap and becomes a drag. */
const DRAG_THRESHOLD = 6;

type PadEvent =
  | { kind: 'tap'; time: number; intensity: number; frequency: number }
  | { kind: 'pan'; time: number; intensity: number; frequency: number };

type Point = { x: number; y: number };

export function PlaygroundScreen() {
  const [recording, setRecording] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [pattern, setPattern] = useState<HapticPattern | null>(null);
  const [duration, setDuration] = useState(0);
  const [clock, setClock] = useState(0);
  const [indicator, setIndicator] = useState<Point | null>(null);
  const [values, setValues] = useState<{ intensity: number; frequency: number } | null>(null);

  const padRef = useRef<HTMLDivElement>(null);
  const eventsRef = useRef<PadEvent[]>([]);
  const startedAtRef = useRef(0);
  const dragOriginRef = useRef<Point | null>(null);
  const draggingRef = useRef(false);

  useEffect(() => {
    return () => {
      realtimeComposer.stop();
    };
  }, []);

  // One ticking clock serves both the recording timer and the playback timer.
  useEffect(() => {
    if (!recording && !playing) return;
    const startedAt = performance.now();
    const id = window.setInterval(() => setClock(performance.now() - startedAt), 100);
    return () => window.clearInterval(id);
  }, [recording, playing]);

  // Recording is capped so a forgotten session cannot grow without bound.
  useEffect(() => {
    if (!recording) return;
    const id = window.setTimeout(() => stopRecording(), MAX_RECORDING_MS);
    return () => window.clearTimeout(id);
  }, [recording]);

  function normalise(event: ReactPointerEvent<HTMLDivElement>) {
    const rect = padRef.current!.getBoundingClientRect();
    const x = Math.min(Math.max(event.clientX - rect.left, 0), rect.width);
    const y = Math.min(Math.max(event.clientY - rect.top, 0), rect.height);
    return {
      point: { x, y },
      // Horizontal is frequency, vertical is intensity with a 0.2 floor — the
      // same mapping the mobile playground uses, so patterns feel alike.
      frequency: rect.width > 0 ? x / rect.width : 0,
      intensity: 0.2 + 0.8 * (1 - (rect.height > 0 ? y / rect.height : 0)),
    };
  }

  function record(event: PadEvent) {
    if (!recording) return;
    eventsRef.current.push(event);
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    const { point, intensity, frequency } = normalise(event);
    dragOriginRef.current = point;
    draggingRef.current = false;
    setIndicator(point);
    setValues({ intensity, frequency });

    playCue([{ type: 'pulse', timestamp: 0, duration: 60, intensity, frequency }]);
    record({ kind: 'tap', time: elapsed(), intensity, frequency });
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (dragOriginRef.current === null) return;
    const { point, intensity, frequency } = normalise(event);
    setIndicator(point);
    setValues({ intensity, frequency });

    if (!draggingRef.current) {
      const origin = dragOriginRef.current;
      if (Math.hypot(point.x - origin.x, point.y - origin.y) < DRAG_THRESHOLD) return;
      draggingRef.current = true;
    }

    realtimeComposer.set(intensity, frequency);
    record({ kind: 'pan', time: elapsed(), intensity, frequency });
  }

  function handlePointerUp() {
    realtimeComposer.stop();
    dragOriginRef.current = null;
    draggingRef.current = false;
    setIndicator(null);
    setValues(null);
  }

  function elapsed() {
    return performance.now() - startedAtRef.current;
  }

  function startRecording() {
    stopPattern();
    eventsRef.current = [];
    startedAtRef.current = performance.now();
    setPattern(null);
    setDuration(0);
    setClock(0);
    setRecording(true);
  }

  function stopRecording() {
    setRecording(false);
    const total = Math.min(elapsed(), MAX_RECORDING_MS);
    const built = buildPattern(eventsRef.current);
    setDuration(total);
    setPattern(built.length > 0 ? built : null);
  }

  function togglePlayback() {
    if (playing || pattern === null) {
      stopPattern();
      setPlaying(false);
      return;
    }
    playPattern('Playground recording', pattern);
    setPlaying(true);
    setClock(0);
    window.setTimeout(() => setPlaying(false), duration);
  }

  function download() {
    if (pattern === null) return;
    const blob = new Blob(
      [JSON.stringify({ name: 'Playground recording', duration, pattern }, null, 2)],
      {
        type: 'application/json',
      },
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'pulsar-playground-pattern.json';
    link.click();
    URL.revokeObjectURL(url);
  }

  const timerLabel = playing ? 'Playing' : recording ? 'Recording' : 'Duration';
  const timerValue = recording
    ? `${(clock / 1000).toFixed(1)}s`
    : playing
      ? `${(clock / 1000).toFixed(1)}s / ${(duration / 1000).toFixed(1)}s`
      : `${(duration / 1000).toFixed(1)}s`;

  return (
    <div className="screen screen--flush">
      <div className="topbar" style={{ justifyContent: 'space-between' }}>
        <h1 className="title" style={{ margin: 0 }}>
          Playground
        </h1>
      </div>
      <p className="hint">
        Tap the pad for an impulse, drag for a continuous effect. Left to right sets frequency,
        bottom to top sets intensity.
      </p>

      <div
        className="pad"
        ref={padRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {indicator === null && !recording && (
          <p className="pad__hint">Tap to trigger a haptic impulse</p>
        )}
        {indicator && <span className="pad__dot" style={{ left: indicator.x, top: indicator.y }} />}
        {values && (
          <div className="pad__readout">
            <span>intensity {values.intensity.toFixed(2)}</span>
            <span>frequency {values.frequency.toFixed(2)}</span>
          </div>
        )}
      </div>

      {(recording || duration > 0) && (
        <p className="muted" style={{ textAlign: 'center', margin: 0 }}>
          {timerLabel} · {timerValue}
        </p>
      )}

      {pattern && <PatternTimeline pattern={pattern} />}

      <div className="playground-controls" style={{ marginTop: 12 }}>
        <button
          type="button"
          className="btn btn--square"
          disabled={pattern === null}
          aria-label={playing ? 'Stop playback' : 'Play recording'}
          onClick={togglePlayback}
        >
          {playing ? <StopIcon /> : <PlayIcon />}
        </button>
        <button
          type="button"
          className="btn btn--grow btn--record"
          onClick={() => (recording ? stopRecording() : startRecording())}
        >
          {recording ? 'Stop' : 'Record'}
          {recording ? <StopIcon size={18} /> : <RecordIcon size={18} />}
        </button>
        <button
          type="button"
          className="btn btn--square"
          disabled={pattern === null}
          aria-label="Download pattern as JSON"
          onClick={download}
        >
          <DownloadIcon />
        </button>
      </div>
    </div>
  );
}

/** Draws the compiled on/off vibration timeline the recording produced. */
function PatternTimeline({ pattern }: { pattern: HapticPattern }) {
  const timeline = toTimeline(pattern);
  const total = timeline.reduce((sum, value) => sum + value, 0);
  if (total === 0) return null;

  let cursor = 0;
  const blocks = timeline.map((value, index) => {
    const start = cursor;
    cursor += value;
    return { start, value, on: index % 2 === 0 };
  });

  return (
    <svg
      className="timeline"
      viewBox="0 0 100 10"
      preserveAspectRatio="none"
      aria-label="Recorded pattern"
    >
      {blocks
        .filter((block) => block.on && block.value > 0)
        .map((block) => (
          <rect
            key={block.start}
            x={(block.start / total) * 100}
            y={1}
            width={Math.max((block.value / total) * 100, 0.4)}
            height={8}
            fill="#001a72"
          />
        ))}
    </svg>
  );
}

/**
 * Turns recorded pad events into a web haptic pattern: taps become short
 * `pulse` segments, and each burst of drag samples becomes one `line` segment
 * whose intensity/frequency envelopes follow the finger.
 */
function buildPattern(events: PadEvent[]): HapticPattern {
  const pattern: HapticPattern = [];
  let group: Extract<PadEvent, { kind: 'pan' }>[] = [];

  const flush = () => {
    if (group.length === 0) return;
    const start = group[0].time;
    const end = group[group.length - 1].time;
    const duration = Math.max(end - start, 40);
    const points = group.map((event) => ({
      time: Math.min(event.time - start, duration),
      intensity: event.intensity,
      frequency: event.frequency,
    }));
    if (points.length === 1) {
      points.push({
        time: duration,
        intensity: points[0].intensity,
        frequency: points[0].frequency,
      });
    }
    pattern.push({
      type: 'line',
      timestamp: start,
      duration,
      intensity: points.map(({ time, intensity }) => ({ time, value: intensity })),
      frequency: points.map(({ time, frequency }) => ({ time, value: frequency })),
    });
    group = [];
  };

  events.forEach((event) => {
    if (event.kind === 'tap') {
      flush();
      pattern.push({
        type: 'pulse',
        timestamp: event.time,
        duration: 60,
        intensity: event.intensity,
        frequency: event.frequency,
      });
      return;
    }
    // A gap longer than 100ms means the finger lifted and came back down.
    if (group.length > 0 && event.time - group[group.length - 1].time > 100) flush();
    group.push(event);
  });

  flush();
  return pattern.sort((left, right) => left.timestamp - right.timestamp);
}
