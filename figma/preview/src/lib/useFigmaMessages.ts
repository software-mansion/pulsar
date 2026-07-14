import { useEffect } from 'react';
import { FIGMA_ORIGINS, type FigmaEmbedEvent } from './embed';

// Subscribe to postMessage events from the embedded Figma prototype. Handlers are
// kept in a ref-free closure; pass a stable `handlers` object (e.g. via useMemo or
// useCallback) or accept that the listener re-binds when they change.
export function useFigmaMessages(handlers: {
  onInitialLoad?: () => void;
  onMousePressOrRelease?: (targetNodeId: string) => void;
  onLoginScreen?: () => void;
}) {
  useEffect(() => {
    const listener = (event: MessageEvent) => {
      if (!FIGMA_ORIGINS.includes(event.origin)) return;
      const msg = event.data as FigmaEmbedEvent;
      if (!msg || typeof msg.type !== 'string') return;
      switch (msg.type) {
        case 'INITIAL_LOAD':
          handlers.onInitialLoad?.();
          break;
        // PRESENTED_NODE_CHANGED is intentionally handled inside PrototypeView
        // (it attributes the event to the active iframe in the keep-alive cache),
        // so it's deliberately not routed here.
        case 'MOUSE_PRESS_OR_RELEASE':
          handlers.onMousePressOrRelease?.(msg.data?.targetNodeId ?? '');
          break;
        case 'LOGIN_SCREEN_SHOWN':
          handlers.onLoginScreen?.();
          break;
      }
    };
    window.addEventListener('message', listener);
    return () => window.removeEventListener('message', listener);
  }, [handlers]);
}
