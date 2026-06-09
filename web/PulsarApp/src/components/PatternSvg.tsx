import { useMemo } from "react";
import { PatternComposer, type Preset } from "pulsar-haptics";

type PatternEntry = Preset["pattern"][number];

interface Props {
  pattern: PatternEntry[];
}

/**
 * Visualize the actual `navigator.vibrate()` timeline that the composer will emit,
 * rather than redrawing the high-level segments. This matches what is actually played.
 */
export function PatternSvg({ pattern }: Props) {
  const shapes = useMemo(() => {
    const composer = new PatternComposer();
    const parsed = composer.parse(pattern);

    if (parsed.length === 0) {
      return { rects: [] as Array<{ x: number; w: number }>, baseline: 22 };
    }

    const width = 100;
    const baseline = 22;
    const totalDuration = parsed.reduce((sum, ms) => sum + ms, 0);

    if (totalDuration <= 0) {
      return { rects: [], baseline };
    }

    const scale = (ms: number) => (ms / totalDuration) * width;
    const rects: Array<{ x: number; w: number }> = [];
    let cursor = 0;

    // navigator.vibrate convention: alternating ON, OFF, ON, OFF... starting with ON.
    for (let i = 0; i < parsed.length; i += 1) {
      const ms = parsed[i]!;
      const isOn = i % 2 === 0;
      if (isOn && ms > 0) {
        rects.push({ x: scale(cursor), w: Math.max(0.5, scale(ms)) });
      }
      cursor += ms;
    }

    return { rects, baseline };
  }, [pattern]);

  return (
    <svg className="pattern-svg" viewBox="0 0 100 24" preserveAspectRatio="none">
      <line
        x1="0"
        y1={shapes.baseline}
        x2="100"
        y2={shapes.baseline}
        stroke="var(--panel-border)"
        strokeWidth="0.5"
      />
      {shapes.rects.map((rect, i) => (
        <rect
          key={i}
          x={rect.x.toFixed(2)}
          y="2"
          width={rect.w.toFixed(2)}
          height={shapes.baseline - 2}
          rx="1"
          fill="var(--accent)"
          opacity="0.9"
        />
      ))}
    </svg>
  );
}
