import styles from './App.module.css';
import { useCallback, useEffect, useMemo, useState } from 'react';
import PRESETS from './presets-data';
import { usePresetsUiStore } from './store';
import type { BoundItem, CatalogEntry, SelectionInfo, Settings } from '../shared/types';
import { onMessage, send } from './figmaBridge';
import { applyFilter, filterRevealing, useFilterStateInit, type FilterState } from './components/Filters';
import PresetDetail from './components/PresetDetail';
import TagsGuide from './components/TagsGuide';
import PresetsTab from './components/PresetsTab';
import LivePreviewTab from './components/LivePreviewTab';
import LivePreviewPanel from './components/LivePreviewPanel';
import OnboardingPanel from './components/OnboardingPanel';
import OnboardingOverlay from './components/OnboardingOverlay';
import DebugPanel from './components/DebugPanel';
import {
  usePhoneConnection,
  phoneStatusOf,
  broadcastToPhone,
  broadcastPreviewUpdate
} from './hooks/usePhoneConnection';
import SelectionBar from './components/SelectionBar';
import PulsarLogo from './components/PulsarLogo';
import ResizeHandle from './components/ResizeHandle';
import { useToast } from './components/Toast';
import { usePreviewSync } from './hooks/usePreviewSync';
import { usePersistOnChange } from './hooks/usePersistOnChange';
import { DEFAULT_SETTINGS, DEV_MODE } from './lib/settings';
import { isFileKeyValid } from './lib/fileKey';
import { playPreset, stopAll } from './audio/player';

// Re-exported for LivePreviewPanel (and anything else that imports it from here).
export type { SyncStatus } from './hooks/usePreviewSync';

// 'live' = the "Live preview" tab (file key + phone pairing); 'preview' = the
// "Share" tab (share link / sync). The internal names predate the split.
// 'debug' only appears in developer mode.
type Tab = 'presets' | 'live' | 'preview' | 'onboarding' | 'debug';

export default function App() {
  const { notify } = useToast();
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [hapticsToken, setHapticsToken] = useState<string | null>(null);
  // Live link to the paired phone (PhonePanel reports this). Broadcasting only
  // makes sense while the phone is actually connected, not merely paired.
  const [phoneConnected, setPhoneConnected] = useState(false);

  const [tab, setTab] = useState<Tab>('presets');
  // First-run onboarding tour. Auto-opens once (gated on the persisted
  // `onboardingSeen` flag from init); the Help tab can relaunch it any time.
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [filter, setFilter] = useState<FilterState>(useFilterStateInit());
  const [favouritesOnly, setFavouritesOnly] = useState(false);

  // Presets-tab interaction state lives in the store so individual PresetCards
  // can subscribe to just their own favourite/bound flag (see store.ts). App
  // reads the whole values here (for filtering, the selection bar, the modal);
  // the actions are stable references safe to pass to memoized children.
  const selection = usePresetsUiStore((s) => s.selection);
  const openId = usePresetsUiStore((s) => s.openId);
  const tagsGuideOpen = usePresetsUiStore((s) => s.tagsGuideOpen);
  const favourites = usePresetsUiStore((s) => s.favourites);
  const scrollToId = usePresetsUiStore((s) => s.scrollToId);
  const setSelection = usePresetsUiStore((s) => s.setSelection);
  const setOpenId = usePresetsUiStore((s) => s.setOpenId);
  const setTagsGuideOpen = usePresetsUiStore((s) => s.setTagsGuideOpen);
  const setFavourites = usePresetsUiStore((s) => s.setFavourites);
  const toggleFavourite = usePresetsUiStore((s) => s.toggleFavourite);
  const setScrollToId = usePresetsUiStore((s) => s.setScrollToId);
  const [boundItems, setBoundItems] = useState<BoundItem[]>([]);
  const [customPresets, setCustomPresets] = useState<CatalogEntry[]>([]);
  // The real Figma file key (or share URL) for this document - needed for the
  // live-preview embed. Seeded from root pluginData on init, remembered per-file.
  const [figmaFileKey, setFigmaFileKey] = useState('');
  // The Figma document name, advertised to the phone as the connection label.
  const [documentName, setDocumentName] = useState('');

  // Custom presets first, then the bundled catalogue.
  const allPresets = useMemo(() => [...customPresets, ...PRESETS], [customPresets]);

  const presetById = useMemo(() => {
    const m = new Map<string, CatalogEntry>();
    for (const p of allPresets) m.set(p.id, p);
    return m;
  }, [allPresets]);

  // Live-preview / sharing sync - owns the server token bookkeeping and the
  // share affordances; listens for project / doc-changed / preview-data itself.
  // On every persisted publish it hands us a diff/refetch message to relay to an
  // open live preview; we only broadcast it when a phone is actually connected
  // (same gating as "play on phone").
  const previewSync = usePreviewSync({
    settings,
    figmaFileKey,
    presetById,
    notify,
    onPublished: (message) => {
      if (hapticsToken && phoneConnected) broadcastPreviewUpdate(hapticsToken, message);
    }
  });

  // The live link to the phone - owned here (not in the Live preview tab) so it
  // survives leaving the tab. It only dies on an explicit Disconnect or when the
  // plugin window closes. Auto-starts pairing while the user is on the Live
  // preview tab with the file key set (the pairing step).
  const phoneConnection = usePhoneConnection({
    token: hapticsToken,
    onTokenChange: setHapticsToken,
    onConnectedChange: setPhoneConnected,
    ensureSharedPreview: previewSync.ensureShared,
    previewToken: previewSync.previewToken,
    documentName,
    autoStart: tab === 'live' && isFileKeyValid(figmaFileKey)
  });

  // Surface the phone-link status as a dot on the "live preview" tab so it's
  // visible from any tab. Hidden while fully idle (not paired, nothing pairing)
  // - only meaningful state earns a dot.
  const phoneStatus = phoneStatusOf(phoneConnection);
  const showPhoneDot = phoneConnection.paired || phoneConnection.phase !== 'idle';

  // Wire up the bridge once for the messages App owns (init, selection, bound
  // list, toasts). Sync-related messages are handled inside usePreviewSync.
  useEffect(() => {
    const off = onMessage((m) => {
      if (m.type === 'init') {
        setSettings(m.settings);
        setHapticsToken(m.hapticsToken);
        setFavourites(new Set(m.favourites));
        setCustomPresets(m.customPresets ?? []);
        setFigmaFileKey(m.figmaFileKey ?? '');
        setDocumentName(m.documentName ?? '');
        // Auto-open the tour on first launch, then never again unless relaunched
        // from the Help tab.
        if (!m.onboardingSeen) setShowOnboarding(true);
        // Pull this file's persisted token + cached config, keyed by the stable
        // minted id (the server key). The real Figma file key for the embed is
        // remembered separately per-file (figmaFileKey, see usePreviewSync).
        previewSync.initProject(m.fileKey ?? '');
      }
      if (m.type === 'selection') setSelection(m.node);
      if (m.type === 'bound-list') setBoundItems(m.items);
      if (m.type === 'toast') notify(m.message, { level: m.level, duration: m.duration });
      // play-preset is handled in a separate effect that re-binds when
      // settings/token change, so it always reads fresh values.
    });
    send({ type: 'ui-ready' });
    return off;
    // We intentionally don't depend on settings/hapticsToken - see the play handler effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist each piece of loaded state back to the main thread when it changes,
  // skipping the first render so a freshly-loaded value isn't written straight
  // back (which would clobber it before `init` restores it). The haptics token is
  // the exception - it persists on mount too (see below).
  usePersistOnChange(settings, () => send({ type: 'persist-settings', settings }));
  usePersistOnChange(figmaFileKey, () => send({ type: 'persist-file-key', figmaFileKey }));
  usePersistOnChange(favourites, () => send({ type: 'persist-favourites', favourites: [...favourites] }));
  usePersistOnChange(customPresets, () => send({ type: 'persist-custom-presets', presets: customPresets }));

  useEffect(() => {
    send({ type: 'persist-haptics-token', token: hapticsToken });
  }, [hapticsToken]);

  const addCustomPreset = (entry: CatalogEntry) => setCustomPresets((prev) => [entry, ...prev]);
  const updateCustomPreset = (id: string, entry: CatalogEntry) =>
    setCustomPresets((prev) => prev.map((e) => (e.id === id ? entry : e)));
  const removeCustomPreset = (id: string) =>
    setCustomPresets((prev) => prev.filter((e) => e.id !== id));

  // The play-preset handler captured stale settings/token on mount. Rebind it on changes.
  useEffect(() => {
    const off = onMessage((m) => {
      if (m.type !== 'play-preset') return;
      const p = presetById.get(m.presetId);
      if (!p) return;
      if (settings.soundInEdit) playPreset(p.id, p.data).catch(() => {});
      if (hapticsToken && phoneConnected) broadcastToPhone(hapticsToken, p.data.name);
    });
    return off;
  }, [settings.soundInEdit, hapticsToken, phoneConnected, presetById]);

  // Relay the designer's focused frame to the paired phone so its live preview
  // presents the same screen. Same gating as "play on phone" - only broadcast
  // into a live channel. Rebinds so it reads the fresh token + connection state.
  // The web preview deliberately doesn't get this (it's a phone-only channel);
  // it navigates on explicit preset taps instead.
  useEffect(() => {
    const off = onMessage((m) => {
      if (m.type !== 'frame-focus') return;
      if (hapticsToken && phoneConnected) {
        broadcastPreviewUpdate(hapticsToken, {
          kind: 'preview-frame-focus',
          previewToken: previewSync.previewToken ?? undefined,
          nodeId: m.nodeId,
          frameName: m.frameName
        });
      }
    });
    return off;
  }, [hapticsToken, phoneConnected, previewSync.previewToken]);

  const filtered = useMemo(() => {
    const base = applyFilter(allPresets, filter);
    return favouritesOnly ? base.filter((e) => favourites.has(e.id)) : base;
  }, [allPresets, filter, favouritesOnly, favourites]);
  const openEntry = openId ? presetById.get(openId) ?? null : null;

  // Live preview is "configured" once the file key is set and a phone is paired
  // - the two steps of the Live preview configurator. Gates the Presets-tab reminder.
  const liveConfigComplete = isFileKeyValid(figmaFileKey) && hapticsToken != null;

  // Stable across favourite/selection changes (deps only shift on pairing/settings)
  // so the memoized PresetCards don't re-render when an unrelated card is favourited.
  const playEntry = useCallback(
    (e: CatalogEntry) => {
      stopAll();
      if (hapticsToken && phoneConnected) broadcastToPhone(hapticsToken, e.data.name);
      if (settings.soundInEdit) playPreset(e.id, e.data).catch(() => {});
    },
    [hapticsToken, phoneConnected, settings.soundInEdit]
  );

  const bindEntry = useCallback((e: CatalogEntry) => {
    send({
      type: 'bind-preset',
      // Inline the pattern for custom presets so a binding survives even if the
      // custom preset is later removed from the list.
      binding: {
        presetId: e.id,
        presetName: e.data.name,
        ...(e.category === 'custom' ? { customPattern: e.data } : {})
      }
    });
  }, []);

  // Jump from the selection bar to a bound preset: switch to the list, clear any
  // filters hiding it, play it, and ask PresetsTab to scroll it into view.
  const goToPreset = (presetId: string) => {
    const entry = presetById.get(presetId);
    if (!entry) return;
    playEntry(entry);
    setOpenId(null);
    setTab('presets');
    setFavouritesOnly(false);
    setFilter(filterRevealing(entry));
    setScrollToId(presetId);
  };

  // Escape closes the open preset-info modal.
  useEffect(() => {
    if (!openId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenId(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openId]);

  const refreshBoundList = () => send({ type: 'request-bound-list' });

  // Keep the Presets-tab "Bound components" accordion fresh: refresh on entering
  // the tab and whenever the selection (and thus a possible bind/unbind) changes.
  useEffect(() => {
    if (tab === 'presets') refreshBoundList();
  }, [tab, selection]);

  // Click a bound component: hear its preset (always, since it's an explicit
  // action) and jump to + highlight it on the canvas.
  const selectBoundItem = (item: BoundItem) => {
    const entry = presetById.get(item.presetId);
    if (entry) {
      stopAll();
      playPreset(entry.id, entry.data).catch(() => {});
      if (hapticsToken && phoneConnected) broadcastToPhone(hapticsToken, entry.data.name);
    }
    send({ type: 'focus-node', nodeId: item.nodeId });
  };

  return (
    <div className={styles['app-shell']}>
      <div className={`row ${styles['app-header']}`}>
        <div className={styles['app-brand']}>
          <PulsarLogo size={22} />
          <span>Pulsar</span>
        </div>
        <div className="spacer" />
        {(['presets', 'live', 'preview', 'onboarding', 'debug'] as const)
          // The debug tab only exists in developer mode (compile-time flag).
          .filter((t) => t !== 'debug' || DEV_MODE)
          .map((t) => (
          <span
            key={t}
            className={`${styles['tab']} ${tab === t ? styles['active'] : ''}`}
            onClick={() => {
              setTab(t);
              setOpenId(null);
            }}
          >
            {t === 'live' && showPhoneDot && (
              <span className={`${styles['tab-dot']} ${styles[phoneStatus]}`} aria-hidden="true" />
            )}
            {t === 'live'
              ? 'live preview'
              : t === 'preview'
                ? 'share'
                : t === 'onboarding'
                  ? 'help'
                  : t}
          </span>
        ))}
      </div>

      {/* Sticky selection section - sits above the scrollable list, showing the
          selected node + its bound preset. Only relevant on the Presets tab. */}
      {tab === 'presets' && (
        <SelectionBar
          selection={selection}
          onUnbind={() => send({ type: 'unbind-preset' })}
          onFocusComponent={() => selection && send({ type: 'focus-node', nodeId: selection.id })}
          onOpenPreset={() => selection?.binding && goToPreset(selection.binding.presetId)}
        />
      )}

      {tab === 'presets' && (
        <PresetsTab
          filter={filter}
          setFilter={setFilter}
          favouritesOnly={favouritesOnly}
          setFavouritesOnly={setFavouritesOnly}
          customPresets={customPresets}
          onAddCustomPreset={addCustomPreset}
          onUpdateCustomPreset={updateCustomPreset}
          onRemoveCustomPreset={removeCustomPreset}
          boundItems={boundItems}
          onSelectBound={selectBoundItem}
          liveConfigComplete={liveConfigComplete}
          onConfigureLivePreview={() => {
            setTab('live');
            setOpenId(null);
          }}
          settings={settings}
          onSettingsChange={setSettings}
          filtered={filtered}
          onToggleFavourite={toggleFavourite}
          onPlay={playEntry}
          onBind={bindEntry}
          onOpen={setOpenId}
          onShowTagsGuide={() => setTagsGuideOpen(true)}
          modalOpen={!!openEntry || tagsGuideOpen}
          scrollToId={scrollToId}
          onScrolledToPreset={() => setScrollToId(null)}
        />
      )}

      {openEntry && (
        <div className={styles['modal-backdrop']} onClick={() => setOpenId(null)}>
          <div className={styles['modal-card']} onClick={(e) => e.stopPropagation()}>
            <PresetDetail
              entry={openEntry}
              onClose={() => setOpenId(null)}
              onPlay={() => playEntry(openEntry)}
              onBind={() => bindEntry(openEntry)}
            />
          </div>
        </div>
      )}

      {tagsGuideOpen && (
        <div className={styles['modal-backdrop']} onClick={() => setTagsGuideOpen(false)}>
          <div className={styles['modal-card']} onClick={(e) => e.stopPropagation()}>
            <TagsGuide onClose={() => setTagsGuideOpen(false)} />
          </div>
        </div>
      )}

      {tab === 'live' && (
        <LivePreviewTab
          figmaFileKey={figmaFileKey}
          onFigmaFileKeyChange={setFigmaFileKey}
          phone={phoneConnection}
          syncStatus={previewSync.syncStatus}
          onSyncNow={previewSync.syncNow}
        />
      )}

      {tab === 'preview' && (
        <LivePreviewPanel
          settings={settings}
          onChange={setSettings}
          isPublic={previewSync.isPublic}
          isShared={previewSync.syncStatus !== 'idle'}
          onToggleVisibility={previewSync.setVisibility}
          onShowLivePreview={previewSync.showInLivePreview}
          onCopyShareLink={previewSync.copyShareLink}
        />
      )}

      {tab === 'onboarding' && (
        <OnboardingPanel onStartOnboarding={() => setShowOnboarding(true)} />
      )}

      {tab === 'debug' && <DebugPanel onShowOnboarding={() => setShowOnboarding(true)} />}

      {showOnboarding && (
        <OnboardingOverlay
          onClose={() => {
            setShowOnboarding(false);
            // Remember it was seen so it doesn't auto-open next launch. Harmless
            // when relaunched from Help (the flag is already set).
            send({ type: 'persist-onboarding-seen', seen: true });
          }}
        />
      )}

      <ResizeHandle />
    </div>
  );
}
