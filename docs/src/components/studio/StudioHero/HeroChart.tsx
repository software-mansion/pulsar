import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './HeroChart.module.scss';

// Inline, editable version of the Figma hero chart: same grid / area / line /
// marker styling, but the line points are (a) driven by props so it can morph to
// the waveform of whichever emoji preset is playing, and (b) draggable — grab a
// node and move it up/down to reshape the line and area in place.

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
  // `display` is what's rendered; it tweens toward `values` when the target (the
  // active preset) changes, and is edited directly while a node is dragged.
  const [display, setDisplay] = useState<number[]>(values);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const dragIndexRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    // A live node drag owns the shape; don't let a preset morph fight it.
    if (dragIndexRef.current !== null) return;

    const from = display;
    const to = values;
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
    // Only re-run when the target changes, not on every tween tick / edit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values]);

  // Map a screen Y coordinate to a 0..1 amplitude value. preserveAspectRatio is
  // "none", so the vertical scale is simply rect.height ↔ VIEW_H.
  const valueFromClientY = useCallback((clientY: number): number => {
    const svg = svgRef.current;
    if (!svg) return 0;
    const rect = svg.getBoundingClientRect();
    const svgY = ((clientY - rect.top) / rect.height) * VIEW_H;
    const value = (PLOT_BOTTOM - svgY) / (PLOT_BOTTOM - PLOT_TOP);
    return Math.max(0, Math.min(1, value));
  }, []);

  const onPointerMove = useCallback(
    (e: PointerEvent) => {
      const i = dragIndexRef.current;
      if (i === null) return;
      const value = valueFromClientY(e.clientY);
      setDisplay((prev) => {
        const next = prev.slice();
        next[i] = value;
        return next;
      });
    },
    [valueFromClientY],
  );

  const onPointerUp = useCallback(() => {
    dragIndexRef.current = null;
    setDragIndex(null);
    window.removeEventListener('pointermove', onPointerMove);
  }, [onPointerMove]);

  const onNodeDown = (i: number) => (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Stop any in-flight morph so the drag has sole control of the shape.
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    dragIndexRef.current = i;
    setDragIndex(i);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp, { once: true });
  };

  const n = display.length;
  const linePoints = display.map((v, i) => `${xAt(i, n).toFixed(1)},${yAt(v).toFixed(1)}`).join(' ');
  const areaPath =
    `M ${PLOT_LEFT} ${PLOT_BOTTOM} ` +
    display.map((v, i) => `L ${xAt(i, n).toFixed(1)} ${yAt(v).toFixed(1)}`).join(' ') +
    ` L ${PLOT_RIGHT} ${PLOT_BOTTOM} Z`;

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      preserveAspectRatio="none"
      role="img"
      aria-label="Editable haptic waveform — drag a point to reshape it"
    >
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

      {display.map((v, i) => {
        const cx = xAt(i, n);
        const cy = yAt(v);
        return (
          <g key={i} className={`${styles.node} ${dragIndex === i ? styles.dragging : ''}`}>
            <circle
              className={styles.marker}
              cx={cx}
              cy={cy}
              r="4.5"
              fill="#FBFEFF"
              stroke="#38ACDD"
              strokeWidth="2.5"
            />
            {/* Larger transparent hit target for easy grabbing. */}
            <circle className={styles.hit} cx={cx} cy={cy} r="13" onPointerDown={onNodeDown(i)} />
          </g>
        );
      })}
    </svg>
  );
}
