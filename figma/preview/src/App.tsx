import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { PresetData, PreviewPayload } from './types';
import { readPayload } from './lib/payload';
import { normalizeId } from './lib/ids';
import { useFigmaMessages } from './lib/useFigmaMessages';
import { useFullscreen } from './lib/useFullscreen';
import { useIsMobile } from './lib/useIsMobile';
import { playPreset, stopAll } from './audio/player';
import { Header } from './components/Header';
import { PrototypeView } from './components/PrototypeView';
import { HapticList } from './components/HapticList';
import { PresetDetailsModal } from './components/PresetDetailsModal';

const ACTIVE_MS = 900;
const TAP_DEBOUNCE_MS = 250;

export default function App() {
  // Payload now arrives asynchronously (token → server fetch). Hold null while
  // the request is in flight; the empty-state UI handles both "no payload yet"
  // and "no payload at all".
  const [payload, setPayload] = useState<PreviewPayload | null>(null);
  const [payloadLoaded, setPayloadLoaded] = useState(false);
  useEffect(() => {
    let cancelled = false;
    readPayload().then((p) => {
      if (cancelled) return;
      setPayload(p);
      setPayloadLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

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

  const [status, setStatus] = useState('Waiting for a design — open one from the Pulsar plugin.');
  // Once we know the payload state, refresh the status accordingly. Done in an
  // effect so the user briefly sees "loading" while the token fetch is in
  // flight rather than a flash of the empty state.
  useEffect(() => {
    if (!payloadLoaded) {
      if (new URLSearchParams(location.search).has('token')) {
        setStatus('Loading preview…');
      }
      return;
    }
    setStatus(
      payload?.fileKey
        ? 'Loading prototype…'
        : 'Waiting for a design — open one from the Pulsar plugin.'
    );
  }, [payloadLoaded, payload]);
  const [currentNodeId, setCurrentNodeId] = useState(presentedId);
  // Sync currentNodeId when the payload arrives later (async token fetch). The
  // useState initializer above only runs once with whatever presentedId was on
  // first render, which is the empty string before the fetch resolves.
  useEffect(() => {
    setCurrentNodeId(presentedId);
  }, [presentedId]);
  const [highlightsOn, setHighlightsOn] = useState(true);
  const [activeId, setActiveId] = useState('');
  const [detailsId, setDetailsId] = useState<string>('');
  const [loaded, setLoaded] = useState(false);

  const activeTimer = useRef<number | undefined>(undefined);
  const lastPlayed = useRef(new Map<string, number>());

  const setActiveTransient = useCallback((id: string) => {
    setActiveId(id);
    if (activeTimer.current) clearTimeout(activeTimer.current);
    activeTimer.current = window.setTimeout(() => setActiveId(''), ACTIVE_MS);
  }, []);

  // When the preview is loaded inside the PulsarApp WebView the URL carries
  // `?host=app`. In that mode we skip the in-page audio fallback and instead
  // postMessage the preset name to the native host, which plays the real
  // device haptic via react-native-pulsar.
  const isAppHost = useMemo(
    () =>
      new URLSearchParams(location.search).get('host') === 'app' &&
      typeof (window as any).ReactNativeWebView !== 'undefined',
    []
  );

  const play = useCallback(
    (id: string) => {
      const data = bindings.get(id);
      if (!data) return;
      if (isAppHost) {
        try {
          (window as any).ReactNativeWebView.postMessage(
            JSON.stringify({ type: 'play-preset', presetName: data.name })
          );
        } catch {
          // If the bridge isn't there for some reason, fall through to audio.
          stopAll();
          playPreset(data).catch(() => {});
        }
        return;
      }
      stopAll();
      playPreset(data).catch(() => {});
    },
    [bindings, isAppHost]
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
      onInitialLoad: () => {
        setStatus('Tap a highlighted element to feel its haptic.');
        setLoaded(true);
      },
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
  const isMobile = useIsMobile();
  // On mobile we always run fullscreen (content fills the screen, no chrome).
  const fullscreen = isFullscreen || isMobile;

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
  const showHighlights = highlightsOn && currentNodeId === presentedId && !fullscreen;

  return (
    <>
      {!fullscreen && (
        <Header status={status} count={elements.length} onEnterFullscreen={enterFullscreen} />
      )}
      <main className={`main${fullscreen ? ' fullscreen' : ''}`}>
        <PrototypeView
          fileKey={payload.fileKey}
          nodeId={payload.nodeId}
          frame={payload.frame}
          elements={elements}
          showHighlights={showHighlights}
          activeId={activeId}
          fullscreen={fullscreen}
          deviceFrame={!isMobile}
          loaded={loaded}
        />
        {!fullscreen && (
          <HapticList
            elements={elements}
            highlightsOn={highlightsOn}
            onToggleHighlights={setHighlightsOn}
            activeId={activeId}
            onActivate={setActiveId}
            onPlay={playFromList}
            onShowDetails={setDetailsId}
          />
        )}
      </main>
      {detailsId && bindings.get(detailsId) && (
        <PresetDetailsModal
          data={bindings.get(detailsId)!}
          elementName={elements.find((e) => e.id === detailsId)?.name}
          onClose={() => setDetailsId('')}
        />
      )}

      {/* Manual fullscreen on desktop can be exited; mobile fullscreen is implicit. */}
      {isFullscreen && !isMobile && (
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
