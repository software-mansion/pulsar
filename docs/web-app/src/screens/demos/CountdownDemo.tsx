import { useEffect, useState } from 'react';
import type { HapticPattern } from 'pulsar-haptics';
import { playCue } from '../../haptics';

const START = 7;

const tick: HapticPattern = [{ type: 'continuous', timestamp: 0, duration: 25 }];
const finalTick: HapticPattern = [{ type: 'continuous', timestamp: 0, duration: 55 }];
const complete: HapticPattern = [
  { type: 'continuous', timestamp: 0, duration: 60 },
  { type: 'continuous', timestamp: 120, duration: 60 },
];

export function CountdownDemo() {
  const [remaining, setRemaining] = useState<number | null>(null);

  // One timeout per second remaining: the effect re-runs on each new value and
  // simply stops scheduling once the count reaches zero.
  useEffect(() => {
    if (remaining === null || remaining <= 0) return;

    const id = window.setTimeout(() => {
      const next = remaining - 1;
      playCue(next > 2 ? tick : next > 0 ? finalTick : complete);
      setRemaining(next);
    }, 1000);

    return () => window.clearTimeout(id);
  }, [remaining]);

  const started = remaining !== null;

  return (
    <>
      <h1 className="title">Countdown timer</h1>
      <p className="lead">
        Haptics synced to a countdown. The last three seconds switch to a longer, more urgent tick,
        and zero lands as a double thump.
      </p>

      <div className="card timer">
        <span
          className={`timer__value${remaining !== null && remaining > 0 && remaining <= 3 ? ' timer__value--warning' : ''}`}
        >
          {remaining ?? '···'}
        </span>
        <span className="muted">
          {remaining === null
            ? 'Ready to start'
            : remaining === 0
              ? 'Complete!'
              : `${remaining} second${remaining === 1 ? '' : 's'} left`}
        </span>
      </div>

      <button
        type="button"
        className="btn"
        style={{ width: '100%', marginTop: 20 }}
        onClick={() => setRemaining(started ? null : START)}
      >
        {started ? 'Reset' : 'Start countdown'}
      </button>
    </>
  );
}
