import { useEffect, useState } from 'react';

// Centered loader shown over the prototype area while the cross-origin embed
// iframe is loading. We can't read the iframe's real load progress, so the
// percentage is simulated: ticks up with diminishing returns toward ~95%, then
// snaps to 100% and fades out the instant the embed posts INITIAL_LOAD.
export function PrototypeLoader({ loaded }: { loaded: boolean }) {
  const [progress, setProgress] = useState(0);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (loaded) {
      setProgress(100);
      const t = window.setTimeout(() => setHidden(true), 450);
      return () => window.clearTimeout(t);
    }
    const id = window.setInterval(() => {
      setProgress((p) => {
        if (p >= 95) return p;
        // Asymptotic approach to 95: bigger jumps near 0, tiny near 95.
        const inc = Math.max(0.6, (95 - p) * 0.08);
        return Math.min(95, p + inc);
      });
    }, 110);
    return () => window.clearInterval(id);
  }, [loaded]);

  if (hidden) return null;

  const size = 88;
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = c * (Math.min(progress, 100) / 100);

  return (
    <div className={`loader${loaded ? ' fading' : ''}`} aria-busy="true">
      <div className="loader-card">
        <div className="loader-ring" style={{ width: size, height: size }}>
          <svg width={size} height={size}>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              stroke="var(--color-blue-20)"
              strokeWidth={stroke}
              fill="none"
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              stroke="var(--color-blue-50)"
              strokeWidth={stroke}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${c}`}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              style={{ transition: 'stroke-dasharray 200ms ease' }}
            />
          </svg>
          <div className="loader-pct">{Math.round(progress)}%</div>
        </div>
        <div className="loader-label">Loading prototype…</div>
      </div>
    </div>
  );
}
