import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FrameInfo, NodeBox, PresetData, PreviewPayload } from './types';
import { getTokenFromUrl, readPayload } from './lib/payload';
import { normalizeId } from './lib/ids';
import { applyDiff, type HapticsDiff } from './lib/applyDiff';
import { useHostUpdates } from './lib/useHostUpdates';
import { useFigmaMessages } from './lib/useFigmaMessages';
import { useFullscreen } from './lib/useFullscreen';
import { useIsMobile } from './lib/useIsMobile';
import { getHostBridge, isAppHost as detectAppHost } from './lib/hostBridge';
import { playPreset, stopAll } from './audio/player';
import { Header } from './components/Header';
import { PrototypeView } from './components/PrototypeView';
import { HapticList } from './components/HapticList';
import { OpenOnPhone } from './components/OpenOnPhone';
import { PresetDetailsModal } from './components/PresetDetailsModal';
import fullscreenExitIcon from './assets/icon-fullscreen-exit.svg';
import fullscreenIcon from './assets/icon-fullscreen.svg';

const ACTIVE_MS = 900;
const TAP_DEBOUNCE_MS = 250;

// True when the center point of `inner` lies within `outer`. Used as a fallback
// "which frame does this element belong to?" test for payloads that don't carry
// a per-element frameId - we treat the element as part of the currently shown
// frame iff its center sits inside the frame's absolute canvas box.
function boxCenterInside(inner: NodeBox, outer: NodeBox): boolean {
  const cx = inner.x + inner.w / 2;
  const cy = inner.y + inner.h / 2;
  return cx >= outer.x && cx <= outer.x + outer.w && cy >= outer.y && cy <= outer.y + outer.h;
}

export default function App() {
  // Payload now arrives asynchronously (token → server fetch). Hold null while
  // the request is in flight; the empty-state UI handles both "no payload yet"
  // and "no payload at all".
  const [payload, setPayload] = useState<PreviewPayload | null>(null);
  const [payloadLoaded, setPayloadLoaded] = useState(false);
  // Set when the server reports the share link was made private (403). Drives a
  // dedicated empty state distinct from "no design loaded".
  const [isPrivate, setIsPrivate] = useState(false);
  // The server revision our current `payload` reflects, and a mirror of the
  // payload itself - both in refs so the (stable) host-update handlers below can
  // read the latest values without re-binding the window message listener.
  const revisionRef = useRef(0);
  const payloadRef = useRef<PreviewPayload | null>(null);
  useEffect(() => {
    payloadRef.current = payload;
  }, [payload]);

  useEffect(() => {
    let cancelled = false;
    readPayload().then((res) => {
      if (cancelled) return;
      if (res.status === 'ok') revisionRef.current = res.revision;
      setPayload(res.status === 'ok' ? res.payload : null);
      setIsPrivate(res.status === 'private');
      setPayloadLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Re-pull the whole config from the server in place (no iframe reload). When a
  // minimum revision is known, retry briefly to ride out read-after-write lag so
  // we never settle on a snapshot older than the change that triggered us.
  const refetch = useCallback(async (minRevision?: number) => {
    for (let attempt = 0; attempt < 4; attempt++) {
      const res = await readPayload();
      if (res.status === 'ok') {
        if (minRevision != null && res.revision < minRevision && attempt < 3) {
          await new Promise((r) => setTimeout(r, 250));
          continue;
        }
        revisionRef.current = res.revision;
        payloadRef.current = res.payload;
        setPayload(res.payload);
        setIsPrivate(false);
        setPayloadLoaded(true);
        return;
      }
      if (res.status === 'private') {
        payloadRef.current = null;
        setPayload(null);
        setIsPrivate(true);
        setPayloadLoaded(true);
      }
      // 'missing' / 'no-token': leave the current state as-is and stop retrying.
      return;
    }
  }, []);

  // Apply a relayed delta in place when our revision is exactly the one the diff
  // was computed against; otherwise we've missed an update (a gap) - refetch.
  const onDiff = useCallback(
    (fromRevision: number, toRevision: number, diff: HapticsDiff) => {
      if (!payloadRef.current || revisionRef.current !== fromRevision) {
        void refetch(toRevision);
        return;
      }
      const next = applyDiff(payloadRef.current, diff);
      payloadRef.current = next;
      revisionRef.current = toRevision;
      setPayload(next);
    },
    [refetch]
  );
  const onRefetch = useCallback((toRevision: number) => void refetch(toRevision), [refetch]);

  // Derived lookup maps (stable across renders).
  const { bindings, ownerMap, presentedId, frames } = useMemo(() => {
    const binds = new Map<string, PresetData>();
    const owner = new Map<string, string>();
    const framesMap = new Map<string, FrameInfo>();
    if (payload) {
      for (const [id, data] of Object.entries(payload.bindings)) binds.set(normalizeId(id), data);
      for (const [id, ownerId] of Object.entries(payload.owner)) owner.set(normalizeId(id), normalizeId(ownerId));
      if (payload.frames) {
        for (const [id, entry] of Object.entries(payload.frames)) {
          // Old payloads stored plain NodeBox; new ones store FrameInfo. Detect
          // by presence of `box` and synthesise a placeholder name otherwise so
          // the grouping UI still has something to render.
          const normalized: FrameInfo =
            'box' in entry
              ? (entry as FrameInfo)
              : { name: 'Screen', box: entry as NodeBox };
          framesMap.set(normalizeId(id), normalized);
        }
      }
    }
    return {
      bindings: binds,
      ownerMap: owner,
      presentedId: normalizeId(payload?.nodeId),
      frames: framesMap
    };
  }, [payload]);

  const elements = useMemo(
    () =>
      (payload?.elements ?? []).map((e) => ({
        ...e,
        id: normalizeId(e.id),
        frameId: e.frameId ? normalizeId(e.frameId) : null
      })),
    [payload]
  );

  const [status, setStatus] = useState('Waiting for a design - open one from the Pulsar plugin.');
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
    if (isPrivate) {
      setStatus('This preview link is private.');
      return;
    }
    setStatus(
      payload?.fileKey
        ? 'Loading prototype…'
        : 'Waiting for a design - open one from the Pulsar plugin.'
    );
  }, [payloadLoaded, payload, isPrivate]);
  // The frame currently presented. Drives both which embed iframe is shown
  // (PrototypeView keeps a keep-alive cache keyed off this) and the overlay
  // grouping. Moved by a deliberate jump - the designer focusing a frame
  // (relayed from the app) or a preset tap in the list - and by in-prototype
  // navigation (a hotspot tap), which PrototypeView reports via
  // onPresentedNodeChange. Switching frames doesn't reload an already-visited
  // one; the Embed API's inbound NAVIGATE_TO_FRAME message is a no-op in
  // practice (verified against a live embed), so each frame is its own iframe
  // and revisits just un-hide the cached one.
  const [currentNodeId, setCurrentNodeId] = useState(presentedId);
  // Sync when the payload arrives later (async token fetch). The useState
  // initializer above only runs once with whatever presentedId was on first
  // render, which is the empty string before the fetch resolves.
  useEffect(() => {
    setCurrentNodeId(presentedId);
  }, [presentedId]);

  // Names for frames the app relayed a focus to. The payload's `frames` map only
  // covers frames that have bindings, so a designer focusing a binding-less frame
  // arrives with no name there - we keep the relayed name to label the indicator.
  const [relayedFrameNames, setRelayedFrameNames] = useState<Record<string, string>>({});

  // Jump to a specific top-level frame (designer focus relay / preset tap).
  // Idempotent - re-selecting the current frame is a no-op. `frameName` is only
  // passed by the focus relay; preset taps resolve the name from the frames map.
  const navigateToFrame = useCallback((frameId: string, frameName?: string) => {
    const norm = normalizeId(frameId);
    if (!norm) return;
    setCurrentNodeId(norm);
    if (frameName) {
      setRelayedFrameNames((prev) => (prev[norm] === frameName ? prev : { ...prev, [norm]: frameName }));
    }
  }, []);

  // Host-relayed updates, only injected when running inside PulsarApp's WebView:
  // incremental config diffs, full refetches, and designer-focus frame jumps.
  const hostHandlers = useMemo(
    () => ({ onDiff, onRefetch, onFocusFrame: navigateToFrame }),
    [onDiff, onRefetch, navigateToFrame]
  );
  useHostUpdates(hostHandlers);
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

  // When the preview is loaded inside the PulsarApp WebView the
  // `window.ReactNativeWebView` bridge is injected by react-native-webview.
  // That single check is authoritative: if it's present we postMessage the
  // preset payload to the native host (which plays the real device haptic via
  // react-native-pulsar); if it isn't, we fall back to the in-page audio
  // generator. We always send the full pattern so the host can fall back to
  // PatternComposer for custom (user-defined) presets whose names don't match
  // anything in react-native-pulsar.Presets. (We used to also gate on a
  // `?host=app` URL param, but that's redundant with the bridge check and
  // broke whenever someone hardcoded the preview URL in PulsarApp for local
  // dev.)
  //
  // The bridge may live on `window` (preview served directly) or on
  // `window.parent` (the docs /figma-preview page embeds us in an <iframe
  // srcdoc>); getHostBridge/detectAppHost resolve either - see lib/hostBridge.
  const isAppHost = useMemo(() => detectAppHost(), []);

  // Deep link that opens this same preview in the Pulsar mobile app, carrying
  // the current share token. Rendered as a QR in the sidebar so a desktop user
  // can hop to their phone; pointless when we're already running inside the app.
  const openOnPhoneLink = useMemo(() => {
    if (isAppHost) return null;
    const token = getTokenFromUrl();
    return token ? `pulsarapp://figma?token=${encodeURIComponent(token)}` : null;
  }, [isAppHost]);

  // When running inside the PulsarApp WebView the preview already fills the
  // WebView (mobile → implicit fullscreen), but the app's bottom tab bar still
  // covers the lower strip. This toggle asks the native host to hide/show that
  // tab bar so the prototype can run edge-to-edge. No-op outside the app host.
  const [navBarHidden, setNavBarHidden] = useState(false);
  // Whether the in-app "current screen" indicator is collapsed to an icon-only
  // dot. The viewer can tuck it away when they don't need the screen name.
  const [indicatorCollapsed, setIndicatorCollapsed] = useState(false);
  const toggleNavBar = useCallback(() => {
    setNavBarHidden((prev) => {
      const next = !prev;
      try {
        getHostBridge()?.postMessage(
          JSON.stringify({ type: 'set-tab-bar-hidden', hidden: next })
        );
      } catch {
        // No bridge - nothing to toggle.
      }
      return next;
    });
  }, []);

  const play = useCallback(
    (id: string) => {
      const data = bindings.get(id);
      if (!data) return;
      if (isAppHost) {
        try {
          const bridge = getHostBridge();
          if (!bridge) throw new Error('host bridge unavailable');
          bridge.postMessage(
            JSON.stringify({
              type: 'play-preset',
              presetName: data.name,
              // PresetData's discrete/continuous shape is structurally identical
              // to react-native-pulsar's Pattern type - see
              // react-native/react-native-pulsar/src/types.ts.
              pattern: {
                discretePattern: data.discretePattern,
                continuousPattern: data.continuousPattern
              }
            })
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
      // PRESENTED_NODE_CHANGED is handled inside PrototypeView instead, where it
      // can be attributed to the active iframe (the keep-alive cache mounts
      // several) and re-label its cache slot.
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

  // The owner revoked this share link. Don't leak that a design ever existed -
  // just explain the link is private and how to regain access.
  if (isPrivate) {
    return (
      <>
        <Header status={status} count={0} onEnterFullscreen={enterFullscreen} />
        <main className="main">
          <div className="frame-wrap">
            <div className="empty">
              <div className="big">This preview is private</div>
              <div>
                The owner turned off sharing for this link. Ask them to share the
                preview again to regain access.
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

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

  // Pick the frame + element subset that match what Figma is currently showing.
  // When the user taps a button whose prototype interaction navigates to another
  // frame, Figma fires PRESENTED_NODE_CHANGED and `currentNodeId` shifts. We use
  // the per-frame box map the plugin sends to keep the overlay aligned on the
  // new frame instead of hiding every highlight. Backward-compat: payloads
  // created before the `frames` field exists fall through to the original
  // present-frame box.
  const hasFrameMap = frames.size > 0;
  const currentFrame: NodeBox | null =
    (hasFrameMap ? frames.get(currentNodeId)?.box ?? null : null) ??
    (currentNodeId === presentedId ? payload.frame : null);
  // Filter elements to those that belong to the currently-presented frame.
  // Prefer the explicit `frameId` when present (new payloads); for older
  // payloads - and for any element the plugin didn't tag - fall back to a
  // canvas-coordinate containment check against the current frame's box. This
  // matters because the plugin collects bound nodes from the whole page, not
  // just the present frame, so without filtering we'd paint highlights for
  // off-frame elements over the wrong screen area of the iframe.
  const visibleElements = currentFrame
    ? elements.filter((e) => {
        if (e.frameId) return e.frameId === currentNodeId;
        return e.box ? boxCenterInside(e.box, currentFrame) : false;
      })
    : [];
  // In fullscreen we show only the Figma content - no header, panel, highlights,
  // or card chrome.
  const showHighlights =
    highlightsOn && !fullscreen && currentFrame !== null && visibleElements.length > 0;

  // Name of the frame on screen, for the in-app "current screen" indicator.
  // Prefer the payload's frames map (frames with bindings); fall back to the name
  // the app relayed with a focus (covers binding-less frames the designer focused).
  const currentFrameName = frames.get(currentNodeId)?.name ?? relayedFrameNames[currentNodeId] ?? '';

  return (
    <>
      {!fullscreen && (
        <Header status={status} count={elements.length} onEnterFullscreen={enterFullscreen} />
      )}
      <main className={`main${fullscreen ? ' fullscreen' : ''}`}>
        <PrototypeView
          fileKey={payload.fileKey}
          nodeId={currentNodeId}
          frame={currentFrame}
          elements={visibleElements}
          showHighlights={showHighlights}
          activeId={activeId}
          fullscreen={fullscreen}
          deviceFrame={!isMobile}
          loaded={loaded}
          onPresentedNodeChange={(id) => setCurrentNodeId(normalizeId(id))}
        />
        {!fullscreen && (
          <HapticList
            elements={elements}
            frames={frames}
            currentFrameId={currentNodeId}
            highlightsOn={highlightsOn}
            onToggleHighlights={setHighlightsOn}
            activeId={activeId}
            onActivate={setActiveId}
            onPlay={playFromList}
            onOpenFrame={navigateToFrame}
            onShowDetails={setDetailsId}
            footer={openOnPhoneLink ? <OpenOnPhone deepLink={openOnPhoneLink} /> : undefined}
          />
        )}
      </main>

      {/* In-app only: a small badge naming the screen on view. The app
          auto-switches frames as the designer focuses them, so without this the
          viewer can lose track of which screen they're feeling. Tap to collapse
          it to an icon-only dot. Hidden in true-fullscreen (nav bar toggled off)
          to keep that view uncluttered. */}
      {isAppHost && currentFrameName && !navBarHidden && (
        <button
          type="button"
          className={`frame-indicator${indicatorCollapsed ? ' collapsed' : ''}`}
          onClick={() => setIndicatorCollapsed((c) => !c)}
          aria-expanded={!indicatorCollapsed}
          aria-label={indicatorCollapsed ? `Current screen: ${currentFrameName}` : 'Hide screen name'}
          title={indicatorCollapsed ? currentFrameName : 'Hide screen name'}
        >
          {/* Screen/frame glyph - the persistent affordance when collapsed. */}
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <path d="M3 9h18" />
          </svg>
          {!indicatorCollapsed && <span className="frame-indicator-name">{currentFrameName}</span>}
        </button>
      )}

      {detailsId && bindings.get(detailsId) && (
        <PresetDetailsModal
          data={bindings.get(detailsId)!}
          elementName={elements.find((e) => e.id === detailsId)?.name}
          isCustom={elements.find((e) => e.id === detailsId)?.isCustom}
          onClose={() => setDetailsId('')}
        />
      )}

      {/* Manual fullscreen on desktop can be exited; mobile fullscreen is implicit. */}
      {isFullscreen && !isMobile && (
        <button className="exit-fs" onClick={exitFullscreen} title="Exit fullscreen (Esc)">
          <img src={fullscreenExitIcon} alt="" width={16} height={16} />
        </button>
      )}

      {/* In-app only: hide/show the native bottom tab bar for a true full-screen
          prototype. Lives at the bottom corner, above where the tab bar sits. */}
      {isAppHost && (
        <button
          className="nav-toggle"
          onClick={toggleNavBar}
          title={navBarHidden ? 'Show navigation bar' : 'Hide navigation bar'}
          aria-pressed={navBarHidden}
        >
          <img
            src={navBarHidden ? fullscreenExitIcon : fullscreenIcon}
            alt={navBarHidden ? 'Show navigation bar' : 'Hide navigation bar'}
            width={16}
            height={16}
          />
        </button>
      )}
    </>
  );
}
