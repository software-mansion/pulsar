import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { FrameInfo, NodeBox, PresetData, PreviewPayload } from './types';
import { readPayload } from './lib/payload';
import { normalizeId } from './lib/ids';
import { applyDiff, type HapticsDiff } from './lib/applyDiff';
import { useHostUpdates } from './lib/useHostUpdates';
import { useFigmaMessages } from './lib/useFigmaMessages';
import { useFullscreen } from './lib/useFullscreen';
import { useIsMobile } from './lib/useIsMobile';
import { getHostBridge, isAppHost as detectAppHost } from './lib/hostBridge';
import { getTokenFromUrl } from './lib/payload';
import { playPreset, stopAll } from './audio/player';
import { usePreviewStore } from './store';
import { Header } from './components/Header';
import { PrototypeView } from './components/PrototypeView';
import { HapticList } from './components/HapticList';
import { OpenOnPhone } from './components/OpenOnPhone';
import { PresetDetailsModal } from './components/PresetDetailsModal';
import fullscreenExitIcon from './assets/icon-fullscreen-exit.svg';
import fullscreenIcon from './assets/icon-fullscreen.svg';

const TAP_DEBOUNCE_MS = 250;
// Reads to ride out read-after-write lag when a minimum revision is required.
const REFETCH_ATTEMPTS = 4;

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
  // App subscribes to the *config* slice (payload) + the current frame - the
  // things it derives lookup maps from. It deliberately does NOT read activeId /
  // detailsId / highlightsOn / nav toggles: those are consumed by store-connected
  // leaf components below, so a hover or a toggle never re-renders App or the
  // iframe host. (Contrast the old version, where all of that lived in App's
  // useState and every change re-rendered the whole tree.)
  const payload = usePreviewStore((s) => s.payload);
  const isPrivate = usePreviewStore((s) => s.isPrivate);
  const payloadLoaded = usePreviewStore((s) => s.payloadLoaded);
  const currentNodeId = usePreviewStore((s) => s.currentNodeId);
  const status = usePreviewStore((s) => s.status);
  const loaded = usePreviewStore((s) => s.loaded);
  // Store actions are stable references, so passing them to memoized children
  // never breaks memoization.
  const navigateToFrame = usePreviewStore((s) => s.navigateToFrame);
  const setDetailsId = usePreviewStore((s) => s.setDetailsId);

  // Initial payload load. Writes straight into the store; no payload/revision
  // refs to keep in sync anymore - handlers below read getState() when they need
  // the latest value.
  useEffect(() => {
    let cancelled = false;
    readPayload().then((res) => {
      if (cancelled) return;
      const st = usePreviewStore.getState();
      if (res.status === 'ok') {
        st.setConfig({ payload: res.payload, revision: res.revision, isPrivate: false });
      } else {
        st.setConfig({ payload: null, isPrivate: res.status === 'private' });
      }
      st.setPayloadLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Re-pull the whole config from the server in place (no iframe reload). When a
  // minimum revision is known, retry briefly to ride out read-after-write lag so
  // we never settle on a snapshot older than the change that triggered us. Stable
  // (no state deps) because it reads/writes the store directly.
  const refetch = useCallback(async (minRevision?: number) => {
    for (let attempt = 0; attempt < REFETCH_ATTEMPTS; attempt++) {
      const res = await readPayload();
      if (res.status === 'ok') {
        const isLastAttempt = attempt === REFETCH_ATTEMPTS - 1;
        if (minRevision != null && res.revision < minRevision && !isLastAttempt) {
          await new Promise((r) => setTimeout(r, 250));
          continue;
        }
        const st = usePreviewStore.getState();
        st.setConfig({ payload: res.payload, revision: res.revision, isPrivate: false });
        st.setPayloadLoaded(true);
        return;
      }
      if (res.status === 'private') {
        const st = usePreviewStore.getState();
        st.setConfig({ payload: null, isPrivate: true });
        st.setPayloadLoaded(true);
      }
      // 'missing' / 'no-token': leave the current state as-is and stop retrying.
      return;
    }
  }, []);

  // Apply a relayed delta in place when our revision is exactly the one the diff
  // was computed against; otherwise we've missed an update (a gap) - refetch. No
  // refs: getState() gives us the freshest payload/revision at call time.
  const onDiff = useCallback(
    (fromRevision: number, toRevision: number, diff: HapticsDiff) => {
      const { payload: cur, revision } = usePreviewStore.getState();
      if (!cur || revision !== fromRevision) {
        void refetch(toRevision);
        return;
      }
      usePreviewStore.getState().setConfig({ payload: applyDiff(cur, diff), revision: toRevision });
    },
    [refetch]
  );
  const onRefetch = useCallback((toRevision: number) => void refetch(toRevision), [refetch]);

  // Derived lookup maps (stable across renders, recomputed only when payload changes).
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

  // Once we know the payload state, refresh the status accordingly. Done in an
  // effect so the user briefly sees "loading" while the token fetch is in
  // flight rather than a flash of the empty state.
  useEffect(() => {
    const setStatus = usePreviewStore.getState().setStatus;
    if (!payloadLoaded) {
      if (new URLSearchParams(location.search).has('token')) setStatus('Loading preview…');
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

  // Sync the presented frame when the payload arrives later (async token fetch).
  useEffect(() => {
    usePreviewStore.getState().setCurrentNodeId(presentedId);
  }, [presentedId]);

  // Host-relayed updates, only injected when running inside PulsarApp's WebView.
  // Every handler is stable now (no state deps), so this listener binds once.
  const hostHandlers = useMemo(
    () => ({ onDiff, onRefetch, onFocusFrame: navigateToFrame }),
    [onDiff, onRefetch, navigateToFrame]
  );
  useHostUpdates(hostHandlers);

  const lastPlayed = useRef(new Map<string, number>());

  // See the long note in the original: the bridge check is authoritative for
  // "are we inside the app?"; when present we postMessage the pattern to native,
  // otherwise we fall back to the in-page audio generator.
  const isAppHost = useMemo(() => detectAppHost(), []);

  const openOnPhoneLink = useMemo(() => {
    if (isAppHost) return null;
    const token = getTokenFromUrl();
    return token ? `pulsarapp://figma?token=${encodeURIComponent(token)}` : null;
  }, [isAppHost]);

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
              pattern: {
                discretePattern: data.discretePattern,
                continuousPattern: data.continuousPattern
              }
            })
          );
        } catch {
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

  // Play a preset from the list and flash its highlight. Stable-ish (changes only
  // when the binding set changes), so memoized rows don't churn on it.
  const playFromList = useCallback(
    (id: string) => {
      play(id);
      usePreviewStore.getState().setActiveTransient(id);
    },
    [play]
  );

  const handlers = useMemo(
    () => ({
      onInitialLoad: () => {
        const st = usePreviewStore.getState();
        st.setStatus('Tap a highlighted element to feel its haptic.');
        st.setLoaded(true);
      },
      onLoginScreen: () => usePreviewStore.getState().setStatus('This file requires Figma login to embed.'),
      onMousePressOrRelease: (targetNodeId: string) => {
        const norm = normalizeId(targetNodeId);
        if (!norm || !bindings.has(norm)) return;
        const now = Date.now();
        if (now - (lastPlayed.current.get(norm) ?? 0) < TAP_DEBOUNCE_MS) return;
        lastPlayed.current.set(norm, now);
        const ownerId = ownerMap.get(norm) ?? norm;
        play(ownerId);
        usePreviewStore.getState().setActiveTransient(ownerId);
      }
    }),
    [bindings, ownerMap, play]
  );
  useFigmaMessages(handlers);

  const { isFullscreen, enter: enterFullscreen, exit: exitFullscreen } = useFullscreen();
  const isMobile = useIsMobile();
  const fullscreen = isFullscreen || isMobile;

  // The owner revoked this share link. Don't leak that a design ever existed.
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

  // Pick the frame + element subset that match what Figma is currently showing
  // (see the long note in the original for the containment fallback).
  const hasFrameMap = frames.size > 0;
  const currentFrame: NodeBox | null =
    (hasFrameMap ? frames.get(currentNodeId)?.box ?? null : null) ??
    (currentNodeId === presentedId ? payload.frame : null);
  const visibleElements = currentFrame
    ? elements.filter((e) => {
        if (e.frameId) return e.frameId === currentNodeId;
        return e.box ? boxCenterInside(e.box, currentFrame) : false;
      })
    : [];

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
          fullscreen={fullscreen}
          deviceFrame={!isMobile}
          loaded={loaded}
          onPresentedNodeChange={(id) => usePreviewStore.getState().setCurrentNodeId(normalizeId(id))}
        />
        {!fullscreen && (
          <HapticList
            elements={elements}
            frames={frames}
            currentFrameId={currentNodeId}
            onPlay={playFromList}
            onOpenFrame={navigateToFrame}
            onShowDetails={setDetailsId}
            isMobile={isMobile}
            footer={openOnPhoneLink ? <OpenOnPhone deepLink={openOnPhoneLink} /> : undefined}
          />
        )}
      </main>

      {isAppHost && <FrameIndicator frames={frames} />}

      <DetailsModalHost bindings={bindings} elements={elements} />

      {/* Manual fullscreen on desktop can be exited; mobile fullscreen is implicit. */}
      {isFullscreen && !isMobile && (
        <button className="exit-fs" onClick={exitFullscreen} title="Exit fullscreen (Esc)">
          <img src={fullscreenExitIcon} alt="" width={16} height={16} />
        </button>
      )}

      {isAppHost && <NavToggle />}
    </>
  );
}

// --- Store-connected leaf hosts ------------------------------------------------
// Each subscribes to just its own slice of view state, so the high-frequency
// interactions they own (opening details, collapsing the indicator, toggling the
// nav bar) never re-render App or the iframe host.

// The preset-details modal. Subscribes to detailsId; App passes the (payload-
// derived) lookups. Renders nothing until a row's ⋯ is tapped.
function DetailsModalHost({
  bindings,
  elements
}: {
  bindings: Map<string, PresetData>;
  elements: { id: string; name: string; isCustom?: boolean }[];
}) {
  const detailsId = usePreviewStore((s) => s.detailsId);
  const setDetailsId = usePreviewStore((s) => s.setDetailsId);
  const data = detailsId ? bindings.get(detailsId) : undefined;
  if (!data) return null;
  return (
    <PresetDetailsModal
      data={data}
      elementName={elements.find((e) => e.id === detailsId)?.name}
      isCustom={elements.find((e) => e.id === detailsId)?.isCustom}
      onClose={() => setDetailsId('')}
    />
  );
}

// In-app "current screen" badge. Subscribes to the frame + indicator slices so it
// updates on navigation / collapse without touching the rest of the tree.
function FrameIndicator({ frames }: { frames: Map<string, FrameInfo> }) {
  const currentNodeId = usePreviewStore((s) => s.currentNodeId);
  const relayedName = usePreviewStore((s) => s.relayedFrameNames[currentNodeId]);
  const navBarHidden = usePreviewStore((s) => s.navBarHidden);
  const collapsed = usePreviewStore((s) => s.indicatorCollapsed);
  const toggleIndicator = usePreviewStore((s) => s.toggleIndicator);
  const name = frames.get(currentNodeId)?.name ?? relayedName ?? '';
  if (!name || navBarHidden) return null;
  return (
    <button
      type="button"
      className={`frame-indicator${collapsed ? ' collapsed' : ''}`}
      onClick={toggleIndicator}
      aria-expanded={!collapsed}
      aria-label={collapsed ? `Current screen: ${name}` : 'Hide screen name'}
      title={collapsed ? name : 'Hide screen name'}
    >
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
      {!collapsed && <span className="frame-indicator-name">{name}</span>}
    </button>
  );
}

// In-app hide/show the native bottom tab bar for a true full-screen prototype.
function NavToggle() {
  const navBarHidden = usePreviewStore((s) => s.navBarHidden);
  const toggleNavBar = usePreviewStore((s) => s.toggleNavBar);
  return (
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
  );
}
