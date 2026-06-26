import { useLayoutEffect, useRef, useState } from 'react';
import type { ElementInfo, NodeBox } from '../types';
import { buildEmbedSrc, FIGMA_ORIGINS, type FigmaEmbedEvent } from '../lib/embed';
import { normalizeId } from '../lib/ids';
import { useElementSize } from '../lib/useElementSize';
import { HighlightOverlay } from './HighlightOverlay';
import { PrototypeLoader } from './PrototypeLoader';

// How many visited frames to keep mounted (active + recent). Each one is a full
// Figma embed, so this is a memory/CPU vs. snappiness trade-off - keep it modest
// for mobile WebViews. Tune here if designers routinely hop across more screens.
const MAX_LIVE_FRAMES = 5;

// One mounted embed. `key` is a stable synthetic id used as the React key and
// ref handle - it never changes for the iframe's lifetime, so the element is
// never reparented (which would reload it). `mountNode` is the node-id the embed
// URL was built with; it never changes either, so the `src` is stable and the
// iframe never reloads. `node` is the frame the iframe is *currently* showing -
// it starts as `mountNode` and is re-labelled when the user navigates inside the
// prototype, so cache lookups (by shown frame) stay accurate without touching src.
interface Slot {
  key: string;
  mountNode: string;
  node: string;
}

export function PrototypeView({
  fileKey,
  nodeId,
  frame,
  elements,
  showHighlights,
  activeId,
  fullscreen = false,
  deviceFrame,
  loaded,
  onPresentedNodeChange
}: {
  fileKey: string;
  // The frame to present (already normalized). The Embed API's inbound
  // NAVIGATE_TO_FRAME message is a no-op in practice (see embed.ts), so each
  // distinct frame is its own iframe selected by node-id. To avoid a reload on
  // every switch we keep a small keep-alive cache of visited frames: the *first*
  // visit loads an iframe; revisits just un-hide the already-loaded one (instant).
  nodeId: string | null;
  frame: NodeBox | null;
  elements: ElementInfo[];
  showHighlights: boolean;
  activeId: string;
  fullscreen?: boolean;
  deviceFrame: boolean;
  loaded: boolean;
  // The prototype navigated (a hotspot tap inside the embed). Reported up so the
  // overlay can follow. Owned here, not in App's global figma-message listener,
  // so we can attribute the event to the *active* iframe by its window - a late
  // event from a hidden, still-loading cached iframe must not move the view.
  onPresentedNodeChange: (nodeId: string) => void;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const size = useElementSize(stageRef);

  const activeFrameId = nodeId ?? '';

  // Keep-alive cache. `slots` is append-only / filter-removed - never reordered,
  // because moving an iframe in the DOM reloads it. Recency (for LRU eviction)
  // lives in a ref so it doesn't perturb mount order.
  const [slots, setSlots] = useState<Slot[]>(() => [
    { key: 'f0', mountNode: activeFrameId, node: activeFrameId }
  ]);
  const counterRef = useRef(1); // next synthetic key suffix ('f0' is taken)
  const recencyRef = useRef<string[]>(['f0']); // slot keys, most-recent last
  const iframesRef = useRef(new Map<string, HTMLIFrameElement>());
  // Mirrors of render state for the (once-bound) message listener below.
  const slotsRef = useRef(slots);
  slotsRef.current = slots;

  const activeKey = slots.find((s) => s.node === activeFrameId)?.key;
  const activeKeyRef = useRef(activeKey);
  activeKeyRef.current = activeKey;
  const onPresentedRef = useRef(onPresentedNodeChange);
  onPresentedRef.current = onPresentedNodeChange;

  // Reconcile the cache to the requested frame *before paint* (useLayoutEffect),
  // so a cache hit shows instantly and a miss never paints a blank gap. A hit
  // just bumps recency; a miss mounts a new iframe and evicts the least-recently
  // shown one when over the cap.
  useLayoutEffect(() => {
    const existing = slotsRef.current.find((s) => s.node === activeFrameId);
    const key = existing ? existing.key : `f${counterRef.current++}`;
    recencyRef.current = [...recencyRef.current.filter((k) => k !== key), key];
    if (existing) return; // already mounted - no DOM change, no reload
    setSlots((prev) => {
      // append only - never reparent; mountNode fixes the src for its lifetime
      let next = [...prev, { key, mountNode: activeFrameId, node: activeFrameId }];
      if (next.length > MAX_LIVE_FRAMES) {
        const lru = recencyRef.current.find((k) => k !== key && next.some((s) => s.key === k));
        if (lru) {
          iframesRef.current.delete(lru);
          next = next.filter((s) => s.key !== lru); // filter-remove keeps the rest in place
        }
      }
      return next;
    });
  }, [activeFrameId]);

  // A different prototype or device bezel changes every embed URL, so the cached
  // iframes are stale - drop them and start fresh on the current frame.
  useLayoutEffect(() => {
    counterRef.current = 1;
    recencyRef.current = ['f0'];
    iframesRef.current.clear();
    setSlots([{ key: 'f0', mountNode: activeFrameId, node: activeFrameId }]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileKey, deviceFrame]);

  // Track in-prototype navigation, but only from the *active* iframe's window -
  // a hidden cached iframe that finishes loading late must not steal the view.
  // Re-label the active slot to the frame it navigated to so the cache stays
  // accurate (a later explicit jump back to the original frame then reloads it
  // fresh instead of showing the navigated-away content).
  useLayoutEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (!FIGMA_ORIGINS.includes(event.origin)) return;
      const msg = event.data as FigmaEmbedEvent;
      if (!msg || msg.type !== 'PRESENTED_NODE_CHANGED') return;
      const active = activeKeyRef.current ? iframesRef.current.get(activeKeyRef.current) : undefined;
      if (!active || event.source !== active.contentWindow) return;
      const next = normalizeId(msg.data?.presentedNodeId ?? '');
      if (!next) return;
      const key = activeKeyRef.current!;
      setSlots((prev) =>
        prev
          .map((s) => (s.key === key ? { ...s, node: next } : s))
          // Drop any other slot that was showing this frame - it's now a stale duplicate.
          .filter((s) => s.key === key || s.node !== next)
      );
      onPresentedRef.current(next);
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  return (
    <div className={`frame-wrap${fullscreen ? ' fullscreen' : ''}`}>
      <div className="stage" ref={stageRef}>
        {slots.map((slot) => (
          <iframe
            key={slot.key}
            ref={(el) => {
              if (el) iframesRef.current.set(slot.key, el);
              else iframesRef.current.delete(slot.key);
            }}
            title="Figma prototype"
            src={buildEmbedSrc(fileKey, slot.mountNode, deviceFrame)}
            allow="fullscreen"
            allowFullScreen
            // Inline display wins over the `.stage iframe { display: block }`
            // rule; only the active frame is shown, the rest stay warm + hidden.
            style={{ display: slot.key === activeKey ? 'block' : 'none' }}
          />
        ))}
        {showHighlights && frame && (
          <HighlightOverlay frame={frame} elements={elements} size={size} activeId={activeId} />
        )}
      </div>
      <PrototypeLoader loaded={loaded} />
    </div>
  );
}
