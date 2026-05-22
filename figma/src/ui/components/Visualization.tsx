import { useMemo } from 'react';
import type { PresetData } from '../../shared/types';

// Simple SVG visualization of a haptic pattern. Shows continuous amplitude
// curve plus discrete impulse bars. Frequency is encoded as bar color.
export default function Visualization({
  data,
  height = 56
}: {
  data: PresetData;
  height?: number;
}) {
  const W = 320;
  const H = height;
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

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      height={H}
      preserveAspectRatio="none"
      style={{
        background: 'white',
        border: '1px solid var(--color-blue-10)',
        borderRadius: 8,
        padding: 4
      }}
    >
      {ampPath && (
        <path d={`${ampPath} L${W - 2},${H} L2,${H} Z`} fill="var(--color-blue-30)" opacity="0.55" />
      )}
      {ampPath && <path d={ampPath} stroke="var(--color-blue-60)" strokeWidth="1.2" fill="none" />}
      {data.discretePattern.map((d, i) => {
        const x = xOf(d.time);
        const h = Math.max(2, d.amplitude * (H - 4));
        // Hue from frequency (0 -> blue, 1 -> magenta-ish)
        const hue = 220 - d.frequency * 200;
        return (
          <line
            key={i}
            x1={x}
            x2={x}
            y1={H - 2}
            y2={H - 2 - h}
            stroke={`hsl(${hue}, 70%, 45%)`}
            strokeWidth="2"
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}
