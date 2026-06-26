import { useEffect } from 'react';
import type { HapticsDiff } from './applyDiff';

// Envelope posted into the preview by the PulsarApp WebView host
// (PulsarApp/app/(tabs)/figma.tsx → buildPreviewInjection) when the Figma
// plugin relays a live haptics-config change over the paired socket.
interface HapticsUpdateEnvelope {
  type: 'pulsar-haptics-update';
  kind: 'preview-haptics-diff' | 'preview-haptics-refetch' | 'preview-frame-focus';
  fromRevision?: number;
  toRevision?: number;
  diff?: HapticsDiff;
  // Set only on 'preview-frame-focus': the top-level frame the preview should
  // present (the designer focused it in Figma), plus its name for the indicator.
  nodeId?: string;
  frameName?: string;
}

// Listen for host-relayed config updates. Pass stable handlers (useMemo/
// useCallback) so the listener doesn't re-bind every render. `onDiff` applies an
// incremental delta; `onRefetch` re-pulls the whole config from the server;
// `onFocusFrame` jumps the embed to the frame the designer focused (app-only -
// the host only injects this when running inside PulsarApp's WebView).
export function useHostUpdates(handlers: {
  onDiff: (fromRevision: number, toRevision: number, diff: HapticsDiff) => void;
  onRefetch: (toRevision: number) => void;
  onFocusFrame: (nodeId: string, frameName?: string) => void;
}) {
  useEffect(() => {
    const listener = (event: MessageEvent) => {
      const data = event.data as HapticsUpdateEnvelope | null;
      if (!data || data.type !== 'pulsar-haptics-update') return;
      if (
        data.kind === 'preview-haptics-diff' &&
        data.diff &&
        typeof data.fromRevision === 'number' &&
        typeof data.toRevision === 'number'
      ) {
        handlers.onDiff(data.fromRevision, data.toRevision, data.diff);
      } else if (data.kind === 'preview-haptics-refetch' && typeof data.toRevision === 'number') {
        handlers.onRefetch(data.toRevision);
      } else if (data.kind === 'preview-frame-focus' && typeof data.nodeId === 'string') {
        handlers.onFocusFrame(data.nodeId, data.frameName);
      }
    };
    window.addEventListener('message', listener);
    return () => window.removeEventListener('message', listener);
  }, [handlers]);
}
