import { useEffect } from 'react';
import type { HapticPattern } from 'pulsar-haptics';
import { playCue } from '../../haptics';

const CYCLE_MS = 1500;
const DOT_INTERVAL_MS = 220;
/** Point in the cycle where a dot lands back on the baseline. */
const BOTTOM_HIT_RATIO = 0.21;

const DOT_PATTERNS: HapticPattern[] = [
  [{ type: 'continuous', timestamp: 0, duration: 30 }],
  [{ type: 'continuous', timestamp: 0, duration: 20 }],
  [{ type: 'continuous', timestamp: 0, duration: 25 }],
];

export function DotLoaderDemo() {
  return (
    <>
      <h1 className="title">Dot loader</h1>
      <p className="lead">
        Each dot fires its own haptic the moment it touches down, so a purely visual loading
        animation gains a rhythm you can feel.
      </p>

      <div className="card" style={{ marginTop: 24 }}>
        <div className="dots">
          {DOT_PATTERNS.map((pattern, index) => (
            <LoaderDot key={index} index={index} pattern={pattern} />
          ))}
        </div>
      </div>
    </>
  );
}

function LoaderDot({ index, pattern }: { index: number; pattern: HapticPattern }) {
  useEffect(() => {
    let intervalId: number | undefined;
    const timeoutId = window.setTimeout(
      () => {
        playCue(pattern);
        intervalId = window.setInterval(() => playCue(pattern), CYCLE_MS);
      },
      index * DOT_INTERVAL_MS + CYCLE_MS * BOTTOM_HIT_RATIO,
    );

    return () => {
      window.clearTimeout(timeoutId);
      if (intervalId !== undefined) window.clearInterval(intervalId);
    };
  }, [index, pattern]);

  return <span className="dots__dot" style={{ animationDelay: `${index * DOT_INTERVAL_MS}ms` }} />;
}
