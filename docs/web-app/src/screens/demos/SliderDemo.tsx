import { useRef, useState } from 'react';
import type { HapticPattern } from 'pulsar-haptics';
import { playCue } from '../../haptics';

const SLIDERS: { id: string; title: string; caption: string; pattern: HapticPattern }[] = [
  {
    id: 'quick',
    title: 'Quick tick',
    caption: 'A crisp 15 ms blip on every step.',
    pattern: [{ type: 'continuous', timestamp: 0, duration: 15 }],
  },
  {
    id: 'soft',
    title: 'Soft tick',
    caption: 'A shorter shot with wider gaps — rounder and quieter.',
    pattern: [{ type: 'pulse', timestamp: 0, duration: 45, intensity: 0.4, frequency: 0.4 }],
  },
  {
    id: 'deep',
    title: 'Deep tick',
    caption: 'A longer block that lands with more weight.',
    pattern: [{ type: 'continuous', timestamp: 0, duration: 45 }],
  },
];

export function SliderDemo() {
  return (
    <>
      <h1 className="title">Slider haptics</h1>
      <p className="lead">
        Move each slider to feel a different tick. Every 10% crossed fires the pattern once, so the
        feedback tracks the value instead of the gesture.
      </p>

      <div className="stack">
        {SLIDERS.map((slider) => (
          <HapticSlider key={slider.id} {...slider} />
        ))}
      </div>
    </>
  );
}

function HapticSlider({
  title,
  caption,
  pattern,
}: {
  title: string;
  caption: string;
  pattern: HapticPattern;
}) {
  const [value, setValue] = useState(50);
  const lastTickRef = useRef(5);

  return (
    <div className="card slider-card">
      <div className="slider-card__label">
        <span className="subtitle">{title}</span>
        <span className="muted">{value}</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        aria-label={title}
        onChange={(event) => {
          const next = Number(event.target.value);
          const tick = Math.floor(next / 10);
          if (tick !== lastTickRef.current) {
            lastTickRef.current = tick;
            playCue(pattern);
          }
          setValue(next);
        }}
      />
      <p className="muted" style={{ margin: 0 }}>
        {caption}
      </p>
    </div>
  );
}
