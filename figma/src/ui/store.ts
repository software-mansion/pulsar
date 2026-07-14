import { create } from 'zustand';
import type { SelectionInfo } from '../shared/types';
import { toggleInSet } from './lib/collections';

// Store for the plugin UI's presets-tab interaction state - the slices that
// leaf components (PresetCard) subscribe to individually. Keeping `favourites`
// and `selection` here (rather than in App's useState, prop-drilled through
// PresetsTab) lets each card read just "am I favourited / bound?" via a
// selector, so toggling one star re-renders that one card instead of all 151
// cards + their SVG visualizations.
//
// Deliberately scoped: the server-sync / phone-pairing machinery in
// usePreviewSync / usePhoneConnection is untouched (it's delicate, ref-based by
// design, and can't be exercised outside Figma), and persisted/hook-input state
// (settings, figmaFileKey, hapticsToken, customPresets) stays in App.

interface PresetsUiState {
  // Favourited preset ids. Seeded from the plugin's persisted data on `init` and
  // written back on change (App owns that bridge wiring); the store is the single
  // source of truth the UI reads.
  favourites: Set<string>;
  // The node currently selected on the Figma canvas (+ its binding, if any).
  // Drives the selection bar and each card's "● selected" badge.
  selection: SelectionInfo | null;
  // The preset whose detail modal is open (null = closed).
  openId: string | null;
  // Whether the "Tags guide" modal is open.
  tagsGuideOpen: boolean;
  // When set, PresetsTab scrolls that preset into view + flashes it, then clears
  // it via setScrollToId(null).
  scrollToId: string | null;

  setFavourites: (ids: Set<string>) => void;
  toggleFavourite: (id: string) => void;
  setSelection: (selection: SelectionInfo | null) => void;
  setOpenId: (id: string | null) => void;
  setTagsGuideOpen: (open: boolean) => void;
  setScrollToId: (id: string | null) => void;
}

export const usePresetsUiStore = create<PresetsUiState>((set) => ({
  favourites: new Set(),
  selection: null,
  openId: null,
  tagsGuideOpen: false,
  scrollToId: null,

  setFavourites: (favourites) => set({ favourites }),
  toggleFavourite: (id) => set((s) => ({ favourites: toggleInSet(s.favourites, id) })),
  setSelection: (selection) => set({ selection }),
  setOpenId: (openId) => set({ openId }),
  setTagsGuideOpen: (tagsGuideOpen) => set({ tagsGuideOpen }),
  setScrollToId: (scrollToId) => set({ scrollToId })
}));
