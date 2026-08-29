import { useCallback, useEffect, useRef, useState } from 'react';

export interface PlaybackClock {
  positionMs: number;
  isRunning: boolean;
  start: (fromMs: number) => void;
  stop: () => void;
  jumpTo: (ms: number) => void;
}

/** The SDK reports no position, so elapsed wall-clock against the known duration is it. */
export function usePlaybackClock(durationMs: number): PlaybackClock {
  const [positionMs, setPositionMs] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const frameRef = useRef<number | null>(null);

  const cancelFrame = useCallback(() => {
    if (frameRef.current != null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  }, []);

  const start = useCallback(
    (fromMs: number) => {
      cancelFrame();
      const startedAt = Date.now() - fromMs;
      setPositionMs(fromMs);
      setIsRunning(true);
      const tick = () => {
        const elapsed = Date.now() - startedAt;
        if (elapsed >= durationMs) {
          frameRef.current = null;
          setPositionMs(durationMs);
          setIsRunning(false);
          return;
        }
        setPositionMs(elapsed);
        frameRef.current = requestAnimationFrame(tick);
      };
      frameRef.current = requestAnimationFrame(tick);
    },
    [cancelFrame, durationMs],
  );

  const stop = useCallback(() => {
    cancelFrame();
    setIsRunning(false);
  }, [cancelFrame]);

  const jumpTo = useCallback(
    (ms: number) => {
      cancelFrame();
      setIsRunning(false);
      setPositionMs(Math.max(0, Math.min(ms, durationMs)));
    },
    [cancelFrame, durationMs],
  );

  useEffect(() => cancelFrame, [cancelFrame]);

  return { positionMs, isRunning, start, stop, jumpTo };
}
