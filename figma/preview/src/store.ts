import { create } from 'zustand';
import type { PreviewPayload } from './types';
import { normalizeId } from './lib/ids';
import { getHostBridge } from './lib/hostBridge';

// Single store for the preview app. It holds two kinds of state:
//
//   • config  - the server payload + the revision it reflects. Previously this
//     lived as `payload`/`revision` useState PLUS `payloadRef`/`revisionRef`
//     mirrors, because the (stable) host-update handlers needed to read the
//     latest value without re-binding. A store makes that duplication go away:
//     `usePreviewStore.getState()` is always fresh, so the handlers read it
//     directly and never need refs or dependency arrays.
//
//   • view    - the interaction state (active highlight, current frame, panel
//     toggles). Keeping it here lets leaf components subscribe to just the slice
//     they render (e.g. one list row subscribes to `activeId === id`), so a
//     hover no longer re-renders App, the iframe host, and all 24 rows.

const ACTIVE_MS = 900;

// Transient-highlight timer. Module-level (not a ref) because the store outlives
// any single component and there is only ever one active highlight.
let activeTimer: ReturnType<typeof setTimeout> | undefined;

interface PreviewState {
  // --- config (server payload) ---
  payload: PreviewPayload | null;
  revision: number;
  isPrivate: boolean;
  payloadLoaded: boolean;

  // --- interaction / view state ---
  // The top-level frame currently presented (drives which embed iframe shows and
  // which elements the overlay groups). Moved by a deliberate jump (designer
  // focus / preset tap) or by in-prototype navigation.
  currentNodeId: string;
  // The element whose highlight is lit right now (hover or a transient tap flash).
  activeId: string;
  highlightsOn: boolean;
  // The element whose preset-details modal is open ('' = closed).
  detailsId: string;
  navBarHidden: boolean;
  indicatorCollapsed: boolean;
  // Names for frames the app relayed a focus to but that aren't in the payload's
  // frames map (a binding-less frame the designer focused).
  relayedFrameNames: Record<string, string>;
  loaded: boolean;
  status: string;

  // --- actions ---
  setConfig: (next: { payload: PreviewPayload | null; revision?: number; isPrivate?: boolean }) => void;
  setPayloadLoaded: (v: boolean) => void;
  setActiveId: (id: string) => void;
  // Light the highlight and auto-clear it after ACTIVE_MS (the tap flash).
  setActiveTransient: (id: string) => void;
  setHighlightsOn: (on: boolean) => void;
  setDetailsId: (id: string) => void;
  setCurrentNodeId: (id: string) => void;
  // Jump to a specific top-level frame. Idempotent - re-selecting the current
  // frame is a no-op. `frameName` (focus relay only) labels binding-less frames.
  navigateToFrame: (frameId: string, frameName?: string) => void;
  toggleNavBar: () => void;
  toggleIndicator: () => void;
  setLoaded: (v: boolean) => void;
  setStatus: (s: string) => void;
}

export const usePreviewStore = create<PreviewState>((set, get) => ({
  payload: null,
  revision: 0,
  isPrivate: false,
  payloadLoaded: false,

  currentNodeId: '',
  activeId: '',
  highlightsOn: true,
  detailsId: '',
  navBarHidden: false,
  indicatorCollapsed: false,
  relayedFrameNames: {},
  loaded: false,
  status: 'Waiting for a design - open one from the Pulsar plugin.',

  setConfig: ({ payload, revision, isPrivate }) =>
    set((s) => ({
      payload,
      revision: revision ?? s.revision,
      isPrivate: isPrivate ?? s.isPrivate
    })),
  setPayloadLoaded: (payloadLoaded) => set({ payloadLoaded }),

  setActiveId: (activeId) => set({ activeId }),
  setActiveTransient: (id) => {
    set({ activeId: id });
    if (activeTimer) clearTimeout(activeTimer);
    activeTimer = setTimeout(() => set({ activeId: '' }), ACTIVE_MS);
  },
  setHighlightsOn: (highlightsOn) => set({ highlightsOn }),
  setDetailsId: (detailsId) => set({ detailsId }),
  setCurrentNodeId: (currentNodeId) => set({ currentNodeId }),
  navigateToFrame: (frameId, frameName) => {
    const norm = normalizeId(frameId);
    if (!norm) return;
    set((s) => ({
      currentNodeId: norm,
      relayedFrameNames:
        frameName && s.relayedFrameNames[norm] !== frameName
          ? { ...s.relayedFrameNames, [norm]: frameName }
          : s.relayedFrameNames
    }));
  },
  toggleNavBar: () =>
    set((s) => {
      const hidden = !s.navBarHidden;
      try {
        getHostBridge()?.postMessage(JSON.stringify({ type: 'set-tab-bar-hidden', hidden }));
      } catch {
        // No bridge - nothing to toggle.
      }
      return { navBarHidden: hidden };
    }),
  toggleIndicator: () => set((s) => ({ indicatorCollapsed: !s.indicatorCollapsed })),
  setLoaded: (loaded) => set({ loaded }),
  setStatus: (status) => set({ status })
}));
