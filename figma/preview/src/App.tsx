import { useCallback, useMemo, useRef, useState } from 'react';
import type { PresetData } from './types';
import { readPayload } from './lib/payload';
import { normalizeId } from './lib/ids';
import { useFigmaMessages } from './lib/useFigmaMessages';
import { useFullscreen } from './lib/useFullscreen';
import { playPreset, stopAll } from './audio/player';
import { Header } from './components/Header';
import { PrototypeView } from './components/PrototypeView';
import { HapticList } from './components/HapticList';

const ACTIVE_MS = 900;
const TAP_DEBOUNCE_MS = 250;

export default function App() {
  const payload = useMemo(readPayload, []);

  // Derived lookup maps (stable across renders).
  const { bindings, ownerMap, presentedId } = useMemo(() => {
    const binds = new Map<string, PresetData>();
    const owner = new Map<string, string>();
    if (payload) {
      for (const [id, data] of Object.entries(payload.bindings)) binds.set(normalizeId(id), data);
      for (const [id, ownerId] of Object.entries(payload.owner)) owner.set(normalizeId(id), normalizeId(ownerId));
    }
    return { bindings: binds, ownerMap: owner, presentedId: normalizeId(payload?.nodeId) };
  }, [payload]);

  const elements = useMemo(
    () => (payload?.elements ?? []).map((e) => ({ ...e, id: normalizeId(e.id) })),
    [payload]
  );

  const [status, setStatus] = useState(
    payload?.fileKey ? 'Loading prototype…' : 'Waiting for a design — open one from the Pulsar plugin.'
  );
  const [currentNodeId, setCurrentNodeId] = useState(presentedId);
  const [highlightsOn, setHighlightsOn] = useState(true);
  const [activeId, setActiveId] = useState('');

  const activeTimer = useRef<number | undefined>(undefined);
  const lastPlayed = useRef(new Map<string, number>());

  const setActiveTransient = useCallback((id: string) => {
    setActiveId(id);
    if (activeTimer.current) clearTimeout(activeTimer.current);
    activeTimer.current = window.setTimeout(() => setActiveId(''), ACTIVE_MS);
  }, []);

  const play = useCallback(
    (id: string) => {
      const data = bindings.get(id);
      if (!data) return;
      stopAll();
      playPreset(data).catch(() => {});
    },
    [bindings]
  );

  const playFromList = useCallback(
    (id: string) => {
      play(id);
      setActiveTransient(id);
    },
    [play, setActiveTransient]
  );

  const handlers = useMemo(
    () => ({
      onInitialLoad: () => setStatus('Tap a highlighted element to feel its haptic.'),
      onPresentedNodeChanged: (id: string) => setCurrentNodeId(normalizeId(id)),
      onLoginScreen: () => setStatus('This file requires Figma login to embed.'),
      onMousePressOrRelease: (targetNodeId: string) => {
        const norm = normalizeId(targetNodeId);
        if (!norm || !bindings.has(norm)) return;
        const now = Date.now();
        if (now - (lastPlayed.current.get(norm) ?? 0) < TAP_DEBOUNCE_MS) return;
        lastPlayed.current.set(norm, now);
        const ownerId = ownerMap.get(norm) ?? norm;
        play(ownerId);
        setActiveTransient(ownerId);
      }
    }),
    [bindings, ownerMap, play, setActiveTransient]
  );
  useFigmaMessages(handlers);

  const { isFullscreen, enter: enterFullscreen, exit: exitFullscreen } = useFullscreen();

  if (!payload?.fileKey) {
    return (
      <>
        <Header status={status} count={0} onEnterFullscreen={enterFullscreen} />
        <main className="main">
          <div className="frame-wrap">
            <div className="empty">
              <div className="big">No design loaded</div>
              <div>
                Open one from the Figma plugin via <b>Preview → Show in live preview</b>.
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  // In fullscreen we show only the Figma content — no header, panel, highlights,
  // or card chrome.
  const showHighlights = highlightsOn && currentNodeId === presentedId && !isFullscreen;

  return (
    <>
      {!isFullscreen && (
        <Header status={status} count={elements.length} onEnterFullscreen={enterFullscreen} />
      )}
      <main className={`main${isFullscreen ? ' fullscreen' : ''}`}>
        <PrototypeView
          fileKey={payload.fileKey}
          nodeId={payload.nodeId}
          frame={payload.frame}
          elements={elements}
          showHighlights={showHighlights}
          activeId={activeId}
          fullscreen={isFullscreen}
        />
        {!isFullscreen && (
          <HapticList
            elements={elements}
            highlightsOn={highlightsOn}
            onToggleHighlights={setHighlightsOn}
            activeId={activeId}
            onActivate={setActiveId}
            onPlay={playFromList}
          />
        )}
      </main>
      {isFullscreen && (
        <button className="exit-fs" onClick={exitFullscreen} title="Exit fullscreen (Esc)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M9 4H4v5M20 9V4h-5M9 20H4v-5M20 15v5h-5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
    </>
  );
}
