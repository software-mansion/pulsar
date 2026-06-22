import { useMemo, useState } from 'react';
import { PatternComposer } from 'pulsar-haptics';
import { Button } from '../landing/Button/Button';
import styles from './SegmentSignal.module.scss';

type SegType = 'continuous' | 'pulse' | 'line';

const DURATION: Record<SegType, number> = {
  continuous: 320,
  pulse: 600,
  line: 800,
};

// Fixed time window the continuous block is drawn against, so its width reflects the
// chosen duration as you drag the slider.
const CONTINUOUS_WINDOW = 1000;

// One shared composer — `parse()` is pure and deterministic (static timing profile),
// so this also produces identical output during SSR and on the client.
const composer = new PatternComposer();

interface State {
  intensity: number;
  frequency: number;
  fromIntensity: number;
  toIntensity: number;
  fromFrequency: number;
  toFrequency: number;
  continuousDuration: number;
}

function buildSegment(type: SegType, s: State) {
  if (type === 'continuous') {
    return { type, timestamp: 0, duration: s.continuousDuration };
  }
  if (type === 'pulse') {
    return {
      type,
      timestamp: 0,
      duration: DURATION.pulse,
      intensity: s.intensity,
      frequency: s.frequency,
    };
  }
  return {
    type,
    timestamp: 0,
    duration: DURATION.line,
    intensity: [
      { time: 0, value: s.fromIntensity },
      { time: DURATION.line, value: s.toIntensity },
    ],
    frequency: [
      { time: 0, value: s.fromFrequency },
      { time: DURATION.line, value: s.toFrequency },
    ],
  };
}

/** Turn the alternating [on, off, on, …] timeline into absolute on/off intervals. */
function toIntervals(timeline: number[]) {
  const intervals: { start: number; end: number; on: boolean }[] = [];
  let cursor = 0;
  for (let i = 0; i < timeline.length; i++) {
    const ms = timeline[i] ?? 0;
    if (ms > 0) intervals.push({ start: cursor, end: cursor + ms, on: i % 2 === 0 });
    cursor += ms;
  }
  return { intervals, total: cursor };
}

function SignalChart({
  timeline,
  durationMs,
  windowMs,
}: {
  timeline: number[];
  durationMs: number;
  windowMs?: number;
}) {
  const { intervals, total } = toIntervals(timeline);
  const span = Math.max(windowMs ?? Math.max(total, durationMs), 1);

  const W = 620;
  const H = 110;
  const padX = 10;
  const onY = 16;
  const offY = 78;
  const baseline = 84;
  const plotW = W - padX * 2;
  const x = (t: number) => padX + (t / span) * plotW;

  // Step line through the on/off levels (vertical steps at every boundary).
  const points: string[] = [`${x(0)},${offY}`];
  for (const iv of intervals) {
    const y = iv.on ? onY : offY;
    points.push(`${x(iv.start)},${y}`, `${x(iv.end)},${y}`);
  }
  const lastEnd = intervals.length ? intervals[intervals.length - 1].end : 0;
  points.push(`${x(lastEnd)},${offY}`, `${x(span)},${offY}`);

  const onBlocks = intervals.filter((iv) => iv.on);

  return (
    <svg className={styles.chart} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label="Vibration signal">
      {/* level guides */}
      <line x1={padX} y1={onY} x2={W - padX} y2={onY} className={styles.guide} />
      <line x1={padX} y1={offY} x2={W - padX} y2={offY} className={styles.guide} />
      <text x={padX} y={onY - 4} className={styles.level}>on</text>
      <text x={padX} y={offY + 12} className={styles.level}>off</text>

      {/* filled on-shots */}
      {onBlocks.map((iv, i) => (
        <rect
          key={i}
          x={x(iv.start)}
          y={onY}
          width={Math.max(1, x(iv.end) - x(iv.start))}
          height={offY - onY}
          className={styles.shot}
        />
      ))}

      {/* signal outline */}
      <polyline points={points.join(' ')} className={styles.signal} />

      {/* time axis */}
      <line x1={padX} y1={baseline} x2={W - padX} y2={baseline} className={styles.axis} />
      <text x={padX} y={H - 6} className={styles.tick}>0 ms</text>
      <text x={W - padX} y={H - 6} className={`${styles.tick} ${styles.tickEnd}`}>{Math.round(span)} ms</text>
    </svg>
  );
}

function Slider({
  label,
  hint,
  value,
  onChange,
  min = 0,
  max = 1,
  step = 0.01,
  format = (v) => v.toFixed(2),
}: {
  label: string;
  hint: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  format?: (v: number) => string;
}) {
  return (
    <label className={styles.slider}>
      <span className={styles.sliderLabel}>
        <code>{label}</code>
        <span className={styles.sliderValue}>{format(value)}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <span className={styles.sliderHint}>{hint}</span>
    </label>
  );
}

const EXPLANATION: Record<SegType, string> = {
  continuous:
    'Vibrates without interruption for the whole duration — the most solid, sustained feedback. There is nothing to modulate, so continuous has no intensity or frequency.',
  pulse:
    'A square wave of repeated shots. intensity sets how long each shot stays on (wider blocks feel stronger); frequency sets how tightly shots are packed (shorter pauses feel higher-pitched and buzzier).',
  line:
    'Like pulse, but intensity and frequency follow control points, so the signal evolves over the segment. Ramp intensity to make the shots grow or shrink, and frequency to make them pack tighter or spread apart, as it plays.',
};

function codeFor(type: SegType, s: State) {
  if (type === 'continuous') {
    return `{
  type: 'continuous',
  timestamp: 0,
  duration: ${s.continuousDuration},
}`;
  }
  if (type === 'pulse') {
    return `{
  type: 'pulse',
  timestamp: 0,
  duration: ${DURATION.pulse},
  intensity: ${s.intensity.toFixed(2)},
  frequency: ${s.frequency.toFixed(2)},
}`;
  }
  return `{
  type: 'line',
  timestamp: 0,
  duration: ${DURATION.line},
  intensity: [
    { time: 0, value: ${s.fromIntensity.toFixed(2)} },
    { time: ${DURATION.line}, value: ${s.toIntensity.toFixed(2)} },
  ],
  frequency: [
    { time: 0, value: ${s.fromFrequency.toFixed(2)} },
    { time: ${DURATION.line}, value: ${s.toFrequency.toFixed(2)} },
  ],
}`;
}

export function SegmentSignal() {
  const [type, setType] = useState<SegType>('pulse');
  const [state, setState] = useState<State>({
    intensity: 0.6,
    frequency: 0.5,
    fromIntensity: 0.15,
    toIntensity: 1,
    fromFrequency: 0.5,
    toFrequency: 0.5,
    continuousDuration: DURATION.continuous,
  });
  const set = (patch: Partial<State>) => setState((prev) => ({ ...prev, ...patch }));

  const segment = useMemo(() => buildSegment(type, state), [type, state]);
  const timeline = useMemo(() => composer.parse([segment as never]), [segment]);

  const play = async () => {
    try {
      const { Preset } = await import('pulsar-haptics');
      new Preset('Segment preview', [segment as never]).play();
    } catch {
      /* haptics are optional */
    }
  };

  return (
    <div className={`not-content ${styles.widget}`}>
      <div className={styles.tabs}>
        {(['continuous', 'pulse', 'line'] as SegType[]).map((t) => (
          <button
            key={t}
            type="button"
            className={`${styles.tab} ${type === t ? styles.active : ''}`}
            onClick={() => setType(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <SignalChart
        timeline={timeline}
        durationMs={segment.duration}
        windowMs={type === 'continuous' ? CONTINUOUS_WINDOW : undefined}
      />

      <div className={styles.controls}>
        <div className={styles.sliders}>
          {type === 'pulse' && (
            <>
              <Slider label="intensity" hint="shot length" value={state.intensity} onChange={(v) => set({ intensity: v })} />
              <Slider label="frequency" hint="pause spacing" value={state.frequency} onChange={(v) => set({ frequency: v })} />
            </>
          )}
          {type === 'line' && (
            <>
              <Slider label="intensity → start" hint="shot length at 0 ms" value={state.fromIntensity} onChange={(v) => set({ fromIntensity: v })} />
              <Slider label="intensity → end" hint={`shot length at ${DURATION.line} ms`} value={state.toIntensity} onChange={(v) => set({ toIntensity: v })} />
              <Slider label="frequency → start" hint="pause spacing at 0 ms" value={state.fromFrequency} onChange={(v) => set({ fromFrequency: v })} />
              <Slider label="frequency → end" hint={`pause spacing at ${DURATION.line} ms`} value={state.toFrequency} onChange={(v) => set({ toFrequency: v })} />
            </>
          )}
          {type === 'continuous' && (
            <Slider
              label="duration"
              hint="how long it vibrates"
              value={state.continuousDuration}
              onChange={(v) => set({ continuousDuration: v })}
              min={80}
              max={CONTINUOUS_WINDOW}
              step={20}
              format={(v) => `${v} ms`}
            />
          )}
        </div>

        <Button label="Play" onClick={play} className={styles.play} />
      </div>

      <p className={styles.explain}>{EXPLANATION[type]}</p>

      <pre className={styles.code}>{codeFor(type, state)}</pre>
    </div>
  );
}
