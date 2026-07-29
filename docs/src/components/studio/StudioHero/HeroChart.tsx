import { useEffect, useRef, useState } from 'react';

// Inline, dynamic version of the Figma hero chart: same grid / area / line /
// marker styling, but the line points are driven by props so it can morph to the
// waveform of whichever emoji preset is playing.

const VIEW_W = 465;
const VIEW_H = 202;
const PAD_X = 14;
const PAD_TOP = 22;
const PAD_BOTTOM = 22;

const PLOT_LEFT = PAD_X;
const PLOT_RIGHT = VIEW_W - PAD_X;
const PLOT_TOP = PAD_TOP;
const PLOT_BOTTOM = VIEW_H - PAD_BOTTOM;

const MORPH_MS = 450;
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

function xAt(i: number, n: number): number {
  return PLOT_LEFT + (i / (n - 1)) * (PLOT_RIGHT - PLOT_LEFT);
}
function yAt(value: number): number {
  return PLOT_BOTTOM - value * (PLOT_BOTTOM - PLOT_TOP);
}

// Static graph-paper grid, drawn once.
const V_LINES = Array.from({ length: 8 }, (_, k) => Math.round((k * VIEW_W) / 8)).slice(1);
const H_LINES = Array.from({ length: 5 }, (_, k) => Math.round((k * VIEW_H) / 5)).slice(1);

export function HeroChart({ values }: { values: number[] }) {
  // `display` is what's rendered; it tweens toward `values` whenever the target
  // (the active preset) changes, so the line morphs instead of snapping.
  const [display, setDisplay] = useState<number[]>(values);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const from = display;
    const to = values;
    // Guard against a length change (all presets share the same N, but be safe).
    if (from.length !== to.length) {
      setDisplay(to);
      return;
    }
    let start: number | null = null;
    const step = (ts: number) => {
      if (start === null) start = ts;
      const p = Math.min((ts - start) / MORPH_MS, 1);
      const e = easeInOut(p);
      setDisplay(from.map((v, i) => v + (to[i] - v) * e));
      if (p < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // Intentionally only re-run when the target changes, not on every tween tick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values]);

  const n = display.length;
  const linePoints = display.map((v, i) => `${xAt(i, n).toFixed(1)},${yAt(v).toFixed(1)}`).join(' ');
  const areaPath =
    `M ${PLOT_LEFT} ${PLOT_BOTTOM} ` +
    display.map((v, i) => `L ${xAt(i, n).toFixed(1)} ${yAt(v).toFixed(1)}`).join(' ') +
    ` L ${PLOT_RIGHT} ${PLOT_BOTTOM} Z`;

  return (
    <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} preserveAspectRatio="none" role="img" aria-label="Haptic waveform">
      <g stroke="#E1F3FA" strokeWidth="1.5">
        {V_LINES.map((x) => (
          <line key={`v${x}`} x1={x} y1="0" x2={x} y2={VIEW_H} />
        ))}
        {H_LINES.map((y) => (
          <line key={`h${y}`} x1="0" y1={y} x2={VIEW_W} y2={y} />
        ))}
      </g>

      <path d={areaPath} fill="#38ACDD" fillOpacity="0.18" />

      <polyline
        points={linePoints}
        fill="none"
        stroke="#38ACDD"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <g fill="#FBFEFF" stroke="#38ACDD" strokeWidth="2.5">
        {display.map((v, i) => (
          <circle key={i} cx={xAt(i, n)} cy={yAt(v)} r="4.5" />
        ))}
      </g>
    </svg>
  );
}
