import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

// Calls `onForeground` once per background → active transition.
export function useForegroundReconnect(onForeground: () => void) {
  const appState = useRef(AppState.currentState);

  // Read through a ref so a re-created callback doesn't re-subscribe.
  const handler = useRef(onForeground);
  handler.current = onForeground;

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (appState.current.match(/inactive|background/) && next === 'active') {
        handler.current();
      }
      appState.current = next;
    });
    return () => sub.remove();
  }, []);
}
