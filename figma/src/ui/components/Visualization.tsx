import styles from './Visualization.module.css';
import { useId, useMemo } from 'react';
import type { PresetData } from '../../shared/types';

// Frequency → hue: 0 → blue (220°), 1 → warm (20°). Shared by the discrete
// impulse bars and the continuous envelope so both channels encode frequency
// on the same colour scale.
const freqColor = (f: number) => `hsl(${(220 - f * 200).toFixed(0)}, 70%, 45%)`;

// Simple SVG visualization of a haptic pattern. The continuous channel is an
// amplitude envelope whose colour tracks the continuous frequency along the
// time axis (via a horizontal gradient); discrete impulses are bars whose
// height encodes amplitude and whose colour encodes frequency.
export default function Visualization({
  data,
  height = 56
}: {
  data: PresetData;
  height?: number;
}) {
  const W = 320;
  const H = height;
  // Unique gradient id per instance — the plugin renders many of these SVGs in
  // one document, so a shared id would make every envelope reuse the first
  // gradient. Strip the colons useId() emits since they break funciri refs.
  const gradId = `freq-${useId().replace(/:/g, '')}`;
  const dur = useMemo(
    () =>
      Math.max(
        50,
        data.duration ||
          Math.max(
            ...(data.discretePattern.map((d) => d.time) as number[]),
            ...(data.continuousPattern.amplitude.map((p) => p.time) as number[]),
            0
          )
      ),
    [data]
  );
  const xOf = (t: number) => (t / dur) * (W - 4) + 2;
  const yOf = (v: number) => H - v * (H - 4) - 2;

  const ampPath = useMemo(() => {
    const pts = data.continuousPattern.amplitude;
    if (pts.length === 0) return '';
    return pts
      .map((p, i) => `${i === 0 ? 'M' : 'L'}${xOf(p.time).toFixed(1)},${yOf(p.value).toFixed(1)}`)
      .join(' ');
  }, [data, dur, H]);

  // Continuous frequency drives a horizontal gradient along the time axis. When
  // the preset has no continuous frequency data we fall back to a flat blue.
  const freqPts = data.continuousPattern.frequency;
  const hasFreq = freqPts.length > 0;
  const fillPaint = hasFreq ? `url(#${gradId})` : 'var(--color-blue-30)';
  const strokePaint = hasFreq ? `url(#${gradId})` : 'var(--color-blue-60)';

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      height={H}
      preserveAspectRatio="none"
      className={styles['visualization-svg']}
    >
      {hasFreq && (
        <defs>
          <linearGradient
            id={gradId}
            gradientUnits="userSpaceOnUse"
            x1={xOf(0)}
            y1={0}
            x2={xOf(dur)}
            y2={0}
          >
            {freqPts.map((p, i) => (
              <stop
                key={i}
                offset={Math.min(1, Math.max(0, p.time / dur))}
                stopColor={freqColor(p.value)}
              />
            ))}
          </linearGradient>
        </defs>
      )}
      {ampPath && (
        <path d={`${ampPath} L${W - 2},${H} L2,${H} Z`} fill={fillPaint} opacity="0.45" />
      )}
      {ampPath && <path d={ampPath} stroke={strokePaint} strokeWidth="1.6" fill="none" />}
      {data.discretePattern.map((d, i) => {
        const x = xOf(d.time);
        const h = Math.max(2, d.amplitude * (H - 4));
        return (
          <line
            key={i}
            x1={x}
            x2={x}
            y1={H - 2}
            y2={H - 2 - h}
            stroke={freqColor(d.frequency)}
            strokeWidth="2"
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}
