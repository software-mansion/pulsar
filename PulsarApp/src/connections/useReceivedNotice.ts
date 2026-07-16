import { useCallback, useEffect, useRef, useState } from 'react';

import type { ReceivedPattern } from './types';

const NOTICE_MS = 1200;

// The transient "preset received" banner: set on every hit, auto-cleared shortly
// after the last one.
export function useReceivedNotice() {
  const [lastReceived, setLastReceived] = useState<ReceivedPattern | null>(null);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const notify = useCallback((found: boolean, name: string) => {
    setLastReceived({ found, name });
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = setTimeout(() => setLastReceived(null), NOTICE_MS);
  }, []);

  useEffect(
    () => () => {
      if (timeout.current) clearTimeout(timeout.current);
    },
    [],
  );

  return { lastReceived, notify };
}
