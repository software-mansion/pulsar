import { useEffect, useRef } from 'react';

// Call `onEscape` when the user presses Escape, while `enabled` (default true).
// For dismissible overlays - modals, an enlarged view, in-app fullscreen. Keeps
// the latest handler in a ref so it never re-subscribes just because the caller
// passed a fresh closure.
export function useEscapeKey(onEscape: () => void, enabled = true) {
  const onEscapeRef = useRef(onEscape);
  onEscapeRef.current = onEscape;
  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onEscapeRef.current();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [enabled]);
}
