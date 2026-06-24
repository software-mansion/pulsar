import styles from './App.module.css';
import { useEffect, useMemo, useState } from 'react';
import PRESETS from './presets-data';
import type { BoundItem, CatalogEntry, SelectionInfo, Settings } from '../shared/types';
import { onMessage, send } from './figmaBridge';
import { applyFilter, filterRevealing, useFilterStateInit, type FilterState } from './components/Filters';
import PresetDetail from './components/PresetDetail';
import PresetsTab from './components/PresetsTab';
import LivePreviewPanel from './components/LivePreviewPanel';
import BoundComponentsPanel from './components/BoundComponentsPanel';
import OnboardingPanel from './components/OnboardingPanel';
import { broadcastToPhone } from './components/PhonePanel';
import SelectionBar from './components/SelectionBar';
import PulsarLogo from './components/PulsarLogo';
import ResizeHandle from './components/ResizeHandle';
import { useToast } from './components/Toast';
import { usePreviewSync } from './hooks/usePreviewSync';
import { DEFAULT_SETTINGS } from './lib/settings';
import { playPreset, stopAll } from './audio/player';

// Re-exported for LivePreviewPanel (and anything else that imports it from here).
export type { SyncStatus } from './hooks/usePreviewSync';

type Tab = 'presets' | 'bound' | 'preview' | 'onboarding';

export default function App() {
  const { notify } = useToast();
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [hapticsToken, setHapticsToken] = useState<string | null>(null);
  // Live link to the paired phone (PhonePanel reports this). Broadcasting only
  // makes sense while the phone is actually connected, not merely paired.
  const [phoneConnected, setPhoneConnected] = useState(false);

  const [selection, setSelection] = useState<SelectionInfo | null>(null);
  const [tab, setTab] = useState<Tab>('presets');
  const [openId, setOpenId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterState>(useFilterStateInit());
  const [favourites, setFavourites] = useState<Set<string>>(new Set());
  const [favouritesOnly, setFavouritesOnly] = useState(false);
  const [boundItems, setBoundItems] = useState<BoundItem[]>([]);
  const [customPresets, setCustomPresets] = useState<CatalogEntry[]>([]);
  // The real Figma file key (or share URL) for this document — needed for the
  // live-preview embed. Seeded from root pluginData on init, remembered per-file.
  const [figmaFileKey, setFigmaFileKey] = useState('');
  // Set when jumping to a preset from the selection bar; PresetsTab scrolls to it.
  const [scrollToId, setScrollToId] = useState<string | null>(null);

  // Custom presets first, then the bundled catalogue.
  const allPresets = useMemo(() => [...customPresets, ...PRESETS], [customPresets]);

  const presetById = useMemo(() => {
    const m = new Map<string, CatalogEntry>();
    for (const p of allPresets) m.set(p.id, p);
    return m;
  }, [allPresets]);

  // Live-preview / sharing sync — owns the server token bookkeeping and the
  // share affordances; listens for project / doc-changed / preview-data itself.
  const previewSync = usePreviewSync({ settings, figmaFileKey, presetById, notify });

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
    // We intentionally don't depend on settings/hapticsToken — see the play handler effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist settings whenever they change (skip the very first render to avoid
  // overwriting what the main thread loaded).
  const [didInit, setDidInit] = useState(false);
  useEffect(() => {
    if (!didInit) {
      setDidInit(true);
      return;
    }
    send({ type: 'persist-settings', settings });
  }, [settings]);

  useEffect(() => {
    send({ type: 'persist-haptics-token', token: hapticsToken });
  }, [hapticsToken]);

  // Persist the per-file Figma file key on change, skipping the first render so
  // we don't clobber the stored value before `init` arrives.
  const [didInitFileKey, setDidInitFileKey] = useState(false);
  useEffect(() => {
    if (!didInitFileKey) {
      setDidInitFileKey(true);
      return;
    }
    send({ type: 'persist-file-key', figmaFileKey });
  }, [figmaFileKey]);

  // Persist favourites on change, skipping the first render so we don't clobber
  // the stored set before `init` arrives from the main thread.
  const [didInitFav, setDidInitFav] = useState(false);
  useEffect(() => {
    if (!didInitFav) {
      setDidInitFav(true);
      return;
    }
    send({ type: 'persist-favourites', favourites: [...favourites] });
  }, [favourites]);

  // Persist custom presets on change, skipping the first render so we don't
  // clobber what `init` loaded.
  const [didInitCustom, setDidInitCustom] = useState(false);
  useEffect(() => {
    if (!didInitCustom) {
      setDidInitCustom(true);
      return;
    }
    send({ type: 'persist-custom-presets', presets: customPresets });
  }, [customPresets]);

  const addCustomPreset = (entry: CatalogEntry) => setCustomPresets((prev) => [entry, ...prev]);
  const updateCustomPreset = (id: string, entry: CatalogEntry) =>
    setCustomPresets((prev) => prev.map((e) => (e.id === id ? entry : e)));
  const removeCustomPreset = (id: string) =>
    setCustomPresets((prev) => prev.filter((e) => e.id !== id));

  const toggleFavourite = (id: string) => {
    setFavourites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

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

  const filtered = useMemo(() => {
    const base = applyFilter(allPresets, filter);
    return favouritesOnly ? base.filter((e) => favourites.has(e.id)) : base;
  }, [allPresets, filter, favouritesOnly, favourites]);
  const openEntry = openId ? presetById.get(openId) ?? null : null;

  const playEntry = (e: CatalogEntry) => {
    stopAll();
    if (hapticsToken && phoneConnected) broadcastToPhone(hapticsToken, e.data.name);
    if (settings.soundInEdit) playPreset(e.id, e.data).catch(() => {});
  };

  const bindEntry = (e: CatalogEntry) => {
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
  };

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

  // Refresh the bound list when opening the tab, and whenever the selection (and
  // thus a possible bind/unbind) changes while it's open.
  useEffect(() => {
    if (tab === 'bound') refreshBoundList();
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
        {(['presets', 'bound', 'preview', 'onboarding'] as const).map((t) => (
          <span
            key={t}
            className={`${styles['tab']} ${tab === t ? styles['active'] : ''}`}
            onClick={() => {
              setTab(t);
              setOpenId(null);
            }}
          >
            {t === 'bound' ? 'components' : t === 'preview' ? 'share' : t}
          </span>
        ))}
      </div>

      {/* Sticky selection section — sits above the scrollable list, showing the
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
          hapticsToken={hapticsToken}
          onHapticsTokenChange={setHapticsToken}
          onPhoneConnectedChange={setPhoneConnected}
          settings={settings}
          onSettingsChange={setSettings}
          filtered={filtered}
          favourites={favourites}
          selection={selection}
          onToggleFavourite={toggleFavourite}
          onPlay={playEntry}
          onBind={bindEntry}
          onOpen={setOpenId}
          modalOpen={!!openEntry}
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
              onPlayOnPhone={() =>
                hapticsToken &&
                phoneConnected &&
                broadcastToPhone(hapticsToken, openEntry.data.name)
              }
              canPlayOnPhone={!!hapticsToken && phoneConnected}
              onBind={() => bindEntry(openEntry)}
            />
          </div>
        </div>
      )}

      {tab === 'bound' && (
        <BoundComponentsPanel
          items={boundItems}
          onRefresh={refreshBoundList}
          onSelect={selectBoundItem}
        />
      )}

      {tab === 'preview' && (
        <LivePreviewPanel
          settings={settings}
          onChange={setSettings}
          figmaFileKey={figmaFileKey}
          onFigmaFileKeyChange={setFigmaFileKey}
          syncStatus={previewSync.syncStatus}
          onSyncNow={previewSync.syncNow}
          isPublic={previewSync.isPublic}
          isShared={previewSync.syncStatus !== 'idle'}
          onToggleVisibility={previewSync.setVisibility}
          onShowLivePreview={previewSync.showInLivePreview}
          onCopyShareLink={previewSync.copyShareLink}
          onCopyShareToken={previewSync.copyShareToken}
          onShowQrCode={previewSync.showQrCode}
          qrDataUrl={previewSync.shareQr}
          onClearQr={previewSync.clearQr}
        />
      )}

      {tab === 'onboarding' && <OnboardingPanel />}

      <ResizeHandle />
    </div>
  );
}
